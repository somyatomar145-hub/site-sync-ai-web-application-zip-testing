/* ------------------------------------------------------------------
   SiteSync AI — data model, templates and derived computations.
   Persistence happens in src/store/store.tsx (localStorage, mirroring
   the SQLite tables used by the Python backend).
-------------------------------------------------------------------*/

export type Status = "on-track" | "warning" | "critical" | "not-started" | "completed";
export type VerifyState = "verified" | "pending" | "flagged";

export interface WbsTask {
  id: string;
  name: string;
  group: string;
  start: string; // ISO yyyy-mm-dd
  finish: string; // ISO yyyy-mm-dd
  weight: number; // share of overall project progress (%)
  actual: number; // verified actual progress (%)
  owner: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  type: string;
  agency: string;
  manager: string;
  managerRole: string;
  managerEmail: string;
  managerPhone: string;
  location: string;
  state: string;
  chainage: string;
  start: string; // ISO
  finish: string; // ISO
  budget: number; // ₹ crore
  funding: string;
  description: string;
  createdAt: string;
  tasks: WbsTask[];
}

export interface Evidence {
  id: string;
  projectId: string;
  wbsId: string;
  type: "Photo" | "Video";
  image: string;
  dateTime: string;
  capturedAt: string; // ISO date used for the monthly curve
  gps: string;
  chainage: string;
  uploadedBy: string;
  role: string;
  verify: VerifyState;
  skilled: number;
  unskilled: number;
  equipment: string;
  remarks: string;
  progress: number; // % progress claimed for the activity
  aiTag: string;
}

export type Severity = "critical" | "warning" | "info";

export interface Risk {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  category: string;
  wbsId: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  detectedOn: string;
  owner: string;
  status: "open" | "monitoring" | "mitigated";
  confidence: "High" | "Medium" | "Low";
  evidenceDetected: string[];
  possibleReason: string;
  recommended: string;
  variance: number;
}

export interface ActionItem {
  id: string;
  riskId: string;
  issue: string;
  action: string;
  owner: string;
  ownerRole: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  status: "open" | "in-progress" | "done" | "overdue";
  source: string;
  wbsId: string;
}

/* ---------------- reference data ---------------- */

export const PROJECT_TYPES = [
  "Highway / Expressway",
  "Bridge / Flyover",
  "Metro / Viaduct",
  "Building / Institutional",
  "Irrigation / Canal",
  "Water Supply / Industrial",
] as const;

export const STAFF = [
  { name: "Er. Ananya Deshmukh", role: "Project Manager" },
  { name: "Er. Rohan Kulkarni", role: "Deputy Project Manager" },
  { name: "Er. Mohit Bhosale", role: "Site Engineer" },
  { name: "Er. Sachin Jadhav", role: "Site Engineer" },
  { name: "Er. Kavya Nair", role: "Structural Engineer" },
  { name: "Er. Priya Shaikh", role: "Site Engineer" },
  { name: "Er. A. Verma", role: "Electrical Engineer" },
  { name: "V. Rane", role: "QA Lead" },
  { name: "R. Kamble", role: "Site Supervisor" },
];

interface TplRow {
  name: string;
  group: string;
  from: number;
  to: number;
  weight: number;
}

export const WBS_TEMPLATES: Record<string, TplRow[]> = {
  "Highway / Expressway": [
    { name: "Site Preparation, Hoarding & Survey", group: "Site Preparation", from: 0, to: 30, weight: 5 },
    { name: "Earthwork in Embankment & Subgrade", group: "Earthwork", from: 15, to: 120, weight: 18 },
    { name: "Granular Base & Binder Course", group: "Pavement", from: 90, to: 220, weight: 16 },
    { name: "Bituminous Concrete (BC) Layer", group: "Pavement", from: 180, to: 300, weight: 12 },
    { name: "Culverts & Minor Structures", group: "Structures", from: 40, to: 180, weight: 14 },
    { name: "Major Bridge / ROB Works", group: "Structures", from: 60, to: 260, weight: 20 },
    { name: "Drainage, Signing & Marking", group: "Installation", from: 200, to: 320, weight: 9 },
    { name: "Testing, Safety Audit & Handover", group: "Testing & Handover", from: 300, to: 330, weight: 6 },
  ],
  "Bridge / Flyover": [
    { name: "Site Preparation & Survey", group: "Site Preparation", from: 0, to: 25, weight: 6 },
    { name: "Piling & Pile Caps", group: "Foundation", from: 15, to: 110, weight: 24 },
    { name: "Substructure — Piers & Pier Caps", group: "Substructure", from: 80, to: 190, weight: 22 },
    { name: "Superstructure Girders / Steel Erection", group: "Structural Work", from: 150, to: 250, weight: 24 },
    { name: "Deck Slab & Wearing Course", group: "Structural Work", from: 200, to: 290, weight: 14 },
    { name: "Testing, Load Trials & Handover", group: "Testing & Handover", from: 280, to: 320, weight: 10 },
  ],
  "Metro / Viaduct": [
    { name: "Site Preparation & Traffic Diversion", group: "Site Preparation", from: 0, to: 35, weight: 8 },
    { name: "Piling & Pile Caps", group: "Foundation", from: 20, to: 130, weight: 20 },
    { name: "Pier Columns & Pier Caps", group: "Substructure", from: 90, to: 210, weight: 20 },
    { name: "Segmented Viaduct Erection", group: "Structural Work", from: 160, to: 300, weight: 26 },
    { name: "Track Bed & Utilities", group: "Installation", from: 240, to: 330, weight: 16 },
    { name: "Testing & Trial Runs", group: "Testing & Handover", from: 320, to: 360, weight: 10 },
  ],
  "Building / Institutional": [
    { name: "Site Preparation & Excavation", group: "Site Preparation", from: 0, to: 30, weight: 8 },
    { name: "Foundation & Raft", group: "Foundation", from: 20, to: 110, weight: 22 },
    { name: "RCC Frame — Columns, Beams, Slabs", group: "Structural Work", from: 80, to: 240, weight: 30 },
    { name: "Masonry, Plaster & Waterproofing", group: "Finishing", from: 180, to: 290, weight: 18 },
    { name: "MEP, Fire Fighting & Lifts", group: "Installation", from: 210, to: 310, weight: 14 },
    { name: "Testing, Snag List & Handover", group: "Testing & Handover", from: 300, to: 340, weight: 8 },
  ],
  "Irrigation / Canal": [
    { name: "Site Preparation & Dewatering", group: "Site Preparation", from: 0, to: 25, weight: 8 },
    { name: "Earthwork Excavation & Embankment", group: "Earthwork", from: 15, to: 140, weight: 26 },
    { name: "Canal Lining (Concrete)", group: "Lining", from: 100, to: 260, weight: 28 },
    { name: "Structures — Falls, Crossings, Outlets", group: "Structures", from: 120, to: 280, weight: 20 },
    { name: "Testing, Water Filling & Handover", group: "Testing & Handover", from: 270, to: 320, weight: 18 },
  ],
  "Water Supply / Industrial": [
    { name: "Site Preparation", group: "Site Preparation", from: 0, to: 30, weight: 10 },
    { name: "Civil Foundation Works", group: "Foundation", from: 20, to: 130, weight: 26 },
    { name: "Main Structural / Civil Works", group: "Structural Work", from: 100, to: 250, weight: 28 },
    { name: "Equipment Supply & Installation", group: "Installation", from: 200, to: 300, weight: 20 },
    { name: "Testing, Commissioning & Handover", group: "Testing & Handover", from: 290, to: 330, weight: 16 },
  ],
};

/* ---------------- date helpers ---------------- */

const MS = 86400000;
export const parseISO = (s: string) => new Date(`${s}T00:00:00`);
export const toISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const todayISO = () => toISO(new Date());
export const addDaysISO = (s: string, n: number) => toISO(new Date(parseISO(s).getTime() + n * MS));
export const diffDays = (a: string, b: string) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / MS);
export const fmtISO = (s: string) =>
  parseISO(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const stampNow = () =>
  `${fmtISO(todayISO())} · ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------------- derived schedule maths ---------------- */

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function weightSum(p: Project) {
  return p.tasks.reduce((s, t) => s + (Number(t.weight) || 0), 0);
}

/** planned % complete of a single activity at a given date */
export function taskPlanned(t: WbsTask, on: string) {
  const dur = diffDays(t.start, t.finish);
  if (dur <= 0) return clamp(on >= t.finish ? 100 : 0);
  return clamp((diffDays(t.start, on) / dur) * 100);
}

export function taskStatus(t: WbsTask, on: string): Status {
  const planned = taskPlanned(t, on);
  if (t.actual >= 100) return "completed";
  if (planned <= 0.5 && t.actual <= 0) return "not-started";
  const gap = planned - t.actual;
  if (gap > 7) return "critical";
  if (gap > 2) return "warning";
  return "on-track";
}

export interface Metrics {
  planned: number;
  actual: number;
  gap: number;
  spi: number;
  totalDays: number;
  elapsedDays: number;
  timeElapsedPct: number;
  forecastFinish: string;
  delayDays: number;
  earnedDays: number;
  health: Status;
}

export function metrics(p: Project, on = todayISO()): Metrics {
  const sum = weightSum(p) || 1;
  const planned = p.tasks.reduce((s, t) => s + ((t.weight / sum) * taskPlanned(t, on)), 0);
  const actual = p.tasks.reduce((s, t) => s + ((t.weight / sum) * clamp(t.actual)), 0);
  const totalDays = Math.max(diffDays(p.start, p.finish), 1);
  const elapsedDays = clamp(diffDays(p.start, on), 0, totalDays);
  const spi = planned > 0.05 ? actual / planned : 1;
  const forecastFinish = addDaysISO(p.start, Math.round(totalDays / Math.max(spi, 0.05)));
  const gap = planned - actual;
  return {
    planned: +planned.toFixed(1),
    actual: +actual.toFixed(1),
    gap: +gap.toFixed(1),
    spi: +spi.toFixed(2),
    totalDays,
    elapsedDays,
    timeElapsedPct: +((elapsedDays / totalDays) * 100).toFixed(1),
    forecastFinish,
    delayDays: Math.max(diffDays(p.finish, forecastFinish), 0),
    earnedDays: Math.round(elapsedDays * spi),
    health: gap > 7 ? "critical" : gap > 2 ? "warning" : "on-track",
  };
}

/** grouped activity roll-up (major activities) */
export function activityRollup(p: Project, on = todayISO()) {
  const sum = weightSum(p) || 1;
  const map = new Map<string, { name: string; weight: number; planned: number; actual: number; wbs: string[] }>();
  for (const t of p.tasks) {
    const key = t.group || "Other";
    const g =
      map.get(key) ??
      { name: key, weight: 0, planned: 0, actual: 0, wbs: [] };
    g.weight += (t.weight / sum) * 100;
    g.planned += (t.weight / sum) * taskPlanned(t, on);
    g.actual += (t.weight / sum) * clamp(t.actual);
    g.wbs.push(t.id);
    map.set(key, g);
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      weight: +g.weight.toFixed(1),
      planned: +g.planned.toFixed(1),
      actual: +g.actual.toFixed(1),
      status: (g.actual >= 99.5
        ? "completed"
        : g.planned - g.actual > 7
          ? "critical"
          : g.planned - g.actual > 2
            ? "warning"
            : g.planned <= 0.5
              ? "not-started"
              : "on-track") as Status,
    }))
    .sort((a, b) => b.weight - a.weight);
}

/* ---------------- gantt view model ---------------- */

export interface GanttRow {
  id: string;
  name: string;
  group: string;
  startLabel: string;
  finishLabel: string;
  start: string;
  finish: string;
  left: number;
  width: number;
  planned: number;
  actual: number;
  status: Status;
  owner: string;
  weight: number;
}

export function ganttRows(p: Project, on = todayISO()): GanttRow[] {
  const total = Math.max(diffDays(p.start, p.finish), 1);
  return p.tasks.map((t) => {
    const left = clamp((diffDays(p.start, t.start) / total) * 100);
    const rawWidth = (Math.max(diffDays(t.start, t.finish), 1) / total) * 100;
    return {
      id: t.id,
      name: t.name,
      group: t.group,
      startLabel: fmtISO(t.start),
      finishLabel: fmtISO(t.finish),
      start: t.start,
      finish: t.finish,
      left,
      width: Math.min(rawWidth, 100 - left),
      planned: +taskPlanned(t, on).toFixed(1),
      actual: +clamp(t.actual).toFixed(1),
      status: taskStatus(t, on),
      owner: t.owner,
      weight: t.weight,
    };
  });
}

/* ---------------- monthly planned vs actual curve ---------------- */

export interface CurvePoint {
  key: string;
  label: string;
  planned: number;
  actual: number | null;
  evidence: number;
  labour: number;
}

function monthEnd(iso: string) {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function monthlyCurve(p: Project, evidence: Evidence[], on = todayISO()): CurvePoint[] {
  const sum = weightSum(p) || 1;
  const pts: CurvePoint[] = [];
  const start = parseISO(p.start);
  const end = parseISO(p.finish);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  let idx = 0;
  while (cursor <= end && idx < 60) {
    const key = toISO(cursor);
    const label = `${MONTH_SHORT[cursor.getMonth()]} '${String(cursor.getFullYear()).slice(2)}`;
    const mEnd = monthEnd(key) > on ? on : monthEnd(key);

    let planned = 0;
    for (const t of p.tasks) {
      const dur = Math.max(diffDays(t.start, t.finish), 1);
      planned += (t.weight / sum) * clamp((diffDays(t.start, mEnd) / dur) * 100);
    }

    let actual = 0;
    for (const t of p.tasks) {
      if (t.actual <= 0 || on <= t.start) continue;
      const span = Math.max(diffDays(t.start, on), 1);
      actual += (t.weight / sum) * t.actual * clamp(diffDays(t.start, mEnd) / span);
    }

    const monthPrefix = key.slice(0, 7);
    const ev = evidence.filter((e) => e.capturedAt.slice(0, 7) === monthPrefix);

    pts.push({
      key,
      label,
      planned: +clamp(planned).toFixed(1),
      actual: key.slice(0, 7) <= on.slice(0, 7) ? +clamp(actual).toFixed(1) : null,
      evidence: ev.length,
      labour: ev.length ? Math.round(ev.reduce((s, e) => s + e.skilled + e.unskilled, 0) / ev.length) : 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
    idx++;
  }
  return pts;
}

/* ---------------- risk derivation ---------------- */

const sevOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export function deriveRisks(p: Project, evidence: Evidence[], on = todayISO()): Risk[] {
  const m = metrics(p, on);
  const out: Risk[] = [];
  const push = (r: Risk) => out.push(r);

  p.tasks.forEach((t, i) => {
    const planned = taskPlanned(t, on);
    if (planned <= 0.5) return;
    const mine = evidence.filter((e) => e.wbsId === t.id);
    const gap = +(planned - t.actual).toFixed(1);
    const avgLabour = mine.length ? Math.round(mine.reduce((s, e) => s + e.skilled + e.unskilled, 0) / mine.length) : 0;
    const last = mine.length ? mine.map((e) => e.capturedAt).sort().slice(-1)[0] : "";
    const staleDays = last ? diffDays(last, on) : -1;
    const detected = fmtISO(on);
    const rid = `RSK-${String(i + 1).padStart(2, "0")}`;

    if (gap > 7) {
      push({
        id: `${rid}-S`,
        title: `${t.name} is behind schedule`,
        detail: `${t.id} reports ${t.actual}% actual against ${planned.toFixed(0)}% planned at ${fmtISO(on)} — a variance of −${gap}% on a work front carrying ${((t.weight / (weightSum(p) || 1)) * 100).toFixed(0)}% of the project weight.`,
        severity: "critical",
        category: "Schedule",
        wbsId: t.id,
        probability: "High",
        impact: gap > 15 ? "High" : "Medium",
        detectedOn: detected,
        owner: t.owner,
        status: "open",
        confidence: mine.length >= 3 ? "High" : "Medium",
        evidenceDetected: [
          mine.length
            ? `${mine.length} geo-tagged evidence records submitted for ${t.id}`
            : `No geo-tagged evidence recorded for ${t.id} so far`,
          mine.length ? `Average manpower ${avgLabour} workers across the submitted records` : "Reported progress is not supported by any site record",
          `Planned window ${fmtISO(t.start)} → ${fmtISO(t.finish)}`,
        ],
        possibleReason:
          mine.length && avgLabour < 40
            ? "Low manpower recorded on site relative to the planned deployment."
            : mine.length < 3
              ? "Insufficient evidence coverage to confirm the reported progress."
              : "Observed output rate is below the planned rate for this activity.",
        recommended: `Verify manpower allocation with the site engineer for ${t.id} and confirm plant availability before approving the next RA bill.`,
        variance: -gap,
      });
    } else if (gap > 2) {
      push({
        id: `${rid}-D`,
        title: `Progress deviation detected on ${t.name}`,
        detail: `${t.id} is running ${gap}% below the planned curve. The deviation exceeds the ±2% tolerance band and is under observation.`,
        severity: "warning",
        category: "Deviation",
        wbsId: t.id,
        probability: "Medium",
        impact: "Medium",
        detectedOn: detected,
        owner: t.owner,
        status: "monitoring",
        confidence: "Medium",
        evidenceDetected: [
          `${mine.length} evidence records available for ${t.id}`,
          `Actual ${t.actual}% against planned ${planned.toFixed(0)}% at ${fmtISO(on)}`,
        ],
        possibleReason: "Slower-than-planned output on the work front; cause not yet confirmed.",
        recommended: `Review ${t.id} progress with the activity owner and update the quantity sheet after a joint measurement.`,
        variance: -gap,
      });
    }

    if (t.actual < 100 && (mine.length === 0 || staleDays > 5)) {
      push({
        id: `${rid}-E`,
        title: `Site evidence missing for Activity ${t.id}`,
        detail:
          mine.length === 0
            ? `No geo-tagged photo or video has been captured for ${t.id}, so the reported progress cannot be validated.`
            : `The last capture for ${t.id} was ${staleDays} days ago (${fmtISO(last)}). Progress claimed since then is unverified.`,
        severity: "warning",
        category: "Evidence Gap",
        wbsId: t.id,
        probability: "High",
        impact: "Medium",
        detectedOn: detected,
        owner: t.owner,
        status: "open",
        confidence: "High",
        evidenceDetected: [
          mine.length === 0 ? "Zero evidence records for this work front" : `Last accepted evidence on ${fmtISO(last)}`,
          `${t.id} is an active front with ${planned.toFixed(0)}% planned progress`,
        ],
        possibleReason: "Evidence capture was skipped on site, or work happened outside the mapped work front.",
        recommended: `Ask the site engineer to upload geo-tagged evidence for ${t.id} and reconcile with the daily progress register.`,
        variance: -gap,
      });
    } else if (planned > 3 && Math.abs(gap) <= 2 && t.actual > 0) {
      push({
        id: `${rid}-P`,
        title: `${t.name} is tracking on plan`,
        detail: `${t.id} has stayed within ±2% of the planned curve with ${mine.length} supporting evidence records.`,
        severity: "info",
        category: "Positive Signal",
        wbsId: t.id,
        probability: "Low",
        impact: "Low",
        detectedOn: detected,
        owner: t.owner,
        status: "mitigated",
        confidence: mine.length >= 2 ? "High" : "Medium",
        evidenceDetected: [
          `${mine.length} verified evidence records for ${t.id}`,
          `Variance ${gap >= 0 ? "+" : ""}${gap}% against plan`,
        ],
        possibleReason: "No adverse signal — execution is aligned with the approved plan.",
        recommended: "No action required — use this work front as the productivity benchmark.",
        variance: -gap,
      });
    }
  });

  if (m.delayDays > 5) {
    const lastTask = p.tasks[p.tasks.length - 1];
    push({
      id: "RSK-90-F",
      title: `Potential delay identified — ${m.delayDays} days projected slip`,
      detail: `At SPI ${m.spi}, the forecast completion is ${fmtISO(m.forecastFinish)} against a baseline of ${fmtISO(p.finish)}.`,
      severity: m.delayDays > 20 ? "critical" : "warning",
      category: "Milestone",
      wbsId: lastTask?.id ?? "WBS-01",
      probability: m.delayDays > 20 ? "High" : "Medium",
      impact: "High",
      detectedOn: fmtISO(on),
      owner: p.manager,
      status: "open",
      confidence: "Medium",
      evidenceDetected: [
        `Earned schedule ${m.earnedDays} of ${m.elapsedDays} elapsed days`,
        `Actual ${m.actual}% vs planned ${m.planned}%`,
      ],
      possibleReason: "Slower output on the lagging work fronts is compounding into downstream activities.",
      recommended: "Run a recovery workshop with the activity owners and re-baseline the affected milestones.",
      variance: -m.gap,
    });
  }

  return out.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
}

export function actionFromRisk(r: Risk): ActionItem {
  const dueOffset = r.severity === "critical" ? 3 : r.severity === "warning" ? 7 : 14;
  const owner = STAFF.find((s) => s.name === r.owner);
  return {
    id: `ACT-${r.id.replace("RSK-", "")}`,
    riskId: r.id,
    issue: r.title,
    action: r.recommended,
    owner: r.owner,
    ownerRole: owner?.role ?? "Site Engineer",
    priority: r.severity === "critical" ? "High" : r.severity === "warning" ? "Medium" : "Low",
    due: fmtISO(addDaysISO(todayISO(), dueOffset)),
    status: r.severity === "info" ? "done" : "open",
    source: r.category,
    wbsId: r.wbsId,
  };
}

export function isOverdue(due: string, on = todayISO()) {
  return diffDays(on, parseISO(due).toISOString().slice(0, 10)) > 0;
}

/* ---------------- presentation meta ---------------- */

export const statusMeta: Record<Status, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  "on-track": { label: "On Track", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  warning: { label: "Warning", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
  "not-started": { label: "Not Started", dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200" },
  completed: { label: "Completed", dot: "bg-teal-600", text: "text-teal-700", bg: "bg-teal-50", ring: "ring-teal-200" },
};

export const verifyMeta: Record<VerifyState, { label: string; text: string; bg: string; icon: "checkCircle" | "clock" | "info" }> = {
  verified: { label: "Verified", text: "text-emerald-700", bg: "bg-emerald-50", icon: "checkCircle" },
  pending: { label: "Pending review", text: "text-amber-700", bg: "bg-amber-50", icon: "clock" },
  flagged: { label: "Flagged · GPS drift", text: "text-red-700", bg: "bg-red-50", icon: "info" },
};

export function varianceTone(v: number) {
  if (v >= -2) return { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", label: "On Track" };
  if (v >= -7) return { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", label: "Warning" };
  return { text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200", label: "Critical" };
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`;

export const sevTone: Record<Severity, { label: string; tone: "red" | "amber" | "green"; bg: string; text: string; ring: string }> = {
  critical: { label: "Critical", tone: "red", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  warning: { label: "Warning", tone: "amber", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  info: { label: "Info / positive", tone: "green", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
};

/* ---------------- AI workflow + report catalogue ---------------- */

export const aiPipeline = [
  { key: "plan", title: "Plan", sub: "Baseline WBS & schedule", detail: "Reads the approved WBS, baseline dates, weightages and planned progress curve.", icon: "schedule", metric: (n: number, d: number) => `${n} WBS · ${d} days` },
  { key: "evidence", title: "Site Evidence", sub: "Geo-tagged photo / video", detail: "Ingests site evidence with GPS, timestamp, manpower and engineer remarks.", icon: "camera", metric: (n: number) => `${n} records` },
  { key: "match", title: "AI Activity Matching", sub: "Vision + metadata", detail: "Matches each evidence item to a WBS activity using visual features plus GPS, chainage and time metadata.", icon: "ai", metric: (n: number) => `${n} mapped to WBS` },
  { key: "validate", title: "Progress Validation", sub: "Claimed vs observed", detail: "Cross-checks reported progress against observed site state and evidence coverage.", icon: "checkCircle", metric: (n: number) => `${n} claims verified` },
  { key: "gap", title: "Planned vs Actual Gap", sub: "Variance per WBS", detail: "Quantifies schedule variance per activity and rolls it up to project level.", icon: "progress", metric: (s: number) => `SPI ${s}` },
  { key: "risk", title: "Risk / Delay Signal", sub: "Possible reason, not certainty", detail: "Correlates gaps with evidence signals to suggest possible contributing reasons with a confidence level.", icon: "alert", metric: (n: number) => `${n} signals` },
  { key: "warn", title: "Early Warning", sub: "Forecast completion date", detail: "Earned-schedule forecast raises an early warning long before the milestone is missed.", icon: "bell", metric: (d: number) => (d > 0 ? `${d} days projected slip` : "No slip projected") },
  { key: "action", title: "Corrective Action", sub: "Owner + due date", detail: "Converts the warning into an owned, dated action in the Action Center with verification evidence.", icon: "actions", metric: (n: number) => `${n} actions` },
] as const;

export interface ReportDef {
  id: string;
  name: string;
  cadence: string;
  description: string;
  icon: "report" | "calendar" | "progress" | "alert" | "camera";
  sections: string[];
}

export const reportDefs: ReportDef[] = [
  { id: "RPT-DPR", name: "Daily Progress Report", cadence: "Daily · auto at 19:00 IST", description: "Day-wise physical progress, manpower deployed, evidence captured and blockers raised.", icon: "calendar", sections: ["Executive summary", "Manpower & plant", "Evidence log", "Blockers", "Weather & downtime"] },
  { id: "RPT-WPR", name: "Weekly Progress Report", cadence: "Weekly · Monday 09:00 IST", description: "Week-on-week progress, WBS variance movement and planned activities for the coming week.", icon: "report", sections: ["S-curve snapshot", "WBS variance", "Top 3 risks", "Next week plan"] },
  { id: "RPT-PVA", name: "Planned vs Actual Report", cadence: "On demand", description: "Baseline vs earned progress with SPI, variance per WBS and forecast completion date.", icon: "progress", sections: ["Variance table", "Earned value indices", "Forecast", "Recovery options"] },
  { id: "RPT-RSK", name: "Risk Report", cadence: "Weekly · Friday 17:00 IST", description: "Live risk register, severity matrix, AI confidence levels and mitigation ownership.", icon: "alert", sections: ["Severity matrix", "Open risks", "Mitigation tracker", "Ageing analysis"] },
  { id: "RPT-EVD", name: "Site Evidence Report", cadence: "On demand", description: "Chronological geo-tagged evidence register with verification status and audit trail.", icon: "camera", sections: ["Evidence index", "Verification status", "GPS audit trail", "Coverage gaps"] },
];
