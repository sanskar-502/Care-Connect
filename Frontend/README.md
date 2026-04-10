# CareConnect 🏥 — React Clinical Web UI (Frontend)

Welcome to the **CareConnect Triage Dashboard**. This folder represents **Pillar 1** of the architecture. It is an ultra-modern, high-contrast, real-time "War Room" interface designed specifically to give clinicians immediate situational awareness regarding patient readmission risk levels.

---

## 🚀 Tech Stack & Design System

- **Framework:** React 19 + Vite (Lightning-fast HMR and optimized building).
- **Data Fetching:** Axios (Connected to Node.js API Gateway).
- **Real-Time Data:** `socket.io-client` (Zero-refresh live updates).
- **Visualization:** `recharts` (For ROI analytics) + Custom pure-SVG interactive components (Vitals Trend Charts).
- **Design Aesthetic:** Premium Medical Glassmorphism. Features heavy use of dynamic hardware-accelerated animations, deep cinematic gradients (`#121420`), and `OKLCH` color spaces to prevent alert fatigue while drastically highlighting critical UI changes.

---

## 🌊 Application Architecture & Data Flow

Because CareConnect requires critical speed, the Frontend relies on a **Push-and-Pull** real-time UI philosophy.

```mermaid
flowchart LR
    A[React Web App] <-->|Rest API (Axios)| B[Node.js API Gateway]
    B -->|WebSocket broadcast| A
    C((Mobile App / Phone)) -->|New Vitals / Text| B
    
    subgraph Frontend Features
        D(Triage Board)
        E(Escalation Center)
        F(Dictation Hub)
    end
    
    A ----> D
    A ----> E
    A ----> F
```

### 1. Triage Board (`/pages/Dashboard.jsx`)
- **Flow:** On load, a `useEffect` calls `GET /api/patients` to populate the board. The UI automatically sorts the table, placing patients with the highest `currentRiskScore` at the very top.
- **Real-Time Hook:** The page listens to the `vitals_updated` WebSocket event. If a patient logs new vitals from home, the Node.js ML recalculates the score. Without the clinician refreshing the page, the specific patient's risk bar instantly animates to the new width, and they physically re-sort on the screen.

### 2. The Escalation Center (`/pages/AlertsPage.jsx`)
- **Flow:** Replaces the messy inbox concept. Calls `GET /api/webhooks/alerts` to load active unresolved flags.
- **Real-Time Hook:** Listens to the `critical_alert` WebSocket event. If the patient replies "NO" to taking meds on WhatsApp, Twilio tells Node, and Node forces the React UI to instantly prepend a new WhatsApp-styled chat bubble into the list.

### 3. Patient Detail & Dictation Hub (`/pages/PatientDetail.jsx`)
- **Flow:** Provides granular deep dives into SHAP explanations and custom-built, dependency-free SVG Vitals charts.
- **Ambient Dictation:** Features an `expo-av` mocked capability. When a doctor types out a raw note and hits *Process*, React sends a `POST /api/data/dictation` payload to the API Gateway. The frontend loader spins until it receives the structured JSON (`Symptoms`, `Actions`, `Meds`) back from the Python NLP Engine.

---

## 📂 Folder Structure

```text
Frontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI Blocks
│   │   └── Navbar.jsx       # Alert badges dynamically tied to active alert lengths
│   ├── data/                
│   │   └── mockData.js      # Legacy fallback data for design placeholders
│   ├── pages/               # Core Views
│   │   ├── AlertsPage.jsx   # The Escalation Center
│   │   ├── AnalyticsPage.jsx# ROI & Fleet Management graphs
│   │   ├── Dashboard.jsx    # The active patient Triage Board
│   │   ├── LoginPage.jsx    # Persona selection layer
│   │   ├── PatientDetail.jsx# Clinical Deep-Dives & LLM Dictation Hub
│   │   └── PatientStatus.jsx# Web-wrapper mock for the PWA patient flow
│   ├── services/
│   │   └── api.js           # The centralized Axios instance communicating w/ port 5000
│   ├── App.jsx              # React Router mapping
│   ├── index.css            # The unified Global Design System (Tokens, Utilities, OKLCH)
│   └── main.jsx             # React Virtual DOM entry
├── package.json
└── vite.config.js           # Build settings
```

---

## 🎨 Global Design System (`src/index.css`)

Rather than relying on massive component libraries like Tailwind or Material UI, CareConnect utilizes a custom-built, atomic CSS framework relying strictly on CSS Variables. 

1. **Colors**: We use `oklch()` color settings for mathematically perfectly spaced saturation jumps, guaranteeing accessibility contrast even in "Dark Mode".
2. **Glassmorphism**: Modals, tables, and navbars utilize layered `backdrop-filter: blur(20px)` atop highly transparent background alphas to simulate polished glass resting over the underlying dark canvas.
3. **Typography**: Engineered to highlight only the most critical clinical data, lowering font weights on non-essential text so doctors process what matters instantly.

---

## 🛠️ Setup & Running

This frontend requires the **Backend API Gateway (Port 5000)** to be running simultaneously to populate real-time data. 

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Vite Dev Server:**
   ```bash
   npm run dev
   ```
   *The application will boot almost instantly on `http://localhost:5173`.*
