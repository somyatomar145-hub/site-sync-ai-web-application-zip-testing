import { Icon } from "@/components/Icons";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  KeyValue,
  KpiCard,
  PipelineBand,
  ProgressBar,
  StatusPill,
  VarianceChip,
  Avatar,
} from "@/components/ui";
import { ProgressCurveChart, RadialGauge, MonthlyBars } from "@/components/Charts";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import {
  activityRollup,
  fmtISO,
  inr,
  metrics as computeMetrics,
  monthlyCurve,
  taskPlanned,
  todayISO,
  varianceTone,
  verifyMeta,
} from "@/data/model";
import type { PageKey as PK } from "@/components/Layout";
import { cn } from "@/utils/cn";

export default function Dashboard({ setPage }: { setPage: (p: PK) => void }) {
  const { active, evidenceFor, risksFor, actionsFor } = useStore();
  if (!active) return <ProjectRequired setPage={setPage} />;

  const evidence = evidenceFor(active.id);
  const risks = risksFor(active.id);
  const actions = actionsFor(active.id);
  const rollup = activityRollup(active);
  const curve = monthlyCurve(active, evidence);
  const mm = computeMetrics(active);
  const gap = mm.gap;
  const tone = varianceTone(gap);
  const critical = risks.filter((r) => r.severity === "critical");
  const warnings = risks.filter((r) => r.severity === "warning");
  const pendingActions = actions.filter((a) => a.status !== "done");

  const alerts = risks.slice(0, 6).map((r) => ({
    title: r.title,
    detail: `${r.wbsId} · ${r.category}${r.variance ? ` · ${r.variance > 0 ? "+" : ""}${r.variance}%` : ""}`,
    tone: r.severity === "critical" ? "red" : r.severity === "warning" ? "amber" : "green",
    icon: (r.severity === "info" ? "checkCircle" : r.severity === "warning" ? "bell" : "alert") as "alert" | "bell" | "checkCircle",
    time: r.detectedOn,
  }));

  const toneMap = {
    red: { ring: "ring-red-200", bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
    amber: { ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
    green: { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  };

  if (active.tasks.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="anim-up overflow-hidden">
          <div className="grid gap-6 p-8 text-center lg:grid-cols-[1fr_auto] lg:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-amber-700 ring-1 ring-amber-200">
                <Icon name="info" className="h-3.5 w-3.5" /> Baseline incomplete
              </span>
              <h2 className="mt-3 text-[22px] font-extrabold tracking-tight text-navy-900">
                {active.name} has no WBS activities yet
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-[12.5px] leading-relaxed text-navy-600 lg:mx-0">
                Add activities with planned dates, weightage and responsible persons. The planned progress curve, Gantt chart, risk
                detection, KPIs and reports are all generated from that baseline.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                <Button icon="schedule" onClick={() => setPage("schedule")}>
                  Open schedule & add activities
                </Button>
                <Button variant="outline" icon="wrench" onClick={() => setPage("projects")}>
                  Edit project details
                </Button>
              </div>
            </div>
            <div className="grid gap-2.5 self-center">
              {[
                { i: "layers" as const, t: "Activity name & work group" },
                { i: "calendar" as const, t: "Planned start & finish" },
                { i: "target" as const, t: "Weight in overall progress" },
                { i: "users" as const, t: "Responsible person" },
              ].map((s) => (
                <div key={s.t} className="flex items-center gap-2.5 rounded-xl bg-canvas px-3.5 py-2.5 ring-1 ring-line">
                  <Icon name={s.i} className="h-4 w-4 text-navy-600" />
                  <span className="text-[12px] font-semibold text-navy-800">{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const todayIdx = curve.findIndex((c) => c.actual !== null);
  const lastPoint = curve[todayIdx >= 0 ? todayIdx : 0];

  return (
    <div className="space-y-5">
      {/* ============ Project overview ============ */}
      <Card className="anim-up overflow-hidden">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="navy">{active.code}</Badge>
              <Badge tone={mm.health === "on-track" ? "green" : mm.health === "warning" ? "amber" : "red"} dot>
                {mm.health === "on-track" ? "Overall on track" : mm.health === "warning" ? "Attention required" : "Critical health"}
              </Badge>
              <span className="font-mono text-[11px] font-semibold text-navy-400">{active.id}</span>
              <Badge tone="slate">{active.type}</Badge>
            </div>
            <h2 className="mt-2.5 text-[20px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[24px]">
              {active.name}
            </h2>
            {active.description && <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-navy-500">{active.description}</p>}
            <div className="mt-4 grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { i: "user" as const, l: "Project Manager", v: `${active.manager}${active.managerRole ? ` · ${active.managerRole}` : ""}` },
                { i: "pin" as const, l: "Project Location", v: `${active.location} · ${active.state}` },
                { i: "calendar" as const, l: "Project Start Date", v: fmtISO(active.start) },
                { i: "target" as const, l: "Expected Completion", v: fmtISO(active.finish) },
                { i: "layers" as const, l: "Executing Agency", v: active.agency },
                { i: "report" as const, l: "Sanctioned Cost", v: active.budget ? inr(active.budget) : "—" },
              ].map((f) => (
                <div key={f.l} className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600 ring-1 ring-navy-100">
                    <Icon name={f.i} className="h-4 w-4" />
                  </span>
                  <KeyValue label={f.l} value={f.v} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line lg:w-[228px]">
            <RadialGauge value={mm.actual} planned={mm.planned} size={158} />
            <div className="w-full rounded-xl bg-white p-2.5 text-center ring-1 ring-line">
              <p className="text-[10.5px] font-bold tracking-widest text-navy-400 uppercase">Schedule variance</p>
              <p className={cn("mt-0.5 font-mono text-[20px] font-extrabold tabular", tone.text)}>
                {gap > 0 ? "−" : "+"}
                {Math.abs(gap)}%
              </p>
              <p className="text-[10.5px] font-semibold text-navy-500">
                SPI {mm.spi} · {mm.delayDays > 0 ? `${mm.delayDays}-day projected slip` : "on schedule"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-navy-50/40 px-5 py-4">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-navy-500 uppercase">
              <Icon name="spark" className="h-3.5 w-3.5 text-sky-600" />
              How SiteSync AI works
            </p>
            <button onClick={() => setPage("ai")} className="text-[11.5px] font-bold text-sky-700 hover:underline">
              See the full AI workflow →
            </button>
          </div>
          <PipelineBand active={mm.gap > 2 ? 5 : 4} />
        </div>
      </Card>

      {/* ============ KPI cards ============ */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Overall Progress" value={mm.actual} unit="%" tone="blue" icon="progress" sub="of 100% scope" delay={0} />
        <KpiCard label="Planned Progress" value={mm.planned} unit="%" tone="navy" icon="schedule" sub={`day ${mm.elapsedDays} of ${mm.totalDays}`} delay={40} />
        <KpiCard label="Actual Progress" value={mm.actual} unit="%" tone="teal" icon="checkCircle" sub="evidence-weighted" delay={80} />
        <KpiCard
          label="Schedule Variance"
          value={gap}
          unit="%"
          tone={gap > 7 ? "red" : gap > 2 ? "amber" : "green"}
          icon={gap > 0 ? "trendDown" : "trendUp"}
          delta={{ value: -gap, suffix: "% pts", good: gap <= 2 }}
          sub="vs baseline plan"
          delay={120}
        />
        <KpiCard label="Active Risks" value={critical.length + warnings.length} tone="amber" icon="alert" sub={`${critical.length} critical · ${warnings.length} warning`} delay={160} />
        <KpiCard label="Pending Actions" value={pendingActions.length} tone={pendingActions.length ? "red" : "green"} icon="actions" sub={`${actions.filter((a) => a.status === "done").length} closed`} delay={200} />
      </div>

      {/* ============ Chart + alerts ============ */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="anim-up xl:col-span-2">
          <CardHeader
            title="Planned vs Actual Progress"
            subtitle="Cumulative S-curve · baseline plan against evidence-weighted actual"
            icon="progress"
            right={
              <>
                <Badge tone="navy">Cumulative %</Badge>
                <Button size="sm" variant="outline" icon="download" onClick={() => setPage("reports")}>
                  Export
                </Button>
              </>
            }
          />
          <div className="p-4 sm:p-5">
            <ProgressCurveChart curve={curve} height={286} todayIndex={todayIdx >= 0 ? todayIdx : undefined} />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4 sm:grid-cols-4">
            {[
              { l: "Current gap", v: `${gap > 0 ? "−" : "+"}${Math.abs(gap)}%`, d: `Planned ${mm.planned}% · actual ${mm.actual}%` },
              { l: "Time elapsed", v: `${mm.timeElapsedPct}%`, d: `Day ${mm.elapsedDays} of ${mm.totalDays}` },
              { l: "Evidence records", v: String(evidence.length), d: `${evidence.filter((e) => e.verify === "verified").length} verified` },
              { l: "Forecast completion", v: fmtISO(mm.forecastFinish), d: mm.delayDays > 0 ? `+${mm.delayDays} days vs baseline` : "Within baseline" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">{s.l}</p>
                <p className="mt-0.5 text-[15px] font-bold text-navy-900 tabular">{s.v}</p>
                <p className="text-[10.5px] text-navy-500">{s.d}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="anim-up">
          <CardHeader
            title="Risk & Alert Panel"
            subtitle="Generated from progress gaps and evidence signals"
            icon="alert"
            right={<Badge tone={critical.length ? "red" : warnings.length ? "amber" : "green"} dot>{critical.length ? `${critical.length} critical` : warnings.length ? `${warnings.length} warning` : "No alerts"}</Badge>}
          />
          <ul className="divide-y divide-line">
            {alerts.map((a) => {
              const t = toneMap[a.tone as "red" | "amber" | "green"];
              return (
                <li key={a.title}>
                  <button onClick={() => setPage("risks")} className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-navy-50/60">
                    <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1", t.bg, t.text, t.ring)}>
                      <Icon name={a.icon} className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[12.5px] leading-snug font-semibold text-navy-900">{a.title}</span>
                        <span className="shrink-0 text-[10px] whitespace-nowrap text-navy-400">{a.time}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-navy-500">{a.detail}</span>
                      <span className={cn("mt-1.5 block h-1 w-full rounded-full opacity-30", t.bar)} />
                    </span>
                  </button>
                </li>
              );
            })}
            {alerts.length === 0 && (
              <li className="px-5 py-10 text-center">
                <Icon name="checkCircle" className="mx-auto h-7 w-7 text-emerald-500" />
                <p className="mt-2 text-[12.5px] font-semibold text-navy-800">No alerts detected</p>
                <p className="text-[11px] text-navy-500">All active work fronts are within the tolerance band.</p>
              </li>
            )}
          </ul>
          <div className="border-t border-line px-5 py-3">
            <Button variant="soft" size="sm" className="w-full" icon="arrowRight" onClick={() => setPage("risks")}>
              Open risk register
            </Button>
          </div>
        </Card>
      </div>

      {/* ============ Progress by WBS ============ */}
      <Card className="anim-up">
        <CardHeader
          title="Project Progress by Activity"
          subtitle="Planned % vs actual % with variance and live status"
          icon="layers"
          right={
            <Button size="sm" variant="outline" icon="schedule" onClick={() => setPage("schedule")}>
              Gantt view
            </Button>
          }
        />
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {rollup.map((a, i) => {
            const v = +(a.actual - a.planned).toFixed(1);
            return (
              <div
                key={a.name}
                className="anim-up group rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-lift"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-navy-900">{a.name}</p>
                    <p className="truncate font-mono text-[10.5px] text-navy-400">{a.wbs.join(" · ")}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>

                <div className="mt-3.5 space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[10.5px] font-semibold">
                      <span className="text-navy-500">Planned</span>
                      <span className="font-mono text-navy-700">{a.planned}%</span>
                    </div>
                    <ProgressBar planned={a.planned} actual={0} height="h-1.5" showMarker={false} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[10.5px] font-semibold">
                      <span className="text-navy-500">Actual</span>
                      <span className="font-mono text-navy-900">{a.actual}%</span>
                    </div>
                    <ProgressBar planned={0} actual={a.actual} height="h-2" showMarker={false} />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Variance</span>
                  <VarianceChip value={v} />
                </div>
                <p className="mt-2 text-[10.5px] leading-snug text-navy-400">
                  Weight in overall progress: <span className="font-semibold text-navy-600">{a.weight}%</span>
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ============ Monthly bars + milestones ============ */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="anim-up xl:col-span-2">
          <CardHeader
            title="Monthly Progress Contribution"
            subtitle="Progress added each month — planned vs actual"
            icon="progress"
            right={<Badge tone="sky">{lastPoint ? `${lastPoint.label} status` : "No data"}</Badge>}
          />
          <div className="p-5">
            <MonthlyBars curve={curve} />
            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-[11px] font-semibold text-navy-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm bg-navy-300" /> Planned
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm bg-sky-500" /> Actual
              </span>
              <span className="ml-auto font-normal text-navy-400">Actual is interpolated from verified activity progress</span>
            </div>
          </div>
        </Card>

        <Card className="anim-up">
          <CardHeader title="Upcoming Milestones" subtitle="Baseline activity finishes with live risk state" icon="target" />
          <ul className="divide-y divide-line">
            {active.tasks
              .slice()
              .sort((a, b) => (a.finish < b.finish ? -1 : 1))
              .slice(0, 5)
              .map((t) => {
                const gapT = taskPlannedOf(t) - t.actual;
                const tone2 = gapT > 7 ? "red" : gapT > 2 ? "amber" : "green";
                return (
                  <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", tone2 === "red" ? "bg-red-500" : tone2 === "amber" ? "bg-amber-500" : "bg-emerald-500")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-navy-900">{t.name}</p>
                      <p className="mt-0.5 font-mono text-[10.5px] text-navy-400">{t.id} · {t.owner}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11.5px] font-bold text-navy-700">{fmtISO(t.finish)}</p>
                      <p className={cn("text-[10.5px] font-semibold", tone2 === "red" ? "text-red-600" : tone2 === "amber" ? "text-amber-600" : "text-emerald-600")}>
                        {t.actual}% done
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
          <div className="border-t border-line px-5 py-3">
            <Button variant="soft" size="sm" className="w-full" icon="progress" onClick={() => setPage("progress")}>
              Open progress tracking
            </Button>
          </div>
        </Card>
      </div>

      {/* ============ Recent site evidence ============ */}
      <Card className="anim-up">
        <CardHeader
          title="Recent Site Evidence"
          subtitle="Latest submissions from the site engineering team"
          icon="camera"
          right={
            <Button size="sm" variant="outline" icon="upload" onClick={() => setPage("evidence")}>
              Upload evidence
            </Button>
          }
        />
        {evidence.length === 0 ? (
          <div className="grid place-items-center gap-2 px-6 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-50 text-navy-400">
              <Icon name="camera" className="h-6 w-6" />
            </span>
            <p className="text-[13px] font-semibold text-navy-800">No site evidence yet</p>
            <p className="max-w-sm text-[11.5px] text-navy-500">
              Upload a geo-tagged photo or video against an activity. Evidence is what turns a reported claim into verified
              progress.
            </p>
            <Button className="mt-2" size="sm" icon="upload" onClick={() => setPage("evidence")}>
              Upload first evidence
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {evidence.slice(0, 3).map((e, i) => {
              const vm = verifyMeta[e.verify];
              return (
                <div
                  key={e.id}
                  className="anim-up group overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
                    {e.type === "Photo" ? (
                      <img src={e.image} alt={e.wbsId} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-navy-900 text-white">
                        <Icon name="play" className="h-8 w-8" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-navy-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                      <Icon name={e.type === "Video" ? "play" : "camera"} className="h-3 w-3" /> {e.type}
                    </span>
                    <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg bg-white/92 px-2 py-1 font-mono text-[10px] font-bold text-navy-800 backdrop-blur">
                      <Icon name="pin" className="h-3 w-3 text-red-500" /> {e.chainage || "Geo-tagged"}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[10.5px] font-bold text-navy-400">{e.id} · {e.wbsId}</p>
                        <p className="mt-0.5 truncate text-[13px] font-bold text-navy-900">
                          {active.tasks.find((t) => t.id === e.wbsId)?.name ?? e.wbsId}
                        </p>
                      </div>
                      <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ring-1", vm.bg, vm.text)}>
                        <Icon name={vm.icon} className="h-3 w-3" />
                        {vm.label}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <span className="flex items-center gap-1.5 text-navy-500">
                        <Icon name="clock" className="h-3.5 w-3.5 text-navy-300" /> {e.dateTime}
                      </span>
                      <span className="flex items-center gap-1.5 truncate text-navy-500">
                        <Icon name="gps" className="h-3.5 w-3.5 shrink-0 text-navy-300" /> {e.gps || "GPS captured"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
                      <Avatar name={e.uploadedBy} className="h-7 w-7 text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-semibold text-navy-800">{e.uploadedBy}</p>
                        <p className="truncate text-[10px] text-navy-400">{e.role}</p>
                      </div>
                      <Badge tone="sky">+{e.progress}%</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ============ Action snapshot ============ */}
      <Card className="anim-up">
        <CardHeader
          title="Action Center Snapshot"
          subtitle="Corrective actions generated from current gaps and warnings"
          icon="actions"
          right={
            <Button size="sm" variant="outline" icon="arrowRight" onClick={() => setPage("actions")}>
              Open Action Center
            </Button>
          }
        />
        {actions.length === 0 ? (
          <div className="px-6 py-12 text-center text-[12.5px] text-navy-500">No corrective actions required right now.</div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <th className="px-5 py-2.5">Risk / Issue</th>
                  <th className="px-3 py-2.5">Recommended action</th>
                  <th className="px-3 py-2.5">Owner</th>
                  <th className="px-3 py-2.5">Priority</th>
                  <th className="px-3 py-2.5">Due</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {actions.slice(0, 4).map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-navy-50/50">
                    <td className="px-5 py-3">
                      <p className="text-[12.5px] font-semibold text-navy-900">{a.issue}</p>
                      <p className="font-mono text-[10.5px] text-navy-400">{a.wbsId} · {a.riskId}</p>
                    </td>
                    <td className="max-w-[280px] px-3 py-3 text-[12px] text-navy-600">{a.action}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <Avatar name={a.owner} className="h-7 w-7 text-[10px]" />
                        <span className="text-[11.5px] font-semibold text-navy-800">{a.owner}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={a.priority === "High" ? "red" : a.priority === "Medium" ? "amber" : "slate"}>{a.priority}</Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11.5px] font-semibold text-navy-700">{a.due}</td>
                    <td className="px-5 py-3">
                      <Badge tone={a.status === "done" ? "green" : a.status === "overdue" ? "red" : a.status === "in-progress" ? "sky" : "amber"}>
                        {a.status.replace("-", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-navy-50/40 px-5 py-3 text-[11.5px] text-navy-600">
          <Icon name="info" className="h-4 w-4 text-navy-400" />
          <span>
            Actual progress {mm.actual}% against a planned {mm.planned}% — every action traces to an activity variance or an evidence
            record.
          </span>
        </div>
      </Card>
    </div>
  );
}

/* local helpers */
function taskPlannedOf(t: { start: string; finish: string }) {
  return taskPlanned(
    { id: "", name: "", group: "", start: t.start, finish: t.finish, weight: 0, actual: 0, owner: "" },
    todayISO(),
  );
}
