import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playChime } from "@/lib/audio";
import { todayKey, useStore } from "@/lib/store";

type TimerSearch = {
  subject?: string;
};

export const Route = createFileRoute("/timer")({
  validateSearch: (search: Record<string, unknown>): TimerSearch => {
    return {
      subject: typeof search.subject === "string" ? search.subject : undefined,
    };
  },
  component: TimerPage,
});

type Mode = "focus" | "shortBreak" | "longBreak";
const LEN: Record<Mode, number> = { focus: 25, shortBreak: 5, longBreak: 15 };
const BG: Record<Mode, string> = {
  focus: "bg-coral",
  shortBreak: "bg-mint",
  longBreak: "bg-sky",
};

function TimerPage() {
  const search = Route.useSearch();
  const {
    t,
    focusLog,
    logFocus,
    allSubjects,
    todayPlan,
    subjectStatsToday,
    subjectStatsWeek,
    soundEnabled,
    setSoundEnabled,
  } = useStore();

  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(LEN.focus * 60);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);

  // Selected subject for this focus session
  const defaultSubject =
    search.subject ||
    todayPlan[0]?.subject ||
    allSubjects[0] ||
    t("generalStudy");
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubject);
  const [customSubject, setCustomSubject] = useState("");

  // Sync if search param changes
  useEffect(() => {
    if (search.subject) {
      setSelectedSubject(search.subject);
    }
  }, [search.subject]);

  const activeSubject =
    selectedSubject === "__custom__"
      ? customSubject.trim() || t("generalStudy")
      : selectedSubject;

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + left * 1000;
    const i = setInterval(() => {
      const r = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(r);
      if (r === 0) {
        clearInterval(i);
        setRunning(false);

        if (mode === "focus") {
          logFocus(activeSubject, LEN.focus);
          if (soundEnabled) playChime("focus");
          const msg = `${t("focusDone")} (${activeSubject})`;
          toast.success(msg);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(msg, { body: `+${LEN.focus} ${t("min")}` });
          }
        } else {
          if (soundEnabled) playChime("break");
          const msg = t("breakDone");
          toast.info(msg);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(msg);
          }
        }
      }
    }, 500);
    return () => clearInterval(i);
  }, [running, mode, left, activeSubject, soundEnabled, t, logFocus]);

  useEffect(() => {
    document.title = running
      ? `${fmt(left)} · ${activeSubject} — ${t(mode)}`
      : `${t("navTimer")} — Zaker`;
  }, [left, running, mode, activeSubject, t]);

  const switchMode = (m: Mode) => {
    setRunning(false);
    setMode(m);
    setLeft(LEN[m] * 60);
  };

  const pct = 1 - left / (LEN[mode] * 60);
  const R = 120;
  const C = 2 * Math.PI * R;

  // Compute total focus minutes today & this week
  const totalTodayMinutes = Object.values(subjectStatsToday).reduce((a, b) => a + b, 0);
  const totalWeekMinutes = Object.values(subjectStatsWeek).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header and sound controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{t("navTimer")}</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playChime("focus")}
            className="pop-btn bg-card text-xs py-1.5 px-3"
            title={t("previewSound")}
          >
            🔔 {t("previewSound")}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`pop-btn text-xs py-1.5 px-3 ${
              soundEnabled ? "bg-mint text-foreground" : "bg-card text-muted-foreground"
            }`}
            title={soundEnabled ? t("soundOn") : t("soundOff")}
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(LEN) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`pop-btn text-sm font-black ${
              mode === m ? BG[m] : "bg-card"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      {/* Subject Selector for Focus Session */}
      <div className="pop-card bg-card p-4">
        <div className="flex items-center gap-2 mb-2 font-black text-sm">
          <BookOpen className="size-4 text-primary" />
          <span>{t("selectSubject")}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={running}
            className="pop-input font-bold"
          >
            <option value={t("generalStudy")}>📚 {t("generalStudy")}</option>
            {allSubjects.map((s) => (
              <option key={s} value={s}>
                📖 {s}
              </option>
            ))}
            <option value="__custom__">➕ إضافة مادة أخرى...</option>
          </select>

          {selectedSubject === "__custom__" && (
            <input
              type="text"
              placeholder="اسم المادة..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              disabled={running}
              className="pop-input"
            />
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground font-bold">
          <span>
            المادة الحالية: <span className="text-foreground font-black underline">{activeSubject}</span>
          </span>
          {subjectStatsToday[activeSubject] ? (
            <span className="text-primary font-black">
              أنجزت فيها اليوم: {subjectStatsToday[activeSubject]} {t("min")}
            </span>
          ) : null}
        </div>
      </div>

      {/* Circular Pomodoro Timer Display */}
      <div className={`pop-card grid place-items-center p-8 transition-colors ${BG[mode]}`}>
        <div className="relative size-72">
          <svg viewBox="0 0 280 280" className="size-full -rotate-90">
            <circle
              cx="140"
              cy="140"
              r={R}
              fill="none"
              strokeWidth="16"
              className="stroke-card/70"
            />
            <circle
              cx="140"
              cy="140"
              r={R}
              fill="none"
              strokeWidth="16"
              strokeLinecap="round"
              className="stroke-foreground transition-[stroke-dashoffset] duration-500"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-black" dir="ltr">
              {fmt(left)}
            </span>
            <span className="mt-1 max-w-[180px] truncate text-center text-xs font-black uppercase tracking-wider text-foreground/80">
              {mode === "focus" ? activeSubject : t(mode)}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            className="pop-btn bg-card px-8 text-lg font-black"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />}
            {running ? t("pause") : t("start")}
          </button>
          <button
            className="pop-btn bg-card"
            aria-label={t("reset")}
            onClick={() => switchMode(mode)}
          >
            <RotateCcw className="size-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="pop-card bg-sun p-4">
          <p className="font-display text-3xl font-black">
            🍅 {focusLog[todayKey()] ?? 0}
          </p>
          <p className="text-xs font-bold text-foreground/80 mt-1">{t("sessionsToday")}</p>
        </div>
        <div className="pop-card bg-grape p-4">
          <p className="font-display text-3xl font-black">
            {totalTodayMinutes} <span className="text-sm font-bold">{t("min")}</span>
          </p>
          <p className="text-xs font-bold text-foreground/80 mt-1">{t("minutes")}</p>
        </div>
      </div>

      {/* 2. Subject Breakdown Statistics (إحصائيات مذاكرة المواد) */}
      <section className="pop-card bg-card p-5 space-y-5">
        <div className="flex items-center gap-2 border-b-2 border-foreground/10 pb-3">
          <BarChart3 className="size-5 text-primary" />
          <h2 className="text-xl font-black">{t("subjectStats")}</h2>
        </div>

        {/* Today's breakdown */}
        <div>
          <h3 className="text-sm font-black mb-3 flex items-center justify-between">
            <span>📅 {t("todaySubjectStats")}</span>
            <span className="text-xs font-bold text-muted-foreground">
              {totalTodayMinutes} {t("min")}
            </span>
          </h3>

          {Object.keys(subjectStatsToday).length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center bg-muted/40 rounded-xl">
              {t("noSubjectFocus")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(subjectStatsToday)
                .sort(([, a], [, b]) => b - a)
                .map(([subj, mins]) => {
                  const pct = totalTodayMinutes > 0 ? Math.round((mins / totalTodayMinutes) * 100) : 0;
                  return (
                    <div key={subj} className="space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span>{subj}</span>
                        <span>
                          {mins} {t("min")} ({pct}%)
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                        <div
                          className="h-full bg-coral transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Weekly breakdown (Last 7 Days) */}
        <div className="pt-2">
          <h3 className="text-sm font-black mb-3 flex items-center justify-between">
            <span>📊 {t("weekSubjectStats")}</span>
            <span className="text-xs font-bold text-muted-foreground">
              {totalWeekMinutes} {t("min")}
            </span>
          </h3>

          {Object.keys(subjectStatsWeek).length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center bg-muted/40 rounded-xl">
              {t("noSubjectFocus")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(subjectStatsWeek)
                .sort(([, a], [, b]) => b - a)
                .map(([subj, mins]) => {
                  const pct = totalWeekMinutes > 0 ? Math.round((mins / totalWeekMinutes) * 100) : 0;
                  return (
                    <div key={subj} className="space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span>{subj}</span>
                        <span>
                          {mins} {t("min")} ({pct}%)
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                        <div
                          className="h-full bg-mint transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
