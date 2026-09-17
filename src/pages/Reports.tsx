import { useState } from "react";
import { Icon, type IconName } from "@/components/Icons";
import { Badge, Button, Card, CardHeader, Modal } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import {
  activityRollup,
  fmtISO,
  ganttRows,
  metrics,
  monthlyCurve,
  reportDefs,
  sevTone,
  todayISO,
  type ReportDef,
} from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

function buildReport(def: ReportDef, ctx: ReturnType<typeof useStore> & { id: string }) {
  const active = ctx.projects.find((p) => p.id === ctx.activeId)!;
  const evidence = ctx.evidenceFor(active.id);
  const risks = ctx.risksFor(active.id);
  const actions = ctx.actionsFor(active.id);
  const m = metrics(active);
  const rollup = activityRollup(active);
  const rows = ganttRows(active);
  const curve = monthlyCurve(active, evidence);
  const today = fmtISO(todayISO());

  const tr = (cells: (string | number)[]) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
  const table = (head: string[], body: (string | number)[][]) =>
    `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body.map(tr).join("")}</tbody></table>`;

  const wbsTable = table(
    ["WBS", "Activity", "Planned start", "Planned finish", "Weight", "Planned", "Actual", "Var", "Status"],
    rows.map((r) => [r.id, r.name, r.startLabel, r.finishLabel, `${r.weight}%`, `${r.planned}%`, `${r.actual}%`, `${(r.actual - r.planned).toFixed(1)}%`, r.status.replace("-", " ")]),
  );
  const riskTable = table(
    ["ID", "Risk / signal", "WBS", "Severity", "Prob / Impact", "Confidence", "Owner", "State"],
    risks.map((r) => [r.id, r.title, r.wbsId, r.severity, `${r.probability} / ${r.impact}`, r.confidence, r.owner, r.status]),
  );
  const evTable = table(
    ["ID", "WBS", "Captured", "GPS", "Chainage", "Labour", "Progress", "Uploaded by", "Verification"],
    evidence.map((e) => [e.id, e.wbsId, e.dateTime, e.gps, e.chainage || "—", `${e.skilled + e.unskilled} nos`, `+${e.progress}%`, e.uploadedBy, e.verify]),
  );
  const actTable = table(
    ["Action", "Risk / issue", "Recommended action", "Owner", "Priority", "Due", "Status"],
    actions.map((a) => [a.id, a.issue, a.action, a.owner, a.priority, a.due, a.status.replace("-", " ")]),
  );
  const curveTable = table(
    ["Month", "Planned %", "Actual %", "Variance", "Evidence", "Avg manpower"],
    curve
      .filter((c) => c.actual !== null)
      .map((c) => [c.label, `${c.planned}%`, `${c.actual}%`, `${((c.actual as number) - c.planned).toFixed(1)} pts`, c.evidence, c.labour || "—"]),
  );

  const meta = `
  <div class="meta">
    <div>Project ID<b>${active.id} · ${active.code}</b></div>
    <div>Project type<b>${active.type}</b></div>
    <div>Executing agency<b>${active.agency}</b></div>
    <div>Project manager<b>${active.manager}${active.managerRole ? ` · ${active.managerRole}` : ""}</b></div>
    <div>Location<b>${active.location}, ${active.state}</b></div>
    <div>Baseline<b>${fmtISO(active.start)} → ${fmtISO(active.finish)}</b></div>
    <div>Sanctioned cost<b>${active.budget ? `₹${active.budget.toLocaleString("en-IN")} Cr` : "—"}</b></div>
    <div>Status date<b>${today}</b></div>
    <div>Generated<b>${def.cadence.split("·")[0].trim()}</b></div>
  </div>`;

  const intro = `Planned progress <b>${m.planned}%</b> · actual progress <b>${m.actual}%</b> · schedule variance <b>−${m.gap} pts</b> · SPI <b>${m.spi}</b> · forecast completion <b>${fmtISO(m.forecastFinish)}</b>${m.delayDays > 0 ? ` (${m.delayDays} days beyond baseline)` : " (within baseline)"}.`;

  const blocks: Record<string, string[]> = {
    "RPT-DPR": [
      `<h3>1. Executive summary</h3><p>${intro}</p><p>Day ${m.elapsedDays} of ${m.totalDays} (${m.timeElapsedPct}% of the baseline duration elapsed). ${active.tasks.length} activities are baselined, ${evidence.length} evidence records support the reported progress.</p>`,
      `<h3>2. Manpower & plant</h3><p>${evidence.length ? `Average manpower recorded across evidence: <b>${Math.round(evidence.reduce((s, e) => s + e.skilled + e.unskilled, 0) / evidence.length)} workers</b>. Plant recorded: ${[...new Set(evidence.map((e) => e.equipment).filter(Boolean))].join("; ") || "not recorded"}.` : "No manpower recorded yet — upload site evidence to populate this section."}</p>`,
      `<h3>3. Evidence log</h3>${evidence.length ? evTable : "<p>No evidence captured.</p>"}`,
      `<h3>4. Blockers</h3>${actions.length ? actTable : "<p>No blockers raised.</p>"}`,
      `<h3>5. Work fronts</h3>${wbsTable}`,
    ],
    "RPT-WPR": [
      `<h3>1. S-curve snapshot</h3><p>${intro}</p>${curveTable}`,
      `<h3>2. WBS variance</h3>${wbsTable}`,
      `<h3>3. Top signals this period</h3>${risks.length ? riskTable : "<p>No signals raised.</p>"}`,
      `<h3>4. Focus areas next period</h3><ul>${rows.filter((r) => r.planned - r.actual > 2).map((r) => `<li>${r.id} — ${r.name}: recover ${(r.planned - r.actual).toFixed(1)} pts with ${r.owner}</li>`).join("") || "<li>All fronts within tolerance.</li>"}</ul>`,
    ],
    "RPT-PVA": [
      `<h3>1. Earned value summary</h3><p>Planned value ${m.planned}% · earned value ${m.actual}% · schedule variance −${m.gap} pts · SPI ${m.spi}. Earned schedule ${m.earnedDays} of ${m.elapsedDays} elapsed days.</p>`,
      `<h3>2. Variance by WBS</h3>${wbsTable}`,
      `<h3>3. Monthly planned vs actual</h3>${curveTable}`,
      `<h3>4. Forecast</h3><p>At the current run-rate the project completes on <b>${fmtISO(m.forecastFinish)}</b>${m.delayDays > 0 ? `, ${m.delayDays} days after the contractual date of ${fmtISO(active.finish)}` : ", within the contractual date"}. Major activity roll-up: ${rollup.map((r) => `${r.name} ${r.actual}%/${r.planned}%`).join(" · ")}.</p>`,
      `<h3>5. Basis of the numbers</h3><p>Planned progress is computed from each activity's baseline dates and weight. Actual progress is the progress recorded against geo-tagged site evidence and verified by the PMC.</p>`,
    ],
    "RPT-RSK": [
      `<h3>1. Risk register</h3>${risks.length ? riskTable : "<p>No live signals.</p>"}`,
      `<h3>2. Severity matrix summary</h3><p>${risks.length ? `${risks.filter((r) => r.severity === "critical").length} critical, ${risks.filter((r) => r.severity === "warning").length} warning and ${risks.filter((r) => r.severity === "info").length} positive signal(s). High-probability / high-impact: ${risks.filter((r) => r.probability === "High" && r.impact === "High").map((r) => r.id).join(", ") || "none"}.` : "No signals to plot."}</p>`,
      `<h3>3. Mitigation tracker</h3>${actions.length ? actTable : "<p>No actions created.</p>"}`,
      `<h3>4. Basis of AI conclusions</h3><p>Each signal lists the evidence detected, a possible contributing reason, a confidence level and the verification required. The engine does not assert a definitive cause of delay.</p>`,
    ],
    "RPT-EVD": [
      `<h3>1. Evidence index (latest first)</h3>${evidence.length ? evTable : "<p>No evidence records yet.</p>"}`,
      `<h3>2. Verification status</h3><p>${evidence.filter((e) => e.verify === "verified").length} verified · ${evidence.filter((e) => e.verify === "pending").length} pending review · ${evidence.filter((e) => e.verify === "flagged").length} flagged. Flagged records are excluded from verified progress until reconciled by the PMC.</p>`,
      `<h3>3. GPS audit trail</h3><p>Each record stores latitude/longitude, accuracy, device timestamp, uploader identity and chainage. Records captured outside a geo-fenced work front are auto-flagged.</p>`,
      `<h3>4. Coverage gaps</h3><ul>${rows.filter((r) => !evidence.some((e) => e.wbsId === r.id) && r.planned > 0.5).map((r) => `<li>${r.id} — ${r.name}: no evidence captured for an active front</li>`).join("") || "<li>All active fronts have evidence coverage.</li>"}</ul>`,
    ],
  };

  return `<!doctype html><html><head><meta charset="utf-8"><title>${def.name} — ${active.name}</title>
<style>
  body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#0d1e35;margin:0;padding:34px;max-width:1000px}
  h1{font-size:22px;margin:0 0 4px}
  h3{font-size:13px;margin:22px 0 6px;color:#1c3c66;text-transform:uppercase;letter-spacing:.06em}
  p{font-size:12.5px;line-height:1.65;margin:6px 0}
  li{font-size:12.5px;line-height:1.6}
  .brand{display:flex;align-items:center;gap:12px;border-bottom:3px solid #0d1e35;padding-bottom:14px;margin-bottom:14px}
  .logo{width:44px;height:44px;border-radius:11px;background:#0d1e35;color:#fff;display:grid;place-items:center;font-weight:800;font-size:15px}
  .muted{color:#5b88bd;font-size:11px;letter-spacing:.14em;font-weight:700}
  .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0;background:#f5f7fb;border:1px solid #e5eaf2;border-radius:12px;padding:14px}
  .meta div{font-size:11px}
  .meta b{display:block;font-size:12.5px}
  table{width:100%;border-collapse:collapse;font-size:10.5px;margin-top:6px}
  th{background:#142a49;color:#fff;text-align:left;padding:6px 7px;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase}
  td{border-bottom:1px solid #e5eaf2;padding:6px 7px;vertical-align:top}
  .foot{margin-top:26px;border-top:1px solid #e5eaf2;padding-top:10px;font-size:10.5px;color:#5b88bd}
</style></head><body>
<div class="brand"><div class="logo">SS</div><div>
  <div class="muted">SITESYNC AI · PLAN • TRACK • BUILD BETTER</div>
  <h1>${def.name}</h1>
  <p style="margin:2px 0 0">${active.name}</p>
</div></div>
${meta}
<p style="background:#f5f7fb;border-left:3px solid #0ea5e9;padding:10px 12px;border-radius:8px">${intro}</p>
${(blocks[def.id] ?? []).join("")}
<div class="foot">Generated by SiteSync AI planning-to-execution bridge · Signatures: Site Engineer ______ · PMC Verifier ______ · Project Manager ______</div>
</body></html>`;
}

export default function Reports({ setPage }: { setPage: (p: PK) => void }) {
  const store = useStore();
  const { active } = store;
  const [preview, setPreview] = useState<ReportDef | null>(null);

  if (!active) return <ProjectRequired setPage={setPage} />;

  const evidence = store.evidenceFor(active.id);
  const risks = store.risksFor(active.id);
  const actions = store.actionsFor(active.id);
  const m = metrics(active);

  const download = (def: ReportDef) => {
    const blob = new Blob([buildReport(def, { ...store, id: active.id })], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.code}-${def.id}-${todayISO()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = [
    { l: "Project", v: active.code },
    { l: "Actual / planned", v: `${m.actual}% / ${m.planned}%` },
    { l: "Evidence records", v: String(evidence.length) },
    { l: "Live signals", v: String(risks.filter((r) => r.severity !== "info").length) },
    { l: "Open actions", v: String(actions.filter((a) => a.status !== "done").length) },
  ];

  return (
    <div className="space-y-5">
      <Card className="anim-up">
        <CardHeader
          title="Report Library"
          subtitle="Generated live from the schedule, evidence, risk and action data"
          icon="report"
          right={
            <>
              <Badge tone="green" dot>
                Live data
              </Badge>
              <Button size="sm" variant="outline" icon="print" onClick={() => window.print()}>
                Print view
              </Button>
            </>
          }
        />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
          {summary.map((s) => (
            <div key={s.l} className="rounded-xl bg-canvas p-3.5 ring-1 ring-line">
              <p className="text-[10px] font-bold tracking-wider text-navy-400 uppercase">{s.l}</p>
              <p className="mt-1 text-[15px] font-bold text-navy-900">{s.v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {reportDefs.map((r, i) => (
          <Card key={r.id} hover className="anim-up flex flex-col p-5" style={{ animationDelay: `${i * 55}ms` }}>
            <div className="flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-800 text-white">
                <Icon name={r.icon as IconName} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-extrabold tracking-tight text-navy-900">{r.name}</h3>
                <p className="mt-0.5 text-[11px] font-semibold text-sky-700">{r.cadence}</p>
              </div>
              <Badge tone="slate">{r.sections.length} sections</Badge>
            </div>

            <p className="mt-3 text-[11.5px] leading-relaxed text-navy-600">{r.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.sections.map((s) => (
                <span key={s} className="rounded-lg bg-navy-50 px-2 py-1 text-[10.5px] font-semibold text-navy-600 ring-1 ring-navy-100">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10.5px] text-navy-400">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="database" className="h-3.5 w-3.5" /> Built from {active.id}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                <Icon name="checkCircle" className="h-3.5 w-3.5" /> Ready
              </span>
            </div>

            <div className="mt-3.5 flex gap-2">
              <Button size="sm" variant="outline" icon="eye" className="flex-1" onClick={() => setPreview(r)}>
                Preview
              </Button>
              <Button size="sm" icon="download" className="flex-1" onClick={() => download(r)}>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="anim-up xl:col-span-2">
          <CardHeader title="Report Schedule" subtitle="Automatic generation and circulation" icon="calendar" />
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line bg-navy-50/60 text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">
                  <th className="px-5 py-2.5">Report</th>
                  <th className="px-3 py-2.5">Frequency</th>
                  <th className="px-3 py-2.5">Recipients</th>
                  <th className="px-5 py-2.5">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { r: "Daily Progress Report", f: "Daily 19:00 IST", to: "PM, PMC, Site Engineers", ch: "Email + PDF" },
                  { r: "Weekly Progress Report", f: "Mon 09:00 IST", to: "PMU, Superintending Engineer", ch: "Email + PDF" },
                  { r: "Planned vs Actual Report", f: "On demand", to: "PM, Planning Cell", ch: "Download" },
                  { r: "Risk Report", f: "Fri 17:00 IST", to: "PM, Risk Owner", ch: "Email + PDF" },
                  { r: "Site Evidence Report", f: "On demand", to: "Auditor, QA", ch: "Download" },
                ].map((x) => (
                  <tr key={x.r} className="transition-colors hover:bg-navy-50/50">
                    <td className="px-5 py-3 text-[12.5px] font-semibold text-navy-900">{x.r}</td>
                    <td className="px-3 py-3 text-[11.5px] text-navy-600">{x.f}</td>
                    <td className="px-3 py-3 text-[11.5px] text-navy-600">{x.to}</td>
                    <td className="px-5 py-3">
                      <Badge tone="navy">{x.ch}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="anim-up">
          <CardHeader title="Audit & Compliance" subtitle="Traceability built into every report" icon="shield" />
          <div className="space-y-3 p-5">
            {[
              { t: "Evidence-linked numbers", d: "Every progress figure cites the records behind it." },
              { t: "Immutable verification log", d: "Approvals and flags are appended, never overwritten." },
              { t: "Offline capable", d: "Reports can be generated on a district server without internet." },
              { t: "Signature block", d: "Site engineer, PMC and PM sign-off lines on every report." },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-2.5 rounded-xl bg-canvas p-3">
                <Icon name="checkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[12px] font-bold text-navy-900">{x.t}</p>
                  <p className="text-[11px] leading-snug text-navy-500">{x.d}</p>
                </div>
              </div>
            ))}
            <Button variant="soft" size="sm" className="w-full" icon="camera" onClick={() => setPage("evidence")}>
              Open evidence register
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        wide
        title={preview?.name ?? ""}
        subtitle={preview ? `${preview.cadence} · status date ${fmtISO(todayISO())}` : ""}
        footer={
          <>
            <Button variant="outline" icon="print" onClick={() => window.print()}>
              Print
            </Button>
            <Button icon="download" onClick={() => preview && download(preview)}>
              Download report
            </Button>
          </>
        }
      >
        {preview && (
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[11px] font-bold">SS</span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-sky-300">SITESYNC AI</p>
                  <p className="text-[12.5px] font-bold">{preview.name}</p>
                </div>
              </div>
              <span className="font-mono text-[10.5px] text-navy-200">{active.code}</span>
            </div>
            <div
              className={cn(
                "thin-scroll max-h-[54vh] overflow-y-auto bg-white px-5 py-4 text-[12px] leading-relaxed text-navy-700",
                "[&_h3]:mt-4 [&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:tracking-wider [&_h3]:text-navy-500 [&_h3]:uppercase",
                "[&_strong]:text-navy-900",
              )}
            >
              <p className="rounded-lg bg-canvas p-3 text-[11.5px]">
                Planned <strong>{m.planned}%</strong> · actual <strong>{m.actual}%</strong> · variance{" "}
                <strong>−{m.gap} pts</strong> · SPI <strong>{m.spi}</strong> · forecast <strong>{fmtISO(m.forecastFinish)}</strong>{" "}
                {m.delayDays > 0 ? `(+${m.delayDays} days)` : "(on schedule)"}
              </p>
              {preview.sections.map((s, i) => (
                <div key={s} className="mt-3 border-t border-line pt-3">
                  <h3 className="mb-1.5">
                    {i + 1}. {s}
                  </h3>
                  <p className="text-[11.5px] text-navy-600">{sectionText(s, { active, evidence, risks, actions, m, preview })}</p>
                </div>
              ))}
              <p className="mt-4 rounded-lg bg-navy-50 p-3 text-[11px] text-navy-600 ring-1 ring-navy-100">
                <strong>AI note:</strong> where a delay is detected, this report states the evidence observed, a possible contributing
                reason, a confidence level and the verification required. It does not claim to identify the exact cause of delay.
              </p>
              <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
                {["Site Engineer", "PMC Verifier", "Project Manager"].map((s) => (
                  <div key={s}>
                    <div className="h-8 border-b border-dashed border-navy-300" />
                    <p className="mt-1 text-[10.5px] font-semibold text-navy-500">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function sectionText(
  s: string,
  ctx: {
    active: NonNullable<ReturnType<typeof useStore>["active"]>;
    evidence: ReturnType<typeof useStore>["evidenceFor"] extends (id: string) => infer R ? R : never;
    risks: ReturnType<typeof useStore>["risksFor"] extends (id: string) => infer R ? R : never;
    actions: ReturnType<typeof useStore>["actionsFor"] extends (id: string) => infer R ? R : never;
    m: ReturnType<typeof metrics>;
    preview: ReportDef | null;
  },
) {
  const { active, evidence, risks, actions, m } = ctx;
  switch (s) {
    case "Executive summary":
      return `Day ${m.elapsedDays} of ${m.totalDays} (${m.timeElapsedPct}% of the baseline elapsed). ${active.tasks.length} activities baselined; ${evidence.length} evidence records support reported progress. ${risks.filter((r) => r.severity !== "info").length} live signal(s) require attention.`;
    case "Manpower & plant":
      return evidence.length
        ? `Average manpower across evidence records: ${Math.round(evidence.reduce((a, e) => a + e.skilled + e.unskilled, 0) / evidence.length)} workers. Plant recorded: ${[...new Set(evidence.map((e) => e.equipment).filter(Boolean))].join("; ") || "not recorded"}.`
        : "No manpower recorded yet — upload site evidence to populate this section.";
    case "Evidence log":
    case "Evidence index":
      return evidence.length
        ? evidence.map((e) => `${e.id} · ${e.wbsId} · ${e.dateTime} · ${e.chainage || "geo-tagged"} · ${e.skilled + e.unskilled} labour · +${e.progress}%`).join("  |  ")
        : "No evidence captured yet.";
    case "Blockers":
      return actions.length ? actions.map((a) => `${a.id} ${a.issue} → ${a.action} (${a.owner}, due ${a.due}, ${a.status})`).join("  |  ") : "No blockers raised.";
    case "Weather & downtime":
      return "Recorded manually by the site engineer against each day's evidence; downtime beyond the contract allowance is escalated in the weekly review.";
    case "S-curve snapshot":
      return `Planned ${m.planned}% vs actual ${m.actual}% with SPI ${m.spi}. Earned schedule ${m.earnedDays} of ${m.elapsedDays} elapsed days.`;
    case "WBS variance":
      return `${active.tasks.length} activities. Largest deviation: ${
        ganttRows(active)
          .filter((r) => r.planned - r.actual > 0)
          .sort((a, b) => b.planned - b.actual - (a.planned - a.actual))[0]
          ? `${ganttRows(active)[0].id} at −${(ganttRows(active).sort((a, b) => b.planned - b.actual - (a.planned - a.actual))[0].planned - ganttRows(active).sort((a, b) => b.planned - b.actual - (a.planned - a.actual))[0].actual).toFixed(1)} pts`
          : "none"
      }.`;
    case "Top 3 risks":
    case "Open risks":
      return risks.length ? risks.slice(0, 3).map((r) => `${r.id} ${r.title} (${sevTone[r.severity].label}, confidence ${r.confidence})`).join(" · ") : "No signals raised.";
    case "Next week plan":
      return "Derived from the activities whose planned window covers the coming period, prioritised by variance and open actions.";
    case "Variance table":
    case "Monthly planned vs actual":
      return "See the downloadable report for the full WBS and month-wise variance tables generated from the live baseline.";
    case "Earned value indices":
      return `PV ${m.planned}% · EV ${m.actual}% · SV −${m.gap} pts · SPI ${m.spi} · forecast completion ${fmtISO(m.forecastFinish)} (${m.delayDays > 0 ? `+${m.delayDays} days` : "on schedule"}).`;
    case "Forecast":
      return `At the current run-rate the project completes on ${fmtISO(m.forecastFinish)} against a baseline of ${fmtISO(active.finish)}.`;
    case "Recovery options":
      return "Options considered: additional plant/gang on the lagging front, re-sequencing downstream activities, or re-baselining affected milestones with PMC concurrence.";
    case "Severity matrix":
      return `${risks.filter((r) => r.severity === "critical").length} critical, ${risks.filter((r) => r.severity === "warning").length} warning, ${risks.filter((r) => r.severity === "info").length} positive signal(s).`;
    case "Mitigation tracker":
      return actions.length ? `${actions.filter((a) => a.status !== "done").length} open of ${actions.length} actions. ${actions.filter((a) => a.status === "overdue").length} overdue.` : "No actions created.";
    case "Ageing analysis":
      return "Signals are timestamped on detection and tracked until closure; escalation triggers after the due date passes.";
    case "Verification status":
      return `${evidence.filter((e) => e.verify === "verified").length} verified · ${evidence.filter((e) => e.verify === "pending").length} pending · ${evidence.filter((e) => e.verify === "flagged").length} flagged.`;
    case "GPS audit trail":
      return "Each record stores latitude/longitude, accuracy, device timestamp, uploader identity and chainage reference.";
    case "Coverage gaps":
      return "Active fronts without any evidence capture are listed in the downloadable report so verification can be requested.";
    default:
      return "Generated from the live project baseline, evidence register and risk register.";
  }
}
