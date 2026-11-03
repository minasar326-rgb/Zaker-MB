import { playMotivationChime } from "./audio";
import { getDailyMotivation } from "./motivation";
import type { Task } from "./store";

const DB_NAME = "zaker_db";
const DB_VERSION = 1;
const STORE_NAME = "sync_data";

// Open IndexedDB in the client thread
function openZakerDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not supported"));
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

export async function setSyncData(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await openZakerDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("[Zaker DB] setSyncData error:", err);
    return false;
  }
}

export async function getSyncData<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openZakerDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Sync active tasks and student name to IndexedDB and Service Worker
 */
export async function syncTasksToServiceWorker(tasks: Task[], studentName: string) {
  try {
    // 1. Save to local IndexedDB for offline service worker access
    await setSyncData("tasks", tasks);
    await setSyncData("studentName", studentName);

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
      });
    }
  } catch (e) {
    console.warn("[Zaker Sync] Sync to service worker error:", e);
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
 * Generate 5-Hour task reminder notification content
 */
export function generate5HourTaskReminderText(tasks: Task[], studentName: string) {
  const pending = tasks.filter((t) => !t.done);
  const name = studentName && studentName.trim() ? studentName.trim() : "يا بطل";

  if (pending.length === 0) {
    return {
      title: `ذاكر - رائع جداً يا ${name}! 🌟`,
      body: `جميع مهامك الدراسية مكتملة حتى الآن! خذ استراحة أو استعد للمهام القادمة.`,
      pendingCount: 0,
    };
  }

  if (pending.length === 1) {
    const t = pending[0];
    const subText = t.subject ? `في مادة ${t.subject}` : "";
    return {
      title: `ذاكر - تذكير المهام كل 5 ساعات ⏰`,
      body: `يا ${name}، لديك مهمة دراسية بانتظارك: "${t.title}" ${subText}.. أنجزها الآن لتشعر براحة الإنجاز! 💪`,
      pendingCount: 1,
    };
  }

  const first = pending[0];
  const subText = first.subject ? `(${first.subject})` : "";
  return {
    title: `ذاكر - تذكير المهام كل 5 ساعات ⏰`,
    body: `يا ${name}، لديك ${pending.length} مهام دراسية متبقية لليوم! ابدأ بالمهمة الأولى: "${first.title}" ${subText} 🚀`,
    pendingCount: pending.length,
  };
}

/**
 * Deliver 5-hour task reminder notification
 */
export async function send5HourTaskReminderNotification(options: {
  tasks: Task[];
  studentName: string;
  force?: boolean;
}): Promise<boolean> {
  const now = Date.now();
  const lastTimeStr = localStorage.getItem(KEY_LAST_5H_REMINDER);
  const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;

  if (!options.force && lastTime && now - lastTime < FIVE_HOURS_MS) {
    return false;
  }

  const { title, body } = generate5HourTaskReminderText(options.tasks, options.studentName);

  // Play distinctive motivation chime
  try {
    playMotivationChime();
  } catch (err) {
    console.warn("Chime error:", err);
  }

  // Deliver notification
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const notifOptions: NotificationOptions & {
        vibrate?: number[];
        data?: { url: string };
        renotify?: boolean;
      } = {
        body,
        icon: "./icons/zaker-study-192.png",
        badge: "./icons/zaker-study-192.png",
        dir: "rtl",
        lang: "ar",
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
  force?: boolean;
}): Promise<boolean> {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastDate = localStorage.getItem(KEY_LAST_DAILY_NOTIF);

  if (!options.force && lastDate === todayStr) {
    return false;
  }

  const quote = getDailyMotivation(options.studentName);

  // Play chime
  try {
    playMotivationChime();
  } catch (err) {
    console.warn("Chime error:", err);
  }

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const notifOptions: NotificationOptions & {
        vibrate?: number[];
        data?: { url: string };
        renotify?: boolean;
      } = {
        body: quote.text + (quote.tip ? `\n💡 نصيحة: ${quote.tip}` : ""),
        icon: "./icons/zaker-study-192.png",
        badge: "./icons/zaker-study-192.png",
        dir: "rtl",
        lang: "ar",
        tag: "zaker-daily-motivation",
        renotify: true,
        vibrate: [150, 75, 150, 75, 300],
        data: { url: "./" },
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification("ذاكر - رسالة اليوم التشجيعية 🌟", notifOptions);
      } else {
        new Notification("ذاكر - رسالة اليوم التشجيعية 🌟", notifOptions);
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
  getStudentName: () => string
) {
  const check = () => {
    const tasks = getTasks();
    const name = getStudentName();

    // Sync state to SW
    syncTasksToServiceWorker(tasks, name);

    // Check 5h task reminder
    const now = Date.now();
    const last5hStr = localStorage.getItem(KEY_LAST_5H_REMINDER);
    const last5h = last5hStr ? parseInt(last5hStr, 10) : 0;
    if (!last5h || now - last5h >= FIVE_HOURS_MS) {
      send5HourTaskReminderNotification({ tasks, studentName: name, force: false });
    }

    // Check daily motivation
    const todayStr = new Date().toISOString().split("T")[0];
    const lastDaily = localStorage.getItem(KEY_LAST_DAILY_NOTIF);
    if (lastDaily !== todayStr) {
      sendDailyMorningNotification({ studentName: name, force: false });
    }
  };

  // Run on start
  check();
  // Check every 30 seconds
  const interval = setInterval(check, 30000);
  return () => clearInterval(interval);
}
