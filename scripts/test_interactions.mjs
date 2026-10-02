import fs from 'fs';

async function testInteractions() {
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
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise((r) => setTimeout(r, 1500));

  // Click on "Active 3D Labs (1)" filter button
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const activeBtn = buttons.find(b => b.textContent.includes('Active 3D Labs'));
      if (activeBtn) activeBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/homepage_filter_active_only.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved screenshots/homepage_filter_active_only.png');

  // Test search query
  await send('Runtime.evaluate', {
    expression: `
      const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('All Subjects'));
      if (allBtn) allBtn.click();
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = 'aerodynamics';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  const snapSearch = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/homepage_search_aerodynamics.png', Buffer.from(snapSearch.data, 'base64'));
  console.log('Saved screenshots/homepage_search_aerodynamics.png');

  // Navigate back to home
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  ws.close();
}

testInteractions().catch(console.error);
