import { useState } from "react";
import { Icon, Logo } from "@/components/Icons";
import { Button, Field, Input } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { SessionUser } from "@/components/Layout";

const HERO =
  "https://images.pexels.com/photos/8961073/pexels-photo-8961073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

const ROLES = [
  { id: "pm", label: "Project Manager", name: "Er. Ananya Deshmukh", email: "ananya.d@msrdc.gov.in", role: "Project Manager · Highways" },
  { id: "se", label: "Site Engineer", name: "Er. Mohit Bhosale", email: "mohit.b@ltinfra.in", role: "Site Engineer · Foundations" },
  { id: "qa", label: "QA / Auditor", name: "V. Rane", email: "v.rane@pmc-qa.in", role: "QA Lead · Third-party Audit" },
];

export default function Login({ onLogin }: { onLogin: (u: SessionUser) => void }) {
  const [role, setRole] = useState(ROLES[0]);
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState("sitesync@2025");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickRole = (r: (typeof ROLES)[number]) => {
    setRole(r);
    setEmail(r.email);
    setError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your registered email and password to continue.");
      return;
    }
    setLoading(true);
    setError("");
    window.setTimeout(() => {
      setLoading(false);
      onLogin({ name: role.name, role: role.role, email: role.email });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_minmax(0,520px)]">
      {/* ---------- Brand panel ---------- */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-navy-900 px-6 py-8 text-white sm:px-10 lg:px-14 lg:py-12">
        <div className="absolute inset-0 opacity-30">
          <img src={HERO} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/78 via-navy-900/82 to-navy-800/72" />
        <div className="grid-paper absolute inset-0 opacity-40" />

        <div className="relative flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <p className="text-[19px] leading-tight font-extrabold tracking-tight">
              SiteSync <span className="text-sky-400">AI</span>
            </p>
            <p className="text-[10.5px] font-semibold tracking-[0.18em] text-navy-300">PLAN • TRACK • BUILD BETTER</p>
          </div>
        </div>

        <div className="relative max-w-xl py-10 lg:py-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wide ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Planning-to-Execution Bridge for Infrastructure
          </span>
          <h1 className="mt-5 text-[30px] leading-[1.12] font-extrabold tracking-tight sm:text-[40px]">
            Connect the planned schedule to what is{" "}
            <span className="text-sky-400">actually happening on site.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-navy-200">
            SiteSync AI converts geo-tagged site evidence into verified progress, detects deviation from the baseline
            plan, raises early warnings and assigns corrective actions — so delays are caught in weeks, not months.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { icon: "camera" as const, t: "Geo-tagged evidence", d: "Photo / video with GPS, time, manpower" },
              { icon: "ai" as const, t: "Activity matching", d: "Evidence mapped to the WBS automatically" },
              { icon: "alert" as const, t: "Deviation detection", d: "Planned vs actual gap per activity" },
              { icon: "actions" as const, t: "Corrective action", d: "Owned, dated and tracked to closure" },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3 rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-400/15 text-sky-300">
                  <Icon name={f.icon} className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold">{f.t}</p>
                  <p className="text-[11px] leading-snug text-navy-300">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {["PLAN", "ACTUAL", "GAP", "RISK", "EARLY WARNING", "ACTION"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="rounded-lg bg-white/10 px-2 py-1 tracking-wide ring-1 ring-white/10">{s}</span>
                {i < 5 && <Icon name="chevronRight" className="h-3.5 w-3.5 text-sky-400" />}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[11px] font-semibold text-navy-300">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="projects" className="h-3.5 w-3.5 text-sky-400" /> Create projects with full baseline details
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="camera" className="h-3.5 w-3.5 text-sky-400" /> Geo-tagged evidence trail
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shield" className="h-3.5 w-3.5 text-emerald-400" /> Audit-ready
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo className="mb-4 h-10 w-10" />
          </div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-navy-900">Sign in to your workspace</h2>
          <p className="mt-1.5 text-[13px] text-navy-500">
            Demonstration environment · select a role to pre-fill demo credentials.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-xl bg-navy-50 p-1.5 ring-1 ring-navy-100">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => pickRole(r)}
                className={cn(
                  "rounded-lg px-2 py-2 text-[11.5px] font-bold transition-all duration-200",
                  role.id === r.id ? "bg-white text-navy-900 shadow-sm" : "text-navy-500 hover:text-navy-800",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Work email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@department.gov.in"
                autoComplete="username"
              />
            </Field>
            <Field label="Password" required hint="Demo password is pre-filled for the presentation.">
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <Icon name="lock" className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
              </div>
            </Field>

            {error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 ring-1 ring-red-100">
                <Icon name="info" className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-navy-600">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-navy-300 accent-navy-700" />
                Keep me signed in
              </label>
              <button type="button" className="text-[12px] font-semibold text-sky-700 hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading} icon={loading ? undefined : "arrowRight"}>
              {loading ? "Verifying credentials…" : `Continue as ${role.label}`}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-canvas p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-navy-500 uppercase">
              <Icon name="shield" className="h-3.5 w-3.5 text-emerald-600" /> Prototype stack
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy-600">
              Front-end HTML/CSS/JS · REST API in Python · SQLite evidence & schedule store. No third-party services
              required for the demonstration.
            </p>
          </div>

          <p className="mt-5 text-center text-[10.5px] text-navy-400">
            © 2025 SiteSync AI · Smart India Hackathon prototype · Sample data only
          </p>
        </div>
      </div>
    </div>
  );
}
