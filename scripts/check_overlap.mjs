async function checkOverlap() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const tb = document.querySelector('.absolute.top-4.left-4');
      const scrubber = document.getElementById('load-multiplier-slider')?.closest('div');
      const viewport = document.querySelector('div.relative.flex-1');

      const tbRect = tb ? tb.getBoundingClientRect() : null;
      const scrubberRect = scrubber ? scrubber.getBoundingClientRect() : null;
      const viewportRect = viewport ? viewport.getBoundingClientRect() : null;

      return {
        viewportBottom: viewportRect?.bottom,
        tbBottom: tbRect?.bottom,
        scrubberTop: scrubberRect?.top,
        tbHeight: tbRect?.height,
        viewportHeight: viewportRect?.height
      };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
}
checkOverlap().catch(console.error);
