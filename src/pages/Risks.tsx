import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, Input, Modal, Select } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { SeverityMatrix } from "@/components/Charts";
import { useStore } from "@/store/store";
import { metrics, sevTone, type Risk } from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

export default function Risks({ setPage }: { setPage: (p: PK) => void }) {
  const { active, risksFor, actionsFor } = useStore();
  const [sev, setSev] = useState("All severities");
  const [cat, setCat] = useState("All categories");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Risk | null>(null);

  const risks = active ? risksFor(active.id) : [];
  const actions = active ? actionsFor(active.id) : [];

  const filtered = useMemo(
    () =>
      risks.filter(
        (r) =>
          (sev === "All severities" || sevTone[r.severity].label === sev) &&
          (cat === "All categories" || r.category === cat) &&
          (q.trim() === "" || `${r.id} ${r.title} ${r.detail} ${r.wbsId} ${r.owner}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [risks, sev, cat, q],
  );

  if (!active) return <ProjectRequired setPage={setPage} />;

  const m = metrics(active);
  const categories = ["All categories", ...Array.from(new Set(risks.map((r) => r.category)))];
  const critical = risks.filter((r) => r.severity === "critical");
  const warnings = risks.filter((r) => r.severity === "warning");
  const positive = risks.filter((r) => r.severity === "info");

  return (
    <div className="space-y-5">
      {/* ---------- summary ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Open signals", v: critical.length + warnings.length, i: "alert" as const, tone: "bg-red-500", s: "Across the active WBS" },
          { l: "Critical", v: critical.length, i: "trendDown" as const, tone: "bg-red-600", s: "Schedule & milestone" },
          { l: "Warnings", v: warnings.length, i: "bell" as const, tone: "bg-amber-500", s: "Evidence & deviation" },
          { l: "Positive signals", v: positive.length, i: "checkCircle" as const, tone: "bg-emerald-500", s: "On-plan work fronts" },
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

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ---------- alert feed ---------- */}
        <Card className="anim-up xl:col-span-2">
          <CardHeader title="Live Alert Feed" subtitle="Ordered by severity — generated from the live baseline and evidence" icon="bell" right={<Badge tone={critical.length ? "red" : warnings.length ? "amber" : "green"} dot>Auto-generated</Badge>} />
          {risks.length === 0 ? (
            <div className="grid place-items-center gap-2 px-6 py-16 text-center">
              <Icon name="checkCircle" className="h-8 w-8 text-emerald-500" />
              <p className="text-[13px] font-semibold text-navy-800">No risk signals right now</p>
              <p className="max-w-sm text-[11.5px] text-navy-500">
                Signals are raised automatically when an activity falls behind its planned curve, evidence goes missing, or the
                forecast completion slips beyond the baseline.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((r, i) => {
                const meta = sevTone[r.severity];
                return (
                  <li
                    key={r.id}
                    className="anim-up group cursor-pointer px-5 py-4 transition-colors hover:bg-navy-50/50"
                    style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                    onClick={() => setDetail(r)}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", meta.bg, meta.text, meta.ring)}>
                        <Icon name={r.severity === "info" ? "checkCircle" : r.severity === "warning" ? "bell" : "alert"} className="h-4 w-4" strokeWidth={1.9} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ring-1", meta.bg, meta.text, meta.ring)}>{r.id}</span>
                          <span className="rounded-md bg-navy-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-700">{r.wbsId}</span>
                          <span className="text-[10.5px] text-navy-400">Detected {r.detectedOn}</span>
                          <span className="ml-auto text-[10px] font-semibold text-navy-400 capitalize">{r.status}</span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-snug font-bold text-navy-900">{r.title}</p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-navy-600">{r.detail}</p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <Badge tone={meta.tone} dot>
                            {meta.label}
                          </Badge>
                          <Badge tone="slate">{r.category}</Badge>
                          <Badge tone={r.confidence === "High" ? "green" : r.confidence === "Medium" ? "amber" : "slate"}>Confidence {r.confidence}</Badge>
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 opacity-0 transition-opacity group-hover:opacity-100">
                            View signal & action <Icon name="chevronRight" className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {risks.length > 0 && filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-[12.5px] text-navy-500">No alerts match the filters.</div>
          )}
        </Card>

        {/* ---------- matrix + notes ---------- */}
        <div className="space-y-5">
          <Card className="anim-up">
            <CardHeader title="Severity Matrix" subtitle="Probability × impact · risk IDs plotted" icon="target" />
            <div className="p-4">
              {risks.length ? (
                <>
                  <SeverityMatrix data={risks} />
                  <div className="mt-3 flex flex-wrap gap-3 text-[10.5px] font-semibold text-navy-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded bg-red-50 ring-1 ring-red-200" /> Escalate
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded bg-amber-50 ring-1 ring-amber-200" /> Monitor
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded bg-emerald-50 ring-1 ring-emerald-200" /> Accept
                    </span>
                  </div>
                </>
              ) : (
                <p className="py-10 text-center text-[12px] text-navy-500">The matrix plots signals once activities are planned.</p>
              )}
            </div>
          </Card>

          <Card className="anim-up">
            <CardHeader title="How signals are raised" subtitle="Transparent, rule-based detection" icon="ai" />
            <div className="space-y-3 p-5">
              {[
                { t: "Activity gap > 7% against its planned curve", d: "Critical alert + corrective action created", tone: "bg-red-500" },
                { t: "Gap between 2% and 7%", d: "Warning to the activity owner and PMC", tone: "bg-amber-500" },
                { t: "No evidence for 5+ days on an active front", d: "Evidence-gap alert — progress cannot be verified", tone: "bg-amber-500" },
                { t: `Forecast slip beyond baseline (currently ${m.delayDays} days)`, d: "Early warning on the milestone date", tone: m.delayDays > 0 ? "bg-red-500" : "bg-emerald-500" },
                { t: "Gap within tolerance", d: "Positive signal — used as a benchmark", tone: "bg-emerald-500" },
              ].map((r) => (
                <div key={r.t} className="flex items-start gap-2.5">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", r.tone)} />
                  <div>
                    <p className="text-[11.5px] font-bold text-navy-800">{r.t}</p>
                    <p className="text-[11px] text-navy-500">{r.d}</p>
                  </div>
                </div>
              ))}
              <p className="rounded-xl bg-canvas p-3 text-[11px] leading-relaxed text-navy-600">
                SiteSync AI reports a <strong>possible contributing reason with a confidence level</strong>. It does not claim to
                know the exact cause of a delay — a human verifies before action is closed.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ---------- register table ---------- */}
      <Card className="anim-up">
        <CardHeader
          title="Risk Register"
          subtitle={`Consolidated register for ${active.code}`}
          icon="shield"
          right={
            <Button size="sm" variant="outline" icon="download" onClick={() => setPage("reports")}>
              Risk report
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
          <div className="relative min-w-[200px] flex-1">
            <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search risk, WBS or owner…" className="pl-9" />
          </div>
          <Select value={sev} onChange={(e) => setSev(e.target.value)} className="sm:w-[190px]">
            {["All severities", "Critical", "Warning", "Info / positive"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-[190px]">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center text-[12.5px] text-navy-500">No register entries match the filters.</div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <th className="px-5 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Risk / signal</th>
                  <th className="px-3 py-2.5">WBS</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Prob.</th>
                  <th className="px-3 py-2.5">Impact</th>
                  <th className="px-3 py-2.5">Owner</th>
                  <th className="px-5 py-2.5">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((r) => (
                  <tr key={r.id} className="cursor-pointer transition-colors hover:bg-navy-50/50" onClick={() => setDetail(r)}>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-bold ring-1", sevTone[r.severity].bg, sevTone[r.severity].text, sevTone[r.severity].ring)}>{r.id}</span>
                    </td>
                    <td className="max-w-[300px] px-3 py-3">
                      <p className="truncate text-[12.5px] font-semibold text-navy-900">{r.title}</p>
                      <p className="truncate text-[10.5px] text-navy-400">{r.evidenceDetected[0]}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11.5px] font-semibold text-navy-600">{r.wbsId}</td>
                    <td className="px-3 py-3 text-[11.5px] text-navy-600">{r.category}</td>
                    <td className="px-3 py-3">
                      <Badge tone={r.probability === "High" ? "red" : r.probability === "Medium" ? "amber" : "green"}>{r.probability}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={r.impact === "High" ? "red" : r.impact === "Medium" ? "amber" : "green"}>{r.impact}</Badge>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] font-semibold text-navy-800">{r.owner}</td>
                    <td className="px-5 py-3 text-[11px] font-bold text-navy-600 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------- detail modal ---------- */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        title={detail?.title ?? ""}
        subtitle={detail ? `${detail.id} · ${detail.wbsId} · detected ${detail.detectedOn}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Close
            </Button>
            <Button
              icon="actions"
              onClick={() => {
                setDetail(null);
                setPage("actions");
              }}
            >
              Open in Action Center
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={sevTone[detail.severity].tone} dot>
                {sevTone[detail.severity].label}
              </Badge>
              <Badge tone="slate">{detail.category}</Badge>
              <Badge tone={detail.confidence === "High" ? "green" : detail.confidence === "Medium" ? "amber" : "slate"}>AI confidence {detail.confidence}</Badge>
              <Badge tone="navy">Owner {detail.owner}</Badge>
            </div>
            <p className="text-[12.5px] leading-relaxed text-navy-700">{detail.detail}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">
                  <Icon name="camera" className="h-3.5 w-3.5" /> Evidence detected
                </p>
                <ul className="mt-1.5 space-y-1">
                  {detail.evidenceDetected.map((e) => (
                    <li key={e} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-navy-700">
                      <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-sky-600" strokeWidth={2.6} /> {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">
                  <Icon name="info" className="h-3.5 w-3.5" /> Possible contributing reason
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-navy-700">
                  {detail.possibleReason} Correlated from evidence patterns with <strong>{detail.confidence}</strong> confidence —
                  requires site verification before it is treated as the cause.
                </p>
              </div>
              <div className="rounded-xl bg-navy-50 p-3.5 ring-1 ring-navy-100 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <Icon name="actions" className="h-3.5 w-3.5" /> Recommended action
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed font-semibold text-navy-900">{detail.recommended}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">Linked actions</p>
              <ul className="space-y-2">
                {actions
                  .filter((a) => a.riskId === detail.id)
                  .map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line px-3 py-2.5">
                      <span className="font-mono text-[10.5px] font-bold text-navy-500">{a.id}</span>
                      <span className="min-w-0 flex-1 text-[12px] font-semibold text-navy-800">{a.action}</span>
                      <Badge tone={a.priority === "High" ? "red" : a.priority === "Medium" ? "amber" : "slate"}>{a.priority}</Badge>
                      <span className="font-mono text-[11px] text-navy-500">{a.due}</span>
                      <Badge tone={a.status === "done" ? "green" : a.status === "overdue" ? "red" : "sky"}>{a.status.replace("-", " ")}</Badge>
                    </li>
                  ))}
                {!actions.some((a) => a.riskId === detail.id) && (
                  <li className="rounded-xl bg-canvas px-3 py-2.5 text-[11.5px] text-navy-500">No action created yet for this signal.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
