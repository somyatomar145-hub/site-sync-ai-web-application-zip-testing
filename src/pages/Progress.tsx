import { Icon } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, ProgressBar, StatusPill, VarianceChip } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { MonthlyBars, ProgressCurveChart, RadialGauge, VarianceBars } from "@/components/Charts";
import { useStore } from "@/store/store";
import {
  activityRollup,
  diffDays,
  fmtISO,
  ganttRows,
  metrics,
  monthlyCurve,
  taskPlanned,
  todayISO,
} from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

export default function Progress({ setPage }: { setPage: (p: PK) => void }) {
  const { active, evidenceFor } = useStore();
  if (!active) return <ProjectRequired setPage={setPage} />;

  const evidence = evidenceFor(active.id);
  const today = todayISO();
  const m = metrics(active, today);
  const curve = monthlyCurve(active, evidence, today);
  const rollup = activityRollup(active, today);
  const rows = ganttRows(active, today);
  const todayIdx = curve.findIndex((c) => c.actual !== null);

  const indices = [
    { l: "SPI (Schedule Performance Index)", v: m.spi.toFixed(2), d: "Below 1.0 = behind schedule", tone: m.spi < 0.9 ? "text-red-600" : m.spi < 1 ? "text-amber-600" : "text-emerald-600" },
    { l: "Schedule Variance (SV)", v: `${-m.gap}%`, d: "Earned − planned progress", tone: m.gap > 7 ? "text-red-600" : m.gap > 2 ? "text-amber-600" : "text-emerald-600" },
    { l: "Earned schedule", v: `${m.earnedDays} / ${m.elapsedDays}`, d: "Equivalent days earned", tone: m.spi < 1 ? "text-amber-600" : "text-emerald-600" },
    { l: "Forecast completion", v: fmtISO(m.forecastFinish), d: m.delayDays > 0 ? `+${m.delayDays} days vs baseline` : "Within baseline", tone: m.delayDays > 7 ? "text-red-600" : m.delayDays > 0 ? "text-amber-600" : "text-emerald-600" },
  ];

  const avgLabour = evidence.length ? Math.round(evidence.reduce((s, e) => s + e.skilled + e.unskilled, 0) / evidence.length) : 0;

  return (
    <div className="space-y-5">
      {/* ---------- headline ---------- */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,300px)_1fr]">
        <Card className="anim-up flex flex-col items-center gap-4 p-5">
          <RadialGauge value={m.actual} planned={m.planned} size={190} />
          <div className="w-full space-y-2.5">
            <div className="rounded-xl bg-canvas p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-navy-500">Overall gap</span>
                <VarianceChip value={-m.gap} />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-navy-600">
                {m.gap > 0.5 ? (
                  <>
                    Actual progress is <strong>{m.gap}% below</strong> the planned progress at day {m.elapsedDays} of {m.totalDays}.
                  </>
                ) : (
                  <>
                    Actual progress is <strong>within tolerance</strong> of the planned curve at day {m.elapsedDays}.
                  </>
                )}
              </p>
            </div>
            <Button variant="soft" size="sm" className="w-full" icon="ai" onClick={() => setPage("ai")}>
              Explain this gap with AI
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="anim-up">
            <CardHeader title="Earned Value Indices" subtitle="Derived from the baseline plan and evidence-weighted actual" icon="target" />
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
              {indices.map((i) => (
                <div key={i.l} className="rounded-xl border border-line p-3.5 transition-colors hover:border-navy-200">
                  <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">{i.l}</p>
                  <p className={cn("mt-1 text-[20px] font-bold tracking-tight tabular", i.tone)}>{i.v}</p>
                  <p className="mt-1 text-[10.5px] text-navy-500">{i.d}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="anim-up">
            <CardHeader
              title="Planned vs Actual S-Curve"
              subtitle="Cumulative progress with the gap shaded in red"
              icon="progress"
              right={
                <>
                  <Badge tone="navy">Day {m.elapsedDays}</Badge>
                  <Button size="sm" variant="outline" icon="download" onClick={() => setPage("reports")}>
                    Planned vs Actual report
                  </Button>
                </>
              }
            />
            <div className="p-4 sm:p-5">
              <ProgressCurveChart curve={curve} height={260} todayIndex={todayIdx >= 0 ? todayIdx : undefined} />
            </div>
          </Card>
        </div>
      </div>

      {/* ---------- WBS table ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Progress by WBS Activity"
          subtitle="Planned %, actual %, variance and status per work front"
          icon="layers"
          right={<Badge tone="sky">{active.tasks.length} activities</Badge>}
        />
        {active.tasks.length === 0 ? (
          <div className="grid place-items-center gap-2 px-6 py-14 text-center">
            <Icon name="layers" className="h-7 w-7 text-navy-300" />
            <p className="text-[13px] font-semibold text-navy-800">No activities to track</p>
            <Button size="sm" icon="schedule" onClick={() => setPage("schedule")}>
              Add WBS activities
            </Button>
          </div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <th className="px-5 py-2.5">Activity</th>
                  <th className="w-[210px] px-3 py-2.5">Planned vs actual</th>
                  <th className="px-3 py-2.5 text-right">Planned</th>
                  <th className="px-3 py-2.5 text-right">Actual</th>
                  <th className="px-3 py-2.5 text-right">Variance</th>
                  <th className="px-3 py-2.5 text-right">Evidence</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((t) => {
                  const evCount = evidence.filter((e) => e.wbsId === t.id).length;
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-navy-50/50">
                      <td className="px-5 py-3">
                        <p className="text-[12.5px] font-semibold text-navy-900">{t.name}</p>
                        <p className="font-mono text-[10.5px] text-navy-400">
                          {t.id} · {t.group}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <ProgressBar planned={t.planned} actual={t.actual} height="h-2.5" />
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[12px] font-semibold text-navy-600">{t.planned}%</td>
                      <td className="px-3 py-3 text-right font-mono text-[12px] font-bold text-navy-900">{t.actual}%</td>
                      <td className="px-3 py-3 text-right">
                        <VarianceChip value={+(t.actual - t.planned).toFixed(1)} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className={cn("inline-flex items-center gap-1 font-mono text-[11.5px] font-semibold", evCount === 0 ? "text-navy-300" : evCount < 2 ? "text-amber-600" : "text-emerald-600")}>
                          <Icon name="camera" className="h-3.5 w-3.5" /> {evCount}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={t.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-line bg-navy-50/40 px-5 py-3 text-[11.5px] text-navy-600">
          <Icon name="info" className="mr-1.5 inline h-4 w-4 text-navy-400" />
          Bars show actual (solid) against the planned level (outlined marker). Planned % is computed from each activity's baseline
          dates and weight.
        </div>
      </Card>

      {/* ---------- variance + monthly ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="anim-up">
          <CardHeader title="Variance by WBS" subtitle="Negative (red) = behind plan · Positive (green) = ahead of plan" icon="trendDown" />
          <div className="p-5">
            <VarianceBars items={rows.map((t) => ({ id: t.id, name: t.name, variance: +(t.actual - t.planned).toFixed(1) }))} />
          </div>
        </Card>

        <Card className="anim-up">
          <CardHeader title="Monthly Progress Contribution" subtitle="Where the schedule was gained or lost" icon="progress" />
          <div className="p-5">
            <MonthlyBars curve={curve} />
            <div className="mt-4 space-y-2 border-t border-line pt-3">
              {rows
                .filter((r) => r.planned - r.actual > 2)
                .sort((a, b) => b.planned - b.actual - (a.planned - a.actual))
                .slice(0, 3)
                .map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2">
                    <span className="w-[70px] shrink-0 font-mono text-[11px] font-bold text-navy-700">{r.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-navy-600">
                      {r.name} · {diffDays(r.start, r.finish)} day window
                    </span>
                    <span className="shrink-0 font-mono text-[11.5px] font-bold text-red-600">−{(r.planned - r.actual).toFixed(1)} pts</span>
                  </div>
                ))}
              {rows.every((r) => r.planned - r.actual <= 2) && rows.length > 0 && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  All activities are within the tolerance band against their planned curves.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- roll-up + productivity ---------- */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="anim-up">
          <CardHeader title="Major Activity Roll-up" subtitle="Weighted contribution to overall project progress" icon="layers" />
          <ul className="divide-y divide-line">
            {rollup.map((a) => (
              <li key={a.name} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="w-[140px] min-w-0">
                  <p className="truncate text-[12.5px] font-bold text-navy-900">{a.name}</p>
                  <p className="text-[10px] text-navy-400">Weight {a.weight}%</p>
                </div>
                <div className="min-w-[170px] flex-1">
                  <ProgressBar planned={a.planned} actual={a.actual} />
                </div>
                <span className="font-mono text-[11.5px] text-navy-600">
                  {a.actual}% <span className="text-navy-300">/ {a.planned}%</span>
                </span>
                <StatusPill status={a.status} className="w-[112px] justify-center" />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="anim-up">
          <CardHeader title="Evidence Signal Check" subtitle="What the site records say about the gap" icon="wrench" />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Evidence records", v: evidence.length },
                { l: "Verified", v: evidence.filter((e) => e.verify === "verified").length },
                { l: "Avg manpower", v: avgLabour || "—" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-canvas p-3 ring-1 ring-line">
                  <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">{s.l}</p>
                  <p className="mt-0.5 text-[18px] font-bold text-navy-900 tabular">{s.v}</p>
                </div>
              ))}
            </div>
            {active.tasks.map((t) => {
              const planned = taskPlanned(t, today);
              const evCount = evidence.filter((e) => e.wbsId === t.id).length;
              const pct = planned > 0 ? (t.actual / planned) * 100 : 0;
              if (planned <= 0.5) return null;
              return (
                <div key={t.id}>
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-semibold">
                    <span className="truncate text-navy-700">
                      {t.id} · {t.name}
                    </span>
                    <span className="font-mono text-navy-500">
                      {pct.toFixed(0)}% <span className="text-navy-300">of plan</span>
                    </span>
                  </div>
                  <ProgressBar planned={100} actual={Math.min(pct, 100)} height="h-2.5" showMarker={false} />
                  <p className={cn("mt-1 text-[10.5px] font-semibold", pct < 80 ? "text-red-600" : pct < 95 ? "text-amber-600" : "text-emerald-600")}>
                    {evCount === 0
                      ? `No evidence captured — ${t.actual}% reported is unverified`
                      : `${evCount} evidence record${evCount === 1 ? "" : "s"} supporting ${t.actual}% actual`}
                  </p>
                </div>
              );
            })}
            {active.tasks.every((t) => taskPlanned(t, today) <= 0.5) && (
              <p className="rounded-xl bg-navy-50 p-3 text-[11.5px] leading-relaxed text-navy-600 ring-1 ring-navy-100">
                The baseline has not started yet — planned progress begins from {fmtISO(active.start)}. Once activities reach their
                planned windows, productivity and variance tracking activate automatically.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
