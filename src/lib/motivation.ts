import { playMotivationChime } from './audio';

export interface EncouragementQuote {
  id: number;
  text: string;
  tip?: string;
  category: 'focus' | 'success' | 'consistency' | 'determination';
}

export const MOTIVATION_QUOTES: EncouragementQuote[] = [
  {
    id: 1,
    text: 'صباح التميز والهمة يا {name}! 🌟 يوم جديد وفرصة جديدة لتصنع مستقبلك الجميل خطوة بخطوة.',
    tip: 'ابدأ بأصعب مهمة أولاً وسترى كيف يسهل باقي اليوم!',
    category: 'success',
  },
  {
    id: 2,
    text: 'يا بطل {name}، تذكّر دائمًا: كل دقيقة تركيز ومذاكرة اليوم هي استثمار عظيم في حلمك الكبير! 💪',
    tip: 'جلسة تركيز واحدة مدتها 25 دقيقة تصنع فرقاً مذهلاً.',
    category: 'focus',
  },
  {
    id: 3,
    text: 'لا تنتظر المزاج المثالي يا {name}، ابدأ بالمهمة الأولى وستجد الحماس يتدفق تلقائيًا! 🚀',
    tip: 'الحماس يأتي بعد البدء وليس قبله.',
    category: 'consistency',
  },
  {
    id: 4,
    text: 'يا {name}، رحلة الألف ميل تبدأ بصفحة واحدة تذاكرها الآن بكل إخلاص.. أنت قدها! 📖✨',
    tip: 'قسّم الدروس الطويلة إلى نقاط صغيرة يسهل هضمها.',
    category: 'determination',
  },
  {
    id: 5,
    text: 'كل الناجحين والعظماء مروا بأيام صعبة واجتهدوا بصبر.. استمر في السعي فهدفك يستحق يا {name}! 🎯',
    tip: 'تخيل فرحتك وفرحة أهلك يوم النتيجة وتفوقك.',
    category: 'success',
  },
  {
    id: 6,
    text: 'يا {name}، التركيز مثل العضلة تقوى بالتدريب.. خذ نفسًا عميقًا وابدأ جلسة تركيز قوية! 🧠⚡',
    tip: 'أبعد هاتفك عن يدك لتبقى في أعلى درجات الاستيعاب.',
    category: 'focus',
  },
  {
    id: 7,
    text: 'إنجاز مهامك اليوم هو سر راحتك وثقتك بنفسك غدًا.. جدولك بانتظارك يا {name}! 🏆',
    tip: 'ضع علامة منجز على أول مهمة لتشعر بمتعة الإنجاز.',
    category: 'consistency',
  },
  {
    id: 8,
    text: 'يا {name}، الفرق بين الحلم والحقيقة هو العمل المستمر كل يوم.. اجعل هذا اليوم مميزًا! 🌈',
    tip: 'المثابرة اليومية البسيطة تهزم الذكاء غير المنظم.',
    category: 'determination',
  },
  {
    id: 9,
    text: 'أنت لست بحاجة إلى أن تكون خارقًا يا {name}، بل أن تكون ملتزمًا وصبورًا فقط! 🌟',
    tip: 'التزم بجدول اليوم وسيكون التفوق حليفك الأكيد.',
    category: 'consistency',
  },
  {
    id: 10,
    text: 'يا {name}، عقلك قادر على استيعاب كل الصعاب عندما تهدأ وتركز بكل هدوء وثقة! 💡',
    tip: 'اشرب كوب ماء ورتّب مكان مذاكرتك لتصفية ذهنك.',
    category: 'focus',
  },
  {
    id: 11,
    text: 'افخر بكل خطوة أنجزتها هذا الأسبوع يا {name}، واليوم نكمل المشوار بعزيمة أقوى! 🔥',
    tip: 'احتفل بإنجازاتك الصغيرة لتشحن طاقتك للأمام.',
    category: 'success',
  },
  {
    id: 12,
    text: 'يا {name}، التعب يزول والنجاح والتفوق يدومان للأبد.. اجتهد ولا تستسلم! 🎓✨',
    tip: 'ساعة مذاكرة مركزة تعادل 3 ساعات من التشتت.',
    category: 'determination',
  },
  {
    id: 13,
    text: 'يا بطل {name}، المعرفة كنز لا يستطيع أحد أن ينتزعه منك.. زِد كنزك اليوم درسًا جديدًا! 💎',
    tip: 'اشرح المعلومة لنفسك بصوت مسموع لترسيخها.',
    category: 'focus',
  },
  {
    id: 14,
    text: 'اليوم يوم جديد لبناء نسختك الأفضل يا {name}.. انطلق ونحن معك خطوة بخطوة! 🌟',
    tip: 'خذ استراحة 5 دقائق بعد كل نصف ساعة لتجديد النشاط.',
    category: 'consistency',
  },
  {
    id: 15,
    text: 'يا {name}، لا يوجد درس مستحيل الفهم.. كل ما تحتاجه هو تجزئته والتركيز فيه بهدوء! 🧩',
    tip: 'استعن بالألوان والخرائط الذهنية لتسهيل الحفظ.',
    category: 'focus',
  },
  {
    id: 16,
    text: 'يا رائع {name}، ما تزرعه اليوم من سهر وجهد وتعب ستجنيه غدًا فخرًا وسعادة! 🌱🌻',
    tip: 'النوم الكافي ليلاً هو سر سرعة استرجاع المعلومات.',
    category: 'success',
  },
  {
    id: 17,
    text: 'كن صبورًا مع نفسك يا {name}.. التطور الحقيقي يحدث عندما تواصل رغم التحديات! 🛡️',
    tip: 'إذا شعرت بالتعب خذ راحة قصيرة ثم عُد بقوة.',
    category: 'determination',
  },
  {
    id: 18,
    text: 'يا {name}، استمتع برحلة التعلم، فكل معلومة جديدة تفتح لعقلك أفقًا واسعًا! 🚀📚',
    tip: 'اربط الدروس بالحياة العملية لتشعر بقيمتها وجمالها.',
    category: 'focus',
  },
  {
    id: 19,
    text: 'أنت أقوى مما تظن وأذكى مما تتخيل يا {name}.. ثق بنفسك وابدأ الآن! ⭐',
    tip: 'الثقة بالنفس تبدأ بإنهاء واجبات اليوم في موعدها.',
    category: 'determination',
  },
  {
    id: 20,
    text: 'يا {name}، اجعل هدفك اليوم هو إنهاء المهام بضمير وإتقان وليس فقط التخلص منها! 💎',
    tip: 'الإتقان يصنع الفارق بين الطالب العادي والمتفوق.',
    category: 'consistency',
  },
];

/**
 * Returns formatted daily quote matching today's date
 */
export function getDailyMotivation(studentName?: string): EncouragementQuote {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % MOTIVATION_QUOTES.length;
  const raw = MOTIVATION_QUOTES[index];
  const name = studentName && studentName.trim() ? studentName.trim() : 'يا بطل';

  return {
    ...raw,
    text: raw.text.replace(/\{name\}/g, name),
  };
}

/**
 * Returns a randomized fresh quote
 */
export function getRandomMotivation(studentName?: string, excludeId?: number): EncouragementQuote {
  const filtered = excludeId
    ? MOTIVATION_QUOTES.filter((q) => q.id !== excludeId)
    : MOTIVATION_QUOTES;
  const picked = filtered[Math.floor(Math.random() * filtered.length)] || MOTIVATION_QUOTES[0];
  const name = studentName && studentName.trim() ? studentName.trim() : 'يا بطل';

  return {
    ...picked,
    text: picked.text.replace(/\{name\}/g, name),
  };
}

const STORAGE_KEY_LAST_NOTIF_DATE = 'zaker_last_motivation_date';

/**
 * Trigger daily motivation notification and sound
 */
export async function sendDailyMotivationNotification(options?: {
  studentName?: string;
  force?: boolean;
  quote?: EncouragementQuote;
}): Promise<boolean> {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem(STORAGE_KEY_LAST_NOTIF_DATE);

  if (!options?.force && lastDate === todayStr) {
    // Already delivered today
    return false;
  }

  const quote = options?.quote || getDailyMotivation(options?.studentName);

  // 1. Play distinctive motivation chime sound
  try {
    playMotivationChime();
  } catch (err) {
    console.warn('[Zaker Audio] Chime error:', err);
  }

  // 2. Deliver System / PWA Notification if supported and granted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const title = 'ذاكر - رسالة اليوم التشجيعية 🌟';
        const notifOptions: NotificationOptions & { vibrate?: number[] } = {
          body: quote.text + (quote.tip ? "\n" + quote.tip : ""),
          icon: "./icons/zaker-study-192.png",
          badge: "./icons/zaker-study-192.png",
          dir: 'rtl',
          lang: 'ar',
          tag: 'zaker-daily-motivation',
          vibrate: [150, 75, 150, 75, 300],
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, notifOptions);
        } else {
          new Notification(title, notifOptions);
        }

        localStorage.setItem(STORAGE_KEY_LAST_NOTIF_DATE, todayStr);
        return true;
      } catch (e) {
        console.warn('[Zaker Notif] Notification dispatch error:', e);
      }
    }
  }

  localStorage.setItem(STORAGE_KEY_LAST_NOTIF_DATE, todayStr);
  return false;
}
