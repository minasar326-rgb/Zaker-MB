import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { playChime } from "./audio";
import { translate, type Key, type Lang } from "./i18n";

export const COLORS = ["coral", "sun", "mint", "sky", "grape", "rose"] as const;
export type Color = (typeof COLORS)[number];

export const colorBg: Record<Color, string> = {
  coral: "bg-coral",
  sun: "bg-sun",
  mint: "bg-mint",
  sky: "bg-sky",
  grape: "bg-grape",
  rose: "bg-rose",
};

export type Session = { id: string; subject: string; day: number; start: string; end: string; color: Color };
export type Priority = "low" | "med" | "high";

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type TaskTag = "homework" | "exam" | "revision" | "project" | "reading";

export type Task = {
  id: string;
  title: string;
  description?: string | undefined;
  subject?: string | undefined;
  due?: string | undefined;
  completedDate?: string | undefined;
  remindMin: number;
  priority: Priority;
  tag?: TaskTag | undefined;
  estimatedMinutes?: number | undefined;
  subtasks?: Subtask[];
  done: boolean;
  reminded?: boolean;
};

export type DailyPlanItem = {
  id: string;
  date: string; // "YYYY-MM-DD"
  subject: string;
  targetMinutes: number;
  notes?: string;
  color: Color;
  done: boolean;
};

export type FocusRecord = {
  id: string;
  date: string; // "YYYY-MM-DD"
  timestamp: number;
  subject: string;
  taskId?: string;
  minutes: number;
};

export type TimerSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsGoal: number;
  autoStartBreaks: boolean;
};

type State = {
  lang: Lang;
  studentName: string;
  sessions: Session[];
  tasks: Task[];
  dailyPlans: DailyPlanItem[];
  focusLog: Record<string, number>; // date -> total focus count
  focusRecords: FocusRecord[]; // detailed records per subject
  soundEnabled: boolean;
  timerSettings: TimerSettings;
};

const KEY = "zaker-state-v4";

const defaultTimerSettings: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsGoal: 4,
  autoStartBreaks: false,
};

const initial: State = {
  lang: "ar",
  studentName: "",
  sessions: [],
  tasks: [],
  dailyPlans: [],
  focusLog: {},
  focusRecords: [],
  soundEnabled: true,
  timerSettings: defaultTimerSettings,
};

type Ctx = State & {
  ready: boolean;
  t: (k: Key) => string;
  setLang: (l: Lang) => void;
  setStudentName: (name: string) => void;
  setSoundEnabled: (v: boolean) => void;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  // Sessions
  saveSession: (s: Omit<Session, "id"> & { id?: string }) => void;
  deleteSession: (id: string) => void;
  // Tasks
  saveTask: (t: Omit<Task, "id" | "done"> & { id?: string; done?: boolean }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  // Daily Study Plan
  savePlanItem: (p: Omit<DailyPlanItem, "id" | "done"> & { id?: string; done?: boolean }) => void;
  togglePlanItem: (id: string) => void;
  deletePlanItem: (id: string) => void;
  importScheduleToPlan: (dateKey?: string) => void;
  // Focus & Timer
  logFocus: (subject?: string, minutes?: number, taskId?: string) => void;
  // Computed helpers
  allSubjects: string[];
  todayPlan: DailyPlanItem[];
  todayTasks: Task[];
  subjectStatsToday: Record<string, number>;
  subjectStatsWeek: Record<string, number>;
  studyStreak: number;
};

const StoreCtx = createContext<Ctx | null>(null);
const uid = () => Math.random().toString(36).slice(2, 10);
export const todayKey = (d: Date = new Date()) => d.toISOString().slice(0, 10);

function parseTimeDiffInMinutes(start: string, end: string): number {
  try {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : 45;
  } catch {
    return 45;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(KEY) ||
        localStorage.getItem("zaker-state-v3") ||
        localStorage.getItem("zaker-state-v2") ||
        localStorage.getItem("zaker-state-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          ...initial,
          ...parsed,
          studentName: parsed.studentName || "",
          tasks: (parsed.tasks || []).map((tk: Task) => ({
            ...tk,
            subtasks: tk.subtasks || [],
          })),
          dailyPlans: parsed.dailyPlans || [],
          focusRecords: parsed.focusRecords || [],
          soundEnabled: parsed.soundEnabled ?? true,
          timerSettings: {
            ...defaultTimerSettings,
            ...(parsed.timerSettings || {}),
          },
        });
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  }, [state, ready]);

  const t = useCallback((k: Key) => translate(state.lang, k), [state.lang]);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Reminders check loop
  useEffect(() => {
    if (!ready) return;
    const check = () => {
      const now = Date.now();
      const due = stateRef.current.tasks.filter(
        (x) => !x.done && !x.reminded && x.due && x.remindMin > 0 && new Date(x.due).getTime() - x.remindMin * 60000 <= now,
      );
      if (!due.length) return;
      due.forEach((x) => {
        const title = translate(stateRef.current.lang, "reminder");
        toast(`⏰ ${title}: ${x.title}`, { duration: 10000 });
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`${title} — ${x.title}`, { body: x.subject ?? "" });
        }
      });
      const ids = new Set(due.map((x) => x.id));
      setState((s) => ({ ...s, tasks: s.tasks.map((x) => (ids.has(x.id) ? { ...x, reminded: true } : x)) }));
    };
    check();
    const i = setInterval(check, 20000);
    return () => clearInterval(i);
  }, [ready]);

  // Derived: All unique subjects across the app
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    state.sessions.forEach((s) => s.subject && set.add(s.subject.trim()));
    state.tasks.forEach((t) => t.subject && set.add(t.subject.trim()));
    state.dailyPlans.forEach((p) => p.subject && set.add(p.subject.trim()));
    state.focusRecords.forEach((r) => r.subject && set.add(r.subject.trim()));
    return Array.from(set).filter(Boolean);
  }, [state.sessions, state.tasks, state.dailyPlans, state.focusRecords]);

  // Derived: Today's plan
  const currentTodayKey = todayKey();
  const todayPlan = useMemo(() => {
    return state.dailyPlans.filter((p) => p.date === currentTodayKey);
  }, [state.dailyPlans, currentTodayKey]);

  // Derived: Today's tasks (completed today, due today, or active tasks)
  const todayTasks = useMemo(() => {
    return state.tasks.filter((tk) => {
      // Completed today
      if (tk.done && tk.completedDate === currentTodayKey) return true;
      // Explicitly due today
      if (tk.due && tk.due.slice(0, 10) === currentTodayKey) return true;
      // Active tasks without a future due date (active backlog for today)
      if (!tk.done) {
        if (!tk.due) return true;
        const dueDate = tk.due.slice(0, 10);
        if (dueDate <= currentTodayKey) return true;
      }
      return false;
    });
  }, [state.tasks, currentTodayKey]);

  // Derived: Subject focus stats for Today
  const subjectStatsToday = useMemo(() => {
    const map: Record<string, number> = {};
    state.focusRecords
      .filter((r) => r.date === currentTodayKey)
      .forEach((r) => {
        map[r.subject] = (map[r.subject] ?? 0) + r.minutes;
      });
    return map;
  }, [state.focusRecords, currentTodayKey]);

  // Derived: Subject focus stats for Last 7 Days
  const subjectStatsWeek = useMemo(() => {
    const map: Record<string, number> = {};
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    state.focusRecords
      .filter((r) => r.timestamp >= weekAgo)
      .forEach((r) => {
        map[r.subject] = (map[r.subject] ?? 0) + r.minutes;
      });
    return map;
  }, [state.focusRecords]);

  // Derived: Study Streak calculation 🔥
  const studyStreak = useMemo(() => {
    const activeDates = new Set<string>();
    Object.keys(state.focusLog).forEach((d) => {
      if ((state.focusLog[d] ?? 0) > 0) activeDates.add(d);
    });
    state.focusRecords.forEach((r) => activeDates.add(r.date));
    state.dailyPlans.forEach((p) => {
      if (p.done) activeDates.add(p.date);
    });
    state.tasks.forEach((t) => {
      if (t.done) {
        if (t.completedDate) activeDates.add(t.completedDate);
        else if (t.due) activeDates.add(t.due.slice(0, 10));
      }
    });

    const todayStr = currentTodayKey;
    const hasToday = activeDates.has(todayStr);

    let streak = 0;
    const checkDate = new Date();

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = todayKey(checkDate);
      if (activeDates.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [state.focusLog, state.focusRecords, state.dailyPlans, state.tasks, currentTodayKey]);

  const value: Ctx = {
    ...state,
    ready,
    t,
    setLang: (lang) => setState((s) => ({ ...s, lang })),
    setStudentName: (studentName) => setState((s) => ({ ...s, studentName: studentName.trim() })),
    setSoundEnabled: (v) => setState((s) => ({ ...s, soundEnabled: v })),
    updateTimerSettings: (newSettings) =>
      setState((s) => ({
        ...s,
        timerSettings: { ...s.timerSettings, ...newSettings },
      })),

    // Sessions
    saveSession: (s) =>
      setState((st) => ({
        ...st,
        sessions: s.id
          ? st.sessions.map((x) => (x.id === s.id ? ({ ...x, ...s } as Session) : x))
          : [...st.sessions, { ...s, id: uid() }],
      })),
    deleteSession: (id) => setState((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== id) })),

    // Tasks
    saveTask: (tk) =>
      setState((st) => {
        const todayStr = todayKey();
        return {
          ...st,
          tasks: tk.id
            ? st.tasks.map((x) =>
                x.id === tk.id
                  ? {
                      ...x,
                      ...tk,
                      completedDate:
                        tk.done !== undefined
                          ? tk.done
                            ? (x.completedDate ?? todayStr)
                            : undefined
                          : x.completedDate,
                      subtasks: tk.subtasks ?? x.subtasks ?? [],
                      reminded: false,
                    }
                  : x,
              )
            : [
                {
                  ...tk,
                  id: uid(),
                  done: tk.done ?? false,
                  completedDate: tk.done ? todayStr : undefined,
                  subtasks: tk.subtasks ?? [],
                },
                ...st.tasks,
              ],
        };
      }),
    toggleTask: (id) =>
      setState((st) => {
        const item = st.tasks.find((x) => x.id === id);
        const willBeDone = item ? !item.done : false;
        if (willBeDone && st.soundEnabled) {
          playChime("focus");
        }
        const todayStr = todayKey();
        return {
          ...st,
          tasks: st.tasks.map((x) =>
            x.id === id
              ? {
                  ...x,
                  done: willBeDone,
                  completedDate: willBeDone ? todayStr : undefined,
                }
              : x,
          ),
        };
      }),
    deleteTask: (id) => setState((st) => ({ ...st, tasks: st.tasks.filter((x) => x.id !== id) })),

    // Subtasks operations
    toggleSubtask: (taskId, subtaskId) =>
      setState((st) => ({
        ...st,
        tasks: st.tasks.map((tk) => {
          if (tk.id !== taskId) return tk;
          const updatedSubtasks = (tk.subtasks || []).map((stk) =>
            stk.id === subtaskId ? { ...stk, done: !stk.done } : stk,
          );
          return {
            ...tk,
            subtasks: updatedSubtasks,
          };
        }),
      })),

    addSubtask: (taskId, title) =>
      setState((st) => ({
        ...st,
        tasks: st.tasks.map((tk) => {
          if (tk.id !== taskId) return tk;
          const newSubtask: Subtask = { id: uid(), title: title.trim(), done: false };
          return {
            ...tk,
            subtasks: [...(tk.subtasks || []), newSubtask],
          };
        }),
      })),

    deleteSubtask: (taskId, subtaskId) =>
      setState((st) => ({
        ...st,
        tasks: st.tasks.map((tk) => {
          if (tk.id !== taskId) return tk;
          return {
            ...tk,
            subtasks: (tk.subtasks || []).filter((stk) => stk.id !== subtaskId),
          };
        }),
      })),

    // Daily Study Plan
    savePlanItem: (p) =>
      setState((st) => ({
        ...st,
        dailyPlans: p.id
          ? st.dailyPlans.map((x) => (x.id === p.id ? ({ ...x, ...p } as DailyPlanItem) : x))
          : [...st.dailyPlans, { ...p, id: uid(), done: p.done ?? false }],
      })),
    togglePlanItem: (id) =>
      setState((st) => {
        const item = st.dailyPlans.find((x) => x.id === id);
        if (item && !item.done && st.soundEnabled) {
          playChime("focus");
        }
        return {
          ...st,
          dailyPlans: st.dailyPlans.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
        };
      }),
    deletePlanItem: (id) => setState((st) => ({ ...st, dailyPlans: st.dailyPlans.filter((x) => x.id !== id) })),
    importScheduleToPlan: (targetDate = todayKey()) => {
      const todayDayOfWeek = new Date().getDay();
      const sessionsForToday = state.sessions.filter((s) => s.day === todayDayOfWeek);
      if (!sessionsForToday.length) {
        toast.info(translate(state.lang, "nothingToday"));
        return;
      }

      setState((st) => {
        const existingForDay = new Set(
          st.dailyPlans.filter((p) => p.date === targetDate).map((p) => p.subject.toLowerCase()),
        );
        const newItems: DailyPlanItem[] = [];

        sessionsForToday.forEach((s) => {
          if (!existingForDay.has(s.subject.toLowerCase())) {
            newItems.push({
              id: uid(),
              date: targetDate,
              subject: s.subject,
              targetMinutes: parseTimeDiffInMinutes(s.start, s.end),
              color: s.color,
              notes: `${s.start} - ${s.end}`,
              done: false,
            });
          }
        });

        if (!newItems.length) {
          const msg =
            st.lang === "ar"
              ? "المواد موجودة بالفعل في خطة اليوم"
              : st.lang === "el"
              ? "Τα μαθήματα υπάρχουν ήδη στο σημερινό πλάνο"
              : "Subjects are already in today's plan";
          toast.info(msg);
          return st;
        }

        const msg =
          st.lang === "ar"
            ? `تم استيراد ${newItems.length} مواد إلى خطة اليوم بنجاح!`
            : st.lang === "el"
            ? `Εισήχθησαν ${newItems.length} μαθήματα στο σημερινό πλάνο!`
            : `Imported ${newItems.length} subjects to today's plan!`;
        toast.success(msg);
        return { ...st, dailyPlans: [...st.dailyPlans, ...newItems] };
      });
    },

    // Focus & Timer
    logFocus: (subject = translate(state.lang, "generalStudy"), minutes = 25, taskId) => {
      const date = todayKey();
      const record: FocusRecord = {
        id: uid(),
        date,
        timestamp: Date.now(),
        subject,
        taskId,
        minutes,
      };

      if (state.soundEnabled) {
        playChime("focus");
      }

      setState((st) => ({
        ...st,
        focusLog: { ...st.focusLog, [date]: (st.focusLog[date] ?? 0) + 1 },
        focusRecords: [record, ...st.focusRecords],
      }));
    },

    allSubjects,
    todayPlan,
    todayTasks,
    subjectStatsToday,
    subjectStatsWeek,
    studyStreak,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
