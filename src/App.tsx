import { useEffect, useState } from "react";
import { Layout, type PageKey, type SessionUser } from "@/components/Layout";
import { StoreProvider, useStore } from "@/store/store";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import NewProject from "@/pages/NewProject";
import Schedule from "@/pages/Schedule";
import SiteEvidence from "@/pages/SiteEvidence";
import Progress from "@/pages/Progress";
import Risks from "@/pages/Risks";
import Reports from "@/pages/Reports";
import AIAnalysis from "@/pages/AIAnalysis";
import ActionCenter from "@/pages/ActionCenter";

const STORAGE_KEY = "sitesync.session";

function Shell() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState<PageKey>("projects");
  const { projects } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (user && projects.length === 0 && page !== "projects" && page !== "new-project" && page !== "ai") {
      setPage("projects");
    }
  }, [user, projects.length, page]);

  const login = (u: SessionUser) => {
    setUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
  };

  const logout = () => {
    setUser(null);
    setPage("projects");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  if (!user) return <Login onLogin={login} />;

  return (
    <Layout page={page} setPage={setPage} user={user} onLogout={logout}>
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "projects" && <Projects setPage={setPage} />}
      {page === "new-project" && <NewProject setPage={setPage} />}
      {page === "schedule" && <Schedule />}
      {page === "evidence" && <SiteEvidence setPage={setPage} />}
      {page === "progress" && <Progress setPage={setPage} />}
      {page === "risks" && <Risks setPage={setPage} />}
      {page === "reports" && <Reports setPage={setPage} />}
      {page === "ai" && <AIAnalysis setPage={setPage} />}
      {page === "actions" && <ActionCenter setPage={setPage} />}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
