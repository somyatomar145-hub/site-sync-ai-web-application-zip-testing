import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, Field, Input, Modal, ProgressBar, Select, StatusPill, VarianceChip } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { GanttChart } from "@/components/Charts";
import { useStore } from "@/store/store";
import { STAFF, addDaysISO, diffDays, fmtISO, ganttRows, metrics, taskPlanned, taskStatus, todayISO, type WbsTask } from "@/data/model";
import { cn } from "@/utils/cn";

const blank = (i: number, start: string): WbsTask => ({
  id: `WBS-${String(i + 1).padStart(2, "0")}`,
  name: "",
  group: "Site Preparation",
  start,
  finish: addDaysISO(start, 30),
  weight: 0,
  actual: 0,
  owner: STAFF[2].name,
});

export default function Schedule() {
  const { active, addTask, updateTask, deleteTask } = useStore();
  const [group, setGroup] = useState("All groups");
  const [status, setStatus] = useState("All statuses");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"gantt" | "table">("gantt");
  const [editor, setEditor] = useState<{ mode: "add" | "edit"; idx: number; task: WbsTask } | null>(null);
  const [err, setErr] = useState("");

  const today = todayISO();

  const filteredTasks = useMemo(
    () =>
      (active?.tasks ?? []).filter((t) => {
        const st = taskStatus(t, today);
        const matchesGroup = group === "All groups" || t.group === group;
        const matchesStatus = status === "All statuses" || st === status;
        const matchesQ = q.trim() === "" || `${t.id} ${t.name} ${t.owner} ${t.group}`.toLowerCase().includes(q.toLowerCase());
        return matchesGroup && matchesStatus && matchesQ;
      }),
    [active, group, status, q, today],
  );

  if (!active) return <ProjectRequired setPage={() => {}} />;

  const m = metrics(active);
  const allRows = ganttRows(active, today);
  const groups = ["All groups", ...Array.from(new Set(active.tasks.map((t) => t.group)))];
  const rows = ganttRows({ ...active, tasks: filteredTasks }, today);

  const saveTask = () => {
    const t = editor?.task;
    if (!t) return;
    if (!t.name.trim()) return setErr("Activity name is required.");
    if (!t.id.trim()) return setErr("WBS ID is required.");
    if (diffDays(t.start, t.finish) <= 0) return setErr("Planned finish must be after planned start.");
    if (editor.mode === "add") {
      if (active.tasks.some((x) => x.id === t.id.trim())) return setErr(`${t.id} already exists — use a unique WBS ID.`);
      addTask(active.id, { ...t, id: t.id.trim() });
    } else {
      updateTask(active.id, t.id, t);
    }
    setEditor(null);
    setErr("");
  };

  return (
    <div className="space-y-5">
      {/* ---------- summary ---------- */}
      <Card className="anim-up p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold tracking-widest text-navy-400 uppercase">Baseline</p>
            <p className="text-[13px] font-bold text-navy-900">
              {fmtISO(active.start)} → {fmtISO(active.finish)}
            </p>
            <p className="text-[11px] text-navy-500">{m.totalDays} calendar days · {active.tasks.length} activities</p>
          </div>
          <div className="hidden h-10 w-px bg-line sm:block" />
          <div className="min-w-[210px] flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
              <span className="text-navy-500">Elapsed time</span>
              <span className="text-navy-800">
                day {m.elapsedDays} of {m.totalDays} · {m.timeElapsedPct}%
              </span>
            </div>
            <ProgressBar planned={m.timeElapsedPct} actual={m.timeElapsedPct} height="h-2" showMarker={false} />
            <p className="mt-1 text-[10.5px] text-navy-400">
              Time elapsed {m.timeElapsedPct}% vs actual progress {m.actual}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { l: "On track", v: active.tasks.filter((t) => ["on-track", "completed"].includes(taskStatus(t, today))).length, tone: "text-emerald-600" },
              { l: "Warning", v: active.tasks.filter((t) => taskStatus(t, today) === "warning").length, tone: "text-amber-600" },
              { l: "Critical", v: active.tasks.filter((t) => taskStatus(t, today) === "critical").length, tone: "text-red-600" },
              { l: "Not started", v: active.tasks.filter((t) => taskStatus(t, today) === "not-started").length, tone: "text-navy-500" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-canvas px-3 py-1.5 ring-1 ring-line">
                <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">{s.l}</p>
                <p className={cn("text-[15px] font-bold tabular", s.tone)}>{s.v}</p>
              </div>
            ))}
          </div>
          <Button size="sm" icon="plus" onClick={() => setEditor({ mode: "add", idx: active.tasks.length, task: blank(active.tasks.length, todayISO()) })}>
            Add activity
          </Button>
        </div>
      </Card>

      {/* ---------- schedule ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Project Schedule (WBS)"
          subtitle="Planned windows, planned vs actual progress, variance and status"
          icon="schedule"
          right={
            <div className="flex rounded-xl bg-navy-50 p-1 ring-1 ring-navy-100">
              {(["gantt", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn("rounded-lg px-3 py-1.5 text-[11.5px] font-bold capitalize transition-all", view === v ? "bg-white text-navy-900 shadow-sm" : "text-navy-500 hover:text-navy-800")}
                >
                  {v}
                </button>
              ))}
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
          <div className="relative min-w-[200px] flex-1">
            <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity, WBS ID or owner…" className="pl-9" />
          </div>
          <Select value={group} onChange={(e) => setGroup(e.target.value)} className="sm:w-[190px]">
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-[176px]">
            {["All statuses", "on-track", "warning", "critical", "completed", "not-started"].map((s) => (
              <option key={s} value={s}>
                {s === "All statuses" ? s : s.replace("-", " ")}
              </option>
            ))}
          </Select>
          <Button variant="outline" icon="download">
            Export
          </Button>
        </div>

        {view === "gantt" ? (
          <div className="p-4 sm:p-5">
            <GanttChart rows={rows} totalDays={m.totalDays} elapsedDays={m.elapsedDays} />
          </div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead>
                <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <th className="px-5 py-2.5">WBS ID</th>
                  <th className="px-3 py-2.5">Activity name</th>
                  <th className="px-3 py-2.5">Planned start</th>
                  <th className="px-3 py-2.5">Planned finish</th>
                  <th className="px-3 py-2.5 text-right">Weight</th>
                  <th className="px-3 py-2.5">Planned %</th>
                  <th className="px-3 py-2.5">Actual %</th>
                  <th className="px-3 py-2.5">Variance</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredTasks.map((t) => {
                  const planned = +taskPlanned(t, today).toFixed(1);
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-navy-50/50">
                      <td className="px-5 py-3 font-mono text-[11.5px] font-bold text-navy-700">{t.id}</td>
                      <td className="px-3 py-3">
                        <p className="text-[12.5px] font-semibold text-navy-900">{t.name}</p>
                        <p className="text-[10.5px] text-navy-400">
                          {t.group} · {t.owner}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11.5px] text-navy-600">{fmtISO(t.start)}</td>
                      <td className="px-3 py-3 font-mono text-[11.5px] text-navy-600">{fmtISO(t.finish)}</td>
                      <td className="px-3 py-3 text-right font-mono text-[11.5px] font-semibold text-navy-600">{t.weight}%</td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-[12px] font-semibold text-navy-600">{planned}%</span>
                        <ProgressBar planned={planned} actual={0} height="h-1.5" className="mt-1 w-[86px]" showMarker={false} />
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-[12px] font-bold text-navy-900">{t.actual}%</span>
                        <ProgressBar planned={0} actual={t.actual} height="h-1.5" className="mt-1 w-[86px]" showMarker={false} />
                      </td>
                      <td className="px-3 py-3">
                        <VarianceChip value={+(t.actual - planned).toFixed(1)} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={taskStatus(t, today)} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditor({ mode: "edit", idx: active.tasks.indexOf(t), task: t })}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-line text-navy-500 transition-colors hover:bg-navy-50"
                            aria-label="Edit activity"
                          >
                            <Icon name="wrench" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(active.id, t.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-line text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete activity"
                          >
                            <Icon name="close" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="px-5 py-12 text-center text-[12.5px] text-navy-500">
                No activities match the current filters.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ---------- slipping + rules ---------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="anim-up lg:col-span-2">
          <CardHeader title="Slipping Activities" subtitle="Activities whose actual progress is furthest behind plan" icon="alert" />
          {allRows.filter((r) => r.planned - r.actual > 0).length === 0 ? (
            <div className="px-5 py-12 text-center text-[12.5px] text-navy-500">
              No activity is behind its planned curve right now.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {allRows
                .filter((r) => r.planned - r.actual > 0)
                .sort((a, b) => b.planned - b.actual - (a.planned - a.actual))
                .slice(0, 5)
                .map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                    <span className="rounded bg-navy-100 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-navy-700">{t.id}</span>
                    <div className="min-w-[160px] flex-1">
                      <p className="text-[12.5px] font-semibold text-navy-900">{t.name}</p>
                      <p className="text-[10.5px] text-navy-400">
                        Baseline finish {t.finishLabel} · owner {t.owner}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-navy-500">
                        {t.planned}% → <span className="font-bold text-navy-800">{t.actual}%</span>
                      </span>
                      <VarianceChip value={+(t.actual - t.planned).toFixed(1)} />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card className="anim-up">
          <CardHeader title="Baseline Rules" subtitle="How variance is computed" icon="info" />
          <div className="space-y-3 p-5 text-[11.5px] leading-relaxed text-navy-600">
            <p className="flex gap-2">
              <Badge tone="green">±0–2%</Badge>
              <span>Within tolerance — treated as on track.</span>
            </p>
            <p className="flex gap-2">
              <Badge tone="amber">−2% to −7%</Badge>
              <span>Warning — owner notified, deviation monitored.</span>
            </p>
            <p className="flex gap-2">
              <Badge tone="red">Below −7%</Badge>
              <span>Critical — corrective action created in the Action Center.</span>
            </p>
            <div className="rounded-xl bg-canvas p-3">
              <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Evidence rule</p>
              <p className="mt-1">
                Planned % is derived from each activity's baseline dates and weight. Actual % comes from the progress recorded
                against geo-tagged site evidence.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- activity editor ---------- */}
      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        wide
        title={editor?.mode === "add" ? "Add WBS activity" : "Edit WBS activity"}
        subtitle="Dates and weightage drive the planned progress curve"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button icon="check" onClick={saveTask}>
              {editor?.mode === "add" ? "Add activity" : "Save activity"}
            </Button>
          </>
        }
      >
        {editor && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WBS ID" required>
              <Input
                value={editor.task.id}
                onChange={(e) => setEditor({ ...editor, task: { ...editor.task, id: e.target.value } })}
                className="font-mono"
                disabled={editor.mode === "edit"}
              />
            </Field>
            <Field label="Activity name" required>
              <Input
                value={editor.task.name}
                onChange={(e) => setEditor({ ...editor, task: { ...editor.task, name: e.target.value } })}
                placeholder="e.g. Piling & Pile Caps"
              />
            </Field>
            <Field label="Work group">
              <Input
                value={editor.task.group}
                onChange={(e) => setEditor({ ...editor, task: { ...editor.task, group: e.target.value } })}
                list="sched-groups"
              />
            </Field>
            <Field label="Responsible person">
              <Select value={editor.task.owner} onChange={(e) => setEditor({ ...editor, task: { ...editor.task, owner: e.target.value } })}>
                {STAFF.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Planned start" required>
              <Input type="date" value={editor.task.start} onChange={(e) => setEditor({ ...editor, task: { ...editor.task, start: e.target.value } })} />
            </Field>
            <Field label="Planned finish" required>
              <Input type="date" value={editor.task.finish} onChange={(e) => setEditor({ ...editor, task: { ...editor.task, finish: e.target.value } })} />
            </Field>
            <Field label="Weight (% of project progress)">
              <Input type="number" min="0" max="100" value={editor.task.weight} onChange={(e) => setEditor({ ...editor, task: { ...editor.task, weight: Number(e.target.value) } })} />
            </Field>
            <Field label="Actual completed (%)" hint="Progress verified on site so far.">
              <Input type="number" min="0" max="100" value={editor.task.actual} onChange={(e) => setEditor({ ...editor, task: { ...editor.task, actual: Number(e.target.value) } })} />
            </Field>
            {err && (
              <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-700 ring-1 ring-red-100 sm:col-span-2">
                <Icon name="info" className="h-3.5 w-3.5" /> {err}
              </p>
            )}
            <p className="text-[11px] text-navy-500 sm:col-span-2">
              {diffDays(editor.task.start, editor.task.finish) > 0
                ? `${diffDays(editor.task.start, editor.task.finish)} days duration · planned ${taskPlanned(editor.task, today).toFixed(0)}% complete by today.`
                : "Check the planned dates."}
            </p>
            <datalist id="sched-groups">
              {["Site Preparation", "Earthwork", "Foundation", "Substructure", "Structural Work", "Pavement", "Installation", "Finishing", "Testing & Handover"].map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
        )}
      </Modal>
    </div>
  );
}
