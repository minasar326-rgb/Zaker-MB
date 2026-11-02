// Zaker (ذاكر) - 100% Offline-First Service Worker
const CACHE_NAME = "zaker-v3";

// Helper to resolve URLs relative to this Service Worker script's directory
const getUrl = (rel) => new URL(rel, self.location.href).href;

// Complete precache list of all essential application assets
const PRECACHE_ASSETS = [
  getUrl("./"),
  getUrl("./index.html"),
  getUrl("./index.html?source=pwa"),
  getUrl("./?source=pwa"),
  getUrl("./manifest.json"),
  getUrl("./manifest-BDmtbVmz.json"),
  getUrl("./favicon.png"),
  getUrl("./favicon.ico"),
  getUrl("./favicon.svg"),
  getUrl("./apple-touch-icon.png"),
  getUrl("./icons/zaker-study-192.png"),
  getUrl("./icons/zaker-study-512.png"),
  getUrl("./icons/zaker-study-maskable.png"),
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
    ).then(() => {
      console.log("[Zaker SW] Claiming clients immediately");
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Strict 100% Offline-First Strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle HTTP/HTTPS GET requests
  if (req.method !== "GET" || (!url.protocol.startsWith("http:") && !url.protocol.startsWith("https:"))) {
    return;
  }

  // A) Navigation Requests (HTML / Page Loads):
  // Cache-First with Background Revalidation for zero-lag offline startup!
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background if online
          fetch(req).then((netResp) => {
            if (netResp && netResp.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        // Try generic root or index.html from cache
        return caches.match(getUrl("./index.html")).then((indexCached) => {
          if (indexCached) {
            fetch(req).then((netResp) => {
              if (netResp && netResp.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
              }
            }).catch(() => {});
            return indexCached;
          }

          // Fetch from network if not cached yet
          return fetch(req).then((netResp) => {
            if (netResp && netResp.status === 200) {
              const copy = netResp.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, copy);
                cache.put(getUrl("./index.html"), copy.clone());
              });
            }
            return netResp;
          }).catch(async () => {
            // Ultimate fallback to index.html or ./
            const fallback = (await caches.match(getUrl("./"))) || (await caches.match(getUrl("./index.html")));
            if (fallback) return fallback;
            return new Response("ذاكر متاح أوفلاين بالكامل", {
              headers: { "Content-Type": "text/html; charset=utf-8" }
            });
          });
        });
      })
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
          const fallbackIcon = await caches.match(getUrl("./icons/zaker-study-192.png"));
          if (fallbackIcon) return fallbackIcon;
        }
        return new Response("Offline asset", { status: 503 });
      });
    })
  );
});

// 4. Daily Motivational Quotes for Push & Periodic Sync
const SW_MOTIVATION_MESSAGES = [
  "صباح التميز والهمة يا بطل! 🌟 يوم جديد وفرصة لتصنع مستقبلك الجميل خطوة بخطوة.",
  "تذكّر دائمًا: كل دقيقة تركيز ومذاكرة اليوم هي استثمار عظيم في حلمك الكبير! 💪",
  "لا تنتظر المزاج المثالي، ابدأ بأول مهمة دراسية والحماس سيأتي تلقائيًا! 🚀",
  "رحلة النجاح تبدأ بصفحة تذاكرها الآن بكل إخلاص.. أنت قدها! 📖✨",
  "كل الناجحين مروا بأيام صعبة واجتهدوا بصبر.. استمر فهدفك يستحق! 🎯",
  "التركيز مثل العضلة تقوى بالتدريب.. خذ نفسًا عميقًا وابدأ جلسة تركيز قوية! 🧠⚡",
  "إنجاز مهامك اليوم هو سر راحتك وثقتك بنفسك غدًا.. جدولك بانتظارك! 🏆"
];

function getRandomMotivation() {
  return SW_MOTIVATION_MESSAGES[Math.floor(Math.random() * SW_MOTIVATION_MESSAGES.length)];
}

// 5. Background Sync & Periodic Sync & Push (for PWA capabilities)
self.addEventListener("sync", (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-motivation-sync" || event.tag === "daily-schedule-sync") {
    event.waitUntil(
      self.registration.showNotification("ذاكر - رسالة اليوم التشجيعية 🌟", {
        body: getRandomMotivation(),
        icon: getUrl("./icons/zaker-study-192.png"),
        badge: getUrl("./icons/zaker-study-192.png"),
        dir: "rtl",
        lang: "ar",
        tag: "zaker-daily-motivation",
        vibrate: [150, 75, 150, 75, 300]
      })
    );
  }
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.text() : getRandomMotivation();
  event.waitUntil(
    self.registration.showNotification("ذاكر - رسالة تشجيع 🌟", {
      body: payload,
      icon: getUrl("./icons/zaker-study-192.png"),
      badge: getUrl("./icons/zaker-study-192.png"),
      dir: "rtl",
      lang: "ar",
      tag: "zaker-daily-motivation",
      vibrate: [150, 75, 150, 75, 300]
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
});\n