import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { colorBg } from "@/components/Shell";
import { dayName, weekOrder } from "@/lib/i18n";
import { COLORS, useStore, type Session } from "@/lib/store";

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
});

type Draft = Omit<Session, "id"> & { id?: string };

function SchedulePage() {
  const { t, lang, sessions, saveSession, deleteSession } = useStore();
  const [active, setActive] = useState(1);
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => setActive(new Date().getDay()), []);

  const order = weekOrder(lang);
  const byDay = (d: number) => sessions.filter((s) => s.day === d).sort((a, b) => a.start.localeCompare(b.start));
  const newDraft = (day: number): Draft => ({ subject: "", day, start: "16:00", end: "17:00", color: "coral" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">{t("navSchedule")}</h1>
        <button className="pop-btn bg-primary text-primary-foreground" onClick={() => setDraft(newDraft(active))}>
          <Plus className="size-4" /> {t("addSession")}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {order.map((d) => (
          <button
            key={d}
            onClick={() => setActive(d)}
            className={`pop-btn shrink-0 text-sm ${active === d ? "bg-secondary" : "bg-card"}`}
          >
            {dayName(lang, d)}
          </button>
        ))}
      </div>
      <div className="lg:hidden">
        <DayColumn day={active} items={byDay(active)} onEdit={setDraft} onAdd={() => setDraft(newDraft(active))} />
      </div>

      <div className="hidden grid-cols-7 gap-3 lg:grid">
        {order.map((d) => (
          <DayColumn key={d} day={d} items={byDay(d)} onEdit={setDraft} onAdd={() => setDraft(newDraft(d))} compact />
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-30 grid place-items-end bg-foreground/40 p-3 sm:place-items-center" onClick={() => setDraft(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.subject.trim()) return;
              saveSession(draft);
              setDraft(null);
            }}
            className="pop-card w-full max-w-md space-y-3 p-5"
          >
            <h2 className="text-xl">{t("addSession")}</h2>
            <label className="block text-sm font-bold">
              {t("subject")}
              <input autoFocus className="pop-input mt-1" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
            </label>
            <label className="block text-sm font-bold">
              {t("day")}
              <select className="pop-input mt-1" value={draft.day} onChange={(e) => setDraft({ ...draft, day: +e.target.value })}>
                {order.map((d) => <option key={d} value={d}>{dayName(lang, d)}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold">
                {t("from")}
                <input type="time" className="pop-input mt-1" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
              </label>
              <label className="block text-sm font-bold">
                {t("to")}
                <input type="time" className="pop-input mt-1" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
              </label>
            </div>
            <div>
              <p className="text-sm font-bold">{t("color")}</p>
              <div className="mt-1 flex gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-label={c}
                    onClick={() => setDraft({ ...draft, color: c })}
                    className={`size-8 rounded-full border-2 ${colorBg[c]} ${draft.color === c ? "ring-4 ring-ring" : ""}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {draft.id ? (
                <button type="button" className="pop-btn bg-card text-destructive" onClick={() => { deleteSession(draft.id!); setDraft(null); }}>
                  <Trash2 className="size-4" /> {t("delete")}
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" className="pop-btn bg-card" onClick={() => setDraft(null)}>{t("cancel")}</button>
                <button className="pop-btn bg-primary text-primary-foreground">{t("save")}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DayColumn({ day, items, onEdit, onAdd, compact }: { day: number; items: Session[]; onEdit: (s: Session) => void; onAdd: () => void; compact?: boolean }) {
  const { t, lang } = useStore();
  return (
    <div className="pop-card flex min-h-48 flex-col gap-2 p-3">
      {compact && <h3 className="text-center text-sm">{dayName(lang, day)}</h3>}
      {items.length === 0 && !compact && <p className="py-6 text-center text-muted-foreground">{t("nothingToday")}</p>}
      {items.map((s) => (
        <button key={s.id} onClick={() => onEdit(s)} className={`rounded-xl border-2 p-3 text-start transition hover:-translate-y-0.5 ${colorBg[s.color]}`}>
          <p className="font-bold leading-tight">{s.subject}</p>
          <p className="text-xs font-semibold" dir="ltr">{s.start} – {s.end}</p>
        </button>
      ))}
      <button onClick={onAdd} aria-label={t("addSession")} className="mt-auto grid place-items-center rounded-xl border-2 border-dashed py-2 text-muted-foreground hover:bg-muted">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
