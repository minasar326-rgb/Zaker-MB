import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { translate, type Key, type Lang } from "./i18n";

export const COLORS = ["coral", "sun", "mint", "sky", "grape", "rose"] as const;
export type Color = (typeof COLORS)[number];

export type Session = { id: string; subject: string; day: number; start: string; end: string; color: Color };
export type Priority = "low" | "med" | "high";
export type Task = {
  id: string;
  title: string;
  subject?: string | undefined;
  due?: string | undefined;
  remindMin: number;
  priority: Priority;
  done: boolean;
  reminded?: boolean;
};

type State = { lang: Lang; sessions: Session[]; tasks: Task[]; focusLog: Record<string, number> };

const KEY = "zaker-state-v1";
const initial: State = { lang: "ar", sessions: [], tasks: [], focusLog: {} };

type Ctx = State & {
  ready: boolean;
  t: (k: Key) => string;
  setLang: (l: Lang) => void;
  saveSession: (s: Omit<Session, "id"> & { id?: string }) => void;
  deleteSession: (id: string) => void;
  saveTask: (t: Omit<Task, "id" | "done"> & { id?: string }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  logFocus: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);
const uid = () => Math.random().toString(36).slice(2, 10);
export const todayKey = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
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

  const value: Ctx = {
    ...state,
    ready,
    t,
    setLang: (lang) => setState((s) => ({ ...s, lang })),
    saveSession: (s) =>
      setState((st) => ({
        ...st,
        sessions: s.id
          ? st.sessions.map((x) => (x.id === s.id ? ({ ...x, ...s } as Session) : x))
          : [...st.sessions, { ...s, id: uid() }],
      })),
    deleteSession: (id) => setState((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== id) })),
    saveTask: (tk) =>
      setState((st) => ({
        ...st,
        tasks: tk.id
          ? st.tasks.map((x) => (x.id === tk.id ? { ...x, ...tk, reminded: false } : x))
          : [{ ...tk, id: uid(), done: false }, ...st.tasks],
      })),
    toggleTask: (id) => setState((st) => ({ ...st, tasks: st.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
    deleteTask: (id) => setState((st) => ({ ...st, tasks: st.tasks.filter((x) => x.id !== id) })),
    logFocus: () =>
      setState((st) => ({ ...st, focusLog: { ...st.focusLog, [todayKey()]: (st.focusLog[todayKey()] ?? 0) + 1 } })),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
