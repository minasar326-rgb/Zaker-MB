import { type Task } from "./store";
import { getDailyMotivation, getDefaultStudentName } from "./motivation";
import { playMotivationChime } from "./audio";
import { type Lang, GREEK_APP_NAME } from "./i18n";

const DB_NAME = "zaker-notifications-sync-db";
const STORE_NAME = "sync-store";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
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

export async function setSyncData(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Non-critical local IndexedDB write
  }
}

export async function getSyncData<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Sync active tasks, student name, and language to IndexedDB and Service Worker
 */
export async function syncTasksToServiceWorker(tasks: Task[], studentName: string, lang: Lang = "ar") {
  try {
    // 1. Save to local IndexedDB for offline service worker access
    await setSyncData("tasks", tasks);
    await setSyncData("studentName", studentName);
    await setSyncData("lang", lang);

    // 2. Broadcast to active service worker controller
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SYNC_TASKS",
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          done: t.done,
          due: t.due,
          priority: t.priority,
        })),
        studentName,
        lang,
      });
    }
  } catch (e) {
    console.warn("[Zaker Sync] Sync to service worker error:", e);
  }
}

/**
 * Sync language setting specifically to Service Worker and IndexedDB
 */
export async function syncLangToServiceWorker(lang: Lang) {
  try {
    await setSyncData("lang", lang);
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SET_LANG",
        lang,
      });
    }
  } catch (e) {
    console.warn("[Zaker Sync] Sync lang to service worker error:", e);
  }
}

/**
 * Register background periodic sync with the browser for 24h motivation and 5h task reminder
 */
export async function registerPeriodicSyncs() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ("periodicSync" in reg && (reg as unknown as { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync) {
      const pSync = (reg as unknown as { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync;
      // 1. Daily motivation (every 24 hours)
      await pSync.register("daily-motivation", { minInterval: 24 * 60 * 60 * 1000 }).catch(() => {});
      // 2. Task reminder (every 5 hours = 18,000,000 ms)
      await pSync.register("tasks-reminder-5h", { minInterval: 5 * 60 * 60 * 1000 }).catch(() => {});
      console.log("[Zaker SW] Periodic background syncs registered (24h + 5h)");
    }
  } catch (err) {
    console.warn("[Zaker SW] Periodic sync registration info:", err);
  }
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const KEY_LAST_5H_REMINDER = "zaker_last_5h_reminder";
const KEY_LAST_DAILY_NOTIF = "zaker_last_motivation_date";

/**
 * Generate 5-Hour task reminder notification content in the requested language
 */
export function generate5HourTaskReminderText(tasks: Task[], studentName: string, lang: Lang = "ar") {
  const pending = tasks.filter((t) => !t.done);
  const name = studentName && studentName.trim() ? studentName.trim() : getDefaultStudentName(lang);
  const appTitle = lang === "en" ? "Study" : lang === "el" ? GREEK_APP_NAME : "ذاكر";

  if (pending.length === 0) {
    const title =
      lang === "en"
        ? `${appTitle} - Awesome job, ${name}! 🌟`
        : lang === "el"
        ? `${appTitle} - Εξαιρετική δουλειά, ${name}! 🌟`
        : `ذاكر - رائع جداً يا ${name}! 🌟`;

    const body =
      lang === "en"
        ? `All your study tasks are completed for now! Take a break or prepare for upcoming ones.`
        : lang === "el"
        ? `Όλες οι εργασίες σου έχουν ολοκληρωθεί! Κάνε ένα διάλειμμα ή ετοιμάσου για τις επόμενες.`
        : `جميع مهامك الدراسية مكتملة حتى الآن! خذ استراحة أو استعد للمهام القادمة.`;

    return { title, body, pendingCount: 0 };
  }

  if (pending.length === 1) {
    const t = pending[0];
    const subText = t.subject
      ? lang === "en"
        ? `in ${t.subject}`
        : lang === "el"
        ? `στο μάθημα ${t.subject}`
        : `في مادة ${t.subject}`
      : "";

    const title =
      lang === "en"
        ? `${appTitle} - Task Reminder (every 5h) ⏰`
        : lang === "el"
        ? `${appTitle} - Υπενθύμιση Εργασιών (ανά 5 ώρες) ⏰`
        : `ذاكر - تذكير المهام كل 5 ساعات ⏰`;

    const body =
      lang === "en"
        ? `Hey ${name}, you have a study task waiting: "${t.title}" ${subText}.. Finish it now to feel accomplished! 💪`
        : lang === "el"
        ? `${name}, έχεις μια εργασία σε αναμονή: "${t.title}" ${subText}.. Ολοκλήρωσέ την τώρα! 💪`
        : `يا ${name}، لديك مهمة دراسية بانتظارك: "${t.title}" ${subText}.. أنجزها الآن لتشعر براحة الإنجاز! 💪`;

    return { title, body, pendingCount: 1 };
  }

  const first = pending[0];
  const subText = first.subject ? `(${first.subject})` : "";

  const title =
    lang === "en"
      ? `${appTitle} - Task Reminder (every 5h) ⏰`
      : lang === "el"
      ? `${appTitle} - Υπενθύμιση Εργασιών (ανά 5 ώρες) ⏰`
      : `ذاكر - تذكير المهام كل 5 ساعات ⏰`;

  const body =
    lang === "en"
      ? `Hey ${name}, you have ${pending.length} study tasks remaining today! Start with the first: "${first.title}" ${subText} 🚀`
      : lang === "el"
      ? `${name}, έχεις ${pending.length} εργασίες να εκκρεμούν για σήμερα! Ξεκίνα με την πρώτη: "${first.title}" ${subText} 🚀`
      : `يا ${name}، لديك ${pending.length} مهام دراسية متبقية لليوم! ابدأ بالمهمة الأولى: "${first.title}" ${subText} 🚀`;

  return { title, body, pendingCount: pending.length };
}

/**
 * Deliver 5-hour task reminder notification
 */
export async function send5HourTaskReminderNotification(options: {
  tasks: Task[];
  studentName: string;
  lang?: Lang;
  force?: boolean;
}): Promise<boolean> {
  const lang: Lang = options.lang || "ar";
  const now = Date.now();
  const lastTimeStr = localStorage.getItem(KEY_LAST_5H_REMINDER);
  const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;

  if (!options.force && lastTime && now - lastTime < FIVE_HOURS_MS) {
    return false;
  }

  const { title, body } = generate5HourTaskReminderText(options.tasks, options.studentName, lang);

  // Play distinctive motivation chime
  try {
    playMotivationChime();
  } catch (err) {
    console.warn("Chime error:", err);
  }

  // Deliver notification
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const iconPath = lang === "en" ? "./icons/en/zaker-study-192.png" : "./icons/zaker-study-192.png";
      const notifOptions: NotificationOptions & {
        vibrate?: number[];
        data?: { url: string };
        renotify?: boolean;
      } = {
        body,
        icon: iconPath,
        badge: iconPath,
        dir: lang === "ar" ? "rtl" : "ltr",
        lang,
        tag: "zaker-5h-task-reminder",
        renotify: true,
        vibrate: [200, 100, 200, 100, 300],
        data: { url: "./#/tasks" },
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, notifOptions);
      } else {
        new Notification(title, notifOptions);
      }

      localStorage.setItem(KEY_LAST_5H_REMINDER, now.toString());
      return true;
    } catch (e) {
      console.warn("[Zaker Notif] 5h dispatch error:", e);
    }
  }

  localStorage.setItem(KEY_LAST_5H_REMINDER, now.toString());
  return false;
}

/**
 * Deliver daily morning notification
 */
export async function sendDailyMorningNotification(options: {
  studentName: string;
  lang?: Lang;
  force?: boolean;
}): Promise<boolean> {
  const lang: Lang = options.lang || "ar";
  const todayStr = new Date().toISOString().split("T")[0];
  const lastDate = localStorage.getItem(KEY_LAST_DAILY_NOTIF);

  if (!options.force && lastDate === todayStr) {
    return false;
  }

  const quote = getDailyMotivation(options.studentName, lang);

  // Play chime
  try {
    playMotivationChime();
  } catch (err) {
    console.warn("Chime error:", err);
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const appTitle = lang === "en" ? "Study" : lang === "el" ? GREEK_APP_NAME : "ذاكر";
      const title =
        lang === "en"
          ? `${appTitle} - Daily Motivation 🌟`
          : lang === "el"
          ? `${appTitle} - Ημερήσια Ενθάρρυνση 🌟`
          : `ذاكر - رسالة اليوم التشجيعية 🌟`;

      const tipPrefix =
        lang === "en" ? "💡 Tip: " : lang === "el" ? "💡 Συμβουλή: " : "💡 نصيحة: ";

      const iconPath = lang === "en" ? "./icons/en/zaker-study-192.png" : "./icons/zaker-study-192.png";

      const notifOptions: NotificationOptions & {
        vibrate?: number[];
        data?: { url: string };
        renotify?: boolean;
      } = {
        body: quote.text + (quote.tip ? `\n${tipPrefix}${quote.tip}` : ""),
        icon: iconPath,
        badge: iconPath,
        dir: lang === "ar" ? "rtl" : "ltr",
        lang,
        tag: "zaker-daily-motivation",
        renotify: true,
        vibrate: [150, 75, 150, 75, 300],
        data: { url: "./" },
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, notifOptions);
      } else {
        new Notification(title, notifOptions);
      }

      localStorage.setItem(KEY_LAST_DAILY_NOTIF, todayStr);
      return true;
    } catch (e) {
      console.warn("[Zaker Notif] Daily dispatch error:", e);
    }
  }

  localStorage.setItem(KEY_LAST_DAILY_NOTIF, todayStr);
  return false;
}

/**
 * Background ticker that runs every 30 seconds while app/tab is active or backgrounded
 */
export function startForegroundBackgroundIntervals(
  getTasks: () => Task[],
  getStudentName: () => string,
  getLang: () => Lang = () => "ar"
) {
  const check = () => {
    const tasks = getTasks();
    const name = getStudentName();
    const lang = getLang();

    // Sync state to SW
    syncTasksToServiceWorker(tasks, name, lang);

    // Check 5h task reminder
    const now = Date.now();
    const last5hStr = localStorage.getItem(KEY_LAST_5H_REMINDER);
    const last5h = last5hStr ? parseInt(last5hStr, 10) : 0;
    if (!last5h || now - last5h >= FIVE_HOURS_MS) {
      send5HourTaskReminderNotification({ tasks, studentName: name, lang, force: false });
    }

    // Check daily motivation
    const todayStr = new Date().toISOString().split("T")[0];
    const lastDaily = localStorage.getItem(KEY_LAST_DAILY_NOTIF);
    if (lastDaily !== todayStr) {
      sendDailyMorningNotification({ studentName: name, lang, force: false });
    }
  };

  // Run on start
  check();
  // Check every 30 seconds
  const interval = setInterval(check, 30000);
  return () => clearInterval(interval);
}
