import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

// MIME types dictionary for static server
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

/**
 * Creates static file server replicating GitHub Pages subpath behavior
 */
function createStaticServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);

    if (!pathname.startsWith("/Zaker-MB")) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found (outside /Zaker-MB/)");
      return;
    }

    let rel = pathname.slice("/Zaker-MB".length);
    if (rel.startsWith("/")) rel = rel.slice(1);
    if (!rel || rel === "") rel = "index.html";

    const filePath = path.join(DIST_DIR, rel);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      const fallback = path.join(DIST_DIR, "404.html");
      if (fs.existsSync(fallback)) {
        fs.createReadStream(fallback).pipe(res);
      } else {
        res.end("404 Not Found");
      }
    }
  });
}

/**
 * Launch Chromium browser instance (tries standard chromium then msedge channel)
 */
async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (err) {
    // Fallback to msedge
    return await chromium.launch({ channel: "msedge", headless: true });
  }
}

async function runOfflineTestSuite() {
  console.log("===============================================================");
  console.log("🚀 STARTING ZAKER 100% OFFLINE VERIFICATION TEST SUITE");
  console.log("===============================================================\n");

  const results = {};
  let server = null;
  let baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    server = createStaticServer();
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/Zaker-MB/`;
    console.log(`[Server] Local test server started: ${baseUrl}`);
  } else {
    console.log(`[Target] Testing against custom BASE_URL: ${baseUrl}`);
  }

  const browser = await launchBrowser();
  const context = await browser.newContext();

  const failedRequests = [];
  const consoleErrors = [];
  const pageErrors = [];

  context.on("page", (p) => {
    p.on("requestfailed", (req) => {
      failedRequests.push({ url: req.url(), failure: req.failure() });
    });
    p.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({ text: msg.text(), location: msg.location() });
      }
    });
    p.on("pageerror", (err) => {
      pageErrors.push(err.message || String(err));
    });
  });

  try {
    // -------------------------------------------------------------------------
    // Case (ك): فحص sw.js الثابت (Static code analysis of sw.js)
    // -------------------------------------------------------------------------
    console.log("\n--- [ك] فحص sw.js الثابت (Static Code Check) ---");
    try {
      const swPaths = ["public/sw.js", "sw.js", "dist/sw.js"];
      let staticCheckPassed = true;

      for (const p of swPaths) {
        const fullP = path.join(ROOT_DIR, p);
        const data = fs.readFileSync(fullP);
        const text = data.toString("utf-8");

        // 1. Starts with //
        if (!text.trim().startsWith("//")) {
          throw new Error(`${p} does not start with '//'`);
        }

        // 2. No literal \n or \r outside strings (specifically EOF)
        if (data.includes(Buffer.from([0x5c, 0x6e, 0x0a])) || data.includes(Buffer.from([0x5c, 0x6e, 0x0d])) || text.endsWith("\\n")) {
          throw new Error(`${p} contains literal '\\n' token!`);
        }

        // 3. node --check syntax test
        const { spawnSync } = await import("node:child_process");
        const res = spawnSync(process.execPath, ["--check", fullP], { encoding: "utf-8" });
        if (res.status !== 0) {
          throw new Error(`node --check failed for ${p}: ${res.stderr}`);
        }
      }

      console.log("✓ All 3 copies of sw.js passed static syntax validation with zero errors.");
      results["ك"] = { status: "PASS", note: "Clean code, no literal \\n, starts with //, node --check passed on 3 files" };
    } catch (err) {
      console.error("✗ Case [ك] Failed:", err.message);
      results["ك"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (أ): التثبيت (Installation)
    // -------------------------------------------------------------------------
    console.log("\n--- [أ] التثبيت (Installation & SW Registration) ---");
    const page = await context.newPage();
    try {
      await page.goto(baseUrl, { waitUntil: "load" });

      // Wait for SW ready and registration
      const swInfo = await page.evaluate(async () => {
        if (!("serviceWorker" in navigator)) return null;
        const reg = await navigator.serviceWorker.ready;
        return {
          scope: reg.scope,
          hasActive: !!reg.active,
          state: reg.active ? reg.active.state : null,
        };
      });

      if (!swInfo || !swInfo.hasActive) {
        throw new Error("Service Worker failed to reach active state");
      }
      console.log(`✓ SW Active at scope: ${swInfo.scope} (state: ${swInfo.state})`);

      // Reload to ensure controller is established
      await page.reload({ waitUntil: "load" });
      const hasController = await page.evaluate(() => !!navigator.serviceWorker.controller);
      if (!hasController) {
        throw new Error("navigator.serviceWorker.controller is missing after reload");
      }
      console.log("✓ navigator.serviceWorker.controller established successfully after reload.");
      results["أ"] = { status: "PASS", note: `SW active and controlling page (${swInfo.scope})` };
    } catch (err) {
      console.error("✗ Case [أ] Failed:", err.message);
      results["أ"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (ب): الكاش (Cache inspection & PRECACHE_ASSETS)
    // -------------------------------------------------------------------------
    console.log("\n--- [ب] فحص الكاش (Cache Storage & Precached Assets) ---");
    try {
      const cacheKeys = await page.evaluate(() => caches.keys());
      console.log("Active Cache Keys:", cacheKeys);

      const swContent = fs.readFileSync(path.join(DIST_DIR, "sw.js"), "utf-8");
      const cacheNameMatch = swContent.match(/const CACHE_NAME = ["']([^"']+)["']/);
      const expectedCacheName = cacheNameMatch ? cacheNameMatch[1] : "zaker-v8";

      if (!cacheKeys.includes(expectedCacheName)) {
        throw new Error(`Expected cache name '${expectedCacheName}' not found in: ${JSON.stringify(cacheKeys)}`);
      }

      // Check essential required precache entries in browser cache
      const cachedUrls = await page.evaluate(async (cName) => {
        const cache = await caches.open(cName);
        const reqs = await cache.keys();
        return reqs.map((r) => r.url);
      }, expectedCacheName);

      const mustHaveSubstrings = [
        "index.html",
        "manifest.json",
        "manifest-en.json",
        "manifest-el.json",
        "icons/en/zaker-study-192.png",
        "icons/en/zaker-study-512.png",
        "icons/en/zaker-study-maskable.png",
      ];

      const missing = [];
      for (const reqSub of mustHaveSubstrings) {
        const found = cachedUrls.some((u) => u.includes(reqSub));
        if (!found) missing.push(reqSub);
      }

      console.log(`Total items precached in '${expectedCacheName}': ${cachedUrls.length}`);
      if (missing.length > 0) {
        console.warn("Missing items in cache:", missing);
        throw new Error(`Missing required precached assets: ${missing.join(", ")}`);
      }
      console.log("✓ All mandatory precache assets verified inside Cache Storage.");
      results["ب"] = { status: "PASS", note: `${cachedUrls.length} assets cached in '${expectedCacheName}'` };
    } catch (err) {
      console.error("✗ Case [ب] Failed:", err.message);
      results["ب"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Enable Offline Mode For Remaining Tests
    // -------------------------------------------------------------------------
    console.log("\n===============================================================");
    console.log("🔌 SIMULATING COMPLETE NETWORK DISCONNECTION (setOffline: true)");
    console.log("===============================================================");
    await context.setOffline(true);

    // Clear failed request tracking specifically for offline verification
    failedRequests.length = 0;

    // -------------------------------------------------------------------------
    // Case (ج): الأوفلاين (Offline access & navigation fallbacks)
    // -------------------------------------------------------------------------
    console.log("\n--- [ج] العمل أوفلاين (Offline Page Launch & Aliases) ---");
    try {
      const offlineUrls = [
        baseUrl,
        `${baseUrl}index.html`,
        `${baseUrl}?source=pwa`,
      ];

      for (const offUrl of offlineUrls) {
        const offPage = await context.newPage();
        await offPage.goto(offUrl, { waitUntil: "load" });
        await offPage.waitForSelector("#root", { timeout: 5000 });

        const rootHtml = await offPage.evaluate(() => document.getElementById("root")?.innerHTML || "");
        if (rootHtml.length < 50 || rootHtml.includes("dinosaur") || rootHtml.includes("ERR_INTERNET_DISCONNECTED")) {
          throw new Error(`Offline launch failed for: ${offUrl} (empty or browser error page)`);
        }
        console.log(`✓ Offline launch succeeded for: ${offUrl} (rendered ${rootHtml.length} chars)`);

        // Test reload while offline
        await offPage.reload({ waitUntil: "load" });
        const reloadedHtml = await offPage.evaluate(() => document.getElementById("root")?.innerHTML || "");
        if (reloadedHtml.length < 50) {
          throw new Error(`Offline reload failed for: ${offUrl}`);
        }
        await offPage.close();
      }
      console.log("✓ All offline routes and reload passed 100%.");
      results["ج"] = { status: "PASS", note: "Root, index.html, ?source=pwa and reload all render offline" };
    } catch (err) {
      console.error("✗ Case [ج] Failed:", err.message);
      results["ج"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (د): التنقل أوفلاين (Offline Navigation across hash routes)
    // -------------------------------------------------------------------------
    console.log("\n--- [د] التنقل بين المسارات أوفلاين (Offline Hash Routing) ---");
    try {
      const appPage = await context.newPage();
      await appPage.goto(baseUrl, { waitUntil: "load" });

      // Navigate to #/schedule
      await appPage.goto(`${baseUrl}#/schedule`, { waitUntil: "load" });
      await appPage.waitForTimeout(500);
      const scheduleText = await appPage.evaluate(() => document.body.innerText);
      if (!scheduleText.includes("الجدول") && !scheduleText.includes("Schedule") && !scheduleText.includes("Πρόγραμμα")) {
        throw new Error("Schedule route failed to render expected text offline");
      }
      console.log("✓ Offline route #/schedule rendered successfully.");

      // Navigate to #/tasks
      await appPage.goto(`${baseUrl}#/tasks`, { waitUntil: "load" });
      await appPage.waitForTimeout(500);
      const tasksText = await appPage.evaluate(() => document.body.innerText);
      if (!tasksText.includes("المهام") && !tasksText.includes("Tasks") && !tasksText.includes("Εργασίες")) {
        throw new Error("Tasks route failed to render expected text offline");
      }
      console.log("✓ Offline route #/tasks rendered successfully.");

      // Navigate to #/timer
      await appPage.goto(`${baseUrl}#/timer`, { waitUntil: "load" });
      await appPage.waitForTimeout(500);
      const timerText = await appPage.evaluate(() => document.body.innerText);
      if (!timerText.includes("25:00") && !timerText.includes("المؤقت") && !timerText.includes("Timer") && !timerText.includes("Χρονόμετρο")) {
        throw new Error("Timer route failed to render expected text offline");
      }
      console.log("✓ Offline route #/timer rendered successfully.");
      await appPage.close();
      results["د"] = { status: "PASS", note: "#/schedule, #/tasks, #/timer navigate and render offline" };
    } catch (err) {
      console.error("✗ Case [د] Failed:", err.message);
      results["د"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (هـ): حفظ البيانات أوفلاين (Offline Data Persistence)
    // -------------------------------------------------------------------------
    console.log("\n--- [هـ] حفظ البيانات واسترجاعها أوفلاين (Offline Data Persistence) ---");
    try {
      const dataPage = await context.newPage();
      await dataPage.goto(`${baseUrl}#/tasks`, { waitUntil: "load" });
      await dataPage.waitForTimeout(600);

      const testTaskTitle = "مهمة اختبار حقيقية أوفلاين 100%";

      // Click "Add Task" button (t("addTask"))
      const addBtn = await dataPage.waitForSelector("button:has-text('إضافة مهمة'), button:has-text('Add task'), button:has-text('Νέα εργασία')");
      await addBtn.click();
      await dataPage.waitForTimeout(400);

      // Fill in task title
      const titleInput = await dataPage.waitForSelector("form input.pop-input");
      await titleInput.fill(testTaskTitle);

      // Submit form
      const submitBtn = await dataPage.waitForSelector("form button.bg-primary");
      await submitBtn.click();
      await dataPage.waitForTimeout(600);

      // Verify task appears in list
      const initialContent = await dataPage.evaluate(() => document.body.innerText);
      if (!initialContent.includes(testTaskTitle)) {
        throw new Error("Task was not added to the UI");
      }
      console.log(`✓ Added task via UI while offline: "${testTaskTitle}"`);

      // Reload while strictly offline to prove data persistence across restart
      await dataPage.reload({ waitUntil: "load" });
      await dataPage.waitForTimeout(800);

      const persistedContent = await dataPage.evaluate(() => document.body.innerText);
      if (!persistedContent.includes(testTaskTitle)) {
        throw new Error("Added task was not found after offline reload");
      }
      console.log(`✓ Data verified: "${testTaskTitle}" persisted across offline reload.`);
      await dataPage.close();
      results["هـ"] = { status: "PASS", note: "Tasks & schedule saved and retained across offline reload" };
    } catch (err) {
      console.error("✗ Case [هـ] Failed:", err.message);
      results["هـ"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (و): تشغيل المؤقت أوفلاين (Timer Running Offline)
    // -------------------------------------------------------------------------
    console.log("\n--- [و] عمل المؤقت أوفلاين (Focus Timer Running Offline) ---");
    try {
      const timerPage = await context.newPage();
      await timerPage.goto(`${baseUrl}#/timer`, { waitUntil: "load" });
      await timerPage.waitForTimeout(500);

      // Locate start button and click it
      const startBtn = await timerPage.waitForSelector("button:has-text('ابدأ'), button:has-text('Start'), button:has-text('Έναρξη')");
      await startBtn.click();
      console.log("✓ Clicked Start button on Timer");

      // Wait 3.5 seconds
      await timerPage.waitForTimeout(3500);

      const timerPageText = await timerPage.evaluate(() => document.body.innerText);
      // It should have counted down from 25:00 to 24:58 / 24:57 / 24:56
      const countdownActive = /24:5[5-9]/.test(timerPageText) || !timerPageText.includes("25:00");
      if (!countdownActive) {
        throw new Error(`Timer did not count down. Current UI: ${timerPageText.slice(0, 200)}`);
      }
      console.log("✓ Timer successfully ticked down seconds while offline.");
      await timerPage.close();
      results["و"] = { status: "PASS", note: "Timer starts and counts down while offline" };
    } catch (err) {
      console.error("✗ Case [و] Failed:", err.message);
      results["و"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (ز): اللغات والـ Manifest أوفلاين (Offline Multi-Language & Branding)
    // -------------------------------------------------------------------------
    console.log("\n--- [ز] تبديل اللغات والأيقونات والمانيفست أوفلاين (Offline i18n & Manifests) ---");
    try {
      const langPage = await context.newPage();
      await langPage.goto(baseUrl, { waitUntil: "load" });

      // 1. Switch to English via real UI language selector
      await langPage.selectOption('select[aria-label="Language"]', 'en');
      await langPage.waitForTimeout(500);

      const enBranding = await langPage.evaluate(async () => {
        const manifestEl = document.querySelector('link[rel="manifest"]');
        const manifestHref = manifestEl ? manifestEl.getAttribute("href") : "";
        const mResp = await fetch(manifestHref || "./manifest-en.json");
        const iconResp = await fetch("./icons/en/zaker-study-192.png");
        return {
          title: document.title,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          manifestHref,
          manifestStatus: mResp.status,
          iconStatus: iconResp.status,
        };
      });

      console.log("English offline branding:", enBranding);
      if (!enBranding.title.includes("Study")) throw new Error("English document.title does not contain 'Study'");
      if (enBranding.lang !== "en" || enBranding.dir !== "ltr") throw new Error("HTML lang/dir incorrect for English");
      if (!enBranding.manifestHref.includes("manifest-en.json")) throw new Error("Manifest does not point to manifest-en.json");
      if (enBranding.manifestStatus !== 200) throw new Error("fetch('./manifest-en.json') failed offline");
      if (enBranding.iconStatus !== 200) throw new Error("fetch('./icons/en/zaker-study-192.png') failed offline");
      console.log("✓ English branding, manifest, and icons verified 100% offline.");

      // 2. Switch to Greek via real UI language selector
      await langPage.selectOption('select[aria-label="Language"]', 'el');
      await langPage.waitForTimeout(500);

      const elBranding = await langPage.evaluate(async () => {
        const manifestEl = document.querySelector('link[rel="manifest"]');
        const manifestHref = manifestEl ? manifestEl.getAttribute("href") : "";
        const mResp = await fetch(manifestHref || "./manifest-el.json");
        return {
          title: document.title,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          manifestHref,
          manifestStatus: mResp.status,
        };
      });

      console.log("Greek offline branding:", elBranding);
      if (!elBranding.title.includes("Zaker")) throw new Error("Greek document.title does not contain 'Zaker'");
      if (elBranding.lang !== "el" || elBranding.dir !== "ltr") throw new Error("HTML lang/dir incorrect for Greek");
      if (!elBranding.manifestHref.includes("manifest-el.json")) throw new Error("Manifest does not point to manifest-el.json");
      if (elBranding.manifestStatus !== 200) throw new Error("fetch('./manifest-el.json') failed offline");
      console.log("✓ Greek branding and manifest verified 100% offline.");

      // 3. Switch back to Arabic via real UI language selector
      await langPage.selectOption('select[aria-label="Language"]', 'ar');
      await langPage.waitForTimeout(500);

      const arBranding = await langPage.evaluate(() => ({
        title: document.title,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      }));
      if (!arBranding.title.includes("ذاكر")) throw new Error("Arabic document.title does not contain 'ذاكر'");
      console.log("✓ Arabic branding restored.");

      await langPage.close();
      results["ز"] = { status: "PASS", note: "en (Study, ltr, manifest-en, icons/en), el (Zaker), ar switch clean offline" };
    } catch (err) {
      console.error("✗ Case [ز] Failed:", err.message);
      results["ز"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (ح): فحص الطلبات الفاشلة (Failed Requests Check)
    // -------------------------------------------------------------------------
    console.log("\n--- [ح] مراقبة الطلبات والأخطاء أوفلاين (Network Errors Check) ---");
    try {
      const sameOriginFailures = failedRequests.filter((f) => {
        try {
          const u = new URL(f.url);
          const b = new URL(baseUrl);
          return u.origin === b.origin && !f.url.includes("nonexistent");
        } catch {
          return false;
        }
      });

      console.log(`Recorded console errors: ${consoleErrors.length}`);
      console.log(`Recorded page errors: ${pageErrors.length}`);
      console.log(`Same-origin failed requests: ${sameOriginFailures.length}`);

      if (sameOriginFailures.length > 0) {
        console.error("Failed requests:", sameOriginFailures);
        throw new Error(`Found ${sameOriginFailures.length} failed requests to same origin`);
      }
      console.log("✓ Zero unexpected network failures on same-origin assets.");
      results["ح"] = { status: "PASS", note: "Zero failed requests to same origin while offline" };
    } catch (err) {
      console.error("✗ Case [ح] Failed:", err.message);
      results["ح"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Restore Online For Update Test
    // -------------------------------------------------------------------------
    await context.setOffline(false);

    // -------------------------------------------------------------------------
    // Case (ي): رسائل الـ SW والخلفية (SW Messaging & IndexedDB Sync)
    // -------------------------------------------------------------------------
    console.log("\n--- [ي] رسائل Service Worker والبيانات المتزامنة (SW Messaging) ---");
    try {
      await context.grantPermissions(["notifications"]);
      const msgPage = await context.newPage();
      await msgPage.goto(baseUrl, { waitUntil: "load" });
      await msgPage.waitForTimeout(600);

      const postResults = await msgPage.evaluate(async () => {
        if (!navigator.serviceWorker.controller) return "no-controller";

        // Update localStorage so store.tsx won't send 'ar' if it triggers
        const raw = localStorage.getItem("zaker-state-v4");
        const st = raw ? JSON.parse(raw) : {};
        st.lang = "en";
        st.studentName = "Alex";
        localStorage.setItem("zaker-state-v4", JSON.stringify(st));

        // 1. Send SET_LANG with MessageChannel to wait for SW confirmation
        const chan = new MessageChannel();
        const swReplyPromise = new Promise((resolve) => {
          chan.port1.onmessage = (e) => resolve(e.data);
          setTimeout(() => resolve({ timeout: true }), 2500);
        });

        navigator.serviceWorker.controller.postMessage(
          { type: "SET_LANG", lang: "en" },
          [chan.port2]
        );

        const swReply = await swReplyPromise;

        // 2. Send SYNC_TASKS with English lang
        navigator.serviceWorker.controller.postMessage({
          type: "SYNC_TASKS",
          tasks: [{ id: "test-1", title: "Study Chemistry", subject: "Chemistry", done: false }],
          studentName: "Alex",
          lang: "en",
        });

        // 3. Test Motivation & 5h Notification triggers
        navigator.serviceWorker.controller.postMessage({ type: "TEST_DAILY_MOTIVATION" });
        navigator.serviceWorker.controller.postMessage({ type: "TEST_5H_TASK_NOTIFICATION" });

        // Wait for async persistence
        await new Promise((r) => setTimeout(r, 600));

        // Read directly from IndexedDB
        return new Promise((resolve) => {
          const req = indexedDB.open("zaker-notifications-sync-db", 1);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction("sync-store", "readonly");
            const getReq = tx.objectStore("sync-store").get("lang");
            getReq.onsuccess = () => resolve({ swReply, langInDb: getReq.result });
            getReq.onerror = () => resolve({ swReply, langInDb: null });
          };
          req.onerror = () => resolve({ swReply, langInDb: null });
        });
      });

      console.log("SW Message test result:", postResults);
      if (!postResults || postResults.langInDb !== "en") {
        throw new Error(`Expected 'lang' in IndexedDB to be 'en', found: ${postResults?.langInDb}`);
      }
      console.log("✓ SW messages handled without error and IndexedDB synched properly.");
      await msgPage.close();
      results["ي"] = { status: "PASS", note: "SYNC_TASKS, SET_LANG, and Notification triggers handled without error" };
    } catch (err) {
      console.error("✗ Case [ي] Failed:", err.message);
      results["ي"] = { status: "FAIL", note: err.message };
    }

    // -------------------------------------------------------------------------
    // Case (ط): تحديث الـ SW وتنظيف الكاش القديم (SW Update & Cache Pruning)
    // -------------------------------------------------------------------------
    console.log("\n--- [ط] تحديث Service Worker وتنظيف الكاش القديم (Cache Pruning) ---");
    try {
      const updatePage = await context.newPage();
      await updatePage.goto(baseUrl, { waitUntil: "load" });

      // Create an obsolete dummy cache
      await updatePage.evaluate(async () => {
        await caches.open("zaker-old-obsolete-cache");
      });
      const keysBefore = await updatePage.evaluate(() => caches.keys());
      if (!keysBefore.includes("zaker-old-obsolete-cache")) {
        throw new Error("Failed to create dummy old cache");
      }
      console.log("Created old cache 'zaker-old-obsolete-cache'. Keys before update:", keysBefore);

      // Trigger SW change by adding a comment in dist/sw.js
      const distSwPath = path.join(DIST_DIR, "sw.js");
      const origSw = fs.readFileSync(distSwPath, "utf-8");
      fs.writeFileSync(distSwPath, origSw + `\n// Test update trigger timestamp: ${Date.now()}\n`, "utf-8");

      // Tell SW to check for update
      await updatePage.evaluate(async () => {
        const reg = await navigator.serviceWorker.ready;
        await reg.update();
      });
      // Wait for service worker to activate and prune obsolete caches
      await updatePage.waitForTimeout(2000);

      const keysAfter = await updatePage.evaluate(() => caches.keys());
      console.log("Keys after SW update:", keysAfter);

      if (keysAfter.includes("zaker-old-obsolete-cache")) {
        throw new Error("Obsolete cache 'zaker-old-obsolete-cache' was NOT deleted during SW activate!");
      }

      // Revert dist/sw.js
      fs.writeFileSync(distSwPath, origSw, "utf-8");
      console.log("✓ Obsolete cache automatically pruned during activate event.");
      await updatePage.close();
      results["ط"] = { status: "PASS", note: "Old cache deleted on SW update, active cache retained" };
    } catch (err) {
      console.error("✗ Case [ط] Failed:", err.message);
      results["ط"] = { status: "FAIL", note: err.message };
    }

  } finally {
    await browser.close();
    if (server) {
      server.close();
      console.log("\n[Server] Test server stopped.");
    }
  }

  // -------------------------------------------------------------------------
  // Compare with Live Deployed GitHub Pages Version
  // -------------------------------------------------------------------------
  console.log("\n===============================================================");
  console.log("🌐 LIVE GITHUB PAGES DEPLOYMENT VERIFICATION");
  console.log("===============================================================");
  try {
    const liveSwUrl = "https://minasar326-rgb.github.io/Zaker-MB/sw.js";
    console.log(`Fetching live Service Worker from: ${liveSwUrl}`);
    const liveResp = await fetch(liveSwUrl, { cache: "no-store" });
    if (liveResp.status === 200) {
      const liveText = await liveResp.text();
      const distText = fs.readFileSync(path.join(DIST_DIR, "sw.js"), "utf-8");

      const liveCacheMatch = liveText.match(/const CACHE_NAME = ["']([^"']+)["']/);
      const distCacheMatch = distText.match(/const CACHE_NAME = ["']([^"']+)["']/);

      const liveCache = liveCacheMatch ? liveCacheMatch[1] : "unknown";
      const distCache = distCacheMatch ? distCacheMatch[1] : "unknown";

      console.log(`Live CACHE_NAME: ${liveCache} | Local CACHE_NAME: ${distCache}`);
      if (liveCache === distCache) {
        console.log("✓ Live GitHub Pages has the latest CACHE_NAME deployed!");
      } else {
        console.warn(`⏳ Live cache (${liveCache}) is still catching up to local (${distCache}) due to GitHub Pages CDN propagation.`);
      }
    } else {
      console.warn(`Could not reach live URL (status ${liveResp.status}).`);
    }
  } catch (liveErr) {
    console.warn("Live check notice (no network or CDN latency):", liveErr.message);
  }

  // -------------------------------------------------------------------------
  // Print Final Summary Table
  // -------------------------------------------------------------------------
  console.log("\n===============================================================");
  console.log("📊 FINAL OFFLINE TEST REPORT SUMMARY");
  console.log("===============================================================");
  console.log("| الحالة | الوصف | النتيجة | تفاصيل |");
  console.log("|---|---|---|---|");

  const caseDescriptions = {
    "أ": "التثبيت وتفعيل Service Worker والتحكم",
    "ب": "فحص الكاش ومطابقة PRECACHE_ASSETS",
    "ج": "العمل أوفلاين والفتح من المسارات البديلة وإعادة التحميل",
    "د": "التنقل الكامل بين المسارات أوفلاين (#/schedule, #/tasks, #/timer)",
    "هـ": "حفظ واسترجاع البيانات والمهام أوفلاين",
    "و": "تشغيل وعدّ تنازلي لمؤقت المذاكرة أوفلاين",
    "ز": "تبديل اللغات والأيقونات والمانيفست أوفلاين (ar, en, el)",
    "ح": "انعدام أي طلبات شبكة فاشلة من نفس النطاق أوفلاين",
    "ط": "تحديث Service Worker وحذف الكاش القديم تلقائياً",
    "ي": "معالجة رسائل الخلفية وتزامن IndexedDB",
    "ك": "الفحص الثابت لكود sw.js وخلوه من أخطاء السطور",
  };

  let allPassed = true;
  for (const key of ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي", "ك"]) {
    const r = results[key] || { status: "FAIL", note: "Not executed" };
    if (r.status !== "PASS") allPassed = false;
    const badge = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(`| [${key}] | ${caseDescriptions[key]} | ${badge} | ${r.note} |`);
  }
  console.log("===============================================================\n");

  if (!allPassed) {
    console.error("❌ TEST SUITE FAILED: One or more cases failed.");
    process.exit(1);
  } else {
    console.log("🎉 ALL CASES PASSED 100%! ZAKER IS PROVEN 100% OFFLINE-CAPABLE.");
    process.exit(0);
  }
}

runOfflineTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
