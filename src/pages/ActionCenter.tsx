import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import { STAFF, fmtISO, todayISO, type ActionItem } from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

const statusMeta: Record<ActionItem["status"], { label: string; tone: "green" | "sky" | "amber" | "red" }> = {
  done: { label: "Completed", tone: "green" },
  "in-progress": { label: "In progress", tone: "sky" },
  open: { label: "Open", tone: "amber" },
  overdue: { label: "Overdue", tone: "red" },
};

const prioMeta: Record<ActionItem["priority"], string> = {
  High: "bg-red-50 text-red-700 ring-red-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-slate-50 text-slate-600 ring-slate-200",
};

export default function ActionCenter({ setPage }: { setPage: (p: PK) => void }) {
  const { active, actionsFor, setActionStatus, addManualAction, deleteManualAction } = useStore();
  const [status, setStatus] = useState("All statuses");
  const [prio, setPrio] = useState("All priorities");
  const [owner, setOwner] = useState("All owners");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    issue: "",
    action: "",
    owner: STAFF[2].name,
    priority: "High" as ActionItem["priority"],
    due: todayISO(),
    wbsId: "",
  });

  const actions = active ? actionsFor(active.id) : [];
  const owners = ["All owners", ...Array.from(new Set(actions.map((i) => i.owner)))];

  const filtered = useMemo(
    () =>
      actions.filter(
        (a) =>
          (status === "All statuses" || statusMeta[a.status].label === status) &&
          (prio === "All priorities" || a.priority === prio) &&
          (owner === "All owners" || a.owner === owner) &&
          (q.trim() === "" || `${a.id} ${a.issue} ${a.action} ${a.owner} ${a.wbsId}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [actions, status, prio, owner, q],
  );

  if (!active) return <ProjectRequired setPage={setPage} />;

  const counts = {
    total: actions.length,
    open: actions.filter((a) => a.status === "open").length,
    progress: actions.filter((a) => a.status === "in-progress").length,
    overdue: actions.filter((a) => a.status === "overdue").length,
    done: actions.filter((a) => a.status === "done").length,
    high: actions.filter((a) => a.priority === "High" && a.status !== "done").length,
  };

  const create = () => {
    if (!draft.issue.trim() || !draft.action.trim()) return;
    addManualAction({
      riskId: "MANUAL",
      issue: draft.issue.trim(),
      action: draft.action.trim(),
      owner: draft.owner,
      ownerRole: STAFF.find((s) => s.name === draft.owner)?.role ?? "Site Engineer",
      priority: draft.priority,
      due: fmtISO(draft.due),
      status: "open",
      source: "Manual entry",
      wbsId: draft.wbsId || active.tasks[0]?.id || "—",
    });
    setAddOpen(false);
    setDraft({ ...draft, issue: "", action: "" });
  };

  return (
    <div className="space-y-5">
      {/* ---------- summary ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { l: "Total actions", v: counts.total, i: "actions" as const, tone: "bg-navy-800", s: "Across all signals" },
          { l: "Open", v: counts.open, i: "clock" as const, tone: "bg-amber-500", s: "Awaiting start" },
          { l: "In progress", v: counts.progress, i: "refresh" as const, tone: "bg-sky-600", s: "Being executed" },
          { l: "Overdue", v: counts.overdue, i: "alert" as const, tone: "bg-red-500", s: "Past due date" },
          { l: "Completed", v: counts.done, i: "checkCircle" as const, tone: "bg-emerald-500", s: "Verified closure" },
        ].map((s, i) => (
          <Card key={s.l} hover className="anim-up p-4" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold tracking-widest text-navy-400 uppercase">{s.l}</p>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg text-white", s.tone)}>
                <Icon name={s.i} className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-[24px] leading-none font-bold text-navy-900 tabular">{s.v}</p>
            <p className="mt-2 text-[11px] text-navy-500">{s.s}</p>
          </Card>
        ))}
      </div>

      {/* ---------- loop banner ---------- */}
      <Card className="anim-up overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex min-w-[260px] flex-1 items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-800 text-white">
              <Icon name="flag" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-navy-900">Closing the loop: warning → action → verification</p>
              <p className="text-[11.5px] text-navy-500">
                {counts.high} high-priority action{counts.high === 1 ? "" : "s"} live for {active.code}. An action closes only when
                verification evidence is attached.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {["Warning", "Action", "Owner", "Due date", "Verification"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-lg px-2 py-1 text-[10.5px] font-bold ring-1",
                    i === 0 ? "bg-amber-50 text-amber-700 ring-amber-200" : i === 4 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-navy-50 text-navy-700 ring-navy-100",
                  )}
                >
                  {s}
                </span>
                {i < 4 && <Icon name="chevronRight" className="h-3 w-3 text-navy-300" />}
              </span>
            ))}
          </div>
          <Button size="sm" icon="plus" className="ml-auto" onClick={() => setAddOpen(true)}>
            New action
          </Button>
        </div>
      </Card>

      {/* ---------- register ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Action Register"
          subtitle="Risk or issue, recommended action, responsible person, priority, due date and status"
          icon="actions"
          right={<Badge tone={counts.overdue ? "red" : "green"} dot>{counts.overdue} overdue</Badge>}
        />
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
          <div className="relative min-w-[190px] flex-1">
            <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, owner or WBS…" className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-[176px]">
            {["All statuses", "Open", "In progress", "Overdue", "Completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select value={prio} onChange={(e) => setPrio(e.target.value)} className="sm:w-[164px]">
            {["All priorities", "High", "Medium", "Low"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select value={owner} onChange={(e) => setOwner(e.target.value)} className="sm:w-[196px]">
            {owners.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center gap-2 px-6 py-16 text-center">
            <Icon name="checkCircle" className="h-8 w-8 text-emerald-500" />
            <p className="text-[13px] font-semibold text-navy-800">
              {actions.length === 0 ? "No corrective actions required" : "No actions match the filters"}
            </p>
            <p className="max-w-md text-[11.5px] text-navy-500">
              {actions.length === 0
                ? "Actions are generated automatically when a work front falls behind its planned curve or evidence goes missing."
                : "Try clearing the status, priority or owner filters."}
            </p>
          </div>
        ) : (
          <>
            <div className="thin-scroll hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1080px] text-left">
                <thead>
                  <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                    <th className="px-5 py-2.5">Risk / Issue</th>
                    <th className="px-3 py-2.5">Recommended action</th>
                    <th className="px-3 py-2.5">Responsible person</th>
                    <th className="px-3 py-2.5">Priority</th>
                    <th className="px-3 py-2.5">Due date</th>
                    <th className="px-3 py-2.5">Source</th>
                    <th className="px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((a) => (
                    <tr key={a.id} className="group transition-colors hover:bg-navy-50/50">
                      <td className="px-5 py-3">
                        <p className="text-[12.5px] font-semibold text-navy-900">{a.issue}</p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-navy-400">
                          {a.id} · {a.wbsId}
                          {a.riskId !== "MANUAL" ? ` · from ${a.riskId}` : ""}
                        </p>
                      </td>
                      <td className="max-w-[260px] px-3 py-3 text-[12px] leading-snug text-navy-700">{a.action}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <Avatar name={a.owner} className="h-7 w-7 text-[10px]" />
                          <span className="min-w-0">
                            <span className="block truncate text-[11.5px] font-semibold text-navy-800">{a.owner}</span>
                            <span className="block truncate text-[10px] text-navy-400">{a.ownerRole}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("rounded-lg px-2 py-1 text-[10.5px] font-bold ring-1", prioMeta[a.priority])}>{a.priority}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11.5px] font-semibold text-navy-700">{a.due}</td>
                      <td className="px-3 py-3 text-[11px] text-navy-500">{a.source}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={statusMeta[a.status].tone} dot>
                            {statusMeta[a.status].label}
                          </Badge>
                          <select
                            value={a.status}
                            onChange={(e) => setActionStatus(a.id, e.target.value as ActionItem["status"])}
                            className="rounded-lg border border-line bg-white px-1.5 py-1 text-[10.5px] font-semibold text-navy-600 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                            aria-label="Change status"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In progress</option>
                            <option value="done">Completed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                          {a.riskId === "MANUAL" && (
                            <button
                              onClick={() => deleteManualAction(a.id)}
                              className="grid h-6 w-6 place-items-center rounded-md text-navy-300 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete action"
                            >
                              <Icon name="close" className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line lg:hidden">
              {filtered.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[10.5px] font-bold text-navy-400">
                        {a.id} · {a.wbsId}
                      </p>
                      <p className="mt-0.5 text-[13px] font-bold text-navy-900">{a.issue}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-lg px-2 py-1 text-[10.5px] font-bold ring-1", prioMeta[a.priority])}>{a.priority}</span>
                  </div>
                  <p className="mt-2 rounded-lg bg-canvas p-2.5 text-[11.5px] text-navy-700">
                    <strong className="text-navy-500">Action: </strong>
                    {a.action}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="flex items-center gap-2">
                      <Avatar name={a.owner} className="h-7 w-7 text-[10px]" />
                      <span>
                        <span className="block text-[11.5px] font-semibold text-navy-800">{a.owner}</span>
                        <span className="block text-[10px] text-navy-400">{a.ownerRole}</span>
                      </span>
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-navy-600">Due {a.due}</span>
                    <Badge tone={statusMeta[a.status].tone} dot>
                      {statusMeta[a.status].label}
                    </Badge>
                  </div>
                  <select
                    value={a.status}
                    onChange={(e) => setActionStatus(a.id, e.target.value as ActionItem["status"])}
                    className="mt-2.5 w-full rounded-lg border border-line px-2 py-1.5 text-[11.5px] font-semibold text-navy-700"
                  >
                    <option value="open">Status: Open</option>
                    <option value="in-progress">Status: In progress</option>
                    <option value="done">Status: Completed</option>
                    <option value="overdue">Status: Overdue</option>
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* ---------- workload + escalation ---------- */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="anim-up xl:col-span-2">
          <CardHeader title="Workload by Owner" subtitle="Open and overdue actions per responsible person" icon="users" />
          {owners.length === 1 ? (
            <div className="px-5 py-12 text-center text-[12.5px] text-navy-500">No owners with live actions.</div>
          ) : (
            <div className="space-y-3 p-5">
              {owners
                .filter((o) => o !== "All owners")
                .map((o) => {
                  const mine = actions.filter((a) => a.owner === o && a.status !== "done");
                  const overdue = mine.filter((a) => a.status === "overdue").length;
                  const max = Math.max(
                    ...owners.filter((x) => x !== "All owners").map((x) => actions.filter((a) => a.owner === x && a.status !== "done").length),
                    1,
                  );
                  return (
                    <div key={o} className="flex flex-wrap items-center gap-3">
                      <Avatar name={o} className="h-8 w-8 text-[11px]" />
                      <div className="min-w-[130px] flex-1">
                        <p className="text-[12px] font-bold text-navy-900">{o}</p>
                        <p className="text-[10.5px] text-navy-400">{actions.find((a) => a.owner === o)?.ownerRole}</p>
                      </div>
                      <div className="h-2.5 min-w-[110px] flex-1 overflow-hidden rounded-full bg-navy-100">
                        <div className={cn("anim-grow h-full rounded-full", overdue > 0 ? "bg-red-500" : "bg-navy-700")} style={{ width: `${(mine.length / max) * 100}%` }} />
                      </div>
                      <span className="w-[92px] text-right font-mono text-[11.5px] font-bold text-navy-700">
                        {mine.length} open{overdue > 0 ? ` · ${overdue} late` : ""}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card className="anim-up">
          <CardHeader title="Escalation Rules" subtitle="What happens when an action ages" icon="bell" />
          <div className="space-y-3 p-5">
            {[
              { t: "Due in 48 hours", d: "Reminder to the owner and the site engineer.", tone: "bg-amber-500" },
              { t: "Past due date", d: "Marked overdue, escalated to the Project Manager.", tone: "bg-red-500" },
              { t: "3 days overdue", d: "Escalated to the PMU review agenda automatically.", tone: "bg-red-600" },
              { t: "Closure check", d: "Requires verification evidence attached before completion.", tone: "bg-emerald-500" },
            ].map((r) => (
              <div key={r.t} className="flex items-start gap-2.5">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", r.tone)} />
                <div>
                  <p className="text-[11.5px] font-bold text-navy-800">{r.t}</p>
                  <p className="text-[11px] text-navy-500">{r.d}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
              <p className="text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">Traceability</p>
              <p className="mt-1 text-[11px] leading-relaxed text-navy-600">
                Every action stores the signal ID, the evidence behind it, the owner and the closure note — forming the
                planning-to-execution audit trail.
              </p>
            </div>
            <Button variant="soft" size="sm" className="w-full" icon="alert" onClick={() => setPage("risks")}>
              Back to risks & alerts
            </Button>
          </div>
        </Card>
      </div>

      {/* ---------- new action modal ---------- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        wide
        title="Create corrective action"
        subtitle="Adds an owned and dated task outside the automatic signals"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button icon="check" onClick={create}>
              Create action
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Risk / issue" required className="sm:col-span-2">
            <Input value={draft.issue} onChange={(e) => setDraft({ ...draft, issue: e.target.value })} placeholder="e.g. Foundation progress below plan" />
          </Field>
          <Field label="Recommended action" required className="sm:col-span-2">
            <Textarea value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} placeholder="e.g. Review manpower and material availability" />
          </Field>
          <Field label="Responsible person" required>
            <Select value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })}>
              {STAFF.map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="WBS activity">
            <Select value={draft.wbsId} onChange={(e) => setDraft({ ...draft, wbsId: e.target.value })}>
              <option value="">Not linked</option>
              {active.tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" required>
            <Select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as ActionItem["priority"] })}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </Select>
          </Field>
          <Field label="Due date" required>
            <Input type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
