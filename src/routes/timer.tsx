import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ListTodo,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playChime } from "@/lib/audio";
import { todayKey, useStore } from "@/lib/store";

type TimerSearch = {
  subject?: string;
  taskId?: string;
};

export const Route = createFileRoute("/timer")({
  validateSearch: (search: Record<string, unknown>): TimerSearch => {
    return {
      subject: typeof search.subject === "string" ? search.subject : undefined,
      taskId: typeof search.taskId === "string" ? search.taskId : undefined,
    };
  },
  component: TimerPage,
});

type Mode = "focus" | "shortBreak" | "longBreak";

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
    tasks,
    subjectStatsToday,
    subjectStatsWeek,
    soundEnabled,
    setSoundEnabled,
    timerSettings,
    updateTimerSettings,
  } = useStore();

  const [mode, setMode] = useState<Mode>("focus");

  // Get duration based on mode and settings
  const getInitialSeconds = (m: Mode) => {
    if (m === "focus") return timerSettings.focusMinutes * 60;
    if (m === "shortBreak") return timerSettings.shortBreakMinutes * 60;
    return timerSettings.longBreakMinutes * 60;
  };

  const [totalDurationSeconds, setTotalDurationSeconds] = useState(
    getInitialSeconds("focus"),
  );
  const [left, setLeft] = useState(getInitialSeconds("focus"));
  const [running, setRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const endRef = useRef(0);

  // Selected subject or task
  const [selectedTaskId, setSelectedTaskId] = useState<string>(search.taskId || "");
  const defaultSubject =
    search.subject ||
    (search.taskId && tasks.find((tk) => tk.id === search.taskId)?.subject) ||
    todayPlan[0]?.subject ||
    allSubjects[0] ||
    t("generalStudy");

  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubject);
  const [customSubject, setCustomSubject] = useState("");

  // Sync if search params change
  useEffect(() => {
    if (search.subject) setSelectedSubject(search.subject);
    if (search.taskId) setSelectedTaskId(search.taskId);
  }, [search.subject, search.taskId]);

  // When task changes, update subject
  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const task = tasks.find((tk) => tk.id === taskId);
      if (task?.subject) {
        setSelectedSubject(task.subject);
      }
    }
  };

  const activeSubject =
    selectedSubject === "__custom__"
      ? customSubject.trim() || t("generalStudy")
      : selectedSubject;

  // Sync initial left when settings change and not running
  useEffect(() => {
    if (!running) {
      const s = getInitialSeconds(mode);
      setTotalDurationSeconds(s);
      setLeft(s);
    }
  }, [timerSettings, mode]);

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
          const finishedMinutes = Math.max(1, Math.round(totalDurationSeconds / 60));
          logFocus(activeSubject, finishedMinutes, selectedTaskId || undefined);

          if (soundEnabled) playChime("focus");
          const msg = `${t("focusDone")} (${activeSubject})`;
          toast.success(msg);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(msg, { body: `+${finishedMinutes} ${t("min")}` });
          }

          // Advance round
          const nextRound = currentRound + 1;
          if (nextRound > timerSettings.roundsGoal) {
            setCurrentRound(1);
            switchMode("longBreak", timerSettings.autoStartBreaks);
          } else {
            setCurrentRound(nextRound);
            switchMode("shortBreak", timerSettings.autoStartBreaks);
          }
        } else {
          if (soundEnabled) playChime("break");
          const msg = t("breakDone");
          toast.info(msg);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(msg);
          }

          switchMode("focus", false);
        }
      }
    }, 500);

    return () => clearInterval(i);
  }, [
    running,
    mode,
    left,
    activeSubject,
    soundEnabled,
    t,
    logFocus,
    currentRound,
    selectedTaskId,
    totalDurationSeconds,
    timerSettings,
  ]);

  useEffect(() => {
    document.title = running
      ? `${fmt(left)} · ${activeSubject} — ${t(mode)}`
      : `${t("navTimer")} — Zaker`;
  }, [left, running, mode, activeSubject, t]);

  const switchMode = (m: Mode, autoRun = false) => {
    setRunning(false);
    setMode(m);
    const secs = getInitialSeconds(m);
    setTotalDurationSeconds(secs);
    setLeft(secs);
    if (autoRun) setRunning(true);
  };

  // Quick adjust duration buttons (+5m, -5m, +1m, -1m)
  const adjustTime = (deltaSeconds: number) => {
    setLeft((prev) => {
      const updated = Math.max(60, prev + deltaSeconds);
      if (!running) {
        setTotalDurationSeconds(updated);
      }
      return updated;
    });
  };

  // Set explicit minutes for current session
  const setExactMinutes = (mins: number) => {
    setRunning(false);
    const secs = mins * 60;
    setTotalDurationSeconds(secs);
    setLeft(secs);
  };

  const pct = totalDurationSeconds > 0 ? 1 - left / totalDurationSeconds : 0;
  const R = 120;
  const C = 2 * Math.PI * R;

  const totalTodayMinutes = Object.values(subjectStatsToday).reduce((a, b) => a + b, 0);
  const totalWeekMinutes = Object.values(subjectStatsWeek).reduce((a, b) => a + b, 0);

  const activeTasks = tasks.filter((tk) => !tk.done);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header and sound/settings controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t("navTimer")}</h1>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">
            تحكم كامل في مدة الجلسات والاستراحات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="pop-btn bg-card text-xs py-1.5 px-3"
            title={t("timerSettings")}
          >
            <Settings className="size-4" />
          </button>

          {/* Audio Chime preview & mute toggle */}
          <button
            onClick={() => playChime("focus")}
            className="pop-btn bg-card text-xs py-1.5 px-3 hidden sm:inline-flex"
            title={t("previewSound")}
          >
            🔔
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
        {(["focus", "shortBreak", "longBreak"] as Mode[]).map((m) => (
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

      {/* Pomodoro Rounds Indicator */}
      <div className="pop-card bg-secondary/30 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍅</span>
          <span className="text-xs font-black text-foreground">
            {t("round")} {currentRound} {t("of")} {timerSettings.roundsGoal}
          </span>
        </div>

        {/* Round circles */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: timerSettings.roundsGoal }).map((_, idx) => (
            <span
              key={idx}
              className={`size-3.5 rounded-full border-2 border-foreground transition ${
                idx < currentRound - 1
                  ? "bg-coral"
                  : idx === currentRound - 1
                  ? "bg-sun animate-pulse"
                  : "bg-card"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Subject & Task Linker */}
      <div className="pop-card bg-card p-4 space-y-3">
        {/* Subject selector */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-black text-xs">
            <BookOpen className="size-4 text-primary" />
            <span>{t("selectSubject")}</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={running}
              className="pop-input font-bold text-xs"
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
                className="pop-input text-xs"
              />
            )}
          </div>
        </div>

        {/* Optional: Link to an active Task */}
        {activeTasks.length > 0 && (
          <div className="pt-2 border-t border-foreground/10">
            <div className="flex items-center gap-2 mb-1.5 font-black text-xs text-muted-foreground">
              <ListTodo className="size-3.5 text-primary" />
              <span>{t("selectTask")}</span>
            </div>

            <select
              value={selectedTaskId}
              onChange={(e) => handleTaskChange(e.target.value)}
              disabled={running}
              className="pop-input font-medium text-xs"
            >
              <option value="">بدون مهمة محددة</option>
              {activeTasks.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  📌 {tk.title} {tk.subject ? `(${tk.subject})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Circular Pomodoro Timer Display */}
      <div className={`pop-card grid place-items-center p-8 transition-colors ${BG[mode]}`}>
        {/* Quick Duration Preset Pills */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {(mode === "focus"
            ? [15, 20, 25, 30, 45, 60]
            : [3, 5, 10, 15, 20]
          ).map((mins) => (
            <button
              key={mins}
              onClick={() => setExactMinutes(mins)}
              className={`rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-black transition ${
                Math.round(totalDurationSeconds / 60) === mins
                  ? "bg-foreground text-background scale-105"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {mins} {t("min")}
            </button>
          ))}
        </div>

        {/* Circular Display */}
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

        {/* Live +/- Time Adjustment Buttons */}
        <div className="mt-4 flex items-center gap-1.5">
          <button
            onClick={() => adjustTime(-300)}
            className="pop-btn bg-card text-xs py-1 px-2.5"
            title="-5 دقائق"
          >
            -5 {t("min")}
          </button>
          <button
            onClick={() => adjustTime(-60)}
            className="pop-btn bg-card text-xs py-1 px-2.5"
            title="-1 دقيقة"
          >
            -1 {t("min")}
          </button>
          <button
            onClick={() => adjustTime(60)}
            className="pop-btn bg-card text-xs py-1 px-2.5"
            title="+1 دقيقة"
          >
            +1 {t("min")}
          </button>
          <button
            onClick={() => adjustTime(300)}
            className="pop-btn bg-card text-xs py-1 px-2.5"
            title="+5 دقائق"
          >
            +5 {t("min")}
          </button>
        </div>

        {/* Start / Pause / Reset Main Buttons */}
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

      {/* Subject Breakdown Statistics */}
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

        {/* Weekly breakdown */}
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

      {/* Timer Settings Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pop-card w-full max-w-md bg-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-black">{t("timerSettings")}</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Focus duration */}
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("focusDuration")}
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  className="pop-input"
                  value={timerSettings.focusMinutes}
                  onChange={(e) =>
                    updateTimerSettings({
                      focusMinutes: Math.max(5, Number(e.target.value)),
                    })
                  }
                />
              </div>

              {/* Short break duration */}
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("shortBreakDuration")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  className="pop-input"
                  value={timerSettings.shortBreakMinutes}
                  onChange={(e) =>
                    updateTimerSettings({
                      shortBreakMinutes: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
              </div>

              {/* Long break duration */}
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("longBreakDuration")}
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  className="pop-input"
                  value={timerSettings.longBreakMinutes}
                  onChange={(e) =>
                    updateTimerSettings({
                      longBreakMinutes: Math.max(5, Number(e.target.value)),
                    })
                  }
                />
              </div>

              {/* Rounds goal */}
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("roundsGoal")}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="pop-input"
                  value={timerSettings.roundsGoal}
                  onChange={(e) =>
                    updateTimerSettings({
                      roundsGoal: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
              </div>

              {/* Auto start breaks */}
              <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-xs">
                <input
                  type="checkbox"
                  checked={timerSettings.autoStartBreaks}
                  onChange={(e) =>
                    updateTimerSettings({
                      autoStartBreaks: e.target.checked,
                    })
                  }
                  className="size-4 accent-primary"
                />
                <span>{t("autoStart")}</span>
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSettingsOpen(false)}
                className="pop-btn bg-primary text-primary-foreground text-sm font-black w-full"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
