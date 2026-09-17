import { useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/Icons";
import type { CurvePoint, GanttRow } from "@/data/model";

/* =========================================================
   1. Planned vs Actual S-curve (interactive)
   ========================================================= */
export function ProgressCurveChart({
  curve,
  height = 300,
  todayIndex,
}: {
  curve: CurvePoint[];
  height?: number;
  todayIndex?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 1000;
  const H = 320;
  const pad = { t: 18, r: 16, b: 34, l: 38 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  if (curve.length < 2) {
    return (
      <div className="grid place-items-center gap-2 py-14 text-center">
        <Icon name="progress" className="h-7 w-7 text-navy-300" />
        <p className="text-[13px] font-semibold text-navy-800">Not enough timeline data yet</p>
        <p className="max-w-sm text-[11.5px] text-navy-500">
          The S-curve appears once the project has a baseline start and finish date with at least one month of duration.
        </p>
      </div>
    );
  }

  const x = (i: number) => pad.l + (i / (curve.length - 1)) * iw;
  const y = (v: number) => pad.t + (1 - v / 100) * ih;

  const plannedPath = curve.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.planned).toFixed(1)}`).join(" ");
  const actualIdx = curve.map((d, i) => (d.actual !== null ? i : -1)).filter((i) => i >= 0);
  const actualPath = actualIdx.map((i, k) => `${k === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(curve[i].actual as number).toFixed(1)}`).join(" ");

  let gapArea = "";
  if (actualIdx.length > 1) {
    const fwd = actualIdx.map((i) => `L${x(i).toFixed(1)},${y(curve[i].actual as number).toFixed(1)}`).join(" ");
    const back = actualIdx
      .slice()
      .reverse()
      .map((i) => `L${x(i).toFixed(1)},${y(curve[i].planned).toFixed(1)}`)
      .join(" ");
    gapArea = `M${x(actualIdx[0])},${y(curve[actualIdx[0]].actual as number)} ${fwd} ${back} Z`;
  }

  const step = Math.max(1, Math.round(curve.length / 11));
  const today = todayIndex ?? actualIdx[actualIdx.length - 1] ?? 0;

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11px] font-semibold text-navy-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-navy-400" />
          Planned (baseline)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-sky-500" />
          Actual (evidence-based)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-red-100 ring-1 ring-red-200" />
          Gap / deviation
        </span>
        <span className="ml-auto hidden font-normal text-navy-400 sm:inline">Hover for month detail</span>
      </div>

      <div ref={wrapRef} className="relative w-full" onMouseMove={(e) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const rel = ((e.clientX - rect.left) / rect.width) * W;
        setHover(Math.max(0, Math.min(curve.length - 1, Math.round(((rel - pad.l) / iw) * (curve.length - 1)))));
      }} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Planned versus actual progress curve">
          <defs>
            <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {[0, 20, 40, 60, 80, 100].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e5eaf2" strokeWidth="1" />
              <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-navy-400" style={{ fontSize: 11, fontWeight: 600 }}>
                {v}
              </text>
            </g>
          ))}

          {curve.map((d, i) =>
            i % step === 0 ? (
              <text key={d.key} x={x(i)} y={H - 12} textAnchor="middle" className="fill-navy-400" style={{ fontSize: 10.5, fontWeight: 600 }}>
                {d.label}
              </text>
            ) : null,
          )}

          <line x1={x(today)} x2={x(today)} y1={pad.t} y2={H - pad.b} stroke="#0d1e35" strokeWidth="1" strokeDasharray="3 3" />
          <text x={x(today)} y={pad.t - 4} textAnchor="middle" className="fill-navy-800" style={{ fontSize: 10, fontWeight: 700 }}>
            TODAY
          </text>

          {gapArea && <path d={gapArea} fill="url(#gapFill)" />}
          <path d={plannedPath} fill="none" stroke="#5b88bd" strokeWidth="2.4" strokeDasharray="7 5" strokeLinecap="round" />
          {actualPath && <path d={actualPath} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" className="anim-draw" />}

          {actualIdx.map((i) => (
            <circle key={curve[i].key} cx={x(i)} cy={y(curve[i].actual as number)} r="3.4" fill="#fff" stroke="#0ea5e9" strokeWidth="2.2" />
          ))}

          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#92b3d8" strokeWidth="1" />
              <circle cx={x(hover)} cy={y(curve[hover].planned)} r="4.6" fill="#5b88bd" stroke="#fff" strokeWidth="2" />
              {curve[hover].actual !== null && (
                <circle cx={x(hover)} cy={y(curve[hover].actual as number)} r="5.2" fill="#0ea5e9" stroke="#fff" strokeWidth="2.2" />
              )}
            </g>
          )}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[172px] -translate-x-1/2 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-lift backdrop-blur"
            style={{ left: `${Math.min(Math.max((x(hover) / W) * 100, 12), 88)}%` }}
          >
            <p className="text-[11px] font-bold tracking-wide text-navy-900">{curve[hover].label}</p>
            <div className="mt-1.5 space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-navy-500">
                  <span className="h-0.5 w-3 rounded bg-navy-400" /> Planned
                </span>
                <span className="font-mono font-bold text-navy-800">{curve[hover].planned}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-navy-500">
                  <span className="h-0.5 w-3 rounded bg-sky-500" /> Actual
                </span>
                <span className="font-mono font-bold text-sky-600">{curve[hover].actual ?? "—"}%</span>
              </div>
              {curve[hover].actual !== null && (
                <div className="flex items-center justify-between gap-3 border-t border-line pt-1">
                  <span className="text-navy-500">Variance</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      (curve[hover].actual as number) - curve[hover].planned > 2
                        ? "text-emerald-600"
                        : curve[hover].planned - (curve[hover].actual as number) > 7
                          ? "text-red-600"
                          : "text-amber-600",
                    )}
                  >
                    {((curve[hover].actual as number) - curve[hover].planned).toFixed(1)}%
                  </span>
                </div>
              )}
              {curve[hover].evidence > 0 && (
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <span className="text-navy-500">Evidence · men</span>
                  <span className="font-mono font-semibold text-navy-700">
                    {curve[hover].evidence} · {curve[hover].labour}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   2. Radial gauge
   ========================================================= */
export function RadialGauge({
  value,
  planned,
  size = 168,
  label = "Actual Progress",
}: {
  value: number;
  planned: number;
  size?: number;
  label?: string;
}) {
  const r = 62;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#e3ecf7" strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#c3d6ec" strokeWidth="14" strokeDasharray={`${(planned / 100) * c} ${c}`} strokeLinecap="round" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,1,.36,1)" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[30px] leading-none font-bold tracking-tight text-navy-900 tabular">{value}%</span>
        <span className="mt-1 text-[10.5px] font-bold tracking-widest text-navy-400 uppercase">{label}</span>
        <span className="mt-1 text-[11px] font-semibold text-navy-500">Planned {planned}%</span>
      </div>
    </div>
  );
}

/* =========================================================
   3. Gantt chart
   ========================================================= */
export function GanttChart({ rows, totalDays, elapsedDays }: { rows: GanttRow[]; totalDays: number; elapsedDays: number }) {
  const tasks = rows;
  const months = useMemo(() => {
    const out: { key: string; label: string }[] = [];
    const count = Math.max(4, Math.min(14, Math.ceil(totalDays / 60)));
    const anchor = new Date();
    anchor.setMonth(anchor.getMonth() - Math.round((elapsedDays / Math.max(totalDays, 1)) * count));
    for (let i = 0; i <= count; i++) {
      const dt = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1);
      out.push({
        key: `${dt.getFullYear()}-${dt.getMonth()}`,
        label: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()]} '${String(dt.getFullYear()).slice(2)}`,
      });
    }
    return out;
  }, [totalDays, elapsedDays]);

  if (tasks.length === 0) {
    return (
      <div className="grid place-items-center gap-2 py-14 text-center">
        <Icon name="schedule" className="h-7 w-7 text-navy-300" />
        <p className="text-[13px] font-semibold text-navy-800">No activities in the schedule</p>
        <p className="max-w-sm text-[11.5px] text-navy-500">Add WBS activities to generate the Gantt timeline.</p>
      </div>
    );
  }

  const todayPct = Math.min((elapsedDays / Math.max(totalDays, 1)) * 100, 100);

  return (
    <div className="thin-scroll overflow-x-auto">
      <div className="min-w-[860px]">
        <div className="flex border-b border-line bg-navy-50/60">
          <div className="w-[268px] shrink-0 border-r border-line px-4 py-2 text-[10.5px] font-bold tracking-widest text-navy-500 uppercase">
            WBS / Activity
          </div>
          <div className="flex-1">
            <div className="flex">
              {months.map((m) => (
                <div key={m.key} className="flex-1 border-r border-line/70 py-2 text-center text-[10.5px] font-semibold text-navy-500 last:border-0">
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-[268px] flex">
            {months.map((m, i) => (
              <div key={m.key} className={cn("flex-1 border-r border-line/60", i % 2 === 1 && "bg-navy-50/30")} />
            ))}
          </div>

          <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-[268px] z-10">
            <div className="absolute top-0 bottom-0 w-px bg-red-500/70" style={{ left: `${todayPct}%` }}>
              <span className="absolute -top-0.5 -left-4 rounded bg-red-500 px-1 py-px text-[9px] font-bold text-white">TODAY</span>
            </div>
          </div>

          {tasks.map((t, idx) => {
            const l = t.left;
            const width = Math.max(t.width, 2);
            const fill = t.planned > 0 ? Math.min((t.actual / t.planned) * 100, 100) : 0;
            const barTone =
              t.status === "completed"
                ? "bg-teal-500"
                : t.status === "critical"
                  ? "bg-red-500"
                  : t.status === "warning"
                    ? "bg-amber-500"
                    : t.status === "on-track"
                      ? "bg-emerald-500"
                      : "bg-navy-300";
            return (
              <div key={t.id} className={cn("group relative flex items-stretch border-b border-line/70 hover:bg-navy-50/50", idx % 2 === 1 && "bg-navy-50/20")}>
                <div className="w-[268px] shrink-0 border-r border-line px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-navy-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-700">{t.id}</span>
                    <span className="truncate text-[12px] font-semibold text-navy-800">{t.name}</span>
                  </div>
                  <p className="mt-0.5 truncate pl-0.5 text-[10.5px] text-navy-400">
                    {t.startLabel} → {t.finishLabel}
                  </p>
                </div>
                <div className="relative flex-1 py-2.5">
                  <div
                    className="absolute top-1/2 h-[18px] -translate-y-1/2 overflow-hidden rounded-md bg-navy-200/70 ring-1 ring-navy-300/60 transition-all duration-300 group-hover:ring-navy-400"
                    style={{ left: `${l}%`, width: `${width}%` }}
                  >
                    <div className={cn("h-full", barTone)} style={{ width: `${fill}%`, transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
                  </div>
                  <span
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded font-mono text-[10px] font-bold whitespace-nowrap",
                      l + width > 84 ? "bg-white/80 px-1 text-navy-700" : "text-navy-600",
                    )}
                    style={l + width > 84 ? { right: `${100 - l + 0.5}%` } : { left: `calc(${l}% + ${width}% + 6px)` }}
                  >
                    {t.actual}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-4 py-3 text-[11px] font-semibold text-navy-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-emerald-500" /> On Track</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-amber-500" /> Warning</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-red-500" /> Critical</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-teal-500" /> Completed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-navy-300" /> Not started</span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-normal text-navy-400">
            Outline = planned window · Fill = actual progress · Red line = today
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   4. Diverging variance bars
   ========================================================= */
export function VarianceBars({ items }: { items: { id: string; name: string; variance: number }[] }) {
  const max = useMemo(() => Math.max(...items.map((i) => Math.abs(i.variance)), 5), [items]);
  if (items.length === 0) return <p className="py-10 text-center text-[12.5px] text-navy-500">No activities to compare yet.</p>;
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const pct = (Math.abs(it.variance) / max) * 50;
        const neg = it.variance < 0;
        return (
          <div key={it.id} className="anim-up flex items-center gap-3" style={{ animationDelay: `${i * 45}ms` }}>
            <span className="w-[62px] shrink-0 truncate font-mono text-[11px] font-bold text-navy-500">{it.id}</span>
            <span className="hidden w-[132px] shrink-0 truncate text-[12px] font-semibold text-navy-700 sm:block">{it.name}</span>
            <div className="relative h-6 flex-1 rounded-lg bg-navy-50/80">
              <div className="absolute inset-y-0 left-1/2 w-px bg-navy-200" />
              <div
                className={cn("anim-grow absolute inset-y-1 rounded-md", neg ? "bg-red-400/90" : "bg-emerald-500/90")}
                style={neg ? { right: "50%", width: `${pct}%` } : { left: "50%", width: `${pct}%` }}
              />
            </div>
            <span className={cn("w-[58px] shrink-0 text-right font-mono text-[11.5px] font-bold tabular", neg ? "text-red-600" : "text-emerald-600")}>
              {it.variance > 0 ? "+" : ""}
              {it.variance.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   5. Grouped monthly bars
   ========================================================= */
export function MonthlyBars({ curve }: { curve: CurvePoint[] }) {
  const data = curve.filter((c) => c.actual !== null).slice(-10);
  if (data.length === 0)
    return (
      <div className="grid place-items-center gap-2 py-12 text-center">
        <Icon name="progress" className="h-7 w-7 text-navy-300" />
        <p className="text-[13px] font-semibold text-navy-800">No monthly actuals yet</p>
        <p className="max-w-sm text-[11.5px] text-navy-500">Enter progress against an activity or upload site evidence to build the monthly chart.</p>
      </div>
    );
  const max = Math.max(...data.map((d) => d.planned), 1);
  return (
    <div className="flex h-[188px] items-end gap-2 sm:gap-3">
      {data.map((d) => (
        <div key={d.key} className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
          <div className="relative flex h-full items-end justify-center gap-[3px]">
            <div className="w-1/3 rounded-t bg-navy-300 transition-all duration-300 group-hover:bg-navy-400" style={{ height: `${(d.planned / max) * 100}%` }} title={`Planned ${d.planned}%`} />
            <div className="w-1/3 rounded-t bg-sky-500 transition-all duration-300 group-hover:bg-sky-600" style={{ height: `${((d.actual ?? 0) / max) * 100}%` }} title={`Actual ${d.actual ?? 0}%`} />
            <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {d.actual}/{d.planned}%
            </span>
          </div>
          <span className="truncate text-center text-[9.5px] font-semibold text-navy-400">{d.label.split(" ")[0]}</span>
          <span className="text-center text-[9px] text-navy-300">'{d.label.split(" ")[1]}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   6. Severity matrix
   ========================================================= */
export function SeverityMatrix({ data }: { data: { id: string; probability: string; impact: string; severity: string; title: string }[] }) {
  const axes = ["Low", "Medium", "High"];
  const cellTone = (p: number, im: number) => {
    const score = p + im;
    if (score >= 5) return "bg-red-50 ring-red-200";
    if (score >= 3) return "bg-amber-50 ring-amber-200";
    return "bg-emerald-50 ring-emerald-200";
  };
  return (
    <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5">
      <div />
      {axes.map((a) => (
        <div key={a} className="pb-1 text-center text-[10.5px] font-bold tracking-wide text-navy-400 uppercase">
          Impact {a}
        </div>
      ))}
      {[2, 1, 0].map((p) => (
        <div key={p} className="contents">
          <div className="flex items-center pr-2 text-right text-[10.5px] font-bold tracking-wide text-navy-400 uppercase">Prob {axes[p]}</div>
          {[0, 1, 2].map((im) => {
            const items = data.filter((d) => d.probability === axes[p] && d.impact === axes[im]);
            return (
              <div key={im} className={cn("min-h-[62px] rounded-lg p-1.5 ring-1", cellTone(p, im))}>
                <div className="flex flex-wrap gap-1">
                  {items.map((it) => (
                    <span key={it.id} title={it.title} className="cursor-default rounded bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-700 ring-1 ring-navy-200 transition-transform hover:-translate-y-0.5">
                      {it.id}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
