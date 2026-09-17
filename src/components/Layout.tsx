import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Icon, Logo, type IconName } from "@/components/Icons";
import { Badge, Button } from "@/components/ui";
import { useStore } from "@/store/store";
import { metrics } from "@/data/model";

export type PageKey =
  | "dashboard"
  | "projects"
  | "new-project"
  | "schedule"
  | "evidence"
  | "progress"
  | "risks"
  | "reports"
  | "ai"
  | "actions";

export const NAV: { key: PageKey; label: string; icon: IconName }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "projects", label: "Projects", icon: "projects" },
  { key: "schedule", label: "Schedule", icon: "schedule" },
  { key: "evidence", label: "Site Evidence", icon: "camera" },
  { key: "progress", label: "Progress", icon: "progress" },
  { key: "risks", label: "Risks & Alerts", icon: "alert" },
  { key: "reports", label: "Reports", icon: "report" },
];

export const NAV_INTEL: { key: PageKey; label: string; icon: IconName }[] = [
  { key: "ai", label: "AI Analysis", icon: "ai" },
  { key: "actions", label: "Action Center", icon: "actions" },
];

export const PAGE_META: Record<PageKey, { title: string; sub: string }> = {
  dashboard: { title: "Project Dashboard", sub: "Planning-to-execution bridge · live site evidence vs baseline plan" },
  projects: { title: "Projects", sub: "Create and manage the infrastructure projects under monitoring" },
  "new-project": { title: "Create Project", sub: "Register a new project with full baseline details and WBS" },
  schedule: { title: "Schedule & Gantt", sub: "Baseline WBS windows against evidence-verified actual progress" },
  evidence: { title: "Site Evidence", sub: "Geo-tagged photo / video capture with timestamp, manpower and remarks" },
  progress: { title: "Progress Tracking", sub: "Earned progress, S-curve and WBS-level variance" },
  risks: { title: "Risks & Alerts", sub: "Deviation, evidence gaps and delay signals with confidence levels" },
  reports: { title: "Reports", sub: "Auto-generated progress, variance, risk and evidence reports" },
  ai: { title: "AI Analysis", sub: "How site evidence becomes progress, gap, warning and action" },
  actions: { title: "Action Center", sub: "Owned and dated corrective actions closing the loop" },
};

export interface SessionUser {
  name: string;
  role: string;
  email: string;
}

export function ProjectRequired({ setPage }: { setPage: (p: PageKey) => void }) {
  return (
    <div className="mx-auto mt-6 max-w-xl">
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-500">
          <Icon name="projects" className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-[18px] font-extrabold tracking-tight text-navy-900">No active project</h2>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-navy-500">
          Create a project with its baseline details and WBS activities. Schedule, evidence, progress, risks and reports all
          build from that baseline.
        </p>
        <Button className="mt-5" icon="plus" onClick={() => setPage("new-project")}>
          Create your first project
        </Button>
      </div>
    </div>
  );
}

export function Layout({
  page,
  setPage,
  user,
  onLogout,
  children,
}: {
  page: PageKey;
  setPage: (p: PageKey) => void;
  user: SessionUser;
  onLogout: () => void;
  children: ReactNode;
}) {
  const { projects, active, setActiveId, actionsFor, risksFor } = useStore();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const m = active ? metrics(active) : null;
  const alerts = active ? risksFor(active.id).filter((r) => r.severity !== "info") : [];
  const pending = active ? actionsFor(active.id).filter((a) => a.status !== "done").length : 0;
  const meta = PAGE_META[page];

  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
    setProjOpen(false);
  }, [page]);

  const NavList = () => (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
      <div>
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.14em] text-navy-400 uppercase">Monitoring</p>
        <ul className="space-y-1">
          {NAV.map((n) => {
            const count =
              n.key === "risks" ? alerts.filter((a) => a.severity === "critical").length : 0;
            return (
              <li key={n.key}>
                <button
                  onClick={() => setPage(n.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                    page === n.key ? "bg-navy-800 text-white shadow-sm" : "text-navy-600 hover:bg-navy-50 hover:text-navy-900",
                  )}
                >
                  <Icon name={n.icon} className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.9} />
                  <span className="flex-1 text-left">{n.label}</span>
                  {count > 0 && (
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", page === n.key ? "bg-white/15 text-white" : "bg-red-50 text-red-600")}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.14em] text-navy-400 uppercase">Intelligence</p>
        <ul className="space-y-1">
          {NAV_INTEL.map((n) => (
            <li key={n.key}>
              <button
                onClick={() => setPage(n.key)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                  page === n.key ? "bg-navy-800 text-white shadow-sm" : "text-navy-600 hover:bg-navy-50 hover:text-navy-900",
                )}
              >
                <Icon name={n.icon} className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.9} />
                <span className="flex-1 text-left">{n.label}</span>
                {n.key === "actions" && pending > 0 && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", page === n.key ? "bg-white/15 text-white" : "bg-amber-50 text-amber-700")}>
                    {pending}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto px-1">
        <button
          onClick={() => setPage("new-project")}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy-300 px-3 py-2.5 text-[12px] font-bold text-navy-600 transition-colors hover:border-navy-500 hover:bg-navy-50"
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> New project
        </button>
        <div className="rounded-2xl bg-navy-900 p-3.5 text-white">
          <p className="text-[10px] font-bold tracking-[0.14em] text-sky-300 uppercase">Core loop</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[10.5px] font-bold">
            {["Plan", "Actual", "Gap", "Risk", "Warning", "Action"].map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                <span className="rounded-md bg-white/10 px-1.5 py-0.5">{s}</span>
                {i < 5 && <span className="text-sky-400/70">›</span>}
              </span>
            ))}
          </div>
          <p className="mt-3 border-t border-white/10 pt-2.5 text-[10.5px] leading-relaxed text-navy-200">
            Every alert is traceable to a site record and closes with an owned action.
          </p>
        </div>
      </div>
    </nav>
  );

  const alertsPreview = alerts.slice(0, 4);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[254px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Logo className="h-9 w-9" />
          <div className="min-w-0">
            <p className="truncate text-[15px] leading-tight font-extrabold tracking-tight text-navy-900">
              SiteSync <span className="text-sky-600">AI</span>
            </p>
            <p className="truncate text-[10px] font-semibold tracking-wide text-navy-400">PLAN • TRACK • BUILD BETTER</p>
          </div>
        </div>

        <div className="px-3 pb-3">
          {projects.length === 0 ? (
            <button
              onClick={() => setPage("new-project")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy-300 bg-navy-50/50 px-3 py-3 text-[12px] font-bold text-navy-600 transition-colors hover:border-navy-500 hover:bg-navy-50"
            >
              <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Create a project
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProjOpen((v) => !v)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-navy-50/60 px-3 py-2.5 text-left transition-colors hover:border-navy-200 hover:bg-navy-50"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-800 text-[10px] font-bold text-white">
                  {(active?.code ?? "PR").slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-navy-900">{active?.name}</span>
                  <span className="block truncate font-mono text-[10px] text-navy-400">
                    {active?.id} {m ? `· ${m.actual}%` : ""}
                  </span>
                </span>
                <Icon name="chevronDown" className={cn("h-4 w-4 shrink-0 text-navy-400 transition-transform", projOpen && "rotate-180")} />
              </button>
              {projOpen && (
                <div className="anim-pop absolute top-full right-0 left-0 z-50 mt-1.5 max-h-[320px] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lift">
                  {projects.map((p) => {
                    const pm = metrics(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveId(p.id);
                          setProjOpen(false);
                        }}
                        className={cn("flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-navy-50", p.id === active?.id && "bg-navy-50")}
                      >
                        <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", pm.health === "on-track" ? "bg-emerald-500" : pm.health === "warning" ? "bg-amber-500" : "bg-red-500")} />
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-semibold text-navy-800">{p.name}</span>
                          <span className="block text-[10px] text-navy-400">
                            {pm.actual}% actual · SPI {pm.spi}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setProjOpen(false);
                      setPage("new-project");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-navy-200 px-2.5 py-2 text-[11.5px] font-bold text-navy-600 hover:bg-navy-50"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" /> Add another project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <NavList />

        <div className="border-t border-line px-3 py-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700">
              {user.name.split(" ").slice(-2).map((s) => s[0]).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold text-navy-900">{user.name}</span>
              <span className="block truncate text-[10.5px] text-navy-400">{user.role}</span>
            </span>
            <button
              onClick={onLogout}
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-in absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="anim-pop absolute inset-y-0 left-0 flex w-[272px] flex-col bg-white shadow-lift">
            <div className="flex items-center gap-2.5 px-4 py-4">
              <Logo className="h-9 w-9" />
              <p className="flex-1 text-[15px] font-extrabold tracking-tight text-navy-900">
                SiteSync <span className="text-sky-600">AI</span>
              </p>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-navy-400 hover:bg-navy-50">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="px-3 pb-3">
              {projects.length > 0 && (
                <select
                  value={active?.id}
                  onChange={(e) => setActiveId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-navy-50/60 px-3 py-2 text-[12px] font-semibold text-navy-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <NavList />
          </aside>
        </div>
      )}

      {/* ---------- Main ---------- */}
      <div className="lg:pl-[254px]">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-navy-600 lg:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[16px] font-bold tracking-tight text-navy-900 sm:text-[18px]">{meta.title}</h1>
              <p className="hidden truncate text-[11.5px] text-navy-500 sm:block">{meta.sub}</p>
            </div>

            {active && (
              <div className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-navy-50 px-2.5 py-1.5 ring-1 ring-navy-100 xl:flex">
                <Icon name="pin" className="h-3.5 w-3.5 text-navy-500" />
                <span className="max-w-[190px] truncate text-[11.5px] font-semibold text-navy-700">{active.location}</span>
              </div>
            )}

            <div className="relative shrink-0">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-line text-navy-600 transition-colors hover:bg-navy-50"
                aria-label="Alerts"
              >
                <Icon name="bell" className="h-4 w-4" />
                {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
              </button>
              {notifOpen && (
                <div className="anim-pop absolute top-full right-0 z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <p className="text-[12.5px] font-bold text-navy-900">Live alerts</p>
                    <Badge tone={alerts.length ? "red" : "green"} dot>
                      {alerts.length} active
                    </Badge>
                  </div>
                  <ul className="divide-y divide-line">
                    {alertsPreview.map((a) => (
                      <li key={a.id}>
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            setPage("risks");
                          }}
                          className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-navy-50"
                        >
                          <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", a.severity === "critical" ? "bg-red-500" : "bg-amber-500")} />
                          <span className="min-w-0">
                            <span className="block text-[12px] font-semibold text-navy-800">{a.title}</span>
                            <span className="block text-[10.5px] text-navy-400">{a.wbsId} · {a.category}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                    {alerts.length === 0 && (
                      <li className="px-4 py-6 text-center text-[11.5px] text-navy-500">
                        No alerts. Add activities and evidence to start detection.
                      </li>
                    )}
                  </ul>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      setPage("actions");
                    }}
                    className="w-full bg-navy-50 py-2.5 text-[11.5px] font-bold text-navy-700 transition-colors hover:bg-navy-100"
                  >
                    Open Action Center →
                  </button>
                </div>
              )}
            </div>

            <Button size="sm" icon="plus" className="hidden sm:inline-flex" onClick={() => setPage("new-project")}>
              Project
            </Button>

            <button
              onClick={onLogout}
              className="hidden h-9 shrink-0 items-center gap-2 rounded-xl border border-line px-3 text-[12px] font-semibold text-navy-600 transition-colors hover:bg-navy-50 lg:flex"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <main key={page} className="anim-in px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </main>

        <footer className="no-print border-t border-line bg-white px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <div>
                <p className="text-[12px] font-bold text-navy-900">SiteSync AI · Planning-to-Execution Bridge</p>
                <p className="text-[10.5px] text-navy-400">Plan • Track • Build Better — {projects.length} project{projects.length === 1 ? "" : "s"} in workspace</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold text-navy-500">
              <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2 py-1 ring-1 ring-navy-100">
                <Icon name="code" className="h-3 w-3" /> HTML · CSS · JS
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2 py-1 ring-1 ring-navy-100">
                <Icon name="server" className="h-3 w-3" /> Python API
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2 py-1 ring-1 ring-navy-100">
                <Icon name="database" className="h-3 w-3" /> SQLite
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
