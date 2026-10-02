async function checkText() {
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
  await send('Runtime.enable');

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const portal = document.querySelector('nextjs-portal');
        if (portal && portal.shadowRoot) {
          const body = portal.shadowRoot.querySelector('div, main, dialog');
          return body ? body.textContent : portal.shadowRoot.textContent;
        }
        return 'none';
      })()
    `,
  });

  console.log('Issue content:', res.result?.value?.trim().substring(0, 400));
  ws.close();
}

checkText().catch(console.error);
