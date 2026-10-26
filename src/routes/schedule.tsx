import { createFileRoute } from "@tanstack/react-router";
import { Plus, Printer, Trash2 } from "lucide-react";
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
  const byDay = (d: number) =>
    sessions
      .filter((s) => s.day === d)
      .sort((a, b) => a.start.localeCompare(b.start));
  const newDraft = (day: number): Draft => ({
    subject: "",
    day,
    start: "16:00",
    end: "17:00",
    color: "coral",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Printable Header (Visible only when printed) */}
      <div className="print-only mb-6 border-b-2 border-black pb-4 text-center">
        <h1 className="text-3xl font-black">📚 {t("appName")} — {t("navSchedule")}</h1>
        <p className="mt-1 text-sm font-bold text-gray-700">
          جدول المذاكرة الأسبوعي
        </p>
      </div>

      {/* Top action bar */}
      <div className="flex items-center justify-between no-print">
        <h1 className="text-3xl font-black">{t("navSchedule")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="pop-btn bg-card text-sm"
            title={t("printSchedule")}
          >
            <Printer className="size-4" />
            <span>{t("print")}</span>
          </button>

          <button
            className="pop-btn bg-primary text-primary-foreground text-sm"
            onClick={() => setDraft(newDraft(active))}
          >
            <Plus className="size-4" /> {t("addSession")}
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden no-print">
        {order.map((d) => (
          <button
            key={d}
            onClick={() => setActive(d)}
            className={`pop-btn shrink-0 text-sm font-bold ${
              active === d ? "bg-secondary" : "bg-card"
            }`}
          >
            {dayName(lang, d)}
          </button>
        ))}
      </div>

      {/* Mobile single column view */}
      <div className="lg:hidden no-print">
        <DayColumn
          day={active}
          items={byDay(active)}
          onEdit={setDraft}
          onAdd={() => setDraft(newDraft(active))}
        />
      </div>

      {/* Desktop 7-Day Grid View (Also used for Print) */}
      <div className="hidden grid-cols-7 gap-3 lg:grid print:grid print:grid-cols-7">
        {order.map((d) => (
          <DayColumn
            key={d}
            day={d}
            items={byDay(d)}
            onEdit={setDraft}
            onAdd={() => setDraft(newDraft(d))}
            compact
          />
        ))}
      </div>

      {/* Add / Edit Session Modal */}
      {draft && (
        <div
          className="fixed inset-0 z-30 grid place-items-end bg-foreground/40 p-3 sm:place-items-center no-print"
          onClick={() => setDraft(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.subject.trim()) return;
              saveSession(draft);
              setDraft(null);
            }}
            className="pop-card w-full max-w-md space-y-3 p-5 bg-card"
          >
            <h2 className="text-xl font-black">{t("addSession")}</h2>
            <label className="block text-sm font-bold">
              {t("subject")}
              <input
                autoFocus
                className="pop-input mt-1"
                placeholder="اسم المادة..."
                value={draft.subject}
                onChange={(e) =>
                  setDraft({ ...draft, subject: e.target.value })
                }
              />
            </label>
            <label className="block text-sm font-bold">
              {t("day")}
              <select
                className="pop-input mt-1 font-bold"
                value={draft.day}
                onChange={(e) =>
                  setDraft({ ...draft, day: +e.target.value })
                }
              >
                {order.map((d) => (
                  <option key={d} value={d}>
                    {dayName(lang, d)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold">
                {t("from")}
                <input
                  type="time"
                  className="pop-input mt-1"
                  value={draft.start}
                  onChange={(e) =>
                    setDraft({ ...draft, start: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-bold">
                {t("to")}
                <input
                  type="time"
                  className="pop-input mt-1"
                  value={draft.end}
                  onChange={(e) =>
                    setDraft({ ...draft, end: e.target.value })
                  }
                />
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
                    className={`size-8 rounded-full border-2 ${colorBg[c]} ${
                      draft.color === c ? "ring-4 ring-foreground" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {draft.id ? (
                <button
                  type="button"
                  className="pop-btn bg-card text-destructive text-sm"
                  onClick={() => {
                    deleteSession(draft.id!);
                    setDraft(null);
                  }}
                >
                  <Trash2 className="size-4" /> {t("delete")}
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="pop-btn bg-card text-sm"
                  onClick={() => setDraft(null)}
                >
                  {t("cancel")}
                </button>
                <button className="pop-btn bg-primary text-primary-foreground text-sm">
                  {t("save")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DayColumn({
  day,
  items,
  onEdit,
  onAdd,
  compact,
}: {
  day: number;
  items: Session[];
  onEdit: (s: Session) => void;
  onAdd: () => void;
  compact?: boolean;
}) {
  const { t, lang } = useStore();
  return (
    <div className="pop-card flex min-h-48 flex-col gap-2 p-3 bg-card">
      <h3 className="text-center text-sm font-black pb-1 border-b border-foreground/10">
        {dayName(lang, day)}
      </h3>
      {items.length === 0 && !compact && (
        <p className="py-6 text-center text-muted-foreground text-xs font-semibold">
          {t("nothingToday")}
        </p>
      )}
      {items.map((s) => (
        <button
          key={s.id}
          onClick={() => onEdit(s)}
          className={`rounded-xl border-2 p-2.5 text-start transition hover:-translate-y-0.5 ${colorBg[s.color]}`}
        >
          <p className="font-black text-sm leading-tight">{s.subject}</p>
          <p className="text-xs font-bold mt-1" dir="ltr">
            {s.start} – {s.end}
          </p>
        </button>
      ))}
      <button
        onClick={onAdd}
        aria-label={t("addSession")}
        className="mt-auto grid place-items-center rounded-xl border-2 border-dashed py-2 text-muted-foreground hover:bg-muted no-print"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
