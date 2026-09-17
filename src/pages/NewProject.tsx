import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, Field, Input, Select, Textarea } from "@/components/ui";
import { useStore } from "@/store/store";
import {
  PROJECT_TYPES,
  STAFF,
  WBS_TEMPLATES,
  addDaysISO,
  diffDays,
  fmtISO,
  metrics,
  taskPlanned,
  todayISO,
  type Project,
  type WbsTask,
} from "@/data/model";
import { cn } from "@/utils/cn";

const STEPS = ["Project details", "Team & location", "Timeline & cost", "WBS activities", "Review & create"];

interface Draft {
  name: string;
  code: string;
  type: string;
  description: string;
  agency: string;
  funding: string;
  manager: string;
  managerRole: string;
  managerEmail: string;
  managerPhone: string;
  location: string;
  state: string;
  chainage: string;
  start: string;
  finish: string;
  budget: string;
  tasks: WbsTask[];
}

const today = todayISO();
const defaultStart = todayISO();
const defaultFinish = addDaysISO(defaultStart, 330);

const blankTask = (i: number, start: string, finish: string): WbsTask => ({
  id: `WBS-${String(i + 1).padStart(2, "0")}`,
  name: "",
  group: "Site Preparation",
  start,
  finish,
  weight: 0,
  actual: 0,
  owner: STAFF[2].name,
});

export default function NewProject({ setPage }: { setPage: (p: "projects" | "dashboard") => void }) {
  const { addProject, projects } = useStore();
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);

  const [d, setD] = useState<Draft>({
    name: "",
    code: "",
    type: PROJECT_TYPES[0],
    description: "",
    agency: "",
    funding: "",
    manager: STAFF[0].name,
    managerRole: STAFF[0].role,
    managerEmail: "",
    managerPhone: "",
    location: "",
    state: "Maharashtra",
    chainage: "",
    start: defaultStart,
    finish: defaultFinish,
    budget: "",
    tasks: WBS_TEMPLATES[PROJECT_TYPES[0]].map((t, i) => ({
      id: `WBS-${String(i + 1).padStart(2, "0")}`,
      name: t.name,
      group: t.group,
      start: addDaysISO(defaultStart, t.from),
      finish: addDaysISO(defaultStart, t.to),
      weight: t.weight,
      actual: 0,
      owner: STAFF[(i % (STAFF.length - 2)) + 2].name,
    })),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setTask = (idx: number, patch: Partial<WbsTask>) =>
    setD((p) => ({ ...p, tasks: p.tasks.map((t, i) => (i === idx ? { ...t, ...patch } : t)) }));

  const weightTotal = useMemo(() => d.tasks.reduce((s, t) => s + (Number(t.weight) || 0), 0), [d.tasks]);
  const preview = useMemo<Project>(
    () => ({
      id: "PREVIEW",
      name: d.name || "Untitled project",
      code: d.code || "NEW",
      type: d.type,
      agency: d.agency || "—",
      manager: d.manager,
      managerRole: d.managerRole,
      managerEmail: d.managerEmail,
      managerPhone: d.managerPhone,
      location: d.location || "—",
      state: d.state,
      chainage: d.chainage,
      start: d.start,
      finish: d.finish,
      budget: Number(d.budget) || 0,
      funding: d.funding,
      description: d.description,
      createdAt: new Date().toISOString(),
      tasks: d.tasks,
    }),
    [d],
  );
  const pv = metrics(preview);

  const errors: Record<number, string[]> = {
    0: [!d.name.trim() && "Project name is required", !d.code.trim() && "Project code is required", !d.agency.trim() && "Executing agency is required"].filter(Boolean) as string[],
    1: [!d.location.trim() && "Site location is required", !d.state.trim() && "State is required"].filter(Boolean) as string[],
    2: [
      !d.start && "Planned start date is required",
      !d.finish && "Expected completion date is required",
      d.start && d.finish && diffDays(d.start, d.finish) <= 0 && "Completion date must be after the start date",
      d.budget !== "" && Number(d.budget) < 0 && "Sanctioned cost cannot be negative",
    ].filter(Boolean) as string[],
    3: [
      d.tasks.length === 0 && "Add at least one WBS activity",
      d.tasks.some((t) => !t.name.trim()) && "Every activity needs a name",
      d.tasks.some((t) => diffDays(t.start, t.finish) <= 0) && "Each activity needs a valid start and finish date",
      Math.round(weightTotal) !== 100 && `Activity weight must total 100% (currently ${weightTotal}%)`,
    ].filter(Boolean) as string[],
    4: [],
  };

  const stepValid = (i: number) => errors[i].length === 0;
  const next = () => {
    setTouched(true);
    if (!stepValid(step)) return;
    setTouched(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const applyTemplate = (type: string) => {
    set("type", type);
    const tpl = WBS_TEMPLATES[type];
    if (!tpl) return;
    const span = Math.max(diffDays(d.start, d.finish), 1);
    setD((p) => ({
      ...p,
      type,
      tasks: tpl.map((t, i) => ({
        id: `WBS-${String(i + 1).padStart(2, "0")}`,
        name: t.name,
        group: t.group,
        start: addDaysISO(p.start, Math.round((t.from / 330) * span)),
        finish: addDaysISO(p.start, Math.round((t.to / 330) * span)),
        weight: t.weight,
        actual: p.tasks[i]?.actual ?? 0,
        owner: p.tasks[i]?.owner ?? STAFF[(i % (STAFF.length - 2)) + 2].name,
      })),
    }));
  };

  const submit = () => {
    setTouched(true);
    for (let i = 0; i < 4; i++) {
      if (!stepValid(i)) {
        setStep(i);
        return;
      }
    }
    addProject({
      name: d.name.trim(),
      code: d.code.trim().toUpperCase(),
      type: d.type,
      description: d.description.trim(),
      agency: d.agency.trim(),
      funding: d.funding.trim(),
      manager: d.manager,
      managerRole: d.managerRole,
      managerEmail: d.managerEmail.trim(),
      managerPhone: d.managerPhone.trim(),
      location: d.location.trim(),
      state: d.state.trim(),
      chainage: d.chainage.trim(),
      start: d.start,
      finish: d.finish,
      budget: Number(d.budget) || 0,
      tasks: d.tasks.map((t, i) => ({
        ...t,
        name: t.name.trim(),
        id: t.id.trim() || `WBS-${String(i + 1).padStart(2, "0")}`,
        weight: Number(t.weight) || 0,
        actual: Math.min(100, Math.max(0, Number(t.actual) || 0)),
      })),
    });
    setPage("dashboard");
  };

  const err = (i: number) => (touched && errors[step][i] ? errors[step][i] : undefined);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* stepper */}
      <Card className="anim-up p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-white">
            <Icon name="plus" className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-extrabold tracking-tight text-navy-900">Register a new project</h2>
            <p className="text-[11.5px] text-navy-500">
              {projects.length === 0
                ? "This will be the first project in your workspace — everything else builds from this baseline."
                : "Adds another project to your monitoring portfolio."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage("projects")}>
            Cancel
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-[11.5px] font-bold transition-all",
                i === step
                  ? "bg-navy-800 text-white shadow-sm"
                  : i < step
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-navy-50 text-navy-400",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px]",
                  i === step ? "bg-white/20" : i < step ? "bg-emerald-500 text-white" : "bg-white text-navy-400",
                )}
              >
                {i < step ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* step 0 — project details */}
      {step === 0 && (
        <Card className="anim-up">
          <CardHeader title="Project details" subtitle="Identity and scope of the work" icon="projects" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Project name" required className="sm:col-span-2" hint={err(0)}>
              <Input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nagpur–Wardha Expressway · Package 3" />
            </Field>
            <Field label="Project code" required hint={err(1)}>
              <Input value={d.code} onChange={(e) => set("code", e.target.value)} placeholder="NH-PKG3" className="font-mono" />
            </Field>
            <Field label="Project type" required>
              <Select value={d.type} onChange={(e) => applyTemplate(e.target.value)}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Executing agency" required hint={err(2)}>
              <Input value={d.agency} onChange={(e) => set("agency", e.target.value)} placeholder="MSRDC / NHAI / PWD / JV name" />
            </Field>
            <Field label="Funding agency">
              <Input value={d.funding} onChange={(e) => set("funding", e.target.value)} placeholder="State budget / centrally sponsored" />
            </Field>
            <Field label="Project brief" className="sm:col-span-2" hint="Short description shown on the dashboard and in reports.">
              <Textarea value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="Scope, key quantities and any special conditions of the contract." />
            </Field>
            <div className="rounded-xl bg-navy-50 p-3.5 ring-1 ring-navy-100 sm:col-span-2">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                <Icon name="spark" className="h-3.5 w-3.5 text-sky-600" /> Template applied
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy-600">
                Choosing a project type preloads a standard WBS with weightages and durations. You can edit every activity in
                step 4.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* step 1 — team & location */}
      {step === 1 && (
        <Card className="anim-up">
          <CardHeader title="Team & location" subtitle="Who is accountable and where the work is" icon="users" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Project manager" required>
              <Select
                value={d.manager}
                onChange={(e) => {
                  const s = STAFF.find((x) => x.name === e.target.value);
                  setD((p) => ({ ...p, manager: e.target.value, managerRole: s?.role ?? p.managerRole }));
                }}
              >
                {STAFF.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Designation">
              <Input value={d.managerRole} onChange={(e) => set("managerRole", e.target.value)} />
            </Field>
            <Field label="Manager email">
              <Input type="email" value={d.managerEmail} onChange={(e) => set("managerEmail", e.target.value)} placeholder="name@department.gov.in" />
            </Field>
            <Field label="Contact number">
              <Input value={d.managerPhone} onChange={(e) => set("managerPhone", e.target.value)} placeholder="+91 ..." />
            </Field>
            <Field label="Site location" required className="sm:col-span-2" hint={err(0)}>
              <Input value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="Chainage 42+000 → 54+400, Wardha District" />
            </Field>
            <Field label="State" required hint={err(1)}>
              <Input value={d.state} onChange={(e) => set("state", e.target.value)} />
            </Field>
            <Field label="Chainage / sector reference">
              <Input value={d.chainage} onChange={(e) => set("chainage", e.target.value)} placeholder="CH 42+000 → CH 54+400" />
            </Field>
          </div>
        </Card>
      )}

      {/* step 2 — timeline & cost */}
      {step === 2 && (
        <Card className="anim-up">
          <CardHeader title="Timeline & cost" subtitle="Baseline dates drive the planned progress curve" icon="calendar" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Planned start date" required>
              <Input
                type="date"
                value={d.start}
                onChange={(e) => {
                  const v = e.target.value;
                  setD((p) => {
                    const span = Math.max(diffDays(p.start, p.finish), 1);
                    return {
                      ...p,
                      start: v,
                      finish: addDaysISO(v, span),
                      tasks: p.tasks.map((t) => ({
                        ...t,
                        start: addDaysISO(v, diffDays(p.start, t.start)),
                        finish: addDaysISO(v, diffDays(p.start, t.finish)),
                      })),
                    };
                  });
                }}
              />
            </Field>
            <Field label="Expected completion date" required hint={err(2) ?? err(1)}>
              <Input type="date" value={d.finish} onChange={(e) => set("finish", e.target.value)} />
            </Field>
            <Field label="Sanctioned cost (₹ crore)">
              <Input type="number" step="0.1" value={d.budget} onChange={(e) => set("budget", e.target.value)} placeholder="486.5" />
            </Field>
            <div className="rounded-xl bg-canvas p-3.5 ring-1 ring-line">
              <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Baseline duration</p>
              <p className="mt-1 text-[20px] font-bold text-navy-900 tabular">
                {Math.max(diffDays(d.start, d.finish), 0)} days
              </p>
              <p className="text-[11px] text-navy-500">
                {fmtISO(d.start)} → {fmtISO(d.finish)}
              </p>
            </div>
            {errors[2].length > 0 && (
              <ul className="space-y-1 rounded-xl bg-red-50 p-3 ring-1 ring-red-100 sm:col-span-2">
                {errors[2].map((e) => (
                  <li key={e} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-red-700">
                    <Icon name="info" className="h-3.5 w-3.5" /> {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      {/* step 3 — WBS */}
      {step === 3 && (
        <Card className="anim-up">
          <CardHeader
            title="WBS activities"
            subtitle="Activities, weightage and progress already completed"
            icon="layers"
            right={
              <div className="flex items-center gap-2">
                <Badge tone={Math.round(weightTotal) === 100 ? "green" : "amber"}>Weight {weightTotal}%</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  icon="plus"
                  onClick={() => setD((p) => ({ ...p, tasks: [...p.tasks, blankTask(p.tasks.length, p.start, addDaysISO(p.start, 30))] }))}
                >
                  Activity
                </Button>
              </div>
            }
          />
          <div className="space-y-3 p-5">
            {errors[3].length > 0 && (
              <ul className="space-y-1 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                {errors[3].map((e) => (
                  <li key={e} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-800">
                    <Icon name="info" className="h-3.5 w-3.5" /> {e}
                  </li>
                ))}
              </ul>
            )}

            {d.tasks.map((t, i) => (
              <div key={i} className="rounded-2xl border border-line p-3.5 transition-colors hover:border-navy-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-navy-100 px-2 py-1 font-mono text-[10.5px] font-bold text-navy-700">{t.id}</span>
                  <button
                    onClick={() => setD((p) => ({ ...p, tasks: p.tasks.filter((_, x) => x !== i) }))}
                    className="grid h-7 w-7 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove activity"
                  >
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Activity name" required className="sm:col-span-2">
                    <Input value={t.name} onChange={(e) => setTask(i, { name: e.target.value })} placeholder="e.g. Piling & Pile Caps" />
                  </Field>
                  <Field label="Work group">
                    <Input value={t.group} onChange={(e) => setTask(i, { group: e.target.value })} placeholder="Foundation" list="groups" />
                  </Field>
                  <Field label="Responsible">
                    <Select value={t.owner} onChange={(e) => setTask(i, { owner: e.target.value })}>
                      {STAFF.map((s) => (
                        <option key={s.name}>{s.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Planned start">
                    <Input type="date" value={t.start} onChange={(e) => setTask(i, { start: e.target.value })} />
                  </Field>
                  <Field label="Planned finish">
                    <Input type="date" value={t.finish} onChange={(e) => setTask(i, { finish: e.target.value })} />
                  </Field>
                  <Field label="Weight (% of project)">
                    <Input type="number" min="0" max="100" value={t.weight} onChange={(e) => setTask(i, { weight: Number(e.target.value) })} />
                  </Field>
                  <Field label="Actual completed (%)" hint="Progress already achieved on site today.">
                    <Input type="number" min="0" max="100" value={t.actual} onChange={(e) => setTask(i, { actual: Number(e.target.value) })} />
                  </Field>
                </div>
                <p className="mt-2 text-[10.5px] text-navy-400">
                  {diffDays(t.start, t.finish) > 0 ? `${diffDays(t.start, t.finish)} days duration · ` : "Invalid duration · "}
                  planned {taskPlanned(t, today).toFixed(0)}% complete by today
                </p>
              </div>
            ))}

            <datalist id="groups">
              {["Site Preparation", "Earthwork", "Foundation", "Substructure", "Structural Work", "Pavement", "Installation", "Finishing", "Testing & Handover"].map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>

            <Button variant="outline" icon="plus" className="w-full" onClick={() => setD((p) => ({ ...p, tasks: [...p.tasks, blankTask(p.tasks.length, p.start, addDaysISO(p.start, 30))] }))}>
              Add another activity
            </Button>
          </div>
        </Card>
      )}

      {/* step 4 — review */}
      {step === 4 && (
        <div className="space-y-5">
          <Card className="anim-up">
            <CardHeader title="Review & create" subtitle="Confirm the baseline before creating the project" icon="checkCircle" />
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <dl className="space-y-3">
                {[
                  ["Project name", d.name || "—"],
                  ["Project ID / code", `Auto-generated · ${d.code.toUpperCase() || "—"}`],
                  ["Type", d.type],
                  ["Executing agency", d.agency || "—"],
                  ["Funding", d.funding || "—"],
                  ["Project manager", `${d.manager} · ${d.managerRole}`],
                  ["Contact", [d.managerEmail, d.managerPhone].filter(Boolean).join(" · ") || "—"],
                  ["Location", `${d.location || "—"}, ${d.state}`],
                  ["Chainage", d.chainage || "—"],
                  ["Baseline", `${fmtISO(d.start)} → ${fmtISO(d.finish)} (${Math.max(diffDays(d.start, d.finish), 0)} days)`],
                  ["Sanctioned cost", d.budget ? `₹${Number(d.budget).toLocaleString("en-IN")} Cr` : "—"],
                  ["Activities", `${d.tasks.length} WBS · weight ${weightTotal}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
                    <dt className="text-[11px] font-bold tracking-wide text-navy-400 uppercase">{k}</dt>
                    <dd className="max-w-[62%] text-right text-[12.5px] font-semibold text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-3">
                <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                  <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Forecast at creation</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-navy-500">Planned today</p>
                      <p className="text-[20px] font-bold text-navy-900 tabular">{pv.planned}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-navy-500">Actual today</p>
                      <p className="text-[20px] font-bold text-sky-700 tabular">{pv.actual}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-navy-500">Schedule variance</p>
                      <p className={cn("text-[20px] font-bold tabular", pv.gap > 7 ? "text-red-600" : pv.gap > 2 ? "text-amber-600" : "text-emerald-600")}>
                        −{pv.gap}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-navy-500">SPI</p>
                      <p className="text-[20px] font-bold text-navy-900 tabular">{pv.spi}</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1.5 rounded-2xl bg-navy-900 p-4 text-white">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-sky-300 uppercase">What happens next</p>
                  {[
                    "Baseline stored — planned curve generated from dates and weightage",
                    "Activity statuses and risk signals computed automatically",
                    "Upload site evidence to convert claims into verified progress",
                    "Deviations raise early warnings and corrective actions",
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-navy-200">
                      <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.6} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" icon="chevronLeft" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          {touched && errors[step].length > 0 && (
            <span className="text-[11.5px] font-semibold text-red-600">{errors[step][0]}</span>
          )}
          {step < STEPS.length - 1 ? (
            <Button icon="arrowRight" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button icon="check" onClick={submit}>
              Create project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
