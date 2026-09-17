import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, Select, Textarea } from "@/components/ui";
import { ProjectRequired } from "@/components/Layout";
import { useStore } from "@/store/store";
import { STAFF, stampNow, todayISO, verifyMeta, type Evidence, type VerifyState } from "@/data/model";
import { cn } from "@/utils/cn";
import type { PageKey as PK } from "@/components/Layout";

const FILTERS: { key: "all" | VerifyState; label: string }[] = [
  { key: "all", label: "All evidence" },
  { key: "verified", label: "Verified" },
  { key: "pending", label: "Pending review" },
  { key: "flagged", label: "Flagged" },
];

export default function SiteEvidence({ setPage }: { setPage: (p: PK) => void }) {
  const { active, evidenceFor, addEvidence, setVerify, deleteEvidence } = useStore();
  const [filter, setFilter] = useState<"all" | VerifyState>("all");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<{ name: string; url: string; type: "Photo" | "Video" } | null>(null);
  const [gps, setGps] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [ts, setTs] = useState(stampNow());
  const [fWbs, setFWbs] = useState("");
  const [skilled, setSkilled] = useState("12");
  const [unskilled, setUnskilled] = useState("22");
  const [equip, setEquip] = useState("");
  const [remarks, setRemarks] = useState("");
  const [chainage, setChainage] = useState("");
  const [progress, setProgress] = useState("2");
  const [uploader, setUploader] = useState(STAFF[2].name);
  const [error, setError] = useState("");

  const evidence = active ? evidenceFor(active.id) : [];
  const task = active?.tasks.find((t) => t.id === fWbs);

  const filtered = useMemo(
    () =>
      evidence.filter(
        (e) =>
          (filter === "all" || e.verify === filter) &&
          (q.trim() === "" ||
            `${e.id} ${e.wbsId} ${e.uploadedBy} ${e.remarks} ${e.chainage}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [evidence, filter, q],
  );

  const counts = {
    all: evidence.length,
    verified: evidence.filter((e) => e.verify === "verified").length,
    pending: evidence.filter((e) => e.verify === "pending").length,
    flagged: evidence.filter((e) => e.verify === "flagged").length,
  };

  if (!active) return <ProjectRequired setPage={setPage} />;

  const captureGps = () => {
    setGpsBusy(true);
    window.setTimeout(() => {
      const lat = (20 + Math.random()).toFixed(4);
      const lng = (73 + Math.random()).toFixed(4);
      setGps(`${lat}° N, ${lng}° E · ±3.8 m`);
      setTs(stampNow());
      setGpsBusy(false);
      setToast("GPS position locked · timestamp stamped from the device clock");
      window.setTimeout(() => setToast(null), 3200);
    }, 800);
  };

  const onPickFile = (f?: File) => {
    if (!f) return;
    setFile({ name: f.name, url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "Video" : "Photo" });
    setError("");
  };

  const submit = () => {
    if (!active.tasks.length) return setError("Add WBS activities to the project before uploading evidence.");
    if (!fWbs) return setError("Select the WBS activity this evidence belongs to.");
    if (!file) return setError("Attach at least one site photo or video before submitting.");
    if (!gps) return setError("Capture the GPS location — every evidence record must be geo-tagged.");
    if (!remarks.trim()) return setError("Add engineer remarks describing the work captured.");
    const rec: Omit<Evidence, "id"> = {
      projectId: active.id,
      wbsId: fWbs,
      type: file.type,
      image: file.url,
      dateTime: ts,
      capturedAt: todayISO(),
      gps,
      chainage,
      uploadedBy: uploader,
      role: STAFF.find((s) => s.name === uploader)?.role ?? "Site Engineer",
      verify: "pending",
      skilled: Math.max(0, Number(skilled) || 0),
      unskilled: Math.max(0, Number(unskilled) || 0),
      equipment: equip,
      remarks: remarks.trim(),
      progress: Math.max(0, Math.min(100, Number(progress) || 0)),
      aiTag: "Queued for AI matching",
    };
    addEvidence(rec);
    setFile(null);
    setGps(null);
    setRemarks("");
    setProgress("2");
    setError("");
    setToast(`Evidence submitted · ${rec.progress}% progress added to ${fWbs} and queued for AI matching`);
    window.setTimeout(() => setToast(null), 4200);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="anim-pop fixed top-20 right-4 z-50 flex max-w-sm items-start gap-2.5 rounded-xl bg-navy-900 px-4 py-3 text-white shadow-lift sm:right-6">
          <Icon name="checkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="text-[12px] leading-snug font-semibold">{toast}</p>
        </div>
      )}

      {/* ---------- stats ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Total records", v: counts.all, i: "database" as const, tone: "bg-navy-800" },
          { l: "Verified", v: counts.verified, i: "checkCircle" as const, tone: "bg-emerald-500" },
          { l: "Pending review", v: counts.pending, i: "clock" as const, tone: "bg-amber-500" },
          { l: "Flagged", v: counts.flagged, i: "info" as const, tone: "bg-red-500" },
        ].map((s, i) => (
          <Card key={s.l} hover className="anim-up p-4" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold tracking-widest text-navy-400 uppercase">{s.l}</p>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg text-white", s.tone)}>
                <Icon name={s.i} className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-[24px] leading-none font-bold text-navy-900 tabular">{s.v}</p>
            <p className="mt-2 text-[11px] text-navy-500">{active.code} · geo-tagged</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
        {/* ================= Upload panel ================= */}
        <Card className="anim-up h-fit">
          <CardHeader title="Upload Site Evidence" subtitle="Geo-tagged capture by the site engineer" icon="camera" right={<Badge tone="sky">Mobile-ready</Badge>} />
          <div className="space-y-4 p-5">
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />

            {file ? (
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="relative aspect-[16/10] bg-navy-100">
                  {file.type === "Photo" ? (
                    <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                  ) : (
                    <video src={file.url} controls className="h-full w-full object-cover" />
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-lg bg-navy-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    <Icon name={file.type === "Video" ? "play" : "camera"} className="h-3 w-3" /> {file.type}
                  </span>
                  <button onClick={() => setFile(null)} className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-navy-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600">
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <Icon name="checkCircle" className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="truncate font-mono text-[11px] text-navy-600">{file.name}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onPickFile(e.dataTransfer.files?.[0]);
                }}
                className="group grid w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50/50 px-4 py-8 text-center transition-all hover:border-navy-400 hover:bg-navy-50"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-navy-600 shadow-sm ring-1 ring-line transition-transform group-hover:scale-110">
                  <Icon name="upload" className="h-5 w-5" />
                </span>
                <span className="text-[12.5px] font-bold text-navy-800">Upload photo or video</span>
                <span className="text-[11px] text-navy-500">Drag & drop or tap · JPG, PNG, MP4 · max 25 MB</span>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[10.5px] font-semibold text-navy-600 ring-1 ring-line">
                  <Icon name="camera" className="h-3.5 w-3.5" /> EXIF & GPS read automatically
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-canvas p-3">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">
                  <Icon name="gps" className="h-3.5 w-3.5" /> GPS location
                </p>
                <p className={cn("mt-1 font-mono text-[11px] font-semibold", gps ? "text-navy-900" : "text-navy-400")}>{gps ?? "Not captured"}</p>
                <Button size="sm" variant="outline" className="mt-2 w-full" icon="gps" onClick={captureGps} disabled={gpsBusy}>
                  {gpsBusy ? "Locking…" : "Capture GPS"}
                </Button>
              </div>
              <div className="rounded-xl border border-line bg-canvas p-3">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-navy-400 uppercase">
                  <Icon name="clock" className="h-3.5 w-3.5" /> Timestamp
                </p>
                <p className="mt-1 font-mono text-[11px] font-semibold text-navy-900">{ts}</p>
                <p className="mt-2 text-[10.5px] text-navy-400">Auto · device clock (IST)</p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Project">
                <Input value={`${active.code} — ${active.name}`} readOnly className="bg-navy-50/60" />
              </Field>
              <Field label="Uploaded by">
                <Select value={uploader} onChange={(e) => setUploader(e.target.value)}>
                  {STAFF.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="WBS / Activity" required className="sm:col-span-2" hint={task ? `${task.group} · responsible ${task.owner} · currently ${task.actual}% complete` : "Select the activity this evidence supports"}>
                <Select value={fWbs} onChange={(e) => setFWbs(e.target.value)}>
                  <option value="">Select activity…</option>
                  {active.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Chainage / landmark">
                <Input value={chainage} onChange={(e) => setChainage(e.target.value)} placeholder="CH 46+250" />
              </Field>
              <Field label="Progress claimed (%)" hint="Added to the activity's actual progress.">
                <Input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} />
              </Field>
              <Field label="Skilled labour (nos)">
                <Input type="number" min="0" value={skilled} onChange={(e) => setSkilled(e.target.value)} />
              </Field>
              <Field label="Unskilled labour (nos)">
                <Input type="number" min="0" value={unskilled} onChange={(e) => setUnskilled(e.target.value)} />
              </Field>
              <Field label="Plant & machinery deployed" className="sm:col-span-2">
                <Input value={equip} onChange={(e) => setEquip(e.target.value)} placeholder="Piling Rig ×1, Mobile Crane ×1" />
              </Field>
              <Field label="Engineer remarks" required className="sm:col-span-2" hint="Describe progress, quality checks and any constraint observed.">
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Pile cap P-06 reinforcement complete, pour planned for tomorrow 06:00." />
              </Field>
            </div>

            {error && (
              <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-700 ring-1 ring-red-100">
                <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button icon="checkCircle" className="flex-1" onClick={submit}>
                Submit evidence
              </Button>
              <Button
                variant="outline"
                icon="refresh"
                onClick={() => {
                  setFile(null);
                  setGps(null);
                  setRemarks("");
                  setError("");
                }}
              >
                Reset
              </Button>
            </div>

            <div className="rounded-xl bg-navy-50 p-3 ring-1 ring-navy-100">
              <p className="text-[10.5px] font-bold tracking-wider text-navy-500 uppercase">What happens after submit</p>
              <ol className="mt-2 space-y-1.5 text-[11px] text-navy-600">
                {[
                  "Record stored against the project with GPS, timestamp and uploader identity",
                  "AI matches the capture to the selected WBS activity",
                  "Claimed progress updates the actual % for that work front",
                  "PMC verifier approves or flags the record — full audit trail",
                ].map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-navy-800 text-[9px] font-bold text-white">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>

        {/* ================= Evidence gallery ================= */}
        <Card className="anim-up">
          <CardHeader
            title="Evidence Register"
            subtitle="Newest submissions first · verification state shown on each card"
            icon="eye"
            right={
              <Button size="sm" variant="outline" icon="report" onClick={() => setPage("reports")}>
                Evidence report
              </Button>
            }
          />
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn("rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition-all", filter === f.key ? "bg-navy-800 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100")}
                >
                  {f.label}
                  <span className={cn("ml-1.5 font-mono text-[10px]", filter === f.key ? "text-white/70" : "text-navy-400")}>{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-[240px]">
              <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence…" className="pl-9" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center gap-2 px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-50 text-navy-400">
                <Icon name="camera" className="h-6 w-6" />
              </span>
              <p className="text-[13px] font-semibold text-navy-800">No evidence records yet</p>
              <p className="max-w-sm text-[11.5px] text-navy-500">
                Upload a geo-tagged photo or video against an activity to build the verified progress trail.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((e, i) => {
                const vm = verifyMeta[e.verify];
                return (
                  <article
                    key={e.id}
                    className="anim-up group overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-lift"
                    style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
                      {e.type === "Photo" ? (
                        <img src={e.image} alt={e.wbsId} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-navy-900 text-white">
                          <Icon name="play" className="h-9 w-9" />
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-navy-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <Icon name={e.type === "Video" ? "play" : "camera"} className="h-3 w-3" /> {e.type}
                      </span>
                      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-white/92 px-2 py-1 text-[10px] font-bold text-navy-800 backdrop-blur">
                        <Icon name="pin" className="h-3 w-3 text-red-500" /> {e.chainage || "Geo-tagged"}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-navy-950/85 to-transparent p-2.5">
                        <span className="font-mono text-[10px] font-bold text-white/90">{e.id} · {e.wbsId}</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-800">
                          <Icon name="gps" className="h-3 w-3 text-sky-600" /> GPS
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="min-w-0 flex-1 text-[13px] leading-snug font-bold text-navy-900">
                          {active.tasks.find((t) => t.id === e.wbsId)?.name ?? e.wbsId}
                        </h4>
                        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ring-1", vm.bg, vm.text)}>
                          <Icon name={vm.icon} className="h-3 w-3" />
                          {vm.label}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1.5 text-[11px] text-navy-500">
                        <p className="flex items-center gap-1.5">
                          <Icon name="clock" className="h-3.5 w-3.5 text-navy-300" /> {e.dateTime}
                        </p>
                        <p className="flex items-start gap-1.5">
                          <Icon name="users" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-300" />
                          <span>
                            Labour {e.skilled + e.unskilled} nos ({e.skilled} skilled / {e.unskilled} unskilled)
                          </span>
                        </p>
                        {e.equipment && (
                          <p className="flex items-start gap-1.5">
                            <Icon name="truck" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-300" />
                            <span className="truncate">{e.equipment}</span>
                          </p>
                        )}
                        <p className="flex items-start gap-1.5">
                          <Icon name="gps" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-300" />
                          <span className="truncate font-mono">{e.gps}</span>
                        </p>
                      </div>

                      <p className="mt-2.5 line-clamp-2 rounded-lg bg-canvas p-2.5 text-[11px] leading-relaxed text-navy-600">{e.remarks}</p>

                      <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
                        <Avatar name={e.uploadedBy} className="h-7 w-7 text-[10px]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-semibold text-navy-800">{e.uploadedBy}</p>
                          <p className="truncate text-[10px] text-navy-400">{e.role}</p>
                        </div>
                        <Badge tone="sky">+{e.progress}%</Badge>
                      </div>

                      <div className="mt-3 flex gap-1.5">
                        {(["verified", "pending", "flagged"] as VerifyState[]).map((v) => (
                          <button
                            key={v}
                            onClick={() => setVerify(e.id, v)}
                            className={cn(
                              "flex-1 rounded-lg px-2 py-1.5 text-[10.5px] font-bold capitalize transition-colors",
                              e.verify === v ? "bg-navy-800 text-white" : "bg-navy-50 text-navy-500 hover:bg-navy-100",
                            )}
                          >
                            {v}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteEvidence(e.id)}
                          className="grid w-8 place-items-center rounded-lg bg-navy-50 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete evidence"
                        >
                          <Icon name="close" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
