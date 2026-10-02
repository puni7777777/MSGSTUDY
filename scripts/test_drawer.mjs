import fs from 'fs';

async function testDrawer() {
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
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('button[title*="metadata"]');
      if (btn) btn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('screenshots/drawer_overlay_open.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved drawer_overlay_open.png');
  ws.close();
}

testDrawer().catch(console.error);
