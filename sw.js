// Zaker (ذاكر) - 100% Offline-First Service Worker with Background 5h Tasks & Daily Notifications
const CACHE_NAME = "zaker-v6";

// Helper to resolve URLs relative to this Service Worker script's directory
const getUrl = (rel) => new URL(rel, self.location.href).href;

// Mandatory core precache assets (installation fails and retries if either fails)
const MANDATORY_PRECACHE_ASSETS = [
  getUrl("./"),
  getUrl("./index.html")
];

// Non-critical secondary assets (optional precache)
const NON_CRITICAL_PRECACHE_ASSETS = [
  getUrl("./index.html?source=pwa"),
  getUrl("./?source=pwa"),
  getUrl("./manifest.json"),
  getUrl("./manifest-sp2RgcW1.json"),
  getUrl("./favicon.png"),
  getUrl("./favicon.ico"),
  getUrl("./favicon.svg"),
  getUrl("./favicon-iYpuZci1.png"),
  getUrl("./apple-touch-icon.png"),
  getUrl("./apple-touch-icon-D76Ipk7H.png"),
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
  getUrl("./widgets/balance.json"),
  getUrl("./widgets/balance-data.json")
];

// 1. Install Event: Precache mandatory assets (must succeed) and non-critical assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[Zaker SW] Precaching mandatory core assets...");
      for (const asset of MANDATORY_PRECACHE_ASSETS) {
        const resp = await fetch(asset, { cache: "reload" });
        if (!resp || (resp.status !== 200 && resp.type !== "opaque")) {
          throw new Error(`[Zaker SW] Mandatory asset failed to fetch: ${asset}`);
        }
        await cache.put(asset, resp);
      }

      console.log("[Zaker SW] Precaching non-critical assets...");
      for (const asset of NON_CRITICAL_PRECACHE_ASSETS) {
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

  if (req.method !== "GET" || (!url.protocol.startsWith("http:") && !url.protocol.startsWith("https:"))) {
    return;
  }

  // Navigation Requests: Cache-First with Background Revalidation
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(req).then((netResp) => {
            if (netResp && netResp.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return caches.match(getUrl("./index.html")).then((indexCached) => {
          if (indexCached) {
            fetch(req).then((netResp) => {
              if (netResp && netResp.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
              }
            }).catch(() => {});
            return indexCached;
          }

          return fetch(req).then((netResp) => {
            if (netResp && netResp.status === 200) {
              const c1 = netResp.clone();
              const c2 = netResp.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, c1);
                cache.put(getUrl("./index.html"), c2);
              });
            }
            return netResp;
          }).catch(async () => {
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

  // Static Assets: Cache-First with Background Update
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(req).then((netResp) => {
          if (netResp && netResp.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
          }
        }).catch(() => {});
        return cachedResponse;
      }

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

// 4. IndexedDB Access in Service Worker
const DB_NAME = "zaker_db";
const DB_VERSION = 1;
const STORE_NAME = "sync_data";

function openZakerDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getSyncData(key) {
  return openZakerDB()
    .then((db) => {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    })
    .catch(() => null);
}

function setSyncData(key, value) {
  return openZakerDB()
    .then((db) => {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    })
    .catch(() => false);
}

// 5. Daily Motivational Messages
const SW_MOTIVATION_MESSAGES = [
  "صباح التميز والهمة يا {name}! 🌟 يوم جديد لتصنع مستقبلك الجميل خطوة بخطوة.",
  "تذكّر دائمًا: كل دقيقة تركيز ومذاكرة اليوم هي استثمار عظيم في حلمك يا {name}! 💪",
  "لا تنتظر المزاج المثالي يا {name}، ابدأ بأول مهمة دراسية والحماس سيأتي تلقائيًا! 🚀",
  "رحلة النجاح تبدأ بصفحة تذاكرها الآن بكل إخلاص.. أنت قدها يا {name}! 📖✨",
  "كل الناجحين مروا بأيام صعبة واجتهدوا بصبر.. استمر فهدفك يستحق يا {name}! 🎯",
  "التركيز مثل العضلة تقوى بالتدريب.. خذ نفسًا عميقًا وابدأ جلسة تركيز قوية! 🧠⚡",
  "إنجاز مهامك اليوم هو سر راحتك وثقتك بنفسك غدًا.. جدولك بانتظارك يا {name}! 🏆"
];

async function triggerDailyMotivationNotification(force = false) {
  try {
    const studentName = (await getSyncData("studentName")) || "يا بطل";
    const rawQuote = SW_MOTIVATION_MESSAGES[Math.floor(Math.random() * SW_MOTIVATION_MESSAGES.length)];
    const quote = rawQuote.replace(/\{name\}/g, studentName);

    await self.registration.showNotification("ذاكر - رسالة اليوم التشجيعية 🌟", {
      body: quote,
      icon: getUrl("./icons/zaker-study-192.png"),
      badge: getUrl("./icons/zaker-study-192.png"),
      dir: "rtl",
      lang: "ar",
      tag: "zaker-daily-motivation",
      renotify: true,
      vibrate: [150, 75, 150, 75, 300],
      data: { url: getUrl("./") }
    });
  } catch (err) {
    console.warn("[Zaker SW] Daily motivation notification error:", err);
  }
}

async function trigger5HourTasksReminderNotification(force = false) {
  try {
    const tasks = (await getSyncData("tasks")) || [];
    const studentName = (await getSyncData("studentName")) || "يا بطل";
    const pending = Array.isArray(tasks) ? tasks.filter((t) => !t.done) : [];

    let title = "ذاكر - تذكير المهام كل 5 ساعات ⏰";
    let body = "";

    if (pending.length === 0) {
      title = `ذاكر - رائع جداً يا ${studentName}! 🌟`;
      body = "جميع مهامك الدراسية مكتملة حتى الآن! استمتع بوقتك أو أضف مراجعة جديدة.";
    } else if (pending.length === 1) {
      const t = pending[0];
      const sub = t.subject ? `في مادة ${t.subject}` : "";
      body = `يا ${studentName}، لديك مهمة دراسية بانتظارك: "${t.title}" ${sub}.. أنجزها الآن لتشعر بالراحة! 💪`;
    } else {
      const first = pending[0];
      const sub = first.subject ? `(${first.subject})` : "";
      body = `يا ${studentName}، لديك ${pending.length} مهام دراسية متبقية لليوم! ابدأ بالمهمة الأولى: "${first.title}" ${sub} 🚀`;
    }

    await self.registration.showNotification(title, {
      body: body,
      icon: getUrl("./icons/zaker-study-192.png"),
      badge: getUrl("./icons/zaker-study-192.png"),
      dir: "rtl",
      lang: "ar",
      tag: "zaker-5h-task-reminder",
      renotify: true,
      vibrate: [200, 100, 200, 100, 300],
      data: { url: getUrl("./#/tasks") }
    });
  } catch (err) {
    console.warn("[Zaker SW] 5h task reminder notification error:", err);
  }
}

// 6. Background Periodic Sync (Browser background worker)
self.addEventListener("periodicsync", (event) => {
  console.log("[Zaker SW] PeriodicSync triggered with tag:", event.tag);
  if (event.tag === "daily-motivation" || event.tag === "daily-motivation-sync" || event.tag === "daily-schedule-sync") {
    event.waitUntil(triggerDailyMotivationNotification());
  } else if (event.tag === "tasks-reminder-5h" || event.tag === "tasks-5h-sync") {
    event.waitUntil(trigger5HourTasksReminderNotification());
  }
});

// 7. Background One-Shot Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(Promise.resolve());
  }
});

// 8. Push Event
self.addEventListener("push", (event) => {
  event.waitUntil(triggerDailyMotivationNotification());
});

// 9. Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || getUrl("./");
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url === targetUrl) {
            return client.focus();
          } else if ("navigate" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// 10. Message Event from Main Window
self.addEventListener("message", (event) => {
  if (!event.data) return;
  const data = event.data;
  if (data.type === "SKIP_WAITING" || data === "skipWaiting") {
    self.skipWaiting();
  } else if (data.type === "SYNC_TASKS") {
    event.waitUntil(
      Promise.all([
        setSyncData("tasks", data.tasks || []),
        data.studentName ? setSyncData("studentName", data.studentName) : Promise.resolve()
      ])
    );
  } else if (data.type === "TEST_5H_TASK_NOTIFICATION") {
    event.waitUntil(trigger5HourTasksReminderNotification(true));
  } else if (data.type === "TEST_DAILY_MOTIVATION") {
    event.waitUntil(triggerDailyMotivationNotification(true));
  }
});
