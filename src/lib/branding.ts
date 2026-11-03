import { type Lang, GREEK_APP_NAME } from "./i18n";
import { syncLangToServiceWorker } from "./notifications";

export function applyBranding(lang: Lang) {
  if (typeof document === "undefined") return;

  const titles: Record<Lang, string> = {
    ar: "ذاكر - تنظيم اليوم الدراسي وجدول المذاكرة والمهام اليومية",
    en: "Study - Daily Study Planner & Tasks",
    el: `${GREEK_APP_NAME} - Πρόγραμμα Μελέτης & Εργασίες`,
  };

  const appNames: Record<Lang, string> = {
    ar: "ذاكر",
    en: "Study",
    el: GREEK_APP_NAME,
  };

  document.title = titles[lang] || titles.ar;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Manifest
  const manifestHref =
    lang === "en"
      ? "./manifest-en.json"
      : lang === "el"
      ? "./manifest-el.json"
      : "./manifest.json";

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.href = manifestHref;
  }

  // Meta app titles
  const metaAppTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
  if (metaAppTitle) {
    metaAppTitle.content = appNames[lang] || appNames.ar;
  }

  const metaAppName = document.querySelector<HTMLMetaElement>('meta[name="application-name"]');
  if (metaAppName) {
    metaAppName.content = appNames[lang] || appNames.ar;
  }

  // Icons
  const appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (appleTouchIcon) {
    appleTouchIcon.href = lang === "en" ? "./apple-touch-icon-en.png" : "./apple-touch-icon.png";
  }

  const favPng = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/png"]');
  if (favPng) {
    favPng.href = lang === "en" ? "./favicon-en.png" : "./favicon.png";
  }

  // Sync lang to SW
  syncLangToServiceWorker(lang);
}
