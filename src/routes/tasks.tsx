import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore, type Priority, type Task } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const prioBg: Record<Priority, string> = { low: "bg-mint", med: "bg-sun", high: "bg-coral" };
type Filter = "active" | "completed" | "all";

function TasksPage() {
  const { t, tasks, saveTask, toggleTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<Filter>("active");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [remindMin, setRemind] = useState(30);
  const [priority, setPriority] = useState<Priority>("med");

  const list = tasks.filter((x) => (filter === "all" ? true : filter === "active" ? !x.done : x.done));
  const now = Date.now();

  const remindOpts = [
    { v: 0, l: t("none") },
    { v: 10, l: `10 ${t("min")}` },
    { v: 30, l: `30 ${t("min")}` },
    { v: 60, l: `1 ${t("hour")}` },
    { v: 1440, l: `1 ${t("dayBefore")}` },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">{t("navTasks")}</h1>

      <form
        className="pop-card grid gap-3 bg-sky p-4 md:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          saveTask({ title: title.trim(), subject: subject.trim() || undefined, due: due || undefined, remindMin: due ? remindMin : 0, priority });
          setTitle("");
          setSubject("");
          setDue("");
        }}
      >
        <input className="pop-input md:col-span-2" placeholder={t("taskTitle")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="pop-input" placeholder={t("subject")} value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input type="datetime-local" aria-label={t("dueDate")} className="pop-input" value={due} onChange={(e) => setDue(e.target.value)} />
        <select aria-label={t("remind")} className="pop-input" value={remindMin} onChange={(e) => setRemind(+e.target.value)} disabled={!due}>
          {remindOpts.map((o) => <option key={o.v} value={o.v}>⏰ {o.l}</option>)}
        </select>
        <div className="flex gap-2">
          <select aria-label={t("priority")} className="pop-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">{t("low")}</option>
            <option value="med">{t("med")}</option>
            <option value="high">{t("high")}</option>
          </select>
          <button aria-label={t("addTask")} className="pop-btn shrink-0 bg-primary px-3 text-primary-foreground">
            <Plus className="size-5" />
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        {(["active", "completed", "all"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`pop-btn text-sm ${filter === f ? "bg-secondary" : "bg-card"}`}>
            {t(f)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="pop-card p-8 text-center text-muted-foreground">{t("noTasks")}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((x) => <TaskRow key={x.id} x={x} now={now} onToggle={() => toggleTask(x.id)} onDelete={() => deleteTask(x.id)} />)}
        </ul>
      )}
    </div>
  );
}

function TaskRow({ x, now, onToggle, onDelete }: { x: Task; now: number; onToggle: () => void; onDelete: () => void }) {
  const { t } = useStore();
  const overdue = !x.done && x.due && new Date(x.due).getTime() < now;
  return (
    <li className={`pop-card flex items-center gap-3 p-3 ${x.done ? "opacity-60" : ""}`}>
      <button
        aria-label="toggle"
        onClick={onToggle}
        className={`grid size-8 shrink-0 place-items-center rounded-lg border-2 ${x.done ? "bg-mint" : "bg-card hover:bg-muted"}`}
      >
        {x.done && <Check className="size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-bold ${x.done ? "line-through" : ""}`}>{x.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full border-2 px-2 py-0.5 ${prioBg[x.priority]}`}>{t(x.priority)}</span>
          {x.subject && <span className="rounded-full border-2 bg-grape px-2 py-0.5">{x.subject}</span>}
          {x.due && <span dir="ltr" className="text-muted-foreground">{x.due.replace("T", " ")}</span>}
          {x.remindMin > 0 && <Bell className="size-3.5" />}
          {overdue && <span className="rounded-full bg-destructive px-2 py-0.5 text-destructive-foreground">{t("overdue")}</span>}
        </div>
      </div>
      <button aria-label={t("delete")} onClick={onDelete} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
