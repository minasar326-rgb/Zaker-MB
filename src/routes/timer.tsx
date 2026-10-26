import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { todayKey, useStore } from "@/lib/store";

export const Route = createFileRoute("/timer")({
  component: TimerPage,
});

type Mode = "focus" | "shortBreak" | "longBreak";
const LEN: Record<Mode, number> = { focus: 25, shortBreak: 5, longBreak: 15 };
const BG: Record<Mode, string> = { focus: "bg-coral", shortBreak: "bg-mint", longBreak: "bg-sky" };

function TimerPage() {
  const { t, focusLog, logFocus } = useStore();
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(LEN.focus * 60);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + left * 1000;
    const i = setInterval(() => {
      const r = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(r);
      if (r === 0) {
        clearInterval(i);
        setRunning(false);
        const msg = mode === "focus" ? t("focusDone") : t("breakDone");
        if (mode === "focus") logFocus();
        toast.success(msg);
        if ("Notification" in window && Notification.permission === "granted") new Notification(msg);
      }
    }, 500);
    return () => clearInterval(i);
  }, [running]);

  useEffect(() => {
    document.title = running ? `${fmt(left)} · ${t(mode)}` : "Pomodoro focus timer — Zaker";
  }, [left, running, mode, t]);

  const switchMode = (m: Mode) => {
    setRunning(false);
    setMode(m);
    setLeft(LEN[m] * 60);
  };
  const pct = 1 - left / (LEN[mode] * 60);
  const R = 120;
  const C = 2 * Math.PI * R;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl">{t("navTimer")}</h1>
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(LEN) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)} className={`pop-btn text-sm ${mode === m ? BG[m] : "bg-card"}`}>
            {t(m)}
          </button>
        ))}
      </div>

      <div className={`pop-card grid place-items-center p-8 ${BG[mode]}`}>
        <div className="relative size-72">
          <svg viewBox="0 0 280 280" className="size-full -rotate-90">
            <circle cx="140" cy="140" r={R} fill="none" strokeWidth="16" className="stroke-card" />
            <circle
              cx="140" cy="140" r={R} fill="none" strokeWidth="16" strokeLinecap="round"
              className="stroke-foreground transition-[stroke-dashoffset] duration-500"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-6xl font-bold" dir="ltr">{fmt(left)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="pop-btn bg-card px-6 text-lg" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-5" /> : <Play className="size-5" />}
            {running ? t("pause") : t("start")}
          </button>
          <button className="pop-btn bg-card" aria-label={t("reset")} onClick={() => switchMode(mode)}>
            <RotateCcw className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="pop-card bg-sun p-4">
          <p className="font-display text-3xl font-bold">🍅 {focusLog[todayKey()] ?? 0}</p>
          <p className="text-sm font-semibold">{t("sessionsToday")}</p>
        </div>
        <div className="pop-card bg-grape p-4">
          <p className="font-display text-3xl font-bold">{(focusLog[todayKey()] ?? 0) * LEN.focus}</p>
          <p className="text-sm font-semibold">{t("minutes")}</p>
        </div>
      </div>
    </div>
  );
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
