export type Lang = "ar" | "en" | "el";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "el", label: "Ελληνικά" },
];

const dict = {
  appName: { ar: "ذاكِر", en: "Zaker", el: "Zaker" },
  tagline: {
    ar: "نظّم مذاكرتك وأنجز مهامك",
    en: "Plan your studies, finish your tasks",
    el: "Οργάνωσε το διάβασμα, ολοκλήρωσε τις εργασίες",
  },
  navHome: { ar: "اليوم", en: "Today", el: "Σήμερα" },
  navSchedule: { ar: "الجدول", en: "Schedule", el: "Πρόγραμμα" },
  navTasks: { ar: "المهام", en: "Tasks", el: "Εργασίες" },
  navTimer: { ar: "المؤقت", en: "Timer", el: "Χρονόμετρο" },
  hello: { ar: "أهلاً! جاهز تذاكر؟", en: "Hey! Ready to study?", el: "Γεια! Έτοιμος για διάβασμα;" },
  todaySessions: { ar: "حصص اليوم", en: "Today's sessions", el: "Σημερινές ενότητες" },
  dueSoon: { ar: "مهام قريبة", en: "Due soon", el: "Λήγουν σύντομα" },
  nothingToday: { ar: "لا توجد حصص اليوم", en: "No sessions today", el: "Καμία ενότητα σήμερα" },
  noTasks: { ar: "لا توجد مهام، أحسنت!", en: "No tasks — nice work!", el: "Καμία εργασία — μπράβο!" },
  done: { ar: "منجزة", en: "Done", el: "Ολοκληρώθηκαν" },
  pending: { ar: "متبقية", en: "Pending", el: "Εκκρεμούν" },
  focusToday: { ar: "جلسات تركيز", en: "Focus sessions", el: "Συνεδρίες εστίασης" },
  addSession: { ar: "إضافة حصة", en: "Add session", el: "Προσθήκη ενότητας" },
  subject: { ar: "المادة", en: "Subject", el: "Μάθημα" },
  day: { ar: "اليوم", en: "Day", el: "Ημέρα" },
  from: { ar: "من", en: "From", el: "Από" },
  to: { ar: "إلى", en: "To", el: "Έως" },
  color: { ar: "اللون", en: "Color", el: "Χρώμα" },
  save: { ar: "حفظ", en: "Save", el: "Αποθήκευση" },
  cancel: { ar: "إلغاء", en: "Cancel", el: "Άκυρο" },
  delete: { ar: "حذف", en: "Delete", el: "Διαγραφή" },
  addTask: { ar: "إضافة مهمة", en: "Add task", el: "Νέα εργασία" },
  taskTitle: { ar: "عنوان المهمة", en: "Task title", el: "Τίτλος εργασίας" },
  dueDate: { ar: "موعد التسليم", en: "Due", el: "Προθεσμία" },
  remind: { ar: "تذكير قبل", en: "Remind me", el: "Υπενθύμιση" },
  none: { ar: "بدون", en: "None", el: "Καμία" },
  min: { ar: "دقيقة", en: "min", el: "λεπ." },
  hour: { ar: "ساعة", en: "hour", el: "ώρα" },
  dayBefore: { ar: "يوم", en: "day", el: "ημέρα" },
  priority: { ar: "الأولوية", en: "Priority", el: "Προτεραιότητα" },
  low: { ar: "عادية", en: "Low", el: "Χαμηλή" },
  med: { ar: "متوسطة", en: "Medium", el: "Μεσαία" },
  high: { ar: "عاجلة", en: "High", el: "Υψηλή" },
  all: { ar: "الكل", en: "All", el: "Όλες" },
  active: { ar: "الحالية", en: "Active", el: "Ενεργές" },
  completed: { ar: "المنجزة", en: "Completed", el: "Ολοκληρωμένες" },
  overdue: { ar: "متأخرة", en: "Overdue", el: "Εκπρόθεσμη" },
  enableNotif: { ar: "تفعيل الإشعارات", en: "Enable notifications", el: "Ενεργοποίηση ειδοποιήσεων" },
  notifOn: { ar: "الإشعارات مفعّلة", en: "Notifications on", el: "Ειδοποιήσεις ενεργές" },
  reminder: { ar: "تذكير", en: "Reminder", el: "Υπενθύμιση" },
  focus: { ar: "تركيز", en: "Focus", el: "Εστίαση" },
  shortBreak: { ar: "استراحة قصيرة", en: "Short break", el: "Μικρό διάλειμμα" },
  longBreak: { ar: "استراحة طويلة", en: "Long break", el: "Μεγάλο διάλειμμα" },
  start: { ar: "ابدأ", en: "Start", el: "Έναρξη" },
  pause: { ar: "إيقاف", en: "Pause", el: "Παύση" },
  reset: { ar: "إعادة", en: "Reset", el: "Επαναφορά" },
  focusDone: { ar: "انتهت جلسة التركيز! خذ استراحة 🎉", en: "Focus done! Take a break 🎉", el: "Τέλος εστίασης! Κάνε διάλειμμα 🎉" },
  breakDone: { ar: "انتهت الاستراحة، يلا نكمل 💪", en: "Break over, let's go 💪", el: "Τέλος διαλείμματος, πάμε 💪" },
  sessionsToday: { ar: "جلسات اليوم", en: "Sessions today", el: "Συνεδρίες σήμερα" },
  minutes: { ar: "الدقائق", en: "Minutes", el: "Λεπτά" },
  localNote: {
    ar: "بياناتك محفوظة على هذا الجهاز فقط",
    en: "Your data is saved on this device only",
    el: "Τα δεδομένα σου αποθηκεύονται μόνο σε αυτή τη συσκευή",
  },
  seeAll: { ar: "عرض الكل", en: "See all", el: "Όلا" },
} as const;

export type Key = keyof typeof dict;
export const translate = (lang: Lang, key: Key) => dict[key][lang];

const days = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  el: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
};
export const dayName = (lang: Lang, d: number) => days[lang][d];
export const weekOrder = (lang: Lang) => (lang === "ar" ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0]);
export const locale = (lang: Lang) => (lang === "ar" ? "ar-EG" : lang === "el" ? "el-GR" : "en-GB");
