import fs from 'fs';

async function verifyLayeringFixes() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          d.error ? reject(d.error) : resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Reload clean page
  console.log('Navigating to http://localhost:3000/subjects/me-201...');
  await send('Page.navigate', { url: 'http://localhost:3000/subjects/me-201' });
  await new Promise((r) => setTimeout(r, 2500));

  // Screenshot 1: Clean Default View
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/fixed_me201_default_view.png', Buffer.from(snap1.data, 'base64'));
  console.log('Saved screenshots/fixed_me201_default_view.png');

  // Open SFD / BMD
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const sfdBtn = buttons.find(b => b.textContent.includes('SFD / BMD'));
      if (sfdBtn) sfdBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 2: SFD/BMD Open without occluding Builder Toolbar
  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/fixed_sfd_toolbar_no_overlap.png', Buffer.from(snap2.data, 'base64'));
  console.log('Saved screenshots/fixed_sfd_toolbar_no_overlap.png');

  // Toggle Course Info Drawer
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const infoBtn = buttons.find(b => b.textContent.includes('Course Info') || b.textContent.includes('Collapse'));
      if (infoBtn) infoBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 3: Course Info overlay popover
  const snap3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/fixed_course_info_popover.png', Buffer.from(snap3.data, 'base64'));
  console.log('Saved screenshots/fixed_course_info_popover.png');

  // Close tab connection
  ws.close();
  console.log('All verification captures saved successfully!');
}

verifyLayeringFixes().catch(console.error);
