import { useEffect, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "@/components/Icons";
import { statusMeta, varianceTone, type Status } from "@/data/model";

/* ---------------- Card ---------------- */
export function Card({
  className,
  children,
  hover = false,
  ...rest
}: { className?: string; children: ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white shadow-card",
        hover && "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:border-navy-200",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700 ring-1 ring-navy-100">
            <Icon name={icon} className="h-[18px] w-[18px]" />
          </span>
        )}
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-navy-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-navy-500">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}

/* ---------------- Button ---------------- */
type BtnVariant = "primary" | "outline" | "ghost" | "danger" | "soft";
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  ...rest
}: {
  children?: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    primary:
      "bg-navy-800 text-white shadow-sm hover:bg-navy-700 hover:shadow-md active:scale-[.985] ring-1 ring-navy-900/10",
    outline: "bg-white text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50 hover:ring-navy-300 active:scale-[.985]",
    ghost: "text-navy-600 hover:bg-navy-50",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[.985]",
    soft: "bg-navy-50 text-navy-700 ring-1 ring-navy-100 hover:bg-navy-100",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
    md: "h-10 px-4 text-[13px] gap-2 rounded-xl",
    lg: "h-12 px-5 text-sm gap-2 rounded-xl",
  };
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />}
      {children}
    </button>
  );
}

/* ---------------- Badge / pill ---------------- */
export function Badge({
  children,
  tone = "navy",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: "navy" | "green" | "amber" | "red" | "teal" | "slate" | "sky";
  className?: string;
  dot?: boolean;
}) {
  const tones = {
    navy: "bg-navy-50 text-navy-700 ring-navy-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  const dots: Record<string, string> = {
    navy: "bg-navy-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    teal: "bg-teal-500",
    slate: "bg-slate-400",
    sky: "bg-sky-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const m = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        m.bg,
        m.text,
        m.ring,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {(status === "critical" || status === "warning") && (
          <span className={cn("anim-ping absolute inline-flex h-full w-full rounded-full", m.dot)} />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", m.dot)} />
      </span>
      {m.label}
    </span>
  );
}

export function VarianceChip({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const tone = varianceTone(value);
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs font-semibold ring-1 tabular",
        tone.bg,
        tone.text,
        tone.ring,
      )}
    >
      <Icon name={up ? "trendUp" : "trendDown"} className="h-3 w-3" strokeWidth={2.4} />
      {up ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

/* ---------------- Progress bar ---------------- */
export function ProgressBar({
  planned,
  actual,
  height = "h-2.5",
  showMarker = true,
  className,
}: {
  planned: number;
  actual: number;
  height?: string;
  showMarker?: boolean;
  className?: string;
}) {
  const tone = varianceTone(planned - actual);
  const barColor = planned - actual <= 0 ? "bg-emerald-500" : planned - actual <= 7 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-navy-100/80", height, className)}>
      <div
        className="absolute inset-y-0 left-0 rounded-full border-r-2 border-dashed border-navy-400/70 bg-navy-200/60"
        style={{ width: `${Math.min(planned, 100)}%` }}
      />
      <div
        className={cn("anim-grow absolute inset-y-0 left-0 rounded-full", barColor)}
        style={{ width: `${Math.min(actual, 100)}%` }}
      />
      {showMarker && planned > 0 && planned <= 100 && (
        <span
          className="absolute -top-0.5 bottom-[-2px] w-px bg-navy-700/60"
          style={{ left: `${planned}%` }}
          aria-hidden
        />
      )}
      <span className="sr-only">{tone.label}</span>
    </div>
  );
}

export function SingleBar({ value, tone = "navy", height = "h-2" }: { value: number; tone?: string; height?: string }) {
  const map: Record<string, string> = {
    navy: "bg-navy-700",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    teal: "bg-teal-500",
  };
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-navy-100/70", height)}>
      <div className={cn("anim-grow h-full rounded-full", map[tone])} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

/* ---------------- form controls ---------------- */
export function Field({
  label,
  children,
  hint,
  required,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-[12px] font-semibold text-navy-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-navy-400">{hint}</span>}
    </label>
  );
}

const controlBase =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-navy-900 placeholder:text-navy-300 transition-all duration-200 focus:border-navy-400 focus:outline-none focus:ring-4 focus:ring-navy-100";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlBase, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlBase, "min-h-[84px] resize-y", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(controlBase, "appearance-none pr-9", props.className)} />
      <Icon
        name="chevronDown"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-navy-400"
      />
    </div>
  );
}

/* ---------------- Stat / KPI ---------------- */
export function KpiCard({
  label,
  value,
  unit,
  sub,
  icon,
  tone = "navy",
  delta,
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon: IconName;
  tone?: "navy" | "blue" | "green" | "amber" | "red" | "teal";
  delta?: { value: number; suffix?: string; good?: boolean };
  delay?: number;
}) {
  const tones: Record<string, { iconBg: string; ring: string; text: string }> = {
    navy: { iconBg: "bg-navy-800", ring: "ring-navy-100", text: "text-navy-900" },
    blue: { iconBg: "bg-sky-600", ring: "ring-sky-100", text: "text-sky-700" },
    green: { iconBg: "bg-emerald-500", ring: "ring-emerald-100", text: "text-emerald-700" },
    amber: { iconBg: "bg-amber-500", ring: "ring-amber-100", text: "text-amber-700" },
    red: { iconBg: "bg-red-500", ring: "ring-red-100", text: "text-red-700" },
    teal: { iconBg: "bg-teal-600", ring: "ring-teal-100", text: "text-teal-700" },
  };
  const t = tones[tone];
  return (
    <Card
      hover
      className="anim-up group relative overflow-hidden p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold tracking-widest text-navy-400 uppercase">{label}</span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg text-white transition-transform duration-300 group-hover:scale-110",
            t.iconBg,
          )}
        >
          <Icon name={icon} className="h-4 w-4" strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className={cn("text-[30px] leading-none font-bold tracking-tight tabular", t.text)}>{value}</span>
        {unit && <span className="pb-0.5 text-sm font-semibold text-navy-400">{unit}</span>}
      </div>
      {delta && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold",
              delta.good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            <Icon name={delta.value >= 0 ? "trendUp" : "trendDown"} className="h-3 w-3" strokeWidth={2.5} />
            {delta.value >= 0 ? "+" : ""}
            {delta.value}
            {delta.suffix ?? "%"}
          </span>
          {sub && <span className="truncate text-[11px] text-navy-500">{sub}</span>}
        </div>
      )}
      {!delta && sub && <p className="mt-2 text-[11px] text-navy-500">{sub}</p>}
    </Card>
  );
}

/* ---------------- Pipeline band (core concept) ---------------- */
const pipeline = [
  { label: "Plan", icon: "schedule" as IconName },
  { label: "Actual", icon: "camera" as IconName },
  { label: "Gap", icon: "progress" as IconName },
  { label: "Risk", icon: "alert" as IconName },
  { label: "Early Warning", icon: "bell" as IconName },
  { label: "Action", icon: "actions" as IconName },
];

export function PipelineBand({ active = 6, className }: { active?: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-stretch gap-x-1 gap-y-2", className)}>
      {pipeline.map((step, i) => {
        const done = i < active - 1;
        const current = i === active - 1;
        return (
          <div key={step.label} className="flex min-w-0 flex-1 items-center gap-1">
            <div
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 transition-all duration-300",
                current
                  ? "bg-navy-800 text-white shadow-sm"
                  : done
                    ? "bg-navy-50 text-navy-700 ring-1 ring-navy-100"
                    : "bg-white text-navy-300 ring-1 ring-line",
              )}
            >
              <Icon name={step.icon} className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              <span className="truncate text-[11.5px] font-bold tracking-wide">{step.label}</span>
            </div>
            {i < pipeline.length - 1 && (
              <Icon
                name="chevronRight"
                className={cn("hidden h-4 w-4 shrink-0 sm:block", done || current ? "text-navy-400" : "text-line")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="anim-in absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "anim-pop relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-2xl",
          wide ? "sm:max-w-4xl" : "sm:max-w-xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-navy-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-navy-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
            aria-label="Close"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-navy-50/50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- Misc ---------------- */
export function KeyValue({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-wide text-navy-400 uppercase">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-[13px] font-semibold text-navy-900", mono && "font-mono text-[12.5px]")}>
        {value}
      </dd>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(Er\.|Ar\.|Mr\.|Ms\.|Dr\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-100 text-[12px] font-bold text-navy-700 ring-2 ring-white",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function EmptyState({ icon = "info", title, hint }: { icon?: IconName; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-50 text-navy-400">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      {hint && <p className="max-w-sm text-xs text-navy-500">{hint}</p>}
    </div>
  );
}

export function Tooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 z-30 -translate-x-1/2 rounded-md bg-navy-900 px-2 py-1 text-[10.5px] font-semibold whitespace-nowrap text-white opacity-0 shadow-md transition-opacity duration-200 group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  );
}
