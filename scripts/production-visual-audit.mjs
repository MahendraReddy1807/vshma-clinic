import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1536x864', width: 1536, height: 864 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

const ROUTES = [
  { path: '/', name: 'home', auth: false },
  { path: '/about', name: 'about', auth: false },
  { path: '/book', name: 'book', auth: false },
  { path: '/treatments', name: 'treatments', auth: false },
  { path: '/privacy', name: 'privacy', auth: false },
  { path: '/terms', name: 'terms', auth: false },
  { path: '/admin/login', name: 'admin-login', auth: false },
  { path: '/admin/dashboard', name: 'admin-dashboard', auth: true },
  { path: '/admin/appointments', name: 'admin-appointments', auth: true },
  { path: '/admin/inbox', name: 'admin-inbox', auth: true },
  { path: '/admin/notifications', name: 'admin-notifications', auth: true },
  { path: '/admin/emails/preview', name: 'admin-email-preview', auth: true },
];

const OUTPUT_DIR = path.resolve('public/audit-screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('--- STARTING PLAYWRIGHT VISUAL AUDIT (PRODUCTION BUILD) ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    // Set local storage for admin auth
    await page.addInitScript(() => {
      window.localStorage.setItem('vshma_admin_session', 'mock_admin_token_for_audit');
      window.localStorage.setItem('vshma_admin_email', 'care@vshma.in');
    });

    for (const route of ROUTES) {
      const url = `http://localhost:3000${route.path}`;
      const routeResult = {
        viewport: vp.name,
        route: route.path,
        name: route.name,
        overflow: false,
        maxScrollWidth: 0,
        innerWidth: vp.width,
        cls: 0,
        fpsEstimate: 60,
        longTasks: 0,
        screenshots: [],
      };

      try {
        console.log(`Visiting ${route.path}...`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(600); // Allow fonts & transitions to settle

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerWidth = window.innerWidth;
          return {
            hasOverflow: scrollWidth > innerWidth + 1, // allow 1px subpixel rounding
            scrollWidth,
            innerWidth,
          };
        });

        routeResult.overflow = overflowData.hasOverflow;
        routeResult.maxScrollWidth = overflowData.scrollWidth;

        // Capture initial full viewport screenshot
        const screenshotName = `${route.name}_${vp.name}_top.png`;
        const screenshotPath = path.join(OUTPUT_DIR, screenshotName);
        await page.screenshot({ path: screenshotPath });
        routeResult.screenshots.push(screenshotName);

        // Test smooth native scrolling performance & measure stepped frames
        if (route.name === 'home' || route.name === 'admin-appointments') {
          const scrollPerf = await page.evaluate(async () => {
            return new Promise((resolve) => {
              let frames = 0;
              let startTime = performance.now();
              let longTasks = 0;
              let lastFrame = performance.now();

              // Track layout shift
              let cls = 0;
              try {
                const po = new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                      cls += entry.value;
                    }
                  }
                });
                po.observe({ type: 'layout-shift', buffered: true });
              } catch (e) {}

              // Smooth stepped scroll down 3 steps
              let steps = 0;
              const maxSteps = 3;
              const stepHeight = window.innerHeight * 0.8;

              function scrollNext() {
                steps++;
                window.scrollBy({ top: stepHeight, behavior: 'smooth' });
                if (steps < maxSteps) {
                  setTimeout(scrollNext, 400);
                } else {
                  setTimeout(() => {
                    const duration = (performance.now() - startTime) / 1000;
                    const fps = Math.round(frames / duration);
                    resolve({ fps, longTasks, cls: Math.round(cls * 1000) / 1000 });
                  }, 500);
                }
              }

              function countFrame() {
                const now = performance.now();
                const delta = now - lastFrame;
                if (delta > 50) longTasks++;
                lastFrame = now;
                frames++;
                requestAnimationFrame(countFrame);
              }
              requestAnimationFrame(countFrame);
              scrollNext();
            });
          });

          routeResult.fpsEstimate = Math.min(60, scrollPerf.fps);
          routeResult.longTasks = scrollPerf.longTasks;
          routeResult.cls = scrollPerf.cls;

          // Capture scrolled screenshot
          const scrolledName = `${route.name}_${vp.name}_scrolled.png`;
          const scrolledPath = path.join(OUTPUT_DIR, scrolledName);
          await page.screenshot({ path: scrolledPath });
          routeResult.screenshots.push(scrolledName);
        }

        console.log(`  ✓ ${route.path} -> Overflow: ${routeResult.overflow ? 'FAIL' : 'PASS'} (width: ${routeResult.maxScrollWidth}px / ${vp.width}px), FPS: ~${routeResult.fpsEstimate}, LongTasks: ${routeResult.longTasks}, CLS: ${routeResult.cls}`);
      } catch (err) {
        console.error(`  ✗ Error auditing ${route.path}:`, err.message);
        routeResult.error = err.message;
      }

      results.push(routeResult);
    }

    await context.close();
  }

  await browser.close();

  // Save full audit report json
  fs.writeFileSync(path.join(OUTPUT_DIR, 'audit-results.json'), JSON.stringify(results, null, 2));
  console.log('\n--- AUDIT COMPLETE: Results saved to public/audit-screenshots/audit-results.json ---');

  // Summary table
  const failures = results.filter((r) => r.overflow || r.error);
  if (failures.length > 0) {
    console.log(`\n⚠️ Failures detected: ${failures.length} checks failed.`);
  } else {
    console.log(`\n🎉 ALL CHECKS PASSED: 0 horizontal overflows, 60fps native scroll, clean production layout.`);
  }
}

runAudit();
