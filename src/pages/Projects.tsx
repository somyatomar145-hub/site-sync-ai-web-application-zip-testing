import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, Field, Input, Modal, ProgressBar, Select, StatusPill, Textarea } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import {
  PROJECT_TYPES,
  STAFF,
  activityRollup,
  diffDays,
  fmtISO,
  inr,
  metrics,
} from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

export default function Projects({ setPage }: { setPage: (p: PK) => void }) {
  const { projects, active, setActiveId, updateProject, deleteProject } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    manager: string;
    managerRole: string;
    location: string;
    state: string;
    start: string;
    finish: string;
    budget: string;
    description: string;
    type: string;
    agency: string;
  }>({
    name: "",
    manager: STAFF[0].name,
    managerRole: STAFF[0].role,
    location: "",
    state: "",
    start: "",
    finish: "",
    budget: "",
    description: "",
    type: PROJECT_TYPES[0] as string,
    agency: "",
  });

  const openEdit = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setForm({
      name: p.name,
      manager: p.manager,
      managerRole: p.managerRole,
      location: p.location,
      state: p.state,
      start: p.start,
      finish: p.finish,
      budget: String(p.budget || ""),
      description: p.description,
      type: p.type,
      agency: p.agency,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active || !form.name.trim()) return;
    updateProject(active.id, {
      name: form.name.trim(),
      manager: form.manager,
      managerRole: form.managerRole,
      location: form.location.trim(),
      state: form.state.trim(),
      start: form.start,
      finish: form.finish,
      budget: Number(form.budget) || 0,
      description: form.description.trim(),
      type: form.type,
      agency: form.agency.trim(),
    });
    setEditOpen(false);
  };

  const stats = useMemo(() => {
    const all = projects.map((p) => metrics(p));
    return {
      count: projects.length,
      value: projects.reduce((s, p) => s + p.budget, 0),
      attention: all.filter((m) => m.health !== "on-track").length,
      critical: all.filter((m) => m.health === "critical").length,
    };
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="anim-up overflow-hidden">
          <div className="grid gap-6 p-8 text-center lg:grid-cols-[1fr_auto] lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-navy-700 ring-1 ring-navy-100">
                <Icon name="spark" className="h-3.5 w-3.5 text-sky-600" /> Empty workspace
              </span>
              <h2 className="mt-3 text-[22px] font-extrabold tracking-tight text-navy-900">No projects registered yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-[12.5px] leading-relaxed text-navy-600 lg:mx-0">
                SiteSync AI starts from the plan. Create a project with its baseline dates, executing agency and WBS
                activities — the schedule, evidence register, progress curve, risk detection and reports are all generated
                from that baseline.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                <Button icon="plus" onClick={() => setPage("new-project")}>
                  Create your first project
                </Button>
                <Button variant="outline" icon="ai" onClick={() => setPage("ai")}>
                  See how the analysis works
                </Button>
              </div>
            </div>
            <div className="grid gap-2.5 self-center">
              {[
                { i: "projects" as const, t: "1. Project & baseline" },
                { i: "schedule" as const, t: "2. WBS schedule" },
                { i: "camera" as const, t: "3. Site evidence" },
                { i: "alert" as const, t: "4. Risk & actions" },
              ].map((s) => (
                <div key={s.t} className="flex items-center gap-2.5 rounded-xl bg-canvas px-3.5 py-2.5 ring-1 ring-line">
                  <Icon name={s.i} className="h-4 w-4 text-navy-600" />
                  <span className="text-[12px] font-semibold text-navy-800">{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <ProjectRequired setPage={setPage} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ---------- Portfolio summary ---------- */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { l: "Projects monitored", v: String(stats.count), s: `${active?.code ?? "—"} active`, i: "projects" as const, tone: "bg-navy-800" },
          { l: "Portfolio value", v: stats.value ? inr(stats.value) : "—", s: "Sanctioned cost", i: "report" as const, tone: "bg-sky-600" },
          { l: "Activities tracked", v: String(projects.reduce((s, p) => s + p.tasks.length, 0)), s: "WBS rows across portfolio", i: "layers" as const, tone: "bg-teal-600" },
          { l: "Projects needing attention", v: String(stats.attention), s: `${stats.critical} critical`, i: "alert" as const, tone: "bg-amber-500" },
        ].map((k, i) => (
          <Card key={k.l} hover className="anim-up p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold tracking-widest text-navy-400 uppercase">{k.l}</p>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg text-white", k.tone)}>
                <Icon name={k.i} className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-[24px] leading-none font-bold tracking-tight text-navy-900 tabular">{k.v}</p>
            <p className="mt-2 text-[11px] text-navy-500">{k.s}</p>
          </Card>
        ))}
      </div>

      {/* ---------- Project grid ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Project Portfolio"
          subtitle="Select a project to make it the active workspace"
          icon="projects"
          right={
            <Button size="sm" icon="plus" onClick={() => setPage("new-project")}>
              New project
            </Button>
          }
        />
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {projects.map((p, i) => {
            const m = metrics(p);
            const rollup = activityRollup(p);
            const isActive = p.id === active?.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "anim-up group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
                  isActive ? "border-navy-300 ring-2 ring-navy-100" : "border-line hover:border-navy-200",
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="navy">{p.code}</Badge>
                      <StatusPill status={m.health} />
                      <Badge tone="slate">{p.type}</Badge>
                    </div>
                    <h3 className="mt-2 text-[14.5px] leading-snug font-bold text-navy-900">{p.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-navy-500">
                      <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-navy-300" /> {p.location}, {p.state}
                    </p>
                  </div>
                  {isActive ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-navy-800 px-2 py-1 text-[10px] font-bold text-white">
                      <Icon name="checkCircle" className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => setActiveId(p.id)}
                        className="rounded-lg border border-line px-2 py-1 text-[10.5px] font-bold text-navy-600 transition-colors hover:bg-navy-50"
                      >
                        Set active
                      </button>
                      <button
                        onClick={() => openEdit(p.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line text-navy-500 transition-colors hover:bg-navy-50"
                        aria-label="Edit project"
                      >
                        <Icon name="wrench" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete project"
                      >
                        <Icon name="close" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-3 rounded-xl bg-canvas p-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">Actual</p>
                    <p className="text-[16px] font-bold text-navy-900 tabular">{m.actual}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">Planned</p>
                    <p className="text-[16px] font-bold text-navy-600 tabular">{m.planned}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">Variance</p>
                    <p className={cn("text-[16px] font-bold tabular", m.gap <= 0 ? "text-emerald-600" : m.gap <= 7 ? "text-amber-600" : "text-red-600")}>
                      {m.gap > 0 ? "−" : "+"}
                      {Math.abs(m.gap)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar planned={m.planned} actual={m.actual} />
                  <div className="mt-1.5 flex justify-between text-[10.5px] text-navy-400">
                    <span>
                      {fmtISO(p.start)} → {fmtISO(p.finish)} · {diffDays(p.start, p.finish)} d
                    </span>
                    <span>SPI {m.spi}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3">
                  <span className="text-[11px] font-semibold text-navy-600">{p.manager}</span>
                  <span className="ml-auto flex items-center gap-3 text-[11px] font-semibold text-navy-500">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="layers" className="h-3.5 w-3.5 text-navy-300" /> {p.tasks.length}
                    </span>
                    {p.budget > 0 && <span>{inr(p.budget)}</span>}
                  </span>
                </div>

                {rollup.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {rollup.slice(0, 4).map((r) => (
                      <span key={r.name} className="rounded-lg bg-navy-50 px-2 py-0.5 text-[10px] font-semibold text-navy-600 ring-1 ring-navy-100">
                        {r.name} {r.actual}%
                      </span>
                    ))}
                  </div>
                )}

                {isActive && (
                  <button
                    onClick={() => openEdit(p.id)}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                  >
                    <Icon name="wrench" className="h-3.5 w-3.5" /> Edit project details
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ---------- Edit modal ---------- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        wide
        title="Edit project details"
        subtitle="Baseline fields used across schedule, evidence and reports"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button icon="check" onClick={saveEdit}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name" required className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Project type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Executing agency">
            <Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} />
          </Field>
          <Field label="Project manager">
            <Select
              value={form.manager}
              onChange={(e) => {
                const s = STAFF.find((x) => x.name === e.target.value);
                setForm({ ...form, manager: e.target.value, managerRole: s?.role ?? form.managerRole });
              }}
            >
              {STAFF.map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Designation">
            <Input value={form.managerRole} onChange={(e) => setForm({ ...form, managerRole: e.target.value })} />
          </Field>
          <Field label="Site location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <Field label="Planned start">
            <Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </Field>
          <Field label="Expected completion">
            <Input type="date" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
          </Field>
          <Field label="Sanctioned cost (₹ Cr)">
            <Input type="number" step="0.1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </Field>
          <Field label="Project brief" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* ---------- Delete confirm ---------- */}
      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete project"
        subtitle="This removes the project with its activities and evidence"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Keep project
            </Button>
            <Button
              variant="danger"
              icon="close"
              onClick={() => {
                if (confirmId) deleteProject(confirmId);
                setConfirmId(null);
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-navy-600">
          <strong>{projects.find((p) => p.id === confirmId)?.name}</strong> and all associated WBS activities, site evidence and
          manual actions will be removed from the workspace. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
