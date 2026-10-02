import fs from 'fs';

async function testInspectorLayering() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const curId = msgId++;
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

  // Select a member in the store by clicking the canvas or invoking zustand store
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Let's find zustand store from the window or react root
        const reactRoot = document.querySelector('#__next') || document.body.firstElementChild;
        // Or find canvas and simulate click
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          // Click near center
          const evt = new MouseEvent('pointerdown', {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true
          });
          canvas.dispatchEvent(evt);
        }

        // Check if there is an open inspector
        const memberHeaders = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.startsWith('Member: '));
        const jointHeaders = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.startsWith('Joint Inspector: '));

        const panel = (memberHeaders[0] || jointHeaders[0]) ? (memberHeaders[0] || jointHeaders[0]).closest('.z-30') : null;

        return {
          canvasFound: !!canvas,
          inspectorFound: !!panel,
          inspectorRect: panel ? panel.getBoundingClientRect() : null,
          inspectorClasses: panel ? panel.className : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Inspector Test:', JSON.stringify(evalResult.result.value, null, 2));

  // Let's also check all z-index elements on the page
  const zIndexReport = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const elementsWithZ = Array.from(document.querySelectorAll('*')).filter(el => {
          const z = window.getComputedStyle(el).zIndex;
          return z !== 'auto' && z !== '0';
        }).map(el => ({
          tag: el.tagName,
          className: el.className.toString().slice(0, 80),
          zIndex: window.getComputedStyle(el).zIndex,
          rect: el.getBoundingClientRect()
        }));

        return elementsWithZ;
      })()
    `,
    returnByValue: true
  });

  console.log('--- Elements with z-index ---');
  console.log(JSON.stringify(zIndexReport.result.value, null, 2));

  ws.close();
}

testInspectorLayering().catch(console.error);
