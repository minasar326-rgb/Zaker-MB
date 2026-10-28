import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlignLeft,
  Bell,
  Check,
  CheckSquare,
  Clock,
  Edit2,
  Filter,
  ListPlus,
  Play,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useStore,
  type Priority,
  type Subtask,
  type Task,
  type TaskTag,
} from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const prioBg: Record<Priority, string> = {
  low: "bg-mint",
  med: "bg-sun",
  high: "bg-coral",
};

const tagIcons: Record<TaskTag, string> = {
  homework: "📝",
  exam: "🎯",
  revision: "🔄",
  project: "💡",
  reading: "📖",
};

type FilterStatus = "active" | "completed" | "all";

type TaskDraft = {
  id?: string;
  title: string;
  description: string;
  subject: string;
  due: string;
  remindMin: number;
  priority: Priority;
  tag: TaskTag | "";
  estimatedMinutes: number | "";
  subtasks: { id: string; title: string; done: boolean }[];
};

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  subject: "",
  due: "",
  remindMin: 30,
  priority: "med",
  tag: "homework",
  estimatedMinutes: 45,
  subtasks: [],
};

function TasksPage() {
  const {
    t,
    tasks,
    saveTask,
    toggleTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    allSubjects,
  } = useStore();

  const navigate = useNavigate();

  // Search & Filter state
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal draft state
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [newStepText, setNewStepText] = useState("");

  // Inline step adding on cards
  const [cardStepInput, setCardStepInput] = useState<Record<string, string>>({});

  const now = Date.now();

  const remindOpts = [
    { v: 0, l: t("none") },
    { v: 10, l: `10 ${t("min")}` },
    { v: 30, l: `30 ${t("min")}` },
    { v: 60, l: `1 ${t("hour")}` },
    { v: 1440, l: `1 ${t("dayBefore")}` },
  ];

  const availableTags: TaskTag[] = [
    "homework",
    "exam",
    "revision",
    "project",
    "reading",
  ];

  // Filtered task list
  const filteredList = tasks.filter((x) => {
    // Status
    if (filterStatus === "active" && x.done) return false;
    if (filterStatus === "completed" && !x.done) return false;

    // Tag
    if (filterTag !== "all" && x.tag !== filterTag) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = x.title.toLowerCase().includes(q);
      const matchSubject = x.subject?.toLowerCase().includes(q) ?? false;
      const matchDesc = x.description?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchSubject && !matchDesc) return false;
    }

    return true;
  });

  const openEditModal = (task: Task) => {
    setDraft({
      id: task.id,
      title: task.title,
      description: task.description || "",
      subject: task.subject || "",
      due: task.due || "",
      remindMin: task.remindMin || 0,
      priority: task.priority,
      tag: task.tag || "homework",
      estimatedMinutes: task.estimatedMinutes || "",
      subtasks: task.subtasks ? [...task.subtasks] : [],
    });
    setNewStepText("");
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setDraft({ ...emptyDraft, subtasks: [] });
    setNewStepText("");
    setModalOpen(true);
  };

  const handleAddDraftStep = () => {
    if (!newStepText.trim()) return;
    setDraft({
      ...draft,
      subtasks: [
        ...draft.subtasks,
        {
          id: Math.random().toString(36).slice(2, 9),
          title: newStepText.trim(),
          done: false,
        },
      ],
    });
    setNewStepText("");
  };

  const handleRemoveDraftStep = (stepId: string) => {
    setDraft({
      ...draft,
      subtasks: draft.subtasks.filter((s) => s.id !== stepId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">{t("navTasks")}</h1>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">
            نظّم تفاصيل واجباتك، مشاريعك، ومواعيد تسليمك بدقة
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="pop-btn bg-primary text-primary-foreground font-black text-sm"
        >
          <Plus className="size-4" /> {t("addTask")}
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="pop-card bg-card p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            className="pop-input ps-9 pe-9"
            placeholder={t("searchTasks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Status & Tag Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-foreground/10">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(["active", "completed", "all"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`pop-btn text-xs py-1 px-3 ${
                  filterStatus === f ? "bg-secondary font-black" : "bg-card text-muted-foreground"
                }`}
              >
                {t(f)}
              </button>
            ))}
          </div>

          {/* Tag Filter Dropdown or Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
              <Filter className="size-3 inline me-1" />
              {t("filterByTag")}:
            </span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="rounded-xl border-2 border-foreground bg-card px-2.5 py-1 text-xs font-bold"
            >
              <option value="all">🌐 {t("all")}</option>
              {availableTags.map((tg) => (
                <option key={tg} value={tg}>
                  {t(`tag_${tg}` as any)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      {filteredList.length === 0 ? (
        <div className="pop-card p-10 text-center bg-card">
          <p className="text-muted-foreground font-black text-lg">{t("noTasks")}</p>
          <button
            onClick={openCreateModal}
            className="pop-btn bg-primary text-primary-foreground text-sm mt-4"
          >
            <Plus className="size-4" /> {t("addTask")}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredList.map((x) => {
            const overdue = !x.done && x.due && new Date(x.due).getTime() < now;
            const subtasks = x.subtasks || [];
            const subtasksDone = subtasks.filter((s) => s.done).length;
            const subtaskPct =
              subtasks.length > 0
                ? Math.round((subtasksDone / subtasks.length) * 100)
                : 0;

            return (
              <div
                key={x.id}
                className={`pop-card p-4 transition-all bg-card ${
                  x.done ? "opacity-65 bg-muted/40" : ""
                }`}
              >
                {/* Header Row: Checkbox + Title + Actions */}
                <div className="flex items-start gap-3">
                  <button
                    aria-label="toggle"
                    onClick={() => toggleTask(x.id)}
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 border-foreground transition ${
                      x.done ? "bg-mint text-foreground" : "bg-card hover:bg-muted"
                    }`}
                  >
                    {x.done && <Check className="size-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-lg font-black leading-tight ${
                          x.done ? "line-through text-foreground/60" : "text-foreground"
                        }`}
                      >
                        {x.title}
                      </h3>

                      {x.tag && (
                        <span className="rounded-full border border-foreground bg-sun px-2 py-0.5 text-xs font-black">
                          {t(`tag_${x.tag}` as any)}
                        </span>
                      )}

                      <span
                        className={`rounded-full border border-foreground px-2 py-0.5 text-xs font-bold ${
                          prioBg[x.priority]
                        }`}
                      >
                        {t(x.priority)}
                      </span>
                    </div>

                    {/* Description Notes if present */}
                    {x.description && (
                      <p className="mt-1.5 text-xs font-medium text-foreground/85 whitespace-pre-wrap rounded-lg bg-muted/50 p-2 border border-foreground/10">
                        {x.description}
                      </p>
                    )}

                    {/* Metadata badges */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-bold">
                      {x.subject && (
                        <span className="rounded-full border border-foreground bg-grape px-2.5 py-0.5 text-foreground">
                          📖 {x.subject}
                        </span>
                      )}

                      {x.due && (
                        <span
                          dir="ltr"
                          className={`rounded-full border border-foreground px-2.5 py-0.5 ${
                            overdue
                              ? "bg-destructive text-destructive-foreground font-black animate-pulse"
                              : "bg-card text-muted-foreground"
                          }`}
                        >
                          📅 {x.due.replace("T", " ")}
                          {overdue && ` (${t("overdue")})`}
                        </span>
                      )}

                      {x.estimatedMinutes && (
                        <span className="rounded-full border border-foreground bg-sky px-2 py-0.5 text-foreground">
                          ⏱️ {x.estimatedMinutes} {t("min")}
                        </span>
                      )}

                      {x.remindMin > 0 && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Bell className="size-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Subtasks / Checklist section */}
                    {subtasks.length > 0 && (
                      <div className="mt-3 rounded-xl border border-foreground/20 bg-muted/30 p-2.5">
                        <div className="flex items-center justify-between text-xs font-black mb-1.5">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="size-3.5 text-primary" />
                            {t("subtasks")} ({subtasksDone}/{subtasks.length})
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {subtaskPct}%
                          </span>
                        </div>

                        {/* Subtask mini progress bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full border border-foreground/30 bg-card mb-2">
                          <div
                            className="h-full bg-mint transition-all duration-300"
                            style={{ width: `${subtaskPct}%` }}
                          />
                        </div>

                        {/* List of subtasks */}
                        <div className="space-y-1">
                          {subtasks.map((stk) => (
                            <div
                              key={stk.id}
                              className="flex items-center justify-between gap-2 text-xs py-0.5"
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={stk.done}
                                  onChange={() => toggleSubtask(x.id, stk.id)}
                                  className="size-3.5 rounded accent-primary cursor-pointer"
                                />
                                <span
                                  className={`truncate font-medium ${
                                    stk.done ? "line-through text-muted-foreground" : "text-foreground"
                                  }`}
                                >
                                  {stk.title}
                                </span>
                              </label>

                              <button
                                onClick={() => deleteSubtask(x.id, stk.id)}
                                className="text-muted-foreground hover:text-destructive p-0.5"
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline input to quickly add a step to this task */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="+ إضافة خطوة فرعية سريعة..."
                        value={cardStepInput[x.id] || ""}
                        onChange={(e) =>
                          setCardStepInput({
                            ...cardStepInput,
                            [x.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (cardStepInput[x.id] || "").trim()) {
                            e.preventDefault();
                            addSubtask(x.id, cardStepInput[x.id]);
                            setCardStepInput({ ...cardStepInput, [x.id]: "" });
                          }
                        }}
                        className="rounded-lg border border-foreground/20 bg-card px-2.5 py-1 text-xs flex-1 focus:outline-none focus:border-foreground"
                      />
                      {(cardStepInput[x.id] || "").trim() && (
                        <button
                          onClick={() => {
                            addSubtask(x.id, cardStepInput[x.id]);
                            setCardStepInput({ ...cardStepInput, [x.id]: "" });
                          }}
                          className="pop-btn bg-secondary text-[11px] py-1 px-2.5"
                        >
                          {t("save")}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() =>
                        navigate({
                          to: "/timer",
                          search: { subject: x.subject || x.title },
                        })
                      }
                      title={t("focusOnTask")}
                      className="rounded-lg p-2 text-primary hover:bg-muted transition"
                    >
                      <Play className="size-4 fill-current" />
                    </button>

                    <button
                      onClick={() => openEditModal(x)}
                      title={t("editTask")}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      <Edit2 className="size-4" />
                    </button>

                    <button
                      aria-label={t("delete")}
                      onClick={() => deleteTask(x.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Edit / Add Task Modal with all details */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-foreground/50 p-3 sm:place-items-center overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.title.trim()) return;
              saveTask({
                id: draft.id,
                title: draft.title.trim(),
                description: draft.description.trim() || undefined,
                subject: draft.subject.trim() || undefined,
                due: draft.due || undefined,
                remindMin: draft.due ? draft.remindMin : 0,
                priority: draft.priority,
                tag: (draft.tag as TaskTag) || undefined,
                estimatedMinutes: Number(draft.estimatedMinutes) || undefined,
                subtasks: draft.subtasks,
              });
              setModalOpen(false);
            }}
            className="pop-card w-full max-w-lg space-y-4 p-6 bg-card my-6"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-black">
                {draft.id ? t("editTask") : t("addTask")}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase text-foreground mb-1">
                {t("taskTitle")} *
              </label>
              <input
                autoFocus
                required
                className="pop-input"
                placeholder="مثلاً: حل تدريبات الحركة في خط مستقيم..."
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            {/* Subject and Tag row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("subject")}
                </label>
                <input
                  className="pop-input"
                  placeholder="فيزياء، رياضيات..."
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  list="subjects-modal-list"
                />
                <datalist id="subjects-modal-list">
                  {allSubjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("tag")}
                </label>
                <select
                  className="pop-input font-bold"
                  value={draft.tag}
                  onChange={(e) =>
                    setDraft({ ...draft, tag: e.target.value as TaskTag })
                  }
                >
                  {availableTags.map((tg) => (
                    <option key={tg} value={tg}>
                      {t(`tag_${tg}` as any)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description / Notes textarea */}
            <div>
              <label className="block text-xs font-black text-foreground mb-1">
                {t("description")}
              </label>
              <textarea
                rows={2}
                className="pop-input resize-none"
                placeholder="صفحات الكتاب، تفاصيل المسائل، روابط أو ملاحظات إضافية..."
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="block text-xs font-black text-foreground mb-1">
                {t("subtasks")} (Checklist)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="خطوة أو مرحلة في المهمة..."
                  value={newStepText}
                  onChange={(e) => setNewStepText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDraftStep();
                    }
                  }}
                  className="pop-input text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddDraftStep}
                  className="pop-btn bg-secondary text-xs px-3 shrink-0"
                >
                  <Plus className="size-3.5" /> {t("addSubtask")}
                </button>
              </div>

              {draft.subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl border border-foreground/15 bg-muted/40">
                  {draft.subtasks.map((stk) => (
                    <div
                      key={stk.id}
                      className="flex items-center justify-between text-xs bg-card p-1.5 rounded-lg border border-foreground/10"
                    >
                      <span>🔹 {stk.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftStep(stk.id)}
                        className="text-destructive hover:bg-muted p-1 rounded"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Due date and Reminder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("dueDate")}
                </label>
                <input
                  type="datetime-local"
                  className="pop-input"
                  value={draft.due}
                  onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("remind")}
                </label>
                <select
                  className="pop-input"
                  value={draft.remindMin}
                  onChange={(e) => setDraft({ ...draft, remindMin: +e.target.value })}
                  disabled={!draft.due}
                >
                  {remindOpts.map((o) => (
                    <option key={o.v} value={o.v}>
                      ⏰ {o.l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("priority")}
                </label>
                <div className="flex gap-2">
                  {(["low", "med", "high"] as Priority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setDraft({ ...draft, priority: p })}
                      className={`pop-btn text-xs flex-1 py-1 px-2 ${
                        draft.priority === p ? prioBg[p] + " font-black" : "bg-card"
                      }`}
                    >
                      {t(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-foreground mb-1">
                  {t("estMinutes")}
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  placeholder="مثال: 45 دقيقة"
                  className="pop-input"
                  value={draft.estimatedMinutes}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      estimatedMinutes: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                className="pop-btn bg-card text-sm"
                onClick={() => setModalOpen(false)}
              >
                {t("cancel")}
              </button>
              <button className="pop-btn bg-primary text-primary-foreground text-sm font-black">
                {t("save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
