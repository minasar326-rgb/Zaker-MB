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
  todaySessions: { ar: "حصص اليوم في الجدول", en: "Today's sessions", el: "Σημερινές ενότητες" },
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
  seeAll: { ar: "عرض الكل", en: "See all", el: "Όλα" },

  // Student Profile & Onboarding
  welcomeStudent: { ar: "مرحباً بك في ذاكِر!", en: "Welcome to Zaker!", el: "Καλώς ήρθατε στο Zaker!" },
  whatIsYourName: { ar: "ما اسمك يا بطل؟", en: "What is your name?", el: "Ποιο είναι το όνομά σου;" },
  namePlaceholder: { ar: "اكتب اسمك هنا...", en: "Type your name here...", el: "Γράψε το όνομά σου εδώ..." },
  startJourney: { ar: "ابدأ رحلة التفوق 🚀", en: "Start Your Journey 🚀", el: "Ξεκινήστε το ταξίδι σας 🚀" },
  studentName: { ar: "اسم الطالب", en: "Student Name", el: "Όνομα μαθητή" },
  editName: { ar: "تعديل الاسم", en: "Edit Name", el: "Επεξεργασία ονόματος" },
  enterYourName: { ar: "أدخل اسمك لتخصيص التطبيق", en: "Enter your name to personalize the app", el: "Εισάγετε το όνομά σας" },

  // Daily plan & combined progress
  dailyPlan: { ar: "خطة مذاكرة اليوم", en: "Today's Study Plan", el: "Ημερήσιο Πλάνο Μελέτης" },
  dailyPlanSubtitle: {
    ar: "رتّب المواد التي ستذاكرها اليوم وحدد وقتاً مستهدفاً لكل مادة",
    en: "Organize subjects for today and set target minutes for each",
    el: "Οργάνωσε τα μαθήματα της ημέρας και θέσε στόχο χρόνου για το καθένα",
  },
  addSubjectPlan: { ar: "إضافة مادة للخطة", en: "Add subject to plan", el: "Προσθήκη μαθήματος" },
  targetMinutes: { ar: "الوقت المستهدف (دقيقة)", en: "Target time (min)", el: "Στόχος (λεπτά)" },
  taskNotes: { ar: "المهام أو الدروس المحددة", en: "Tasks / Specific topics", el: "Εργασίες / Συγκεκριμένα θέματα" },
  studyProgress: { ar: "إنجاز أهداف اليوم", en: "Today's Overall Achievement", el: "Σημερινά Επιτεύγματα" },
  startStudying: { ar: "ابدأ المذاكرة بالمؤقت", en: "Start timer on this", el: "Έναρξη μελέτης με χρονόμετρο" },
  importSchedule: { ar: "نسخ مواد الجدول لليوم", en: "Import from schedule", el: "Εισαγωγή από πρόγραμμα" },
  noPlanYet: {
    ar: "لم تحدد خطة مذاكرة لليوم بعد! أضف المواد الآن لتنظيم وقتك بذكاء 💡",
    en: "No study plan for today yet! Add subjects now to organize your time 💡",
    el: "Δεν έχεις ορίσει πλάνο για σήμερα! Πρόσθεσε μαθήματα τώρα 💡",
  },
  allPlannedDone: {
    ar: "أنت بطل! حققت أهداف اليوم بنجاح 🎯🎉",
    en: "Champion! You completed today's study goals successfully 🎯🎉",
    el: "Μπράβο! Ολοκλήρωσες τους σημερινούς στόχους με επιτυχία 🎯🎉",
  },
  studyStreak: { ar: "شعلة الالتزام", en: "Study Streak", el: "Σερί Μελέτης" },
  streakDays: { ar: "أيام متتالية", en: "days streak", el: "συνεχόμενες ημέρες" },
  streakAwesome: {
    ar: "حماسك مستمر! واصل التقدم كل يوم 🔥",
    en: "Keep the momentum going every day! 🔥",
    el: "Συνέχισε δυναμικά κάθε μέρα! 🔥",
  },
  streakStart: {
    ar: "ابدأ سلسلة التزامك اليوم بالمذاكرة والتركيز! 🚀",
    en: "Start your study streak today with focus! 🚀",
    el: "Ξεκίνα το σερί σου σήμερα με συγκέντρωση! 🚀",
  },
  print: { ar: "طباعة (PDF)", en: "Print (PDF)", el: "Εκτύπωση (PDF)" },
  printSchedule: { ar: "طباعة الجدول (PDF)", en: "Print Schedule (PDF)", el: "Εκτύπωση Προγράμματος (PDF)" },
  printPlan: { ar: "طباعة خطة اليوم (PDF)", en: "Print Daily Plan (PDF)", el: "Εκτύπωση Πλάνου (PDF)" },
  selectSubject: { ar: "المادة التي تذاكرها حالياً", en: "Currently studying", el: "Τρέχον μάθημα" },
  generalStudy: { ar: "مذاكرة عامة", en: "General Study", el: "Γενικό διάβασμα" },
  subjectStats: { ar: "إحصائيات المواد", en: "Subject Statistics", el: "Στατιστικά Μαθημάτων" },
  todaySubjectStats: { ar: "إنجاز اليوم حسب المادة", en: "Today by Subject", el: "Σημερινό ανά μάθημα" },
  weekSubjectStats: { ar: "إنجاز الأسبوع حسب المادة (آخر 7 أيام)", en: "Last 7 Days by Subject", el: "Τελευταίες 7 ημέρες ανά μάθημα" },
  noSubjectFocus: {
    ar: "ابدأ جلسة تركيز لتسجيل دقائق المذاكرة لكل مادة",
    en: "Start a focus session to log minutes per subject",
    el: "Ξεκίνα μια συνεδρία για να καταγράψεις χρόνο ανά μάθημα",
  },
  soundChime: { ar: "صوت التنبيه", en: "Chime sound", el: "Ήχος κουδουνίσματος" },
  soundOn: { ar: "الصوت مفعّل", en: "Sound on", el: "Ήχος ενεργός" },
  soundOff: { ar: "الصوت مكتوم", en: "Sound muted", el: "Ήχος σε σίγαση" },
  previewSound: { ar: "تجربة الصوت", en: "Test chime", el: "Δοκιμή ήχου" },
  totalTarget: { ar: "المستهدف الإجمالي", en: "Total Target", el: "Συνολικός στόχος" },
  totalAchieved: { ar: "المحقق فعلياً", en: "Total Studied", el: "Πραγματοποιήθηκε" },

  // Combined Daily Achievement
  dailyOverviewTitle: { ar: "إنجاز اليوم (المذاكرة + المهام)", en: "Today's Achievement (Study + Tasks)", el: "Σημερινά Επιτεύγματα (Μελέτη + Εργασίες)" },
  studySectionTitle: { ar: "📚 مذاكرة المواد", en: "📚 Study Subjects", el: "📚 Μαθήματα Μελέτης" },
  tasksSectionTitle: { ar: "✅ المهام والواجبات", en: "✅ Tasks & Assignments", el: "✅ Εργασίες & Καθήκοντα" },
  addQuickTaskToday: { ar: "إضافة مهمة لليوم", en: "Add task for today", el: "Προσθήκη εργασίας για σήμερα" },
  noTasksYetToday: { ar: "لا توجد مهام لليوم، أضف مهمة جديدة أو استمتع بيومك!", en: "No tasks for today! Add a task or enjoy your day!", el: "Δεν υπάρχουν εργασίες για σήμερα!" },
  totalDayProgress: { ar: "إجمالي إنجاز اليوم (المذاكرة + المهام)", en: "Overall Achievement (Study + Tasks)", el: "Συνολικό Επίτευγμα (Μελέτη + Εργασίες)" },
  dailyTasksSection: { ar: "مهام اليوم", en: "Today's Tasks", el: "Σημερινές εργασίες" },
  subjectsAchievement: { ar: "المذاكرة", en: "Study Subjects", el: "Μαθήματα" },
  tasksAchievement: { ar: "المهام", en: "Tasks", el: "Εργασίες" },
  allGoalsDone: { ar: "أنت أسطورة! أنجزت كل المذاكرة وجميع المهام المحددة لليوم! 🏆🎉", en: "Legendary! You completed all study sessions and all tasks for today! 🏆🎉", el: "Απίστευτο! Ολοκλήρωσες όλο το διάβασμα και όλες τις εργασίες σήμερα! 🏆🎉" },
  goalsCount: { ar: "أهداف منجزة", en: "goals done", el: "στόχοι ολοκληρώθηκαν" },
  quickTaskPlaceholder: {
    ar: "اكتب مهمة أو واجباً جديداً لليوم...",
    en: "Type a task or homework for today...",
    el: "Πληκτρολογήστε νέα εργασία για σήμερα...",
  },
  completedTodayBadge: {
    ar: "تم إنجازها اليوم ✓",
    en: "Completed today ✓",
    el: "Ολοκληρώθηκε σήμερα ✓",
  },
  pendingTodayBadge: {
    ar: "مطلوبة اليوم",
    en: "Due today",
    el: "Για σήμερα",
  },

  // Advanced Tasks
  description: { ar: "تفاصيل / ملاحظات", en: "Description / Notes", el: "Περιγραφή / Σημειώσεις" },
  subtasks: { ar: "الخطوات والمهام الفرعية", en: "Subtasks / Steps", el: "Υποεργασίες / Βήματα" },
  addSubtask: { ar: "إضافة خطوة", en: "Add step", el: "Προσθήκη βήματος" },
  editTask: { ar: "تعديل المهمة", en: "Edit Task", el: "Επεξεργασία" },
  tag: { ar: "نوع المهمة", en: "Task Type", el: "Τύπος" },
  tag_homework: { ar: "📝 واجب منزلي", en: "📝 Homework", el: "📝 Εργασία" },
  tag_exam: { ar: "🎯 اختبار / امتحان", en: "🎯 Exam / Quiz", el: "🎯 Διαγώνισμα" },
  tag_revision: { ar: "🔄 مراجعة", en: "🔄 Revision", el: "🔄 Επανάληψη" },
  tag_project: { ar: "💡 بحث / مشروع", en: "💡 Project", el: "💡 Project" },
  tag_reading: { ar: "📖 قراءة / استيعاب", en: "📖 Reading", el: "📖 Μελέτη" },
  estMinutes: { ar: "الوقت المقدر (دقيقة)", en: "Estimated (min)", el: "Εκτίμηση (λεπ.)" },
  searchTasks: { ar: "ابحث بالاسم، المادة، أو التفاصيل...", en: "Search tasks, subjects...", el: "Αναζήτηση εργασιών..." },
  focusOnTask: { ar: "ركّز على هذه المهمة ⏱️", en: "Focus on this task ⏱️", el: "Εστίαση στην εργασία ⏱️" },
  filterByTag: { ar: "تصفية بالتصنيف", en: "Filter by tag", el: "Φίλτρο ετικέτας" },
  stepsDone: { ar: "خطوات مكتملة", en: "steps completed", el: "βήματα ολοκληρώθηκαν" },
  taskSubtitle: {
    ar: "نظّم تفاصيل واجباتك، مشاريعك، ومواعيد تسليمك بدقة",
    en: "Organize homework, projects, and deadlines with precision",
    el: "Οργανώστε εργασίες, projects και προθεσμίες με ακρίβεια",
  },
  placeholderTaskTitle: {
    ar: "مثلاً: حل تدريبات الحركة في خط مستقيم...",
    en: "e.g. Solve physics chapter 2 exercises...",
    el: "π.χ. Λύση ασκήσεων φυσικής κεφαλαίου 2...",
  },
  placeholderSubject: {
    ar: "فيزياء، رياضيات، كيمياء...",
    en: "Physics, Math, Chemistry...",
    el: "Φυσική, Μαθηματικά, Χημεία...",
  },
  placeholderDescription: {
    ar: "صفحات الكتاب، تفاصيل المسائل، روابط أو ملاحظات إضافية...",
    en: "Book pages, problem details, links or extra notes...",
    el: "Σελίδες βιβλίου, λεπτομέρειες, σύνδεσμοι ή σημειώσεις...",
  },
  placeholderSubtask: {
    ar: "خطوة أو مرحلة في المهمة...",
    en: "Step or milestone in task...",
    el: "Βήμα ή στάδιο στην εργασία...",
  },
  placeholderEstMinutes: {
    ar: "مثال: 45 دقيقة",
    en: "e.g. 45 min",
    el: "π.χ. 45 λεπ.",
  },
  quickAddStep: {
    ar: "+ إضافة خطوة فرعية سريعة...",
    en: "+ Add quick step...",
    el: "+ Γρήγορη προσθήκη βήματος...",
  },

  // Advanced Timer Controls
  timerSettings: { ar: "تخصيص أوقات المؤقت", en: "Timer Settings", el: "Ρυθμίσεις χρονομέτρου" },
  customMinutes: { ar: "تخصيص الوقت", en: "Custom time", el: "Προσαρμογή" },
  adjustTime: { ar: "تعديل الوقت", en: "Adjust time", el: "Ρύθμιση χρόνου" },
  round: { ar: "الجولة", en: "Round", el: "Γύρος" },
  of: { ar: "من", en: "of", el: "από" },
  roundsGoal: { ar: "عدد الجولات", en: "Rounds goal", el: "Στόχος γύρων" },
  focusDuration: { ar: "وقت التركيز (دقيقة)", en: "Focus duration (min)", el: "Χρόνος εστίασης (λεπ.)" },
  shortBreakDuration: { ar: "استراحة قصيرة (دقيقة)", en: "Short break (min)", el: "Σύντομο διάλειμμα (λεπ.)" },
  longBreakDuration: { ar: "استراحة طويلة (دقيقة)", en: "Long break (min)", el: "Μεγάλο διάλειμμα (λεπ.)" },
  autoStart: { ar: "الانتقال التلقائي للاستراحة", en: "Auto-start breaks", el: "Αυτόματη έναρξη διαλείμματος" },
  selectTask: { ar: "ربط بمهمة محددة", en: "Link to a task", el: "Σύνδεση με εργασία" },
  linkedTask: { ar: "المهمة المرتبطة", en: "Linked Task", el: "Συνδεδεμένη εργασία" },
  timerSubtitle: {
    ar: "تحكم كامل في مدة الجلسات والاستراحات",
    en: "Full control over focus sessions and breaks",
    el: "Πλήρης έλεγχος των συνεδριών και διαλειμμάτων",
  },
  currentSubjectLabel: { ar: "المادة الحالية:", en: "Current subject:", el: "Τρέχον μάθημα:" },
  studiedTodayLabel: { ar: "أنجزت فيها اليوم:", en: "Studied today:", el: "Μελετήθηκε σήμερα:" },
  noTaskSelected: { ar: "بدون مهمة محددة", en: "No specific task linked", el: "Χωρίς συγκεκριμένη εργασία" },
  addAnotherSubject: { ar: "➕ إضافة مادة أخرى...", en: "➕ Add other subject...", el: "➕ Προσθήκη άλλου μαθήματος..." },
  customSubjectName: { ar: "اسم المادة...", en: "Subject name...", el: "Όνομα μαθήματος..." },
  weeklyTimetable: { ar: "جدول المذاكرة الأسبوعي", en: "Weekly Study Schedule", el: "Εβδομαδιαίο Πρόγραμμα Μελέτης" },
  placeholderPlanSubject: { ar: "مثال: رياضيات، فيزياء، لغة عربية...", en: "e.g. Math, Physics, English...", el: "π.χ. Μαθηματικά, Φυσική..." },
  placeholderPlanNotes: { ar: "مثال: حل صفحة 45، تلخيص الفصل الثاني...", en: "e.g. Solve page 45, summarize chapter 2...", el: "π.χ. Λύση σελίδας 45..." },
} as const;

export type Key = keyof typeof dict;
export const translate = (lang: Lang, key: Key) => dict[key][lang];

export function getGreeting(lang: Lang, name?: string): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return dict.hello[lang];
  }
  if (lang === "ar") {
    return `أهلاً يا ${trimmed}! جاهز تذاكر؟`;
  }
  if (lang === "el") {
    return `Γεια σου ${trimmed}! Έτοιμος για διάβασμα;`;
  }
  return `Hey ${trimmed}! Ready to study?`;
}

const days = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  el: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
};
export const dayName = (lang: Lang, d: number) => days[lang][d];
export const weekOrder = (lang: Lang) => (lang === "ar" ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0]);
export const locale = (lang: Lang) => (lang === "ar" ? "ar-EG" : lang === "el" ? "el-GR" : "en-GB");
