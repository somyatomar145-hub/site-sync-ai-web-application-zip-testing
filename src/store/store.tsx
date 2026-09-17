import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  actionFromRisk,
  deriveRisks,
  diffDays,
  todayISO,
  type ActionItem,
  type Evidence,
  type Project,
  type Risk,
  type VerifyState,
  type WbsTask,
} from "@/data/model";

/* ------------------------------------------------------------------
   Local store. Mirrors the SQLite schema used by the Python backend:
     projects · wbs_tasks · site_evidence · actions · action_status
-------------------------------------------------------------------*/

const KEY = "sitesync.db.v2";
type ActionStatus = ActionItem["status"];

interface DB {
  projects: Project[];
  evidence: Evidence[];
  manual: ActionItem[];
  overrides: Record<string, ActionStatus>;
  activeId: string | null;
}

const EMPTY: DB = { projects: [], evidence: [], manual: [], overrides: {}, activeId: null };

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<DB>;
    return {
      projects: p.projects ?? [],
      evidence: p.evidence ?? [],
      manual: p.manual ?? [],
      overrides: p.overrides ?? {},
      activeId: p.activeId ?? null,
    };
  } catch {
    return EMPTY;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** accepts both ISO (2025-10-24) and display (24 Oct 2025) date strings */
function day(d: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = d.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (m) {
    const idx = MONTHS.findIndex((x) => x.toLowerCase() === m[2].slice(0, 3).toLowerCase());
    if (idx >= 0) return `${m[3]}-${String(idx + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? todayISO() : parsed.toISOString().slice(0, 10);
}

interface Ctx {
  projects: Project[];
  active: Project | null;
  activeId: string | null;
  setActiveId: (id: string) => void;
  /* projects */
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  /* wbs */
  addTask: (projectId: string, t: Omit<WbsTask, "id"> & { id?: string }) => void;
  updateTask: (projectId: string, taskId: string, patch: Partial<WbsTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  /* evidence */
  evidenceFor: (projectId: string) => Evidence[];
  addEvidence: (e: Omit<Evidence, "id">) => void;
  setVerify: (id: string, v: VerifyState) => void;
  deleteEvidence: (id: string) => void;
  /* risks + actions */
  risksFor: (projectId: string) => Risk[];
  actionsFor: (projectId: string) => ActionItem[];
  setActionStatus: (actionId: string, s: ActionStatus) => void;
  addManualAction: (a: Omit<ActionItem, "id">) => void;
  deleteManualAction: (id: string) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage unavailable — session only */
    }
  }, [db]);

  const active = useMemo(
    () => db.projects.find((p) => p.id === db.activeId) ?? db.projects[0] ?? null,
    [db.projects, db.activeId],
  );

  const patchProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setDb((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? fn(p) : p)) }));
  }, []);

  const addProject: Ctx["addProject"] = useCallback((input) => {
    setDb((d) => {
      const n = d.projects.length + 1;
      const project: Project = {
        ...input,
        id: `PRJ-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
      };
      return { ...d, projects: [...d.projects, project], activeId: project.id };
    });
  }, []);

  const deleteProject: Ctx["deleteProject"] = useCallback((id) => {
    setDb((d) => {
      const projects = d.projects.filter((p) => p.id !== id);
      const removed = d.projects.find((p) => p.id === id);
      const taskIds = new Set(removed?.tasks.map((t) => t.id));
      return {
        ...d,
        projects,
        evidence: d.evidence.filter((e) => e.projectId !== id),
        manual: d.manual.filter((a) => !taskIds.has(a.wbsId)),
        activeId: d.activeId === id ? projects[0]?.id ?? null : d.activeId,
      };
    });
  }, []);

  const addTask: Ctx["addTask"] = useCallback(
    (projectId, t) => {
      patchProject(projectId, (p) => {
        const nextNo = p.tasks.length + 1;
        const task: WbsTask = { ...t, id: t.id?.trim() || `WBS-${String(nextNo).padStart(2, "0")}` };
        return { ...p, tasks: [...p.tasks, task] };
      });
    },
    [patchProject],
  );

  const updateTask: Ctx["updateTask"] = useCallback(
    (projectId, taskId, patch) => {
      patchProject(projectId, (p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      }));
    },
    [patchProject],
  );

  const deleteTask: Ctx["deleteTask"] = useCallback(
    (projectId, taskId) => {
      patchProject(projectId, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }));
    },
    [patchProject],
  );

  const evidenceFor: Ctx["evidenceFor"] = useCallback(
    (projectId) =>
      db.evidence
        .filter((e) => e.projectId === projectId)
        .sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1)),
    [db.evidence],
  );

  const addEvidence: Ctx["addEvidence"] = useCallback((input) => {
    setDb((d) => {
      const rec: Evidence = { ...input, id: `EVD-${1000 + d.evidence.length + 1}` };
      return {
        ...d,
        evidence: [rec, ...d.evidence],
        projects: d.projects.map((p) =>
          p.id === input.projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === input.wbsId ? { ...t, actual: Math.min(100, +(t.actual + (input.progress || 0)).toFixed(1)) } : t,
                ),
              }
            : p,
        ),
      };
    });
  }, []);

  const setVerify: Ctx["setVerify"] = useCallback((id, v) => {
    setDb((d) => ({ ...d, evidence: d.evidence.map((e) => (e.id === id ? { ...e, verify: v } : e)) }));
  }, []);

  const deleteEvidence: Ctx["deleteEvidence"] = useCallback((id) => {
    setDb((d) => ({ ...d, evidence: d.evidence.filter((e) => e.id !== id) }));
  }, []);

  const risksFor: Ctx["risksFor"] = useCallback(
    (projectId) => {
      const p = db.projects.find((x) => x.id === projectId);
      if (!p) return [];
      return deriveRisks(p, db.evidence.filter((e) => e.projectId === projectId));
    },
    [db.projects, db.evidence],
  );

  const actionsFor: Ctx["actionsFor"] = useCallback(
    (projectId) => {
      const p = db.projects.find((x) => x.id === projectId);
      if (!p) return [];
      const derived: ActionItem[] = deriveRisks(p, db.evidence.filter((e) => e.projectId === projectId)).map((r) =>
        actionFromRisk(r),
      );
      const manual = db.manual.filter((a) => !derived.some((l) => l.id === a.id));
      const today = todayISO();
      const order: ActionStatus[] = ["overdue", "open", "in-progress", "done"];
      return [...derived, ...manual]
        .map((a) => {
          const withOverride = { ...a, status: db.overrides[a.id] ?? a.status };
          if (withOverride.status !== "done" && withOverride.status !== "overdue" && diffDays(today, day(withOverride.due)) > 0) {
            return { ...withOverride, status: "overdue" as ActionStatus };
          }
          return withOverride;
        })
        .sort((x, y) => order.indexOf(x.status) - order.indexOf(y.status));
    },
    [db.projects, db.evidence, db.manual, db.overrides],
  );

  const value: Ctx = {
    projects: db.projects,
    active,
    activeId: active?.id ?? null,
    setActiveId: (id) => setDb((d) => ({ ...d, activeId: id })),
    addProject,
    updateProject: (id, patch) => patchProject(id, (p) => ({ ...p, ...patch })),
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    evidenceFor,
    addEvidence,
    setVerify,
    deleteEvidence,
    risksFor,
    actionsFor,
    setActionStatus: (actionId, s) => setDb((d) => ({ ...d, overrides: { ...d.overrides, [actionId]: s } })),
    addManualAction: (a) =>
      setDb((d) => ({
        ...d,
        manual: [{ ...a, id: `ACT-M${String(d.manual.length + 1).padStart(2, "0")}` }, ...d.manual],
      })),
    deleteManualAction: (id) => setDb((d) => ({ ...d, manual: d.manual.filter((a) => a.id !== id) })),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
