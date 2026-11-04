import { Link } from "@tanstack/react-router";
import { CalendarDays, Download, Home, ListChecks, Timer } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { LANGS } from "@/lib/i18n";
import { useStore } from "@/lib/store";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const NAV = [
  { to: "/", key: "navHome", icon: Home },
  { to: "/schedule", key: "navSchedule", icon: CalendarDays },
  { to: "/tasks", key: "navTasks", icon: ListChecks },
  { to: "/timer", key: "navTimer", icon: Timer },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="animate-wiggle grid size-10 place-items-center rounded-xl border-2 bg-secondary text-xl shadow-[var(--shadow-pop-sm)]">
            📚
          </span>
          <span className="font-display text-2xl font-bold">{t("appName")}</span>
        </Link>
        <nav className="hidden gap-2 md:flex">
          {NAV.map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="pop-btn bg-card text-sm"
              activeProps={{ className: "pop-btn bg-primary text-primary-foreground text-sm" }}
            >
              <Icon className="size-4" />
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="pop-btn bg-sun text-foreground font-black text-xs flex items-center gap-1.5 py-1.5 px-3 animate-pulse"
              title={t("installApp")}
            >
              <Download className="size-4" />
              <span>{t("installApp")}</span>
            </button>
          )}
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="rounded-full border-2 bg-card px-3 py-1.5 text-sm font-bold"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4">{children}</main>
      <p className="mt-10 text-center text-xs text-muted-foreground">{t("localNote")}</p>
      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-2xl border-2 bg-card p-1.5 shadow-[var(--shadow-pop)] md:hidden">
        {NAV.map(({ to, key, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-bold"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            <Icon className="size-5" />
            {t(key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export { colorBg } from "@/lib/store";
