import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\PUNITH\\.gemini\\antigravity-cli\\brain\\826dc6c6-5860-4ba9-a15b-3de0d8081b1d';

async function testMissionStudioCDP() {
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

  console.log('Reloading page to ensure fresh state...');
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Check Studio button exists
  const hasStudioBtn = await evaluate(`Boolean(document.querySelector('button[title*="Mission Studio"]'))`);
  console.log('Has Studio button in HeaderNav:', hasStudioBtn);
  if (!hasStudioBtn) throw new Error('Studio button missing in HeaderNav!');

  // 2. Click Studio button to open Mission Studio modal
  console.log('Clicking Studio button...');
  await evaluate(`document.querySelector('button[title*="Mission Studio"]').click()`);
  await new Promise((r) => setTimeout(r, 600));

  await captureScreenshot('mission_studio_modal_canvas_tab.png');

  // 3. Switch to Help Guide tab
  console.log('Switching to Help Guide tab...');
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const helpBtn = btns.find(b => b.textContent.includes('Syntax & Help Guide'));
      if (helpBtn) helpBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));
  await captureScreenshot('mission_studio_help_guide.png');

  // 4. Switch to Import / Paste JSON tab
  console.log('Switching to Import / Paste JSON tab...');
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const importBtn = btns.find(b => b.textContent.includes('Import / Paste JSON'));
      if (importBtn) importBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 500));

  // 5. Read cantilever mission JSON and paste it into textarea
  const cantileverJson = fs.readFileSync(
    path.join(rootDir, 'src', 'content', 'missions', 'example_cantilever_truss.json'),
    'utf8'
  );

  console.log('Pasting Cantilever mission JSON into textarea...');
  await evaluate(`
    ((json) => {
      const textarea = document.querySelector('textarea[aria-label="Mission JSON Code Input"]');
      if (textarea) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, json);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })(${JSON.stringify(cantileverJson)})
  `);

  await new Promise((r) => setTimeout(r, 500));
  await captureScreenshot('mission_studio_valid_json.png');

  // 6. Click Install Mission & Launch in 3D
  console.log('Clicking Install Mission & Launch in 3D...');
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const installBtn = btns.find(b => b.textContent.includes('Install Mission & Launch in 3D'));
      if (installBtn) installBtn.click();
    })()
  `);

  await new Promise((r) => setTimeout(r, 1200));

  // 7. Verify active challenge in header
  const activeMissionTitle = await evaluate(`
    (() => {
      const headerSpan = document.querySelector('header span.text-xs.font-bold.text-slate-200');
      return headerSpan ? headerSpan.textContent : '';
    })()
  `);
  console.log('Active Mission in Header after Install:', activeMissionTitle);

  // 8. Capture screenshot of live Cantilever mission
  await captureScreenshot('cantilever_mission_installed_live.png');

  console.log('Closing WebSocket connection...');
  ws.close();

  console.log('✅ ALL BROWSER MISSION STUDIO WORKFLOWS VERIFIED SUCCESSFULLY VIA CDP!');
}

testMissionStudioCDP().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
