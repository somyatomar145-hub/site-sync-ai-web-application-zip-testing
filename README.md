# SiteSync AI — Planning-to-Execution Bridge

> **An intelligent, closed-loop infrastructure project management platform.**  
> Plan • Track • Build Better.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

---

## 🌟 Executive Summary

**SiteSync AI** bridges the disconnect between architectural master schedules and day-to-day ground reality on civil infrastructure projects. Rather than merely logging historical delays after milestones slip, SiteSync deploys multi-factor predictive heuristics to forecast delay probabilities, identify spatial and resource bottlenecks, and assign proactive recovery playbooks to protect critical-path delivery.

---

## 🚀 Key Modules & Capabilities

- **📊 Central Project Dashboard:** Real-time visibility into overall project health, physical vs. financial progress S-Curves, milestone velocity, and active alert streams.
- **🏗️ Multi-Project Workspace:** Switch between concurrent construction sites, or configure new capital projects with custom WBS structures and phase dependencies.
- **📅 Schedule & WBS Engine:** Critical path calculation, Gantt-style timeline breakdown, planned vs. actual duration variance tracking.
- **📸 Geo-Tagged Site Evidence Capture:** Field engineers capture progress updates, geo-verified photos, manpower logs, and material receipts with AI semantic linking to WBS work packages.
- **⚠️ Predictive Early Risk Engine:** Multi-factor risk analysis tracking manpower deficit ratios, material lead times, and pace variance to calculate delay probability and impact days before schedule slippage occurs.
- **🛡️ Action Center & Recovery Playbooks:** Domain-specific mitigation actions (Workforce deployment, expedited logistics, re-sequencing) with quantified loss prevention metrics.
- **🤖 SiteSync AI Copilot & Multi-Factor Analysis:** Contextual assistant capable of diagnosing complex schedule bottlenecks, explaining variance causality, and recommending mitigation workflows.
- **📑 Executive Milestone & Audit Reports:** High-level executive summaries and downloadable PDF/CSV audit trails for project owners, lenders, and review committees.

---

## 💻 Tech Stack

- **Framework:** React 19.2 + TypeScript 5.9
- **Bundler & Build Tool:** Vite 7.3
- **Styling:** Tailwind CSS v4 + `@tailwindcss/vite`
- **State Management:** Reactive Context & LocalStorage Persistence
- **Packaging:** Self-contained single-file / standalone bundle support via `vite-plugin-singlefile`
- **Zero External API Lock-in:** Heuristics and analysis engine run entirely client-side.

---

## 🛠️ Getting Started Locally

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation

```bash
# 1. Clone or extract repository
cd sitesync-ai-web-application

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Building for Production

```bash
# Compile and build production bundle
npm run build

# Preview production build locally
npm run preview
```

The optimized assets will be generated in the `dist/` directory.

---

## 📁 Repository Structure

```
sitesync-ai-web-application/
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies and npm scripts
├── package-lock.json        # Deterministic dependency lockfile
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite + Tailwind v4 + SingleFile configuration
├── .gitignore               # Excludes node_modules, build outputs, and cache
├── README.md                # Project documentation
└── src/
    ├── App.tsx              # Root shell & tab navigation router
    ├── main.tsx             # DOM mount & strict mode bootstrap
    ├── index.css            # Tailwind theme tokens & animation keyframes
    ├── components/
    │   ├── Charts.tsx       # S-Curve, radial gauge, and monthly variance charts
    │   ├── Icons.tsx        # High-performance inline SVG icon library
    │   ├── Layout.tsx       # Navigation sidebar, header, and responsive shell
    │   └── ui.tsx           # Reusable UI component system (Cards, Badges, Modals)
    ├── data/
    │   └── model.ts         # Infrastructure project schemas, WBS nodes, and sample dataset
    ├── pages/
    │   ├── AIAnalysis.tsx   # AI copilot & multi-factor diagnostic center
    │   ├── ActionCenter.tsx # Recovery playbooks & penalty prevention tracking
    │   ├── Dashboard.tsx    # Executive project control dashboard
    │   ├── Login.tsx        # Role-based access authentication gate
    │   ├── NewProject.tsx   # Capital project initialization wizard
    │   ├── Progress.tsx     # Physical vs. planned progress tracking
    │   ├── Projects.tsx     # Portfolio project switcher
    │   ├── Reports.tsx      # Milestone variance reports and audit trails
    │   ├── Risks.tsx        # Early warning risk matrix & probability calculator
    │   ├── Schedule.tsx     # Master Gantt & critical path activity tracker
    │   └── SiteEvidence.tsx # Field inspection evidence & geo-tag validator
    ├── store/
    │   └── store.tsx        # Centralized project state management & persistence
    └── utils/
        └── cn.ts            # Tailwind class name merge utility
```

---

## 🚢 Uploading to GitHub

This folder is clean and weighs **less than 1 MB** (proper size, zero bloated dependencies). To push to your GitHub account:

```bash
cd /Users/somya/Desktop/sitesync-ai-web-application

# Link to your remote GitHub repository
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git branch -M main
git push -u origin main
```
