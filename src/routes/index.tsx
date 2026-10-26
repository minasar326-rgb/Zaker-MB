import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellRing, Check, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { colorBg } from "@/components/Shell";
import { dayName } from "@/lib/i18n";
import { todayKey, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang, sessions, tasks, focusLog, toggleTask } = useStore();
  const [today, setToday] = useState(0);
  const [perm, setPerm] = useState<string>("default");
  useEffect(() => {
    setToday(new Date().getDay());
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  const todays = sessions.filter((s) => s.day === today).sort((a, b) => a.start.localeCompare(b.start));
  const pending = tasks.filter((x) => !x.done);
  const upcoming = [...pending].sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9")).slice(0, 5);
  const doneCount = tasks.length - pending.length;

  return (
    <div className="space-y-6">
      <section className="pop-card relative overflow-hidden bg-secondary p-6 md:p-8">
        <div className="absolute -end-6 -top-6 size-32 rounded-full border-2 bg-coral" aria-hidden />
        <div className="absolute -bottom-8 end-24 size-20 rounded-full border-2 bg-mint" aria-hidden />
        <p className="relative font-bold">{dayName(lang, today)}</p>
        <h1 className="relative mt-1 text-3xl md:text-5xl">{t("hello")}</h1>
        <p className="relative mt-2 max-w-md text-secondary-foreground/80">{t("tagline")}</p>
        {perm !== "granted" && perm !== "unsupported" && (
          <button
            className="pop-btn relative mt-5 bg-card"
            onClick={async () => setPerm(await Notification.requestPermission())}
          >
            <Bell className="size-4" /> {t("enableNotif")}
          </button>
        )}
        {perm === "granted" && (
          <p className="relative mt-5 inline-flex items-center gap-2 font-bold">
            <BellRing className="size-4" /> {t("notifOn")}
          </p>
        )}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat label={t("pending")} value={pending.length} bg="bg-sky" />
        <Stat label={t("done")} value={doneCount} bg="bg-mint" />
        <Stat label={t("focusToday")} value={focusLog[todayKey()] ?? 0} bg="bg-rose" icon />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="pop-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">{t("todaySessions")}</h2>
            <Link to="/schedule" className="text-sm font-bold text-primary">{t("seeAll")}</Link>
          </div>
          {todays.length === 0 ? (
            <p className="text-muted-foreground">{t("nothingToday")}</p>
          ) : (
            <ul className="space-y-2">
              {todays.map((s) => (
                <li key={s.id} className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${colorBg[s.color]}`}>
                  <span className="font-bold">{s.subject}</span>
                  <span className="text-sm font-semibold" dir="ltr">{s.start} – {s.end}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pop-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">{t("dueSoon")}</h2>
            <Link to="/tasks" className="text-sm font-bold text-primary">{t("seeAll")}</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">{t("noTasks")}</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((x) => (
                <li key={x.id} className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5">
                  <button
                    aria-label="done"
                    onClick={() => toggleTask(x.id)}
                    className="grid size-6 place-items-center rounded-md border-2 hover:bg-mint"
                  >
                    <Check className="size-3.5 opacity-0 hover:opacity-100" />
                  </button>
                  <span className="flex-1 font-semibold">{x.title}</span>
                  {x.due && <span className="text-xs text-muted-foreground" dir="ltr">{x.due.replace("T", " ")}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, bg, icon }: { label: string; value: number; bg: string; icon?: boolean }) {
  return (
    <div className={`pop-card p-4 ${bg}`}>
      <p className="flex items-center gap-1 font-display text-3xl font-bold">
        {value} {icon && <Flame className="size-6" />}
      </p>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
