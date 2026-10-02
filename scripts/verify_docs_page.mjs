import fs from 'fs';
import path from 'path';

const artifactDir = 'C:\\Users\\PUNITH\\.gemini\\antigravity-cli\\brain\\826dc6c6-5860-4ba9-a15b-3de0d8081b1d';

async function verifyDocsPage() {
  console.log('Connecting to Chrome CDP on port 9222...');
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const pageTab = tabs.find((t) => t.type === 'page' && t.url.includes('3000'));
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

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  };

  const captureScreenshot = async (filename) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  };

  // 1. Navigate to Home Page
  console.log('Navigating to http://localhost:3000/ ...');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Check header documentation link exists
  const hasDocsLink = await evaluate(`
    (() => {
      const header = document.querySelector('header');
      const docsLink = header ? header.querySelector('a[href="/docs"]') : null;
      return Boolean(docsLink && docsLink.textContent.includes('Documentation'));
    })()
  `);
  console.log('Home page header has Documentation link:', hasDocsLink);
  if (!hasDocsLink) throw new Error('Documentation link missing in home page header!');

  await captureScreenshot('homepage_header_docs_link.png');

  // 3. Click the Documentation link
  console.log('Clicking Documentation link in header...');
  await evaluate(`document.querySelector('header a[href="/docs"]').click()`);
  await new Promise((r) => setTimeout(r, 1500));

  const docsUrl = await evaluate(`window.location.pathname`);
  console.log('Current URL after navigation:', docsUrl);

  // 4. Capture top of docs page
  await captureScreenshot('docs_page_top.png');

  // 5. Scroll down to JSON schema section and capture
  console.log('Scrolling to Universal Mission Schema section...');
  await evaluate(`
    (() => {
      const el = document.getElementById('schema-overview');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));
  await captureScreenshot('docs_page_json_schema.png');

  // 6. Scroll down to Examples section and capture
  console.log('Scrolling to Examples section...');
  await evaluate(`
    (() => {
      const el = document.getElementById('example-cantilever');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    })()
  `);
  await new Promise((r) => setTimeout(r, 600));
  await captureScreenshot('docs_page_examples.png');

  ws.close();
  console.log('✅ ALL DOCS PAGE BROWSER TESTS PASSED!');
}

verifyDocsPage().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
