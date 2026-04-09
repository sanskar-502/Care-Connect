# CareConnect Frontend — HackBricks 2026

Welcome to the frontend repository for **CareConnect**, built by **Team Butter Garlic Naan** for the HackBricks 2026 hackathon.

CareConnect is a premium, AI-driven healthcare platform designed to drastically reduce hospital readmissions through Predictive Risk Engines, Ambient AI documentation, and Automated Patient loop monitoring.

This frontend is a **high-fidelity prototype** entirely built with React and Vite. It heavily focuses on a modern, dark-themed glassmorphism aesthetic tailored explicitly for clinical intelligence.

---

## 🚀 Quick Start

1. **Install dependencies:**
   Make sure you are in the `/Frontend` directory.
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **View the app:**
   Open your browser to `http://localhost:5173`. 

---

## 🎨 Design System & CSS Architecture 

**IMPORTANT FOR CONTRIBUTORS:**
We are **NOT** using TailwindCSS in this project. All styling is explicitly handled via standard CSS and a strict CSS Variables (Custom Properties) design system to ensure unparalleled control over our custom glassmorphism and gradient aesthetics.

- **Global Variables:** Our entire color palette relies on `OKLCH` variables located at the top of `src/index.css`. This ensures perfectly smooth gradients and consistent styling across the app.
- **Component Styling:** Every page and major component has its own dedicated `.css` file (e.g., `LandingPage.css`, `PatientStatus.css`). Please keep your CSS scoped to the relevant stylesheets.
- **Animations:** We heavily rely on CSS animations (e.g., `.animate-fade-in-up`, `.animate-slide-in-right`) defined in `index.css`. Reuse these classes whenever components mount!

---

## 🗺️ Application Structure

The application is routing-driven via `react-router-dom`. The following main views are available:

- **`/` (Landing Page):** The core marketing site explaining our 5 core features (Predictive ML, SHAP Explainability, Ambient AI, RAG Copilot, Twilio Follow-ups). Includes high-quality AI generated assets.
- **`/login` (Mock Persona Flow):** Instead of a generic auth flow, this page lets the judges/users select what persona they want to embody (Clinician, Admin, Patient) for demo purposes.
- **`/dashboard` (Clinician View):** The primary view for doctors and care managers. Shows live patient trajectories and risk scores.
- **`/alerts` (Escalation Center):** Simulates real-time webhook/Twilio alerts where incoming patient responses trigger UI updates.
- **`/analytics` (ML Dashboard):** Uses Recharts to visually graph predictive accuracy, ROC curves, and hospital impact telemetry.
- **`/patient-status/:patientId` (Patient View):** A mobile-optimized progressive-web-app (PWA) styled interface designed explicitly for patients. Allows them to log their daily check-ins (Medication, Blood Pressure, Blood Sugar).

---

## 📂 Folder Tree Breakdown

```text
Frontend/
├── public/
│   └── assets/           <-- All globally accessible images, SVGs, and AI-generated logos
├── src/
│   ├── components/       <-- Global reusable chunks (Navbar, Layouts)
│   ├── data/             <-- mockData.js (Contains ALL static JSON data for prototyping)
│   ├── pages/            <-- Individual Route Views (Landing, Dashboard, Alerts, PatientStatus)
│   ├── App.jsx           <-- Main Router Definition
│   ├── index.css         <-- Global styles, typography, variables, and animations
│   └── main.jsx          <-- React App Entry
└── package.json
```

---

## 🛠️ Data State (Mocking)

Currently, the application relies on `src/data/mockData.js` to populate tables, charts, and patient data. 
As we begin backend integration with Python/Node, we will replace these simple imports with React `useEffect` data-fetching logic targeting our local API endpoints. If you need to add a new UI feature, hardcode its initial state data into `mockData.js` first.
