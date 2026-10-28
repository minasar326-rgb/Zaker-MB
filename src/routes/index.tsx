import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Flame,
  ListCheck,
  Play,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { colorBg } from "@/components/Shell";
import { dayName, getGreeting } from "@/lib/i18n";
import {
  COLORS,
  todayKey,
  useStore,
  type Color,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

type PlanDraft = {
  id?: string;
  subject: string;
  targetMinutes: number;
  notes: string;
  color: Color;
};

function Index() {
  const {
    t,
    lang,
    studentName,
    setStudentName,
    sessions,
    tasks,
    focusLog,
    saveTask,
    toggleTask,
    todayPlan,
    todayTasks,
    savePlanItem,
    togglePlanItem,
    deletePlanItem,
    importScheduleToPlan,
    studyStreak,
    allSubjects,
    subjectStatsToday,
    ready,
  } = useStore();

  const navigate = useNavigate();
  const [today, setToday] = useState(0);
  const [perm, setPerm] = useState<string>("default");
  const [planDraft, setPlanDraft] = useState<PlanDraft | null>(null);

  // Student name modal
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [tempName, setTempName] = useState("");

  // Quick task state for Today's Achievement
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskSubject, setQuickTaskSubject] = useState("");

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    saveTask({
      title: quickTaskTitle.trim(),
      subject: quickTaskSubject.trim() || undefined,
      due: todayKey(),
      remindMin: 15,
      priority: "med",
      done: false,
    });
    setQuickTaskTitle("");
  };

  useEffect(() => {
    setToday(new Date().getDay());
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  // Show onboarding name modal on first visit
  useEffect(() => {
    if (ready && !studentName) {
      setNameModalOpen(true);
    }
  }, [ready, studentName]);

  const todays = sessions
    .filter((s) => s.day === today)
    .sort((a, b) => a.start.localeCompare(b.start));
  const pending = tasks.filter((x) => !x.done);
  const upcoming = [...pending]
    .sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"))
    .slice(0, 5);

  // Daily plan calculations (Subjects)
  const totalPlannedSubjects = todayPlan.length;
  const completedSubjects = todayPlan.filter((p) => p.done).length;

  // Daily tasks calculations (Tasks due today)
  const totalTodayTasks = todayTasks.length;
  const completedTodayTasks = todayTasks.filter((tk) => tk.done).length;

  // Combined overall daily goals achievement (Subjects + Tasks)
  const overallTotalGoals = totalPlannedSubjects + totalTodayTasks;
  const overallCompletedGoals = completedSubjects + completedTodayTasks;
  const overallProgressPct =
    overallTotalGoals > 0
      ? Math.round((overallCompletedGoals / overallTotalGoals) * 100)
      : 0;

  const totalTargetMins = todayPlan.reduce((acc, p) => acc + p.targetMinutes, 0);
  const totalAchievedMins = Object.values(subjectStatsToday).reduce(
    (acc, m) => acc + m,
    0,
  );

  const openNewPlanModal = () => {
    setPlanDraft({
      subject: allSubjects[0] || "",
      targetMinutes: 45,
      notes: "",
      color: "coral",
    });
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setStudentName(tempName.trim());
      setNameModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Header */}
      <div className="print-only mb-6 border-b-2 border-black pb-4 text-center">
        <h1 className="text-3xl font-black">
          📚 {t("appName")} — {t("dailyPlan")}
        </h1>
        <p className="mt-1 text-sm font-bold text-gray-700">
          {studentName ? `${t("studentName")}: ${studentName} · ` : ""}
          {dayName(lang, today)} · {todayKey()}
        </p>
      </div>

      {/* Hero Welcome Banner */}
      <section className="pop-card relative overflow-hidden bg-secondary p-6 md:p-8 no-print">
        <div
          className="absolute -end-6 -top-6 size-32 rounded-full border-2 bg-coral"
          aria-hidden
        />
        <div
          className="absolute -bottom-8 end-24 size-20 rounded-full border-2 bg-mint"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-secondary-foreground/90">
            {dayName(lang, today)} · {todayKey()}
          </p>

          <div className="flex items-center gap-2">
            {/* Student Name badge with edit button */}
            {studentName ? (
              <button
                onClick={() => {
                  setTempName(studentName);
                  setNameModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-black shadow-[var(--shadow-pop-sm)] hover:bg-muted transition"
                title={t("editName")}
              >
                <User className="size-3.5 text-primary" />
                <span>{studentName}</span>
                <Edit3 className="size-3 text-muted-foreground ms-0.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setTempName("");
                  setNameModalOpen(true);
                }}
                className="pop-btn bg-card text-xs py-1 px-3"
              >
                + {t("studentName")}
              </button>
            )}

            {/* Study Streak Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-sun px-3.5 py-1 text-sm font-extrabold shadow-[var(--shadow-pop-sm)]">
              <Flame className="size-5 text-orange-600 animate-bounce" />
              <span>
                {studyStreak} {t("streakDays")}
              </span>
            </div>
          </div>
        </div>

        {/* Personalized Greeting with Student Name */}
        <h1 className="relative mt-2 text-3xl md:text-5xl font-black">
          {getGreeting(lang, studentName)}
        </h1>
        <p className="relative mt-2 max-w-md text-secondary-foreground/85 font-medium">
          {studyStreak > 0 ? t("streakAwesome") : t("streakStart")}
        </p>

        {perm !== "granted" && perm !== "unsupported" && (
          <button
            className="pop-btn relative mt-5 bg-card"
            onClick={async () => setPerm(await Notification.requestPermission())}
          >
            <Bell className="size-4" /> {t("enableNotif")}
          </button>
        )}
        {perm === "granted" && (
          <p className="relative mt-5 inline-flex items-center gap-2 font-bold text-sm">
            <BellRing className="size-4" /> {t("notifOn")}
          </p>
        )}
      </section>

      {/* Overview Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <div className="pop-card bg-sun p-4">
          <p className="flex items-center gap-1 font-display text-3xl font-black text-foreground">
            {studyStreak} <Flame className="size-7 text-orange-600" />
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{t("studyStreak")}</p>
        </div>

        <div className="pop-card bg-sky p-4">
          <p className="font-display text-3xl font-black text-foreground">
            {totalAchievedMins} <span className="text-lg font-bold">{t("min")}</span>
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{t("totalAchieved")}</p>
        </div>

        <div className="pop-card bg-mint p-4">
          <p className="font-display text-3xl font-black text-foreground">
            {overallCompletedGoals}/{overallTotalGoals}
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{t("totalDayProgress")}</p>
        </div>

        <div className="pop-card bg-rose p-4">
          <p className="font-display text-3xl font-black text-foreground">
            {pending.length}
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{t("pending")}</p>
        </div>
      </section>

      {/* 1. Combined Daily Achievement: Study Sessions + Tasks */}
      <section className="pop-card p-5 md:p-6 bg-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-black">{t("dailyOverviewTitle")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 no-print">
              {t("totalDayProgress")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            {todays.length > 0 && (
              <button
                onClick={() => importScheduleToPlan()}
                className="pop-btn bg-secondary text-xs md:text-sm"
                title={t("importSchedule")}
              >
                <Download className="size-3.5" />
                {t("importSchedule")}
              </button>
            )}

            <button
              onClick={handlePrintPlan}
              className="pop-btn bg-card text-xs md:text-sm"
              title={t("printPlan")}
            >
              <Printer className="size-3.5" />
              {t("print")}
            </button>

            <button
              onClick={openNewPlanModal}
              className="pop-btn bg-primary text-primary-foreground text-xs md:text-sm"
            >
              <Plus className="size-4" />
              {t("addSubjectPlan")}
            </button>
          </div>
        </div>

        {/* Combined Overall Daily Progress Bar (Subjects + Tasks) */}
        <div className="rounded-2xl border-2 border-foreground bg-muted/60 p-4 shadow-[var(--shadow-pop-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-black mb-2">
            <span className="flex items-center gap-2 text-base">
              <Sparkles className="size-5 text-primary" />
              <span>{t("totalDayProgress")}:</span>
              <span className="font-display text-lg text-primary">
                {overallCompletedGoals} / {overallTotalGoals}
              </span>
              <span className="text-xs bg-card px-2.5 py-0.5 rounded-full border border-foreground/30 font-bold">
                {overallProgressPct}%
              </span>
            </span>
            <span className="text-xs text-muted-foreground font-bold">
              ⏱️ {totalAchievedMins} / {totalTargetMins} {t("min")}
            </span>
          </div>

          {/* Overall Progress meter */}
          <div className="h-5 w-full overflow-hidden rounded-full border-2 border-foreground bg-card">
            <div
              className={`h-full transition-all duration-500 ${
                overallProgressPct === 100 ? "bg-mint" : "bg-sun"
              }`}
              style={{ width: `${Math.max(overallProgressPct, overallTotalGoals > 0 ? 4 : 0)}%` }}
            />
          </div>

          {/* Achievement breakdown pillars side-by-side */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
            <div
              className={`flex items-center justify-between rounded-xl border-2 border-foreground p-3 transition ${
                completedSubjects > 0 && completedSubjects === totalPlannedSubjects
                  ? "bg-mint/40"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <div>
                  <p className="font-black text-sm">{t("studySectionTitle")}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {totalAchievedMins} {t("min")} / {totalTargetMins} {t("min")}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-sm px-2.5 py-1 rounded-lg bg-muted border border-foreground/20">
                {completedSubjects} / {totalPlannedSubjects}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl border-2 border-foreground p-3 transition ${
                totalTodayTasks > 0 && completedTodayTasks === totalTodayTasks
                  ? "bg-mint/40"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-black text-sm">{t("tasksSectionTitle")}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {completedTodayTasks} {t("done")} / {totalTodayTasks - completedTodayTasks} {t("pending")}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-sm px-2.5 py-1 rounded-lg bg-muted border border-foreground/20">
                {completedTodayTasks} / {totalTodayTasks}
              </span>
            </div>
          </div>

          {overallTotalGoals > 0 && overallProgressPct === 100 && (
            <div className="mt-3 rounded-xl border-2 border-foreground bg-mint p-2.5 text-center text-xs font-black shadow-[var(--shadow-pop-sm)]">
              {t("allGoalsDone")}
            </div>
          )}
        </div>

        {/* Pillar 1: Study Subjects (📚 مذاكرة المواد) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span>{t("studySectionTitle")}</span>
              <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full border border-foreground/20 font-bold">
                {completedSubjects}/{totalPlannedSubjects}
              </span>
            </h3>
            <button
              onClick={openNewPlanModal}
              className="pop-btn bg-card text-xs py-1 px-3 no-print"
            >
              <Plus className="size-3.5" />
              {t("addSubjectPlan")}
            </button>
          </div>

          {todayPlan.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-foreground/30 p-6 text-center bg-muted/20">
              <p className="text-muted-foreground font-bold text-sm">{t("noPlanYet")}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 no-print">
                <button
                  onClick={openNewPlanModal}
                  className="pop-btn bg-primary text-primary-foreground text-xs"
                >
                  <Plus className="size-3.5" /> {t("addSubjectPlan")}
                </button>
                {todays.length > 0 && (
                  <button
                    onClick={() => importScheduleToPlan()}
                    className="pop-btn bg-secondary text-xs"
                  >
                    <Download className="size-3.5" /> {t("importSchedule")}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todayPlan.map((item) => {
                const studiedMins = subjectStatsToday[item.subject] ?? 0;
                const isTargetReached = studiedMins >= item.targetMinutes;

                return (
                  <div
                    key={item.id}
                    className={`pop-card relative flex flex-col justify-between p-4 transition-all ${colorBg[item.color]} ${
                      item.done ? "opacity-75" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => togglePlanItem(item.id)}
                          className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 border-foreground transition ${
                            item.done ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                          }`}
                          title={item.done ? t("done") : t("pending")}
                        >
                          {item.done && <Check className="size-4 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-lg font-black leading-tight truncate ${
                              item.done ? "line-through text-foreground/60" : "text-foreground"
                            }`}
                          >
                            {item.subject}
                          </h4>
                          {item.notes && (
                            <p className="text-xs font-semibold text-foreground/80 mt-1 line-clamp-2">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => deletePlanItem(item.id)}
                          className="rounded-lg p-1 text-foreground/60 hover:text-destructive hover:bg-card/50 transition no-print"
                          title={t("delete")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="inline-flex items-center gap-1 rounded-full border border-foreground bg-card px-2.5 py-0.5">
                          <Clock className="size-3" />
                          {item.targetMinutes} {t("min")}
                        </span>

                        {studiedMins > 0 && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border border-foreground px-2 py-0.5 ${
                              isTargetReached ? "bg-mint text-foreground" : "bg-card text-foreground"
                            }`}
                          >
                            {studiedMins} {t("min")} {t("done")}
                            {isTargetReached && " ✓"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-foreground/20 flex items-center justify-between no-print">
                      <button
                        onClick={() =>
                          navigate({
                            to: "/timer",
                            search: { subject: item.subject },
                          })
                        }
                        className="pop-btn bg-card text-xs py-1 px-3 w-full justify-center"
                        title={t("startStudying")}
                      >
                        <Play className="size-3 fill-current" />
                        {t("startStudying")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pillar 2: Tasks & Assignments (✅ المهام والواجبات) */}
        <div className="pt-5 border-t border-foreground/15">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span>{t("tasksSectionTitle")}</span>
              <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full border border-foreground/20 font-bold">
                {completedTodayTasks}/{totalTodayTasks}
              </span>
            </h3>
            <Link to="/tasks" className="text-xs font-bold text-primary hover:underline">
              {t("seeAll")} →
            </Link>
          </div>

          {/* Quick Add Task directly for Today */}
          <form onSubmit={handleAddQuickTask} className="mb-3 flex flex-wrap gap-2 no-print">
            <input
              type="text"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              placeholder={t("quickTaskPlaceholder")}
              className="pop-input flex-1 min-w-[200px] text-xs py-2 px-3"
            />
            {allSubjects.length > 0 && (
              <select
                value={quickTaskSubject}
                onChange={(e) => setQuickTaskSubject(e.target.value)}
                className="pop-input text-xs py-2 px-2 max-w-[140px]"
              >
                <option value="">{t("subject")}...</option>
                {allSubjects.map((sb) => (
                  <option key={sb} value={sb}>
                    {sb}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              disabled={!quickTaskTitle.trim()}
              className="pop-btn bg-primary text-primary-foreground text-xs py-2 px-4 disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              {t("addQuickTaskToday")}
            </button>
          </form>

          {/* List of today tasks */}
          {todayTasks.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-foreground/30 p-5 text-center bg-muted/20">
              <p className="text-muted-foreground font-bold text-xs">{t("noTasksYetToday")}</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {todayTasks.map((tk) => (
                <div
                  key={tk.id}
                  className={`flex items-center justify-between gap-2.5 rounded-xl border-2 border-foreground p-3 transition ${
                    tk.done ? "bg-mint/40 opacity-75" : "bg-card"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(tk.id)}
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 border-foreground transition ${
                      tk.done ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                    }`}
                    title={tk.done ? t("done") : t("pending")}
                  >
                    {tk.done && <Check className="size-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-black truncate ${
                        tk.done ? "line-through text-foreground/60" : "text-foreground"
                      }`}
                    >
                      {tk.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-bold">
                      {tk.subject && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground border border-foreground/15">
                          {tk.subject}
                        </span>
                      )}
                      {tk.done ? (
                        <span className="text-emerald-700 font-extrabold">
                          {t("completedTodayBadge")}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          {t("pendingTodayBadge")}
                        </span>
                      )}
                      {tk.estimatedMinutes && (
                        <span className="text-muted-foreground">
                          · {tk.estimatedMinutes} {t("min")}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate({
                        to: "/timer",
                        search: { subject: tk.subject || tk.title, taskId: tk.id },
                      })
                    }
                    className="p-1.5 text-primary hover:bg-muted rounded-lg border border-transparent hover:border-foreground transition"
                    title={t("focusOnTask")}
                  >
                    <Play className="size-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid: Today's Schedule Sessions & Due Soon Tasks */}
      <div className="grid gap-6 md:grid-cols-2 no-print">
        {/* Today's Schedule Sessions */}
        <section className="pop-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">{t("todaySessions")}</h2>
            <Link to="/schedule" className="text-sm font-bold text-primary">
              {t("seeAll")}
            </Link>
          </div>
          {todays.length === 0 ? (
            <p className="text-muted-foreground">{t("nothingToday")}</p>
          ) : (
            <ul className="space-y-2">
              {todays.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${colorBg[s.color]}`}
                >
                  <span className="font-bold">{s.subject}</span>
                  <span className="text-sm font-semibold" dir="ltr">
                    {s.start} – {s.end}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Due Soon Tasks */}
        <section className="pop-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">{t("dueSoon")}</h2>
            <Link to="/tasks" className="text-sm font-bold text-primary">
              {t("seeAll")}
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">{t("noTasks")}</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((x) => (
                <li
                  key={x.id}
                  className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5"
                >
                  <button
                    aria-label="done"
                    onClick={() => toggleTask(x.id)}
                    className="grid size-6 place-items-center rounded-md border-2 hover:bg-mint"
                  >
                    <Check className="size-3.5 opacity-0 hover:opacity-100" />
                  </button>
                  <span className="flex-1 font-semibold">{x.title}</span>
                  {x.due && (
                    <span
                      className="text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {x.due.replace("T", " ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Add / Edit Daily Plan Modal */}
      {planDraft && (
        <div
          className="fixed inset-0 z-40 grid place-items-end bg-foreground/40 p-3 sm:place-items-center"
          onClick={() => setPlanDraft(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!planDraft.subject.trim()) return;
              savePlanItem({
                id: planDraft.id,
                date: todayKey(),
                subject: planDraft.subject.trim(),
                targetMinutes: Number(planDraft.targetMinutes) || 45,
                notes: planDraft.notes.trim() || undefined,
                color: planDraft.color,
              });
              setPlanDraft(null);
            }}
            className="pop-card w-full max-w-md space-y-4 p-5 bg-card"
          >
            <h2 className="text-xl font-black">{t("addSubjectPlan")}</h2>

            <label className="block text-sm font-bold">
              {t("subject")}
              <input
                autoFocus
                className="pop-input mt-1"
                placeholder={t("placeholderPlanSubject")}
                value={planDraft.subject}
                onChange={(e) =>
                  setPlanDraft({ ...planDraft, subject: e.target.value })
                }
                list="subjects-list"
              />
              <datalist id="subjects-list">
                {allSubjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>

            <div>
              <label className="block text-sm font-bold">
                {t("targetMinutes")}
              </label>
              <div className="mt-1 flex gap-2">
                {[25, 45, 60, 90, 120].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPlanDraft({ ...planDraft, targetMinutes: m })}
                    className={`pop-btn text-xs py-1 px-2.5 ${
                      planDraft.targetMinutes === m ? "bg-primary text-primary-foreground" : "bg-card"
                    }`}
                  >
                    {m} {t("min")}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="5"
                max="360"
                className="pop-input mt-2"
                value={planDraft.targetMinutes}
                onChange={(e) =>
                  setPlanDraft({
                    ...planDraft,
                    targetMinutes: Math.max(5, Number(e.target.value)),
                  })
                }
              />
            </div>

            <label className="block text-sm font-bold">
              {t("taskNotes")}
              <input
                className="pop-input mt-1"
                placeholder={t("placeholderPlanNotes")}
                value={planDraft.notes}
                onChange={(e) =>
                  setPlanDraft({ ...planDraft, notes: e.target.value })
                }
              />
            </label>

            <div>
              <p className="text-sm font-bold">{t("color")}</p>
              <div className="mt-1.5 flex gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-label={c}
                    onClick={() => setPlanDraft({ ...planDraft, color: c })}
                    className={`size-8 rounded-full border-2 ${colorBg[c]} ${
                      planDraft.color === c ? "ring-4 ring-foreground" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                className="pop-btn bg-card text-sm"
                onClick={() => setPlanDraft(null)}
              >
                {t("cancel")}
              </button>
              <button className="pop-btn bg-primary text-primary-foreground text-sm">
                {t("save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Name Modal (First-time or Edit) */}
      {nameModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4"
          onClick={() => {
            if (studentName) setNameModalOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pop-card w-full max-w-sm bg-card p-6 space-y-4 text-center animate-in fade-in zoom-in duration-200"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border-2 border-foreground bg-sun text-3xl shadow-[var(--shadow-pop-sm)]">
              🎓
            </div>

            <div>
              <h2 className="text-2xl font-black">{t("welcomeStudent")}</h2>
              <p className="text-xs text-muted-foreground mt-1 font-bold">
                {t("whatIsYourName")}
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3">
              <input
                autoFocus
                required
                type="text"
                className="pop-input text-center text-lg font-black"
                placeholder={t("namePlaceholder")}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />

              <button
                type="submit"
                disabled={!tempName.trim()}
                className="pop-btn bg-primary text-primary-foreground font-black text-sm w-full py-2.5 disabled:opacity-50"
              >
                {t("startJourney")}
              </button>

              {studentName && (
                <button
                  type="button"
                  onClick={() => setNameModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-bold"
                >
                  {t("cancel")}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
