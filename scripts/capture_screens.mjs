import fs from 'fs';
import path from 'path';

async function capture() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Get active tabs
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find((t) => t.type === 'page');

  if (!pageTab) {
    console.error('No page tab found in Chrome!');
    return;
  }

  console.log('Connecting to tab:', pageTab.title, pageTab.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  console.log('Connected to tab over CDP WebSocket.');

  await send('Page.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const pagesToCapture = [
    { url: 'http://localhost:3000/', file: 'homepage_all_subjects_grid.png', wait: 2000 },
    { url: 'http://localhost:3000/subjects/me-201', file: 'subject_me201_3d_lab.png', wait: 3500 },
    { url: 'http://localhost:3000/subjects/me-204', file: 'subject_me204_thermo_lab.png', wait: 2000 },
    { url: 'http://localhost:3000/subjects/me-301', file: 'subject_me301_fluid_lab.png', wait: 2000 },
    { url: 'http://localhost:3000/subjects/me-308', file: 'subject_me308_machine_design.png', wait: 2000 },
  ];

  for (const page of pagesToCapture) {
    console.log(`Navigating to ${page.url}...`);
    await send('Page.navigate', { url: page.url });
    await new Promise((r) => setTimeout(r, page.wait));

    const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, page.file);
    fs.writeFileSync(filePath, Buffer.from(screenshotData.data, 'base64'));
    console.log(`Saved screenshot: ${page.file} (${(screenshotData.data.length / 1024).toFixed(1)} KB)`);
  }

  // Navigate back to home page when finished
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  ws.close();
  console.log('Finished capturing all screenshots successfully!');
}

capture().catch(console.error);
