// Zaker (ذاكر) - 100% Offline-First Service Worker
const CACHE_NAME = "zaker-v2";

// Helper to resolve URLs relative to this Service Worker script's directory
const getUrl = (rel) => new URL(rel, self.location.href).href;

// Complete precache list of all essential application assets
const PRECACHE_ASSETS = [
  getUrl("./"),
  getUrl("./index.html"),
  getUrl("./index.html?source=pwa"),
  getUrl("./?source=pwa"),
  getUrl("./manifest.json"),
  getUrl("./favicon.png"),
  getUrl("./favicon.ico"),
  getUrl("./favicon.svg"),
  getUrl("./apple-touch-icon.png"),
  getUrl("./icons/zaker-192.png"),
  getUrl("./icons/zaker-512.png"),
  getUrl("./icons/zaker-maskable.png"),
  getUrl("./icons/icon-192.png"),
  getUrl("./icons/icon-512.png"),
  getUrl("./screenshots/screenshot-mobile.png"),
  getUrl("./screenshots/screenshot-desktop.png"),
  getUrl("./fonts/fonts.css"),
  getUrl("./fonts/font_0_SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2"),
  getUrl("./fonts/font_1_QGYvz_MVcBeNP4NJuktqQ4E.woff2"),
  getUrl("./fonts/font_2_SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2"),
  getUrl("./fonts/font_3_SLXVc1nY6HkvangtZmpQdkhzfH5lkSscSCyS4J0.woff2"),
  getUrl("./fonts/font_4_QGYvz_MVcBeNP4NJtEtq.woff2"),
  getUrl("./widgets/balance.json"),
  getUrl("./widgets/balance-data.json")
];

// 1. Install Event: Precache everything immediately and skip waiting
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[Zaker SW] Precaching assets for 100% offline support...");
      for (const asset of PRECACHE_ASSETS) {
        try {
          const resp = await fetch(asset, { cache: "reload" });
          if (resp && (resp.status === 200 || resp.type === "opaque")) {
            await cache.put(asset, resp);
          }
        } catch (err) {
          console.warn("[Zaker SW] Precache non-critical skip:", asset, err);
        }
      }
    })
  );
});

// 2. Activate Event: Delete old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Zaker SW] Deleting obsolete cache:", key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: 100% Offline-First Architecture
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith("http://") && !req.url.startsWith("https://")) return;

  // A) Navigation requests (opening the app or reloading):
  // ALWAYS return cached index.html FIRST (Cache-First) so the app opens instantly 100% offline!
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // Check cache for index.html or root
        const cached =
          (await cache.match(req, { ignoreSearch: true })) ||
          (await cache.match(getUrl("./index.html"))) ||
          (await cache.match(getUrl("./"))) ||
          (await cache.match(getUrl("./?source=pwa")));

        // Background revalidation (stale-while-revalidate) if online
        const bgUpdate = fetch(req).then(async (netResp) => {
          if (netResp && netResp.status === 200) {
            await cache.put(req, netResp.clone());
            await cache.put(getUrl("./index.html"), netResp.clone());
            await cache.put(getUrl("./"), netResp.clone());
          }
          return netResp;
        }).catch(() => null);

        // If cached, return it IMMEDIATELY! (Zero lag, 100% offline!)
        if (cached) {
          return cached;
        }

        // If not in cache yet (initial load), wait for network
        const net = await bgUpdate;
        if (net) return net;

        // Emergency fallback: return index.html from cache
        const fallback = await cache.match(getUrl("./index.html"));
        if (fallback) return fallback;

        return new Response("App is loading...", { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
      })()
    );
    return;
  }

  // B) Static Assets (JS, CSS, Fonts, Images, Icons):
  // Cache-First with Background Update
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Update asset in background if network is available
        fetch(req).then((netResp) => {
          if (netResp && netResp.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for next time
      return fetch(req).then((netResp) => {
        if (netResp && netResp.status === 200) {
          const copy = netResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return netResp;
      }).catch(async () => {
        if (req.headers.get("accept")?.includes("image/")) {
          const fallbackIcon = await caches.match(getUrl("./icons/zaker-192.png"));
          if (fallbackIcon) return fallbackIcon;
        }
        return new Response("Offline asset", { status: 503 });
      });
    })
  );
});

// 4. Background Sync & Periodic Sync & Push (for PWA capabilities)
self.addEventListener("sync", (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener("periodicsync", (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.text() : "تنبيه من تطبيق ذاكر: حان وقت المذاكرة والتركيز 📚";
  event.waitUntil(
    self.registration.showNotification("ذاكر", {
      body: payload,
      icon: getUrl("./icons/zaker-192.png"),
      badge: getUrl("./icons/zaker-192.png"),
      dir: "rtl",
      lang: "ar"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = getUrl("./");
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "SKIP_WAITING" || event.data === "skipWaiting")) {
    self.skipWaiting();
  }
});
