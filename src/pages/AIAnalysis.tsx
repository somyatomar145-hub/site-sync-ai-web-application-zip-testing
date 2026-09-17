import { Icon, type IconName } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, ProgressBar } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import { aiPipeline, metrics } from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

const confMeta = {
  High: { tone: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", bar: 92 },
  Medium: { tone: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", bar: 62 },
  Low: { tone: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200", bar: 32 },
};

function StepCard({ step, index, compact }: { step: (typeof aiPipeline)[number]; index: number; compact?: boolean }) {
  return (
    <div className={cn("group relative flex h-full flex-col rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-lift", compact && "p-3.5")}>
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-white transition-transform duration-300 group-hover:scale-110">
          <Icon name={step.icon as IconName} className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="font-mono text-[10.5px] font-bold text-navy-300">0{index + 1}</span>
      </div>
      <p className="mt-3 text-[13.5px] font-extrabold tracking-tight text-navy-900">{step.title}</p>
      <p className="text-[11px] font-semibold text-sky-700">{step.sub}</p>
      <p className="mt-2 flex-1 text-[11px] leading-relaxed text-navy-600">{step.detail}</p>
    </div>
  );
}

function Arrow({ dir = "right" }: { dir?: "right" | "down" }) {
  if (dir === "down")
    return (
      <div className="flex flex-col items-center py-1.5">
        <span className="flow-line-v h-6" />
        <Icon name="chevronDown" className="h-3.5 w-3.5 text-navy-300" />
      </div>
    );
  return <Icon name="chevronRight" className="hidden h-4 w-4 shrink-0 text-navy-300 sm:block" />;
}

export default function AIAnalysis({ setPage }: { setPage: (p: PK) => void }) {
  const { active, evidenceFor, risksFor, actionsFor } = useStore();
  if (!active) return <ProjectRequired setPage={setPage} />;

  const evidence = evidenceFor(active.id);
  const risks = risksFor(active.id);
  const actions = actionsFor(active.id);
  const m = metrics(active);

  const steps = aiPipeline.map((s) => ({
    ...s,
    value:
      s.key === "plan"
        ? s.metric(active.tasks.length, m.totalDays)
        : s.key === "evidence"
          ? s.metric(evidence.length)
          : s.key === "match"
            ? s.metric(evidence.length)
            : s.key === "validate"
              ? s.metric(evidence.filter((e) => e.verify === "verified").length)
              : s.key === "gap"
                ? s.metric(m.spi)
                : s.key === "risk"
                  ? s.metric(risks.length)
                  : s.key === "warn"
                    ? s.metric(m.delayDays)
                    : s.metric(actions.length),
  }));

  const rows = [steps.slice(0, 4), steps.slice(4, 8)];

  return (
    <div className="space-y-5">
      {/* ---------- honesty banner ---------- */}
      <Card className="anim-up overflow-hidden">
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_minmax(0,320px)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-navy-700 ring-1 ring-navy-100">
              <Icon name="ai" className="h-3.5 w-3.5 text-sky-600" /> Planning-to-Execution Bridge · analysis engine
            </span>
            <h2 className="mt-3 text-[19px] leading-snug font-extrabold tracking-tight text-navy-900 sm:text-[22px]">
              SiteSync AI turns site evidence into a measurable gap, a risk signal and an owned action.
            </h2>
            <p className="mt-2.5 max-w-2xl text-[12.5px] leading-relaxed text-navy-600">
              The engine reads the approved plan, matches geo-tagged evidence to WBS activities, validates the claimed progress and
              quantifies the planned-vs-actual gap. Where a gap exists it reports the <strong>evidence detected</strong>, a{" "}
              <strong>possible reason</strong>, a <strong>confidence level</strong> and the <strong>recommended verification</strong>{" "}
              — it never asserts a single cause of delay on its own.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" icon="camera" onClick={() => setPage("evidence")}>
                Evidence input
              </Button>
              <Button size="sm" variant="outline" icon="actions" onClick={() => setPage("actions")}>
                Action output
              </Button>
              <Button size="sm" variant="outline" icon="progress" onClick={() => setPage("progress")}>
                Progress output
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-navy-900 p-4 text-white">
            <p className="text-[10.5px] font-bold tracking-[0.14em] text-sky-300 uppercase">Design principle</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-navy-100">
              AI suggests. <span className="font-bold text-white">Site engineers confirm.</span> Every conclusion stays attached to
              the evidence that produced it, so an auditor can replay the decision.
            </p>
            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[11px]">
              {[
                "Detected: what the evidence shows",
                "Possible reason: correlated, not proven",
                "Confidence: High / Medium / Low",
                "Action: what a human should verify",
              ].map((s) => (
                <p key={s} className="flex items-start gap-1.5 text-navy-200">
                  <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.6} /> {s}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- workflow ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Analysis Workflow"
          subtitle="Eight connected stages from the baseline plan to a corrective action"
          icon="spark"
          right={<Badge tone="sky">{active.code} · live values</Badge>}
        />
        <div className="p-5">
          <div className="hidden lg:block">
            {rows.map((row, ri) => (
              <div key={ri}>
                {ri > 0 && (
                  <div className="flex flex-col items-center py-2">
                    <span className="flow-line-v h-5" />
                    <Icon name="chevronDown" className="h-4 w-4 text-navy-300" />
                  </div>
                )}
                <div className="flex items-stretch gap-1">
                  {row.map((s, i) => (
                    <div key={s.key} className="flex min-w-0 flex-1 items-stretch gap-1">
                      <div className="min-w-0 flex-1">
                        <StepCard step={s} index={ri * 4 + i} compact />
                        <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-canvas px-2 py-1.5">
                          <Icon name="database" className="h-3 w-3 shrink-0 text-navy-400" />
                          <span className="truncate font-mono text-[10.5px] font-semibold text-navy-600">{s.value}</span>
                        </p>
                      </div>
                      {i < row.length - 1 && <Arrow />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:hidden">
            {steps.map((s, i) => (
              <div key={s.key}>
                <StepCard step={s} index={i} />
                <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-canvas px-2 py-1.5">
                  <Icon name="database" className="h-3 w-3 shrink-0 text-navy-400" />
                  <span className="truncate font-mono text-[10.5px] font-semibold text-navy-600">{s.value}</span>
                </p>
                {i < steps.length - 1 && <Arrow dir="down" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-navy-50/40 px-5 py-3.5 text-[11.5px] font-semibold text-navy-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="layers" className="h-4 w-4 text-navy-400" /> Input: baseline WBS + schedule
          </span>
          <Icon name="chevronRight" className="h-3.5 w-3.5 text-navy-300" />
          <span className="inline-flex items-center gap-1.5">
            <Icon name="camera" className="h-4 w-4 text-sky-600" /> Input: geo-tagged site evidence
          </span>
          <Icon name="chevronRight" className="h-3.5 w-3.5 text-navy-300" />
          <span className="inline-flex items-center gap-1.5">
            <Icon name="actions" className="h-4 w-4 text-emerald-600" /> Output: verified progress, warnings, actions
          </span>
        </div>
      </Card>

      {/* ---------- insights ---------- */}
      {risks.length === 0 ? (
        <Card className="anim-up">
          <CardHeader title="AI Findings" subtitle="Generated from the current gap and evidence patterns" icon="ai" />
          <div className="grid place-items-center gap-2 px-6 py-14 text-center">
            <Icon name="checkCircle" className="h-8 w-8 text-emerald-500" />
            <p className="text-[13px] font-semibold text-navy-800">No findings to report</p>
            <p className="max-w-md text-[11.5px] leading-relaxed text-navy-500">
              Findings appear when an activity deviates from its planned curve, evidence coverage drops, or the forecast
              completion slips. Record progress against activities or upload evidence to generate findings.
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" icon="schedule" onClick={() => setPage("schedule")}>
                Open schedule
              </Button>
              <Button size="sm" icon="camera" onClick={() => setPage("evidence")}>
                Upload evidence
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {risks.map((ins, i) => {
            const c = confMeta[ins.confidence];
            return (
              <Card key={ins.id} hover className="anim-up p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-navy-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-700">{ins.id}</span>
                      <span className="rounded-md bg-navy-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-700">{ins.wbsId}</span>
                      <Badge tone={ins.severity === "critical" ? "red" : ins.severity === "warning" ? "amber" : "green"} dot>
                        {ins.severity}
                      </Badge>
                    </div>
                    <h3 className="mt-1.5 text-[14.5px] leading-snug font-extrabold tracking-tight text-navy-900">{ins.title}</h3>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-lg px-2 py-1 font-mono text-[11.5px] font-bold ring-1",
                      ins.variance <= -7 ? "bg-red-50 text-red-700 ring-red-200" : ins.variance <= -2 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    )}
                  >
                    {ins.variance > 0 ? "+" : ""}
                    {ins.variance}% variance
                  </span>
                </div>

                <p className="mt-2.5 rounded-xl bg-canvas p-3 text-[12px] leading-relaxed text-navy-700">{ins.detail}</p>

                <div className="mt-3.5">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">
                    <Icon name="camera" className="h-3.5 w-3.5" /> Evidence detected
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {ins.evidenceDetected.map((e) => (
                      <li key={e} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-navy-700">
                        <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-sky-600" strokeWidth={2.6} />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line p-3">
                    <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Possible reason</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-navy-700">{ins.possibleReason}</p>
                  </div>
                  <div className={cn("rounded-xl p-3 ring-1", c.bg, c.ring)}>
                    <p className="text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">Confidence level</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={cn("text-[15px] font-extrabold", c.text)}>{ins.confidence}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70">
                        <div className={cn("anim-grow h-full rounded-full", c.tone)} style={{ width: `${c.bar}%` }} />
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10.5px] leading-snug text-navy-600">
                      {ins.confidence === "High"
                        ? "Consistent evidence across multiple records."
                        : ins.confidence === "Medium"
                          ? "Supportive evidence, but not conclusive — verify on site."
                          : "Weak or partial evidence — treat as a hypothesis only."}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 rounded-xl bg-navy-900 p-3.5 text-white">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-sky-300 uppercase">
                    <Icon name="actions" className="h-3.5 w-3.5" /> Recommended verification / action
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed font-semibold">{ins.recommended}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------- transparency panel ---------- */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="anim-up xl:col-span-2">
          <CardHeader title="Model Inputs & Outputs" subtitle="What the engine consumes and what it produces" icon="database" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Inputs</p>
              <ul className="mt-2 space-y-2">
                {[
                  { i: "schedule" as IconName, t: "Baseline WBS, dates and weightages" },
                  { i: "camera" as IconName, t: "Geo-tagged photos / videos with timestamp" },
                  { i: "gps" as IconName, t: "GPS coordinates and chainage mapping" },
                  { i: "users" as IconName, t: "Manpower and plant entries per capture" },
                  { i: "report" as IconName, t: "Daily progress register (text claims)" },
                ].map((r) => (
                  <li key={r.t} className="flex items-start gap-2.5 rounded-xl bg-canvas px-3 py-2">
                    <Icon name={r.i} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
                    <span className="text-[11.5px] text-navy-700">{r.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Outputs</p>
              <ul className="mt-2 space-y-2">
                {[
                  { i: "progress" as IconName, t: "Verified actual % per WBS and project S-curve" },
                  { i: "trendDown" as IconName, t: "Planned vs actual gap and SPI" },
                  { i: "alert" as IconName, t: "Risk / delay signals with confidence" },
                  { i: "bell" as IconName, t: "Early warning with forecast dates" },
                  { i: "actions" as IconName, t: "Corrective actions with owner and due date" },
                ].map((r) => (
                  <li key={r.t} className="flex items-start gap-2.5 rounded-xl bg-navy-50 px-3 py-2 ring-1 ring-navy-100">
                    <Icon name={r.i} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-700" />
                    <span className="text-[11.5px] text-navy-800">{r.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="anim-up">
          <CardHeader title="Confidence Handling" subtitle="Why the engine states a level" icon="shield" />
          <div className="space-y-3.5 p-5">
            {(["High", "Medium", "Low"] as const).map((lvl) => {
              const meta = confMeta[lvl];
              const n = risks.filter((r) => r.confidence === lvl).length;
              return (
                <div key={lvl} className={cn("rounded-xl p-3 ring-1", meta.bg, meta.ring)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[12.5px] font-extrabold", meta.text)}>{lvl}</span>
                    <span className="font-mono text-[10.5px] font-semibold text-navy-500">
                      {n} case{n === 1 ? "" : "s"} today
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar planned={0} actual={meta.bar} height="h-1.5" showMarker={false} />
                  </div>
                  <p className="mt-1.5 text-[10.5px] leading-snug text-navy-600">
                    {lvl === "High"
                      ? "Consistent evidence across ≥10 records on the same front."
                      : lvl === "Medium"
                        ? "Supportive evidence with gaps in coverage."
                        : "Single or unverifiable record — hypothesis only."}
                  </p>
                </div>
              );
            })}
            <p className="rounded-xl bg-canvas p-3 text-[11px] leading-relaxed text-navy-600">
              Analysis runs as a Python service over the SQLite evidence store. No external AI service is required — the same rules
              execute offline on a district server.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
