import fs from 'fs';

async function verifyFixes() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find((t) => t.type === 'page');
  if (!pageTab) {
    console.error('No page tab found on port 9222');
    process.exit(1);
  }

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

  const logs = [];
  ws.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      const text = d.params.args.map((a) => a.value || a.description).join(' ');
      logs.push(`[${d.params.type}] ${text}`);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Navigate to subjects/me-201
  await send('Page.navigate', { url: 'http://localhost:3000/subjects/me-201' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Check accessibility attributes and typing negative numbers
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const forceInput = document.getElementById('theory-force-input');
        const forceLabel = document.querySelector('label[for="theory-force-input"]');
        const areaInput = document.getElementById('theory-area-input');
        const areaLabel = document.querySelector('label[for="theory-area-input"]');

        const stepperBtns = document.querySelectorAll('button[aria-label*="Increase"], button[aria-label*="Decrease"]');

        // Test typing negative number
        forceInput.focus();
        forceInput.value = '-75';
        forceInput.dispatchEvent(new Event('change', { bubbles: true }));
        forceInput.blur();

        return {
          forceInputFound: !!forceInput,
          forceLabelFound: !!forceLabel,
          areaInputFound: !!areaInput,
          areaLabelFound: !!areaLabel,
          forceInputValue: forceInput ? forceInput.value : null,
          stepperBtnsCount: stepperBtns.length,
          stepperAriaLabels: Array.from(stepperBtns).slice(0, 4).map(b => b.getAttribute('aria-label'))
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('DOM Evaluation:', JSON.stringify(evalResult.result.value, null, 2));

  // Wait a moment for re-render
  await new Promise((r) => setTimeout(r, 1000));

  // Take screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  const artifactPath =
    'C:/Users/PUNITH/.gemini/antigravity-cli/brain/826dc6c6-5860-4ba9-a15b-3de0d8081b1d/critique_fixes_verified.png';
  fs.writeFileSync(artifactPath, Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot to:', artifactPath);

  console.log('Console warnings/errors during test:', logs.filter((l) => l.includes('warn') || l.includes('error')));

  ws.close();
}

verifyFixes().catch((err) => {
  console.error(err);
  process.exit(1);
});
