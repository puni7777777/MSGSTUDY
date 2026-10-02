import fs from 'fs';

async function runAssessmentB() {
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('CSS.enable');

  console.log('Navigating to http://localhost:3000/subjects/me-201...');
  await send('Page.navigate', { url: 'http://localhost:3000/subjects/me-201' });
  await new Promise((r) => setTimeout(r, 2500));

  // 1. Comprehensive Layout, Stacking & Collision Check
  const layoutReport = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Collect bounding boxes and z-indices for key HUD elements
        const getBox = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            id: el.id,
            className: el.className,
            top: r.top,
            left: r.left,
            bottom: r.bottom,
            right: r.right,
            width: r.width,
            height: r.height,
            zIndex: style.zIndex,
            position: style.position,
            overflow: style.overflow
          };
        };

        const theoryTitle = Array.from(document.querySelectorAll('*')).find(el => el.textContent === 'THEORY & FORMULAS');
        const theoryPanel = theoryTitle ? theoryTitle.closest('.w-80, .sm\\\\:w-88, div[class*=\"w-80\"]') : null;

        const theoryManualBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Theory Manual'));
        const subToolbar = theoryManualBtn ? theoryManualBtn.closest('div[class*=\"p-2\"]') : null;

        const builderToolbar = document.querySelector('div.max-h-\\\\[calc\\\\(100vh-14rem\\\\)\\\\]') || (theoryPanel ? theoryPanel.parentElement : null);

        const headerNav = document.querySelector('header, nav, div[class*=\"HeaderNav\"]');
        const courseHeader = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('ME-201:'));
        const courseHeaderCard = courseHeader ? courseHeader.closest('div[class*=\"rounded\"]') : null;

        const stressLegend = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('Axial Stress (MPa)'));
        const stressLegendBox = stressLegend ? stressLegend.closest('div[class*=\"rounded\"]') : null;

        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          theoryPanel: getBox(theoryPanel),
          subToolbar: getBox(subToolbar),
          builderToolbar: getBox(builderToolbar),
          courseHeaderCard: getBox(courseHeaderCard),
          stressLegendBox: getBox(stressLegendBox)
        };
      })()
    `,
    returnByValue: true
  });

  console.log('--- Layout & Stacking Report ---');
  console.log(JSON.stringify(layoutReport.result.value, null, 2));

  // 2. Interactive Verification of TheoryCalculationPanel & NumericStepperInput
  const interactionReport = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const forceInput = document.getElementById('theory-force-input');
        const forceLabel = document.querySelector('label[for=\"theory-force-input\"]');
        const areaInput = document.getElementById('theory-area-input');
        const areaLabel = document.querySelector('label[for=\"theory-area-input\"]');
        const yieldInput = document.getElementById('theory-yield-input');
        const yieldLabel = document.querySelector('label[for=\"theory-yield-input\"]');

        // Check stepper buttons
        const stepperButtons = Array.from(document.querySelectorAll('button[aria-label*=\"Increase\"], button[aria-label*=\"Decrease\"]')).map(b => ({
          ariaLabel: b.getAttribute('aria-label'),
          title: b.title,
          height: b.getBoundingClientRect().height,
          width: b.getBoundingClientRect().width
        }));

        // Test typing negative number -65.5
        const initialVal = forceInput ? forceInput.value : null;
        if (forceInput) {
          forceInput.focus();
          forceInput.value = '-65.5';
          forceInput.dispatchEvent(new Event('change', { bubbles: true }));
          forceInput.blur();
        }

        // Test stepping on areaInput
        const upBtn = areaInput ? areaInput.parentElement.querySelector('button[aria-label*=\"Increase\"]') : null;
        const initialArea = areaInput ? areaInput.value : null;
        if (upBtn) {
          upBtn.click();
        }
        const updatedArea = areaInput ? areaInput.value : null;

        // Check live solution card output text
        const realTimeSolution = Array.from(document.querySelectorAll('*')).find(el => el.textContent === 'Real-Time Solution');
        const solutionCard = realTimeSolution ? realTimeSolution.parentElement.innerText : null;

        return {
          labels: {
            forceLabelText: forceLabel ? forceLabel.textContent.trim() : null,
            areaLabelText: areaLabel ? areaLabel.textContent.trim() : null,
            yieldLabelText: yieldLabel ? yieldLabel.textContent.trim() : null,
            hasMatchingFor: !!(forceLabel && forceLabel.getAttribute('for') === 'theory-force-input')
          },
          typingTest: {
            initialVal,
            typedVal: forceInput ? forceInput.value : null,
            acceptedNegative: forceInput ? forceInput.value === '-65.5' : false
          },
          stepperTest: {
            initialArea,
            updatedArea,
            steppersCount: stepperButtons.length,
            sampleSteppers: stepperButtons.slice(0, 4)
          },
          solutionCardPreview: solutionCard ? solutionCard.split('\\n').slice(0, 5).join(' | ') : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('--- Interactive Verification Report ---');
  console.log(JSON.stringify(interactionReport.result.value, null, 2));

  // 3. Tab Switching Verification (Tabs 1, 2, 3, 4)
  const tabReport = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tabs = Array.from(document.querySelectorAll('button')).filter(b => {
          const t = b.textContent.trim();
          return t.includes('σ = F/A') || t.includes('P_cr') || t.includes('FOS') || t.includes('ΔL');
        });

        const tabStyles = tabs.map(t => {
          const s = window.getComputedStyle(t);
          return {
            text: t.textContent.trim(),
            color: s.color,
            backgroundColor: s.backgroundColor,
            fontWeight: s.fontWeight,
            fontSize: s.fontSize
          };
        });

        return {
          tabCount: tabs.length,
          tabStyles
        };
      })()
    `,
    returnByValue: true
  });

  console.log('--- Tab Switcher Report ---');
  console.log(JSON.stringify(tabReport.result.value, null, 2));

  // 4. Contrast and Font Size Audit on HUD text
  const hudTypographyReport = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const theoryTitle = Array.from(document.querySelectorAll('*')).find(el => el.textContent === 'THEORY & FORMULAS');
        const theoryPanel = theoryTitle ? theoryTitle.closest('.w-80, .sm\\\\:w-88, div[class*=\"w-80\"]') : null;
        if (!theoryPanel) return { error: 'Theory panel not found' };

        // Helper to calculate relative luminance & contrast
        function parseRgb(colorStr) {
          const match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
          if (!match) return null;
          return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        }

        function lum(rgb) {
          const a = rgb.map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        }

        function contrast(rgb1, rgb2) {
          const l1 = lum(rgb1);
          const l2 = lum(rgb2);
          const bright = Math.max(l1, l2);
          const dark = Math.min(l1, l2);
          return (bright + 0.05) / (dark + 0.05);
        }

        const textNodes = [];
        const walk = (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(node);
            const text = Array.from(node.childNodes)
              .filter(c => c.nodeType === Node.TEXT_NODE)
              .map(c => c.textContent.trim())
              .join(' ');

            if (text && style.display !== 'none' && style.visibility !== 'hidden') {
              textNodes.push({
                tag: node.tagName,
                text: text.slice(0, 40),
                color: style.color,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight
              });
            }
          }
          for (const child of node.childNodes) walk(child);
        };
        walk(theoryPanel);

        return {
          totalTextElements: textNodes.length,
          fontSizesUsed: [...new Set(textNodes.map(t => t.fontSize))],
          sub10pxFonts: textNodes.filter(t => parseFloat(t.fontSize) < 10),
          sampleElements: textNodes.slice(0, 15)
        };
      })()
    `,
    returnByValue: true
  });

  console.log('--- HUD Typography & Contrast Audit ---');
  console.log(JSON.stringify(hudTypographyReport.result.value, null, 2));

  // 5. Capture crisp screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = 'screenshots/assessment_b_verified.png';
  fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
  console.log('Screenshot captured to:', outPath);

  ws.close();
}

runAssessmentB().catch((err) => {
  console.error(err);
  process.exit(1);
});
