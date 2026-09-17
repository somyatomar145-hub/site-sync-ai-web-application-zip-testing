import type { SVGProps } from "react";

const P = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="1.6" />
      <rect x="13.5" y="11" width="7.5" height="10" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </>
  ),
  projects: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9.5 21v-5h5v5" />
      <path d="M9.5 10h.01M14.5 10h.01" />
    </>
  ),
  schedule: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.4" />
      <path d="M3 9.5h18M8 3v3.5M16 3v3.5" />
      <path d="M6.5 13.5h5M9 16.5h6" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a2 2 0 0 0 1.7-.95l.6-1a1.5 1.5 0 0 1 1.28-.72h3.44a1.5 1.5 0 0 1 1.28.72l.6 1A2 2 0 0 0 17.3 6h1.2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.6" />
    </>
  ),
  progress: (
    <>
      <path d="M3 20h18" />
      <path d="M4 16l4.5-5 3.5 3 5-6.5" />
      <path d="M17 7.5h3v3" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20.2h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.2M12 17h.01" />
    </>
  ),
  report: (
    <>
      <path d="M14 3v4.5a1 1 0 0 0 1 1h4.5" />
      <path d="M19.5 8.5V19a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H14z" />
      <path d="M8 13h8M8 16.5h5" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3.2 13.6 8 18.4 9.6 13.6 11.2 12 16l-1.6-4.8L5.6 9.6 10.4 8z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),
  actions: (
    <>
      <rect x="4" y="4" width="16" height="17" rx="2.4" />
      <path d="M9 3.2V6h6V3.2" />
      <path d="M8.6 13.4l2.2 2.2 4.6-4.8" />
    </>
  ),
  hardhat: (
    <>
      <path d="M3.5 17.5h17" />
      <path d="M5 17.5v-2a7 7 0 0 1 14 0v2" />
      <path d="M10 8.4V5.6A1.6 1.6 0 0 1 11.6 4h.8A1.6 1.6 0 0 1 14 5.6v2.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.8 19.5a6.3 6.3 0 0 1 12.4 0" />
      <path d="M16.2 5.3a3.4 3.4 0 0 1 0 6.6M17.6 19.5a6.4 6.4 0 0 0-1-3.4 6.3 6.3 0 0 1 4.6 3.4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
      <path d="M3.5 10h17M8.5 3v4M15.5 3v4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.8" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16 9.4" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />,
  chevronDown: <path d="M6 9.5 12 15.5 18 9.5" />,
  chevronRight: <path d="M9.5 6 15.5 12 9.5 18" />,
  chevronLeft: <path d="M14.5 6 8.5 12l6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M4.5 15v3A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </>
  ),
  download: (
    <>
      <path d="M12 4.5V16" />
      <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 16.5v1.5A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
    </>
  ),
  print: (
    <>
      <path d="M7 8.5V3.5h10v5" />
      <rect x="3.5" y="8.5" width="17" height="7.5" rx="2" />
      <path d="M7 14h10v6.5H7z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M3.5 6h17l-6.5 7.5v5.5l-4-2v-3.5z" />,
  gps: (
    <>
      <circle cx="12" cy="12" r="6.6" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5z" />
      <path d="m4.5 12.5 7.5 4 7.5-4M4.5 17l7.5 4 7.5-4" />
    </>
  ),
  trendUp: (
    <>
      <path d="M3.5 17 10 10l4 3.5 6.5-7" />
      <path d="M15.5 6.5h5v5" />
    </>
  ),
  trendDown: (
    <>
      <path d="M3.5 7 10 14l4-3.5 6.5 7" />
      <path d="M15.5 17.5h5v-5" />
    </>
  ),
  wrench: (
    <>
      <path d="M15.5 3.5a5 5 0 0 0-4.4 7.4L4 18v2.5h2.5l7.1-7.1a5 5 0 0 0 6-6.6l-2.9 2.9-2.5-2.5 2.9-2.9a5 5 0 0 0-1.6-.8Z" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 16.5V6.5h11v10" />
      <path d="M13.5 9.5H18l3.5 4v3h-2" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
      <path d="M9 17.5h5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z" />
      <path d="M9.2 12.2l2 2 3.6-3.8" />
    </>
  ),
  logout: (
    <>
      <path d="M14.5 8.5V6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.5" />
      <path d="M9.5 12h10M16.5 8.5 20 12l-3.5 3.5" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.8 7.8M16.2 16.2l2.2 2.2M18.4 5.6l-2.2 2.2M7.8 16.2l-2.2 2.2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4.5V11h-6" />
    </>
  ),
  play: <path d="M8 5.5 18 12 8 18.5z" />,
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.4a10.5 10.5 0 0 0 5.1 5.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  code: <path d="m9 8-4.5 4L9 16M15 8l4.5 4L15 16" />,
  server: (
    <>
      <rect x="3.5" y="4" width="17" height="6.5" rx="2" />
      <rect x="3.5" y="13.5" width="17" height="6.5" rx="2" />
      <path d="M7 7.2h.01M7 16.7h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h14" />
      <path d="m13.5 7 5 5-5 5" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4h13l-2.5 4.5 2.5 4.5h-13" />
    </>
  ),
};

export type IconName = keyof typeof P;

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; className?: string; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {P[name]}
    </svg>
  );
}

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0d1e35" />
      <path d="M9 27.5h22" stroke="#5b88bd" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M13 27.5V19h5.5v8.5M20.5 27.5V14H26v13.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 14.5l7-4.5 7 4.5"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32.5" cy="9.5" r="3" fill="#10b981" />
    </svg>
  );
}
