// Zaker (ذاكر / Study) - 100% Offline-First Service Worker with Multi-Language Background 5h Tasks & Daily Notifications
const CACHE_NAME = "zaker-v7";

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
  getUrl("./manifest-en.json"),
  getUrl("./manifest-el.json"),
  getUrl("./manifest-sp2RgcW1.json"),
  getUrl("./favicon.png"),
  getUrl("./favicon.ico"),
  getUrl("./favicon.svg"),
  getUrl("./favicon-iYpuZci1.png"),
  getUrl("./favicon-en.png"),
  getUrl("./apple-touch-icon.png"),
  getUrl("./apple-touch-icon-D76Ipk7H.png"),
  getUrl("./apple-touch-icon-en.png"),
  getUrl("./icons/zaker-study-192.png"),
  getUrl("./icons/zaker-study-512.png"),
  getUrl("./icons/zaker-study-maskable.png"),
  getUrl("./icons/en/zaker-study-192.png"),
  getUrl("./icons/en/zaker-study-512.png"),
  getUrl("./icons/en/zaker-study-maskable.png"),
  getUrl("./icons/zaker-192.png"),
  getUrl("./icons/zaker-512.png"),
  getUrl("./icons/zaker-maskable.png"),
  getUrl("./icons/icon-192.png"),
  getUrl("./icons/icon-512.png"),
  getUrl("./screenshots/screenshot-mobile.png"),
  getUrl("./screenshots/screenshot-desktop.png"),
  getUrl("./screenshots/screen-english.png"),
  getUrl("./screenshots/screen-greek.png"),
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

// 4. IndexedDB Access Helper
const DB_NAME = "zaker-notifications-sync-db";
const STORE_NAME = "sync-store";
const DB_VERSION = 1;

function openZakerDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return reject(new Error("IndexedDB not available"));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
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

// 5. Multi-Language Notifications Dictionary
const SW_I18N = {
  ar: {
    appName: "ذاكر",
    defaultName: "يا بطل",
    motivationTitle: "ذاكر - رسالة اليوم التشجيعية 🌟",
    reminderTitle: "ذاكر - تذكير المهام كل 5 ساعات ⏰",
    reminderZeroTitle: "ذاكر - رائع جداً يا {name}! 🌟",
    reminderZeroBody: "جميع مهامك الدراسية مكتملة حتى الآن! استمتع بوقتك أو أضف مراجعة جديدة.",
    reminderOneBody: 'يا {name}، لديك مهمة دراسية بانتظارك: "{title}" {sub}.. أنجزها الآن لتشعر بالراحة! 💪',
    reminderMultiBody: 'يا {name}، لديك {count} مهام دراسية متبقية لليوم! ابدأ بالمهمة الأولى: "{title}" {sub} 🚀',
    subjectPrefix: "في مادة ",
    quotes: [
      "صباح التميز والهمة يا {name}! 🌟 يوم جديد لتصنع مستقبلك الجميل خطوة بخطوة.",
      "تذكّر دائمًا: كل دقيقة تركيز ومذاكرة اليوم هي استثمار عظيم في حلمك يا {name}! 💪",
      "لا تنتظر المزاج المثالي يا {name}، ابدأ بأول مهمة دراسية والحماس سيأتي تلقائيًا! 🚀",
      "رحلة النجاح تبدأ بصفحة تذاكرها الآن بكل إخلاص.. أنت قدها يا {name}! 📖✨",
      "كل الناجحين مروا بأيام صعبة واجتهدوا بصبر.. استمر فهدفك يستحق يا {name}! 🎯",
      "التركيز مثل العضلة تقوى بالتدريب.. خذ نفسًا عميقًا وابدأ جلسة تركيز قوية! 🧠⚡",
      "إنجاز مهامك اليوم هو سر راحتك وثقتك بنفسك غدًا.. جدولك بانتظارك يا {name}! 🏆"
    ]
  },
  en: {
    appName: "Study",
    defaultName: "Champ",
    motivationTitle: "Study - Daily Motivation 🌟",
    reminderTitle: "Study - Task Reminder (every 5h) ⏰",
    reminderZeroTitle: "Study - Awesome job, {name}! 🌟",
    reminderZeroBody: "All your study tasks are completed for now! Enjoy your time or prepare for next tasks.",
    reminderOneBody: 'Hey {name}, you have a study task waiting: "{title}" {sub}.. Finish it now to feel accomplished! 💪',
    reminderMultiBody: 'Hey {name}, you have {count} study tasks remaining today! Start with the first: "{title}" {sub} 🚀',
    subjectPrefix: "in ",
    quotes: [
      "Good morning champion {name}! 🌟 A new day to build your bright future step by step.",
      "Remember {name}: every minute of focused study today is a great investment in your dream! 💪",
      "Don't wait for the perfect mood, {name}! Start your first study task and momentum will follow! 🚀",
      "The journey of success begins with a single page studied with passion.. You've got this, {name}! 📖✨",
      "Every achiever pushed through tough days with patience.. Keep going, your goal is worth it {name}! 🎯",
      "Focus is like a muscle that strengthens with practice.. Take a deep breath and start strong! 🧠⚡",
      "Finishing your tasks today is the secret to peace of mind tomorrow.. Your schedule awaits, {name}! 🏆"
    ]
  },
  el: {
    appName: "Zaker",
    defaultName: "Πρωταθλητή",
    motivationTitle: "Zaker - Ημερήσια Ενθάρρυνση 🌟",
    reminderTitle: "Zaker - Υπενθύμιση Εργασιών (ανά 5 ώρες) ⏰",
    reminderZeroTitle: "Zaker - Εξαιρετική δουλειά, {name}! 🌟",
    reminderZeroBody: "Όλες οι εργασίες σου έχουν ολοκληρωθεί! Απόλαυσε τον χρόνο σου ή πρόσθεσε νέα επανάληψη.",
    reminderOneBody: '{name}, έχεις μια εργασία σε αναμονή: "{title}" {sub}.. Ολοκλήρωσέ την τώρα! 💪',
    reminderMultiBody: '{name}, έχεις {count} εργασίες να εκκρεμούν για σήμερα! Ξεκίνα με την πρώτη: "{title}" {sub} 🚀',
    subjectPrefix: "στο μάθημα ",
    quotes: [
      "Καλημέρα {name}! 🌟 Μια νέα μέρα να χτίσεις το λαμπρό σου μέλλον βήμα-βήμα.",
      "Να θυμάσαι {name}: κάθε λεπτό συγκέντρωσης σήμερα είναι σπουδαία επένδυση στο όνειρό σου! 💪",
      "Μην περιμένεις την τέλεια διάθεση, {name}! Ξεκίνα την πρώτη εργασία και η όρεξη θα έρθει! 🚀",
      "Το ταξίδι της επιτυχίας ξεκινά με μία μόνο σελίδα μελέτης.. Μπορείς να τα καταφέρεις, {name}! 📖✨",
      "Όλοι οι πετυχημένοι πέρασαν δύσκολες μέρες με υπομονή.. Συνέχισε, ο στόχος αξίζει {name}! 🎯",
      "Η εστίαση δυναμώνει με την εξάσκηση.. Πάρε βαθιά ανάσα και ξεκίνα δυναμικά! 🧠⚡",
      "Η ολοκλήρωση των εργασιών σήμερα φέρνει ηρεμία αύριο.. Το πρόγραμμα σε περιμένει, {name}! 🏆"
    ]
  }
};

async function triggerDailyMotivationNotification(force = false) {
  try {
    const lang = (await getSyncData("lang")) || "ar";
    const loc = SW_I18N[lang] || SW_I18N.ar;
    const studentName = (await getSyncData("studentName")) || loc.defaultName;

    const quotes = loc.quotes;
    const rawQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quote = rawQuote.replace(/\{name\}/g, studentName);

    const iconUrl = lang === "en" ? getUrl("./icons/en/zaker-study-192.png") : getUrl("./icons/zaker-study-192.png");

    await self.registration.showNotification(loc.motivationTitle, {
      body: quote,
      icon: iconUrl,
      badge: iconUrl,
      dir: lang === "ar" ? "rtl" : "ltr",
      lang: lang,
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
    const lang = (await getSyncData("lang")) || "ar";
    const loc = SW_I18N[lang] || SW_I18N.ar;
    const tasks = (await getSyncData("tasks")) || [];
    const studentName = (await getSyncData("studentName")) || loc.defaultName;
    const pending = Array.isArray(tasks) ? tasks.filter((t) => !t.done) : [];

    let title = loc.reminderTitle;
    let body = "";

    if (pending.length === 0) {
      title = loc.reminderZeroTitle.replace(/\{name\}/g, studentName);
      body = loc.reminderZeroBody;
    } else if (pending.length === 1) {
      const t = pending[0];
      const sub = t.subject ? `${loc.subjectPrefix}${t.subject}` : "";
      body = loc.reminderOneBody
        .replace(/\{name\}/g, studentName)
        .replace(/\{title\}/g, t.title || "")
        .replace(/\{sub\}/g, sub);
    } else {
      const first = pending[0];
      const sub = first.subject ? `(${first.subject})` : "";
      body = loc.reminderMultiBody
        .replace(/\{name\}/g, studentName)
        .replace(/\{count\}/g, String(pending.length))
        .replace(/\{title\}/g, first.title || "")
        .replace(/\{sub\}/g, sub);
    }

    const iconUrl = lang === "en" ? getUrl("./icons/en/zaker-study-192.png") : getUrl("./icons/zaker-study-192.png");

    await self.registration.showNotification(title, {
      body: body,
      icon: iconUrl,
      badge: iconUrl,
      dir: lang === "ar" ? "rtl" : "ltr",
      lang: lang,
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
        data.studentName ? setSyncData("studentName", data.studentName) : Promise.resolve(),
        data.lang ? setSyncData("lang", data.lang) : Promise.resolve()
      ])
    );
  } else if (data.type === "SET_LANG") {
    event.waitUntil(setSyncData("lang", data.lang || "ar"));
  } else if (data.type === "TEST_5H_TASK_NOTIFICATION") {
    event.waitUntil(trigger5HourTasksReminderNotification(true));
  } else if (data.type === "TEST_DAILY_MOTIVATION") {
    event.waitUntil(triggerDailyMotivationNotification(true));
  }
});
