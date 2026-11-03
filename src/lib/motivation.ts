import { playMotivationChime } from "./audio";
import { type Lang, GREEK_APP_NAME } from "./i18n";

export interface LocalizedString {
  ar: string;
  en: string;
  el: string;
}

export interface EncouragementQuoteRaw {
  id: number;
  category: "focus" | "success" | "consistency" | "determination";
  text: LocalizedString;
  tip?: LocalizedString;
}

export interface EncouragementQuote {
  id: number;
  category: "focus" | "success" | "consistency" | "determination";
  text: string;
  tip?: string;
}

export const MOTIVATION_QUOTES: EncouragementQuoteRaw[] = [
  {
    id: 1,
    category: "success",
    text: {
      ar: "صباح التميز والهمة يا {name}! 🌟 يوم جديد وفرصة جديدة لتصنع مستقبلك الجميل خطوة بخطوة.",
      en: "Good morning champion {name}! 🌟 A new day and a fresh opportunity to build your bright future step by step.",
      el: "Καλημέρα {name}! 🌟 Μια νέα μέρα και μια νέα ευκαιρία να χτίσεις το λαμπρό σου μέλλον βήμα-βήμα.",
    },
    tip: {
      ar: "ابدأ بأصعب مهمة أولاً وسترى كيف يسهل باقي اليوم!",
      en: "Tackle the hardest task first and the rest of the day will feel easy!",
      el: "Ξεκίνα με τη δυσκολότερη εργασία και η υπόλοιπη μέρα θα κυλήσει εύκολα!",
    },
  },
  {
    id: 2,
    category: "focus",
    text: {
      ar: "يا بطل {name}، تذكّر دائمًا: كل دقيقة تركيز ومذاكرة اليوم هي استثمار عظيم في حلمك الكبير! 💪",
      en: "Hey {name}, remember: every minute of focused study today is a great investment in your big dream! 💪",
      el: "{name}, να θυμάσαι: κάθε λεπτό συγκέντρωσης σήμερα είναι μια σπουδαία επένδυση στο μεγάλο σου όνειρο! 💪",
    },
    tip: {
      ar: "جلسة تركيز واحدة مدتها 25 دقيقة تصنع فرقاً مذهلاً.",
      en: "A single 25-minute focus session makes an incredible difference.",
      el: "Μια 25λεπτη συνεδρία εστίασης κάνει απίστευτη διαφορά.",
    },
  },
  {
    id: 3,
    category: "consistency",
    text: {
      ar: "لا تنتظر المزاج المثالي يا {name}، ابدأ بالمهمة الأولى وستجد الحماس يتدفق تلقائيًا! 🚀",
      en: "Don't wait for the perfect mood, {name}! Start the first task and motivation will naturally follow! 🚀",
      el: "Μην περιμένεις την τέλεια διάθεση, {name}! Ξεκίνα την πρώτη εργασία και ο ενθουσιασμός θα έρθει! 🚀",
    },
    tip: {
      ar: "الحماس يأتي بعد البدء وليس قبله.",
      en: "Motivation comes after starting, not before.",
      el: "Το κίνητρο έρχεται μετά την έναρξη, όχι πριν.",
    },
  },
  {
    id: 4,
    category: "determination",
    text: {
      ar: "يا {name}، رحلة الألف ميل تبدأ بصفحة واحدة تذاكرها الآن بكل إخلاص.. أنت قدها! 📖✨",
      en: "Hey {name}, the journey of a thousand miles begins with a single page studied right now.. You can do it! 📖✨",
      el: "{name}, το ταξίδι των χιλίων μιλίων ξεκινά με μία μόνο σελίδα μελέτης τώρα.. Μπορείς να τα καταφέρεις! 📖✨",
    },
    tip: {
      ar: "قسّم الدروس الطويلة إلى نقاط صغيرة يسهل هضمها.",
      en: "Break long lessons into bite-sized manageable chunks.",
      el: "Χώρισε τα μεγάλα μαθήματα σε μικρά διαχειρίσιμα κομμάτια.",
    },
  },
  {
    id: 5,
    category: "success",
    text: {
      ar: "كل الناجحين والعظماء مروا بأيام صعبة واجتهدوا بصبر.. استمر في السعي فهدفك يستحق يا {name}! 🎯",
      en: "Every great achiever pushed through tough days with patience.. Keep going, your goal is worth it {name}! 🎯",
      el: "Όλοι οι σπουδαίοι πέρασαν δύσκολες μέρες με υπομονή.. Συνέχισε, ο στόχος σου αξίζει {name}! 🎯",
    },
    tip: {
      ar: "تخيل فرحتك وفرحة أهلك يوم النتيجة وتفوقك.",
      en: "Picture the joy of success and making yourself proud on results day.",
      el: "Φαντάσου τη χαρά της επιτυχίας την ημέρα των αποτελεσμάτων.",
    },
  },
  {
    id: 6,
    category: "focus",
    text: {
      ar: "يا {name}، التركيز مثل العضلة تقوى بالتدريب.. خذ نفسًا عميقًا وابدأ جلسة تركيز قوية! 🧠⚡",
      en: "Focus is like a muscle that grows with practice, {name}.. Take a deep breath and start a powerful focus session! 🧠⚡",
      el: "Η εστίαση είναι σαν ένας μυς που δυναμώνει με την εξάσκηση, {name}.. Πάρε βαθιά ανάσα και ξεκίνα! 🧠⚡",
    },
    tip: {
      ar: "أبعد هاتفك عن يدك لتبقى في أعلى درجات الاستيعاب.",
      en: "Put your phone away to keep your mind sharp and absorb everything.",
      el: "Βάλε το κινητό μακριά για να διατηρήσεις απόλυτη συγκέντρωση.",
    },
  },
  {
    id: 7,
    category: "consistency",
    text: {
      ar: "إنجاز مهامك اليوم هو سر راحتك وثقتك بنفسك غدًا.. جدولك بانتظارك يا {name}! 🏆",
      en: "Finishing your tasks today is the secret to peace of mind and confidence tomorrow.. Your schedule awaits, {name}! 🏆",
      el: "Η ολοκλήρωση των εργασιών σήμερα φέρνει ηρεμία και αυτοπεποίθηση αύριο.. Το πρόγραμμά σου σε περιμένει, {name}! 🏆",
    },
    tip: {
      ar: "ضع علامة منجز على أول مهمة لتشعر بمتعة الإنجاز.",
      en: "Check off your first task to feel the rewarding spark of momentum.",
      el: "Σημείωσε ως ολοκληρωμένη την πρώτη εργασία για να νιώσεις ικανοποίηση.",
    },
  },
  {
    id: 8,
    category: "determination",
    text: {
      ar: "يا {name}، الفرق بين الحلم والحقيقة هو العمل المستمر كل يوم.. اجعل هذا اليوم مميزًا! 🌈",
      en: "The difference between dreams and reality is consistent daily action, {name}.. Make today count! 🌈",
      el: "Η διαφορά μεταξύ ονείρου και πραγματικότητας είναι η καθημερινή δράση, {name}.. Κάνε τη σημερινή μέρα να μετρήσει! 🌈",
    },
    tip: {
      ar: "المثابرة اليومية البسيطة تهزم الذكاء غير المنظم.",
      en: "Simple daily consistency beats unorganized talent every time.",
      el: "Η σταθερή καθημερινή επιμονή νικά το ανοργάνωτο ταλέντο.",
    },
  },
  {
    id: 9,
    category: "consistency",
    text: {
      ar: "أنت لست بحاجة إلى أن تكون خارقًا يا {name}، بل أن تكون ملتزمًا وصبورًا فقط! 🌟",
      en: "You don't need to be superhuman, {name}—just committed and patient! 🌟",
      el: "Δεν χρειάζεται να είσαι υπεράνθρωπος, {name}—απλώς αφοσιωμένος και υπομονετικός! 🌟",
    },
    tip: {
      ar: "التزم بجدول اليوم وسيكون التفوق حليفك الأكيد.",
      en: "Stick to your schedule today and excellence will surely follow.",
      el: "Μείνε πιστός στο πρόγραμμά σου σήμερα και η επιτυχία θα ακολουθήσει.",
    },
  },
  {
    id: 10,
    category: "focus",
    text: {
      ar: "يا {name}، عقلك قادر على استيعاب كل الصعاب عندما تهدأ وتركز بكل هدوء وثقة! 💡",
      en: "Your mind can conquer any tough topic when you stay calm, confident, and focused, {name}! 💡",
      el: "Το μυαλό σου μπορεί να κατανοήσει κάθε δύσκολο θέμα όταν παραμένεις ήρεμος και συγκεντρωμένος, {name}! 💡",
    },
    tip: {
      ar: "اشرب كوب ماء ورتّب مكان مذاكرتك لتصفية ذهنك.",
      en: "Drink a glass of water and tidy your desk to clear your thoughts.",
      el: "Πιες ένα ποτήρι νερό και τακτοποίησε το γραφείο σου για να καθαρίσει το μυαλό σου.",
    },
  },
  {
    id: 11,
    category: "success",
    text: {
      ar: "افخر بكل خطوة أنجزتها هذا الأسبوع يا {name}، واليوم نكمل المشوار بعزيمة أقوى! 🔥",
      en: "Be proud of every step you achieved this week, {name}—today we keep going with even greater drive! 🔥",
      el: "Να είσαι περήφανος για κάθε βήμα αυτή τη βδομάδα, {name}—σήμερα συνεχίζουμε με ακόμα μεγαλύτερο πείσμα! 🔥",
    },
    tip: {
      ar: "احتفل بإنجازاتك الصغيرة لتشحن طاقتك للأمام.",
      en: "Celebrate small wins to fuel your energy for what lies ahead.",
      el: "Γιόρτασε τις μικρές νίκες για να γεμίσεις ενέργεια.",
    },
  },
  {
    id: 12,
    category: "determination",
    text: {
      ar: "يا {name}، التعب يزول والنجاح والتفوق يدومان للأبد.. اجتهد ولا تستسلم! 🎓✨",
      en: "Tiredness fades, but accomplishment and excellence last forever, {name}.. Keep pushing, never give up! 🎓✨",
      el: "Η κούραση περνάει, αλλά η επιτυχία και η γνώση μένουν για πάντα, {name}.. Προσπάθησε, μην τα παρατάς! 🎓✨",
    },
    tip: {
      ar: "ساعة مذاكرة مركزة تعادل 3 ساعات من التشتت.",
      en: "One hour of deep focus beats three hours of distracted browsing.",
      el: "Μία ώρα βαθιάς μελέτης ισοδυναμεί με 3 ώρες διάσπασης προσοχής.",
    },
  },
  {
    id: 13,
    category: "focus",
    text: {
      ar: "يا بطل {name}، المعرفة كنز لا يستطيع أحد أن ينتزعه منك.. زِد كنزك اليوم درسًا جديدًا! 💎",
      en: "Knowledge is a treasure nobody can ever take away from you, {name}.. Add another gem to your treasure today! 💎",
      el: "Η γνώση είναι ένας θησαυρός που κανείς δεν μπορεί να σου πάρει, {name}.. Πρόσθεσε έναν νέο θησαυρό σήμερα! 💎",
    },
    tip: {
      ar: "اشرح المعلومة لنفسك بصوت مسموع لترسيخها.",
      en: "Explain the concept out loud to yourself to lock it in memory.",
      el: "Εξήγησε την έννοια στον εαυτό σου δυνατά για να την εμπεδώσεις.",
    },
  },
  {
    id: 14,
    category: "consistency",
    text: {
      ar: "اليوم يوم جديد لبناء نسختك الأفضل يا {name}.. انطلق ونحن معك خطوة بخطوة! 🌟",
      en: "Today is a brand new day to build your best self, {name}.. Go for it, step by step! 🌟",
      el: "Σήμερα είναι μια νέα μέρα να γίνεις η καλύτερη εκδοχή σου, {name}.. Ξεκίνα, βήμα προς βήμα! 🌟",
    },
    tip: {
      ar: "خذ استراحة 5 دقائق بعد كل نصف ساعة لتجديد النشاط.",
      en: "Take a 5-minute break every half hour to refresh your mental battery.",
      el: "Κάνε ένα διάλειμμα 5 λεπτών κάθε μισή ώρα για ανανέωση.",
    },
  },
  {
    id: 15,
    category: "focus",
    text: {
      ar: "يا {name}، لا يوجد درس مستحيل الفهم.. كل ما تحتاجه هو تجزئته والتركيز فيه بهدوء! 🧩",
      en: "No lesson is impossible to grasp, {name}.. All you need is to break it down and focus calmly! 🧩",
      el: "Κανένα μάθημα δεν είναι αδύνατο να κατανοηθεί, {name}.. Αρκεί να το σπάσεις σε μέρη και να εστιάσεις ήρεμα! 🧩",
    },
    tip: {
      ar: "استعن بالألوان والخرائط الذهنية لتسهيل الحفظ.",
      en: "Use colors and mind maps to make visual connections.",
      el: "Χρησιμοποίησε χρώματα και νοητικούς χάρτες για να διευκολύνεις την απομνημόνευση.",
    },
  },
  {
    id: 16,
    category: "success",
    text: {
      ar: "يا رائع {name}، ما تزرعه اليوم من سهر وجهد وتعب ستجنيه غدًا فخرًا وسعادة! 🌱🌻",
      en: "The effort and dedication you plant today will bloom into pride and success tomorrow, {name}! 🌱🌻",
      el: "Η προσπάθεια που φυτεύεις σήμερα θα ανθίσει σε υπερηφάνεια και χαρά αύριο, {name}! 🌱🌻",
    },
    tip: {
      ar: "النوم الكافي ليلاً هو سر سرعة استرجاع المعلومات.",
      en: "Getting good sleep tonight is the real secret to fast memory recall.",
      el: "Ο καλός βραδινός ύπνος είναι το μυστικό για γρήγορη ανάκληση γνώσεων.",
    },
  },
  {
    id: 17,
    category: "determination",
    text: {
      ar: "كن صبورًا مع نفسك يا {name}.. التطور الحقيقي يحدث عندما تواصل رغم التحديات! 🛡️",
      en: "Be patient with yourself, {name}.. True growth happens when you keep going despite the challenge! 🛡️",
      el: "Να έχεις υπομονή με τον εαυτό σου, {name}.. Η πραγματική πρόοδος συμβαίνει όταν συνεχίζεις παρά τις δυσκολίες! 🛡️",
    },
    tip: {
      ar: "إذا شعرت بالتعب خذ راحة قصيرة ثم عُد بقوة.",
      en: "If you feel tired, take a short breather and bounce back strong.",
      el: "Αν νιώσεις κούραση, πάρε μια μικρή ανάσα και επέστρεψε δυναμικά.",
    },
  },
  {
    id: 18,
    category: "focus",
    text: {
      ar: "يا {name}، استمتع برحلة التعلم، فكل معلومة جديدة تفتح لعقلك أفقًا واسعًا! 🚀📚",
      en: "Enjoy the learning journey, {name}—every new piece of knowledge expands your horizons! 🚀📚",
      el: "Απόλαυσε το ταξίδι της μάθησης, {name}—κάθε νέα γνώση διευρύνει τους ορίζοντές σου! 🚀📚",
    },
    tip: {
      ar: "اربط الدروس بالحياة العملية لتشعر بقيمتها وجمالها.",
      en: "Connect what you study to real life to appreciate its true value.",
      el: "Σύνδεσε τα μαθήματα με την καθημερινή ζωή για να καταλάβεις την αξία τους.",
    },
  },
  {
    id: 19,
    category: "determination",
    text: {
      ar: "أنت أقوى مما تظن وأذكى مما تتخيل يا {name}.. ثق بنفسك وابدأ الآن! ⭐",
      en: "You are stronger than you think and smarter than you imagine, {name}.. Believe in yourself and start now! ⭐",
      el: "Είσαι πιο δυνατός και πιο έξυπνος απ’ όσο νομίζεις, {name}.. Πίστεψε στον εαυτό σου και ξεκίνα τώρα! ⭐",
    },
    tip: {
      ar: "الثقة بالنفس تبدأ بإنهاء واجبات اليوم في موعدها.",
      en: "Confidence builds when you finish today's assignments on time.",
      el: "Η αυτοπεποίθηση χτίζεται όταν τελειώνεις τις εργασίες σου στην ώρα τους.",
    },
  },
  {
    id: 20,
    category: "consistency",
    text: {
      ar: "يا {name}، اجعل هدفك اليوم هو إنهاء المهام بضمير وإتقان وليس فقط التخلص منها! 💎",
      en: "Make it your goal today to complete your tasks with excellence and mastery, {name}! 💎",
      el: "Βάλε στόχο σήμερα να ολοκληρώσεις τις εργασίες σου με αριστεία και συνέπεια, {name}! 💎",
    },
    tip: {
      ar: "الإتقان يصنع الفارق بين الطالب العادي والمتفوق.",
      en: "Mastery is what turns an ordinary student into a standout achiever.",
      el: "Η προσοχή στη λεπτομέρεια κάνει τη διαφορά ανάμεσα στον καλό και τον κορυφαίο μαθητή.",
    },
  },
];

export function getDefaultStudentName(lang: Lang = "ar"): string {
  if (lang === "en") return "Champ";
  if (lang === "el") return "Πρωταθλητή";
  return "يا بطل";
}

/**
 * Returns formatted daily quote matching today's date in requested language
 */
export function getDailyMotivation(studentName?: string, lang: Lang = "ar"): EncouragementQuote {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % MOTIVATION_QUOTES.length;
  const raw = MOTIVATION_QUOTES[index];
  const name = studentName && studentName.trim() ? studentName.trim() : getDefaultStudentName(lang);

  const rawText = raw.text[lang] || raw.text.ar;
  const rawTip = raw.tip ? (raw.tip[lang] || raw.tip.ar) : undefined;

  return {
    id: raw.id,
    category: raw.category,
    text: rawText.replace(/\{name\}/g, name),
    tip: rawTip ? rawTip.replace(/\{name\}/g, name) : undefined,
  };
}

/**
 * Returns a randomized fresh quote in requested language
 */
export function getRandomMotivation(studentName?: string, excludeId?: number, lang: Lang = "ar"): EncouragementQuote {
  const filtered = excludeId
    ? MOTIVATION_QUOTES.filter((q) => q.id !== excludeId)
    : MOTIVATION_QUOTES;
  const picked = filtered[Math.floor(Math.random() * filtered.length)] || MOTIVATION_QUOTES[0];
  const name = studentName && studentName.trim() ? studentName.trim() : getDefaultStudentName(lang);

  const rawText = picked.text[lang] || picked.text.ar;
  const rawTip = picked.tip ? (picked.tip[lang] || picked.tip.ar) : undefined;

  return {
    id: picked.id,
    category: picked.category,
    text: rawText.replace(/\{name\}/g, name),
    tip: rawTip ? rawTip.replace(/\{name\}/g, name) : undefined,
  };
}

const STORAGE_KEY_LAST_NOTIF_DATE = "zaker_last_motivation_date";

/**
 * Trigger daily motivation notification and sound
 */
export async function sendDailyMotivationNotification(options?: {
  studentName?: string;
  force?: boolean;
  quote?: EncouragementQuote;
  lang?: Lang;
}): Promise<boolean> {
  const lang: Lang = options?.lang || "ar";
  const todayStr = new Date().toISOString().split("T")[0];
  const lastDate = localStorage.getItem(STORAGE_KEY_LAST_NOTIF_DATE);

  if (!options?.force && lastDate === todayStr) {
    return false;
  }

  const quote = options?.quote || getDailyMotivation(options?.studentName, lang);

  // 1. Play distinctive motivation chime sound
  try {
    playMotivationChime();
  } catch (err) {
    console.warn("[Zaker Audio] Chime error:", err);
  }

  // 2. Deliver System / PWA Notification if supported and granted
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        const title =
          lang === "en"
            ? "Study - Daily Motivation 🌟"
            : lang === "el"
            ? `${GREEK_APP_NAME} - Ημερήσια Ενθάρρυνση 🌟`
            : "ذاكر - رسالة اليوم التشجيعية 🌟";

        const tipPrefix =
          lang === "en"
            ? "💡 Tip: "
            : lang === "el"
            ? "💡 Συμβουλή: "
            : "💡 نصيحة: ";

        const iconPath =
          lang === "en"
            ? "./icons/en/zaker-study-192.png"
            : "./icons/zaker-study-192.png";

        const notifOptions: NotificationOptions & { vibrate?: number[] } = {
          body: quote.text + (quote.tip ? `\n${tipPrefix}${quote.tip}` : ""),
          icon: iconPath,
          badge: iconPath,
          dir: lang === "ar" ? "rtl" : "ltr",
          lang,
          tag: "zaker-daily-motivation",
          vibrate: [150, 75, 150, 75, 300],
        };

        if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, notifOptions);
        } else {
          new Notification(title, notifOptions);
        }

        localStorage.setItem(STORAGE_KEY_LAST_NOTIF_DATE, todayStr);
        return true;
      } catch (e) {
        console.warn("[Zaker Notif] Notification dispatch error:", e);
      }
    }
  }

  localStorage.setItem(STORAGE_KEY_LAST_NOTIF_DATE, todayStr);
  return false;
}
