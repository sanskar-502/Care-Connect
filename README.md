# 🏥 CareConnect

**HackBricks 2026 | Built by Team Butter Garlic Naan 🧄🍞**

CareConnect is a premium, **Hybrid AI Healthcare Platform** designed to drastically reduce 30-day hospital readmissions through Predictive Risk Engines, Ambient AI Documentation, and Automated Patient Loop Monitoring.

---

## 🛑 The Problem: The "Revolving Door"

Nearly **20% of Medicare patients** are readmitted within 30 days of discharge, costing the US healthcare system over **$26 billion annually**. Current hospital software relies exclusively on structured numerical vitals, completely ignoring the rich clinical context buried in doctor's handwritten notes, lab reports, and dictated observations. By the time legacy systems flag a deteriorating patient, they've usually already left the building — and by then, it's too late.

## 💡 The Solution: Multi-Modal Readmission Intelligence

CareConnect bridges the gap between acute clinical care and post-discharge recovery. We utilize a **5-Pillar Hybrid Architecture** — combining the mathematical power of **Databricks Machine Learning** (for precision risk scoring) with the contextual understanding of **Google Gemini Large Language Models** (for ambient clinical dictation, document analysis, and RAG-powered copilot summaries).

**One sentence pitch:** *We turn chaotic doctor's notes, messy lab reports, and real-time vitals into a single, dynamic risk score that tells the nurse exactly which patient to check on next.*

---

## 🏗️ System Architecture Overview

CareConnect is a distributed microservices platform consisting of 5 independent environments that communicate through REST APIs, WebSockets, and Axios proxies.

```
                    ┌─────────────────────────────────────────────────┐
                    │              CLIENT LAYER                       │
                    │                                                 │
                    │  ┌──────────────────┐  ┌──────────────────┐    │
                    │  │  React Web App   │  │ Expo Mobile App  │    │
                    │  │  (Port 5173)     │  │ (Doctors)        │    │
                    │  └────────┬─────────┘  └────────┬─────────┘    │
                    └───────────┼──────────────────────┼──────────────┘
                                │ REST + WebSockets    │ REST API
                                ▼                      ▼
                    ┌─────────────────────────────────────────────────┐
                    │          ORCHESTRATION LAYER                     │
                    │                                                 │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │     Node.js API Gateway (Port 5000)      │   │
                    │  │     Express + Socket.io + Mongoose       │   │
                    │  └──────┬──────────┬──────────────┬─────────┘   │
                    └─────────┼──────────┼──────────────┼─────────────┘
                              │          │              │
                   Mongoose   │          │ Axios Proxy  │  Twilio SDK
                              ▼          ▼              ▼
              ┌───────────────────┐  ┌──────────────┐  ┌──────────────┐
              │   MongoDB Atlas   │  │ Python FastAPI│  │  Twilio SMS  │
              │  (Structured Data)│  │ LangChain +   │  │ (Escalation) │
              │  Patients, Vitals │  │ Gemini        │  └──────────────┘
              │  Notes, Alerts    │  │ (Port 8000)   │
              └───────────────────┘  └──────┬───┬────┘
                                            │   │
                                 Embed/Query│   │Predict
                                            ▼   ▼
                              ┌──────────────┐  ┌──────────────┐
                              │  ChromaDB    │  │  Databricks  │
                              │  (Vectors)   │  │  XGBoost ML  │
                              │  3072-dim    │  │  Risk Model  │
                              └──────────────┘  └──────────────┘
```

### Why This Architecture?

| Concern | Solution |
|---------|----------|
| **Data Isolation** | Structured patient data (vitals, names, IDs) stays in MongoDB. Unstructured text embeddings live in ChromaDB. No data leakage. |
| **Language Optimization** | Node.js handles I/O-heavy API routing. Python handles compute-heavy ML/NLP. Each language plays to its strength. |
| **Real-time Alerts** | Socket.io pushes critical vital alerts to the React dashboard instantly, without polling. |
| **Security** | Every ChromaDB vector query is filtered by `patientId`, making cross-patient hallucination physically impossible. |

---

## 📂 Project Directory Structure

```
CareConnect/
│
├── Frontend/                    # React 19 + Vite Clinical Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Marketing landing page
│   │   │   ├── LoginPage.jsx        # Doctor authentication
│   │   │   ├── Dashboard.jsx        # Triage board + Admit Patient modal
│   │   │   ├── PatientDetail.jsx    # Full patient view (vitals, copilot, dictation)
│   │   │   ├── AlertsPage.jsx       # Escalation center for critical alerts
│   │   │   ├── AnalyticsPage.jsx    # Hospital-wide analytics dashboard
│   │   │   └── PatientStatus.jsx    # Public patient status page
│   │   ├── services/
│   │   │   └── api.js               # Axios client for all backend calls
│   │   ├── components/
│   │   │   └── Sidebar.jsx          # Navigation sidebar
│   │   └── index.css                # OKLCH glassmorphism design system
│   └── package.json
│
├── Backend/                     # Node.js Express API Gateway
│   ├── server.js                    # Entry point (Express + Socket.io + MongoDB)
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection
│   ├── models/
│   │   ├── Patient.js               # Patient schema (demographics, risk, AI insights)
│   │   ├── VitalsLog.js             # Time-series biometric readings
│   │   ├── ClinicalNote.js          # Doctor dictations with extracted intent
│   │   ├── MedicalDocument.js       # Uploaded lab reports / prescriptions
│   │   └── Alert.js                 # Critical alerts (vital breaches, escalations)
│   ├── controllers/
│   │   ├── patientController.js     # CRUD + AI-powered admission pipeline
│   │   ├── dataController.js        # Vitals ingestion, dictation, RAG copilot
│   │   └── webhookController.js     # Twilio SMS/WhatsApp webhook handler
│   ├── routes/
│   │   ├── patientRoutes.js         # /api/patients/*
│   │   ├── dataRoutes.js            # /api/data/*
│   │   └── webhookRoutes.js         # /api/webhooks/*
│   ├── services/
│   │   └── aiEngineBridge.js        # Axios proxy to Python AI Engine
│   └── scripts/
│       └── seed.js                  # Auto-seeder for demo data
│
├── ai_engine/                   # Python FastAPI AI & ML Engine
│   ├── main.py                      # FastAPI app entry point with CORS
│   ├── config.py                    # Environment variable loader (singleton)
│   ├── prompts.py                   # All 5 LLM system prompts (centralized)
│   ├── api/
│   │   ├── endpoints.py             # Core API routes (risk, NLP, RAG, summary)
│   │   └── document_endpoints.py    # Document processing + insights routes
│   ├── services/
│   │   ├── nlp_extractor.py         # LangChain clinical NLP + embedding generation
│   │   ├── llm_rag_service.py       # RAG copilot (ChromaDB retrieval + LLM reasoning)
│   │   ├── chroma_service.py        # ChromaDB vector store (insert + query)
│   │   ├── document_processor.py    # Gemini Vision document extraction
│   │   └── databricks_client.py     # XGBoost risk prediction proxy
│   ├── chroma_data/                 # Persistent ChromaDB storage (auto-created)
│   └── requirements.txt
│
└── Mobile/                      # React Native Expo App (Doctor + Patient)
```

---

## 🔥 Feature Breakdown (What Works Right Now)

### 1. 🎯 Dynamic Triage Board with ML Risk Scoring

The main dashboard displays all admitted patients sorted by their **dynamically calculated readmission risk score** (0-100%). The score is computed by the Databricks XGBoost model using real patient vitals and recalculated every time new data enters the system.

**Step-by-step flow:**
1. Doctor opens the React Dashboard at `http://localhost:5173/dashboard`
2. Frontend calls `GET /api/patients` → Node.js queries MongoDB → Returns all patients sorted by `currentRiskScore` descending
3. Each patient card shows: Name, Age, Risk Score (with color-coded progress bar), Status pill, and Medication count
4. The triage board **re-sorts automatically** when risk scores change via WebSocket events

---

### 2. 🏥 AI-Powered Patient Admission

When a doctor admits a new patient, CareConnect runs a **multi-step AI pipeline** that extracts clinical intent, calculates risk, stores vector embeddings, and generates a holistic AI summary — all from a single form submission.

**Step-by-step flow:**
1. Doctor clicks **"+ Admit Patient"** → Opens a modal with fields for demographics, initial vitals, clinical notes, and an optional document upload
2. Frontend sends `POST /api/patients` with all form data to Node.js
3. Node.js creates the patient record in MongoDB (generating the `patientId`)
4. Node.js creates the **first VitalsLog entry** in MongoDB using the admission vitals (BP, sugar, heart rate, SpO2, temperature) — *this is why the graph shows data immediately*
5. Node.js forwards the clinical note + `patientId` to Python via `POST /api/extract-note`
6. Python uses **LangChain + Gemini** with the `EXTRACTION_PROMPT` to parse the raw note into structured JSON: `{symptoms, medicationChanges, actions, riskSignal}`
7. Python generates a **3072-dimensional vector embedding** using `gemini-embedding-2` and stores it in **ChromaDB** tagged with the `patientId`
8. Node.js sends the patient's vitals to Python via `POST /api/predict-risk`
9. Python forwards the features to the **Databricks XGBoost** model → Returns a risk probability (0-100%)
10. Node.js saves the clinical note as a `ClinicalNote` document in MongoDB
11. Node.js triggers `refreshPatientInsights()` in the background → Python generates a holistic AI summary using the `PATIENT_INSIGHTS_PROMPT` → Result is stored on the Patient document as `aiInsights`
12. If a supporting document was uploaded, Frontend sends it as `POST /api/data/upload` → Node.js converts to Base64 → Python uses **Gemini Vision** to extract diagnosis, medications, test results → Embedding stored in ChromaDB

```
  Doctor          React           Node.js          MongoDB         Python AI        ChromaDB       Databricks
    │               │                │                │               │                │               │
    │──Fill Form───▶│                │                │               │                │               │
    │               │──POST /patients─▶               │               │                │               │
    │               │                │──Create Patient─▶              │                │               │
    │               │                │──Create VitalsLog─▶            │                │               │
    │               │                │──POST /extract-note───────────▶│                │               │
    │               │                │                │     Extract symptoms, meds     │               │
    │               │                │                │               │──Store embed──▶│               │
    │               │                │                │◀──Return intent───────────────│               │
    │               │                │──POST /predict-risk───────────▶│                │               │
    │               │                │                │               │──Forward──────▶│──XGBoost──────▶
    │               │                │                │               │◀──Risk Score───│◀──────────────│
    │               │                │◀──Return risk score───────────│                │               │
    │               │                │──Save ClinicalNote─▶          │                │               │
    │               │                │──Update Patient risk─▶         │                │               │
    │               │                │──POST /generate-insights──────▶│                │               │
    │               │                │                │     Generate AI Summary        │               │
    │               │                │◀──Return insights──────────────│                │               │
    │               │                │──Update aiInsights─▶           │                │               │
    │               │◀──Return patient│                │               │                │               │
    │◀──Redirect────│                │                │               │                │               │
    │               │                │                │               │                │               │
```

---

### 3. 📊 Interactive Vitals Trend Graphs

Each patient has a dedicated detail page with **pure SVG interactive charts** (no charting library) that visualize their vitals history over time.

**Available metrics:**
| Metric | Unit | Normal Range | Color |
|--------|------|-------------|-------|
| Blood Sugar | mg/dL | 70–140 | 🟡 Amber |
| BP (Systolic) | mmHg | 90–130 | 🔴 Red |
| Heart Rate | bpm | 60–100 | 🟣 Indigo |
| SpO₂ | % | 95–100 | 🟢 Green |

**Features:**
- Animated SVG path with smooth transitions
- Hover tooltips showing exact date and value
- Reference band (green zone) showing normal range
- Mini stat cards: Latest, Highest, Lowest, Average, Normal Range
- Tab switching between metrics with animated transitions

---

### 4. 🎤 Ambient Clinical Dictation

Doctors can type or speak clinical notes, and the AI automatically extracts structured clinical intent.

**Step-by-step flow:**
1. Doctor navigates to a patient's detail page → Scrolls to the **"Ambient Dictation"** section
2. Types or dictates a note like: *"Patient reports persistent fatigue. Increased Lasix to 40mg BID. Schedule follow-up in 3 days."*
3. Clicks **"Save Note"** → Frontend sends `POST /api/data/dictation` with `{patientId, rawText}`
4. Node.js forwards to Python `POST /api/extract-note`
5. Python's `nlp_extractor.py` uses LangChain's `.with_structured_output()` to force Gemini into returning exact JSON:
   ```json
   {
     "symptoms": ["persistent fatigue"],
     "medicationChanges": ["Increased Lasix to 40mg BID"],
     "actions": ["Schedule follow-up in 3 days"],
     "riskSignal": "negative"
   }
   ```
6. Python generates a vector embedding and stores it in ChromaDB
7. Node.js saves the raw note + extracted intent as a `ClinicalNote` in MongoDB
8. Node.js recalculates the patient's risk score using the new data
9. Node.js broadcasts a WebSocket event to update the dashboard in real-time
10. The patient's status tag on the triage board updates dynamically based on `riskSignal`

---

### 5. 📄 Medical Document Scanner (Gemini Vision)

Doctors can upload lab reports, prescriptions, or scan images, and the AI extracts structured medical data automatically.

**Step-by-step flow:**
1. Doctor clicks the **upload button** on the patient's detail page
2. Selects a PDF, PNG, JPG, or WebP file
3. Frontend converts the file to Base64 and sends `POST /api/data/upload`
4. Node.js receives the file via `multer` (memory storage) → Converts buffer to Base64
5. Node.js sends `{patientId, mimeType, fileBase64}` to Python `POST /api/process-document`
6. Python's `document_processor.py` creates a **multimodal LangChain message** with both the extraction prompt and the image data
7. Gemini Vision analyzes the document and returns:
   ```json
   {
     "diagnosis": "Acute pancreatitis",
     "medications": ["Ondansetron 4mg IV"],
     "testResults": ["HB 12.90 gm/dl", "Platelet count 97 x 10^3/uL"],
     "recommendations": ["Monitor serum amylase daily"]
   }
   ```
8. Python generates a text summary → Creates a vector embedding → Stores in ChromaDB
9. Node.js saves the document metadata in MongoDB as a `MedicalDocument`
10. `refreshPatientInsights()` runs in the background to update the AI summary

---

### 6. 🤖 RAG Medical Copilot (Retrieval-Augmented Generation)

A conversational AI chat interface where doctors can ask natural-language questions about any patient, and get answers grounded exclusively in that patient's medical history.

**Step-by-step flow:**
1. Doctor opens the patient detail page → Scrolls to the **"RAG Medical Copilot"** panel
2. Quick-access suggestion pills appear (e.g., "Summarize admission note", "List current medications") — *these disappear after the first message*
3. Doctor types: *"What were the patient's test results?"*
4. Frontend sends `POST /api/data/copilot` with `{patientId, query}`
5. Node.js proxies to Python `POST /api/rag-query`
6. Python's `llm_rag_service.py`:
   - Converts the question into a **3072-dim embedding** using `gemini-embedding-2`
   - Queries **ChromaDB** with the embedding, filtered by `WHERE patientId = <id>` (strict isolation — **zero cross-patient data leakage**)
   - Retrieves the top 5 most semantically similar text chunks
   - Constructs a context string from the retrieved chunks
   - Sends the context + question to Gemini using the `RAG_PROMPT` (which enforces: *"If the answer is NOT in the context, respond: Insufficient data"*)
7. Gemini generates a grounded answer
8. Response flows back through the chain to the React chat UI

**Security Guardrails:**
- ChromaDB query uses `where={"patientId": str(patient_id)}` — cross-patient queries are impossible at the database level
- RAG prompt instructs the LLM to never introduce external medical knowledge
- If no records exist for the patient, the system returns a clear message rather than hallucinating

---

### 7. 🧠 AI Patient Health Summary (Auto-Generated)

A holistic AI-generated summary that appears on every patient's detail page, providing the doctor with an instant overview of the patient's current condition, risks, and recommendations.

**How it works:**
1. The `refreshPatientInsights()` function runs automatically after:
   - A new patient is admitted
   - New vitals are ingested
   - A clinical note is saved
   - A medical document is uploaded
2. It gathers the last 10 vitals logs, last 10 clinical notes, and last 5 medical documents from MongoDB
3. Sends all of this as context to Python `POST /api/generate-insights`
4. Python uses the `PATIENT_INSIGHTS_PROMPT` with Gemini to generate:
   ```json
   {
     "currentCondition": "Patient is stable but showing mildly elevated blood pressure...",
     "risks": ["Hypertension Risk", "Medication Non-Compliance"],
     "recommendations": ["Monitor BP twice daily", "Schedule cardiology follow-up"]
   }
   ```
5. The result is stored on `Patient.aiInsights` in MongoDB and displayed in a highlighted card on the detail page

---

### 8. 🚨 Real-Time WebSocket Critical Alerts

When a patient's vitals cross dangerous thresholds, the system instantly fires a visual alert to the clinician dashboard.

**Thresholds:**
| Condition | Threshold |
|-----------|-----------|
| Systolic BP too high | > 180 mmHg |
| Systolic BP too low | < 90 mmHg |
| Blood Sugar too high | > 300 mg/dL |
| Blood Sugar too low | < 50 mg/dL |

**Step-by-step flow:**
1. New vitals arrive via `POST /api/data/vitals`
2. Node.js checks if any thresholds are breached
3. If critical: Creates an `Alert` document in MongoDB
4. Broadcasts a `critical_alert` WebSocket event via Socket.io
5. The React Alerts Page receives the event and displays an immediate, animated notification — no page refresh needed

---

### 9. 🎨 Premium UI Design System

The frontend uses a custom **OKLCH glassmorphism design system** built entirely in vanilla CSS — no Tailwind, no component libraries.

**Design highlights:**
- Dark mode with vibrant cyan/purple accent gradients
- Glass-effect cards with `backdrop-filter: blur()`
- Smooth micro-animations on hover, focus, and state changes
- Custom SVG charts with animated paths and interactive tooltips
- Responsive layout with CSS Grid and Flexbox
- Risk score visualization using animated SVG dial gauges
- Typing indicator animation in the RAG Copilot chat

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/careconnect
FRONTEND_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### AI Engine `.env`
```env
GOOGLE_API_KEY=your_gemini_api_key
MONGO_URI=mongodb://127.0.0.1:27017/careconnect
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your_databricks_pat
AI_ENGINE_PORT=8000
```

---

## 💻 How to Boot the Platform Locally

To experience the entire platform, you must boot the microservices concurrently in **4 separate terminal windows**.

> [!TIP]
> **Zero Setup Database:** We've built an auto-seeder! In Terminal 2, simply run `node scripts/seed.js` to instantly populate your local MongoDB with demo patients, alerts, and vitals.

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ with `pip`
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas URI)
- A valid **Google Gemini API Key** (free tier works)

### Terminal 1: Python AI Engine (Port 8000)
```bash
cd ai_engine
python -m venv venv
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Terminal 2: Node.js API Gateway (Port 5000)
```bash
cd Backend
npm install
npm run dev
```

### Terminal 3: React Web Frontend (Port 5173)
```bash
cd Frontend
npm install
npm run dev
```

### Terminal 4: Expo Mobile App
```bash
cd Mobile
npm install
npx expo start
```
*(Scan the generated QR code using the Expo Go app on your physical iPhone/Android).*

---

## 🔌 API Reference

### Patient Routes (`/api/patients`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Fetch all patients (sorted by risk) |
| `GET` | `/api/patients/:id` | Fetch single patient by ID |
| `POST` | `/api/patients` | Admit a new patient (triggers full AI pipeline) |
| `PUT` | `/api/patients/:id` | Update patient record |
| `DELETE` | `/api/patients/:id` | Delete patient |

### Data Routes (`/api/data`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/data/vitals` | Ingest patient vitals (triggers risk recalculation) |
| `POST` | `/api/data/dictation` | Process ambient clinical dictation |
| `POST` | `/api/data/copilot` | Query the RAG Medical Copilot |
| `POST` | `/api/data/upload` | Upload medical document (multipart/form-data) |
| `GET` | `/api/data/vitals/:patientId` | Fetch vitals history for graphs |
| `GET` | `/api/data/notes/:patientId` | Fetch clinical notes timeline |
| `GET` | `/api/data/documents/:patientId` | Fetch uploaded documents |

### Python AI Engine Routes (`localhost:8000/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict-risk` | Run XGBoost risk prediction |
| `POST` | `/api/extract-note` | NLP extraction from dictation |
| `POST` | `/api/generate-summary` | LLM patient vitals summary |
| `POST` | `/api/rag-query` | RAG copilot vector search + LLM |
| `POST` | `/api/process-document` | Gemini Vision document extraction |
| `POST` | `/api/generate-insights` | Holistic AI patient insights |

---

## 🧪 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite, Vanilla CSS | Clinical dashboard UI |
| Backend | Express.js, Socket.io, Mongoose | API Gateway & real-time events |
| AI Engine | FastAPI, LangChain, Pydantic | NLP, RAG, document processing |
| Vector DB | ChromaDB (local, persistent) | Semantic search on clinical text |
| Database | MongoDB (Atlas or local) | Structured patient data |
| LLM | Google Gemini 2.5 Flash Lite | Text generation & vision |
| Embeddings | Google Gemini Embedding 2 | 3072-dim text embeddings |
| ML Model | Databricks XGBoost | 30-day readmission prediction |
| Mobile | React Native, Expo | Doctor & patient mobile app |
| Alerts | Twilio SMS | Family escalation notifications |

---

## 🚀 End-to-End Demo Flow

1. **Boot all 3 services** (Python, Node.js, React)
2. Open `http://localhost:5173` → Click **"Enter Dashboard"**
3. Click **"+ Admit Patient"** → Fill in vitals + clinical note + upload a lab report image
4. Watch the patient appear on the Triage Board with a calculated risk score
5. Click into the patient → See the vitals graph with the admission data point
6. Scroll down → See the **AI Health Summary** auto-generated from your note
7. Type a question in the **RAG Copilot**: *"What was the diagnosis?"* → Get a grounded answer from ChromaDB
8. Use the **Ambient Dictation** box to add a follow-up note → Watch the risk score update
9. Check the **Alerts Page** for any critical vital breaches

Happy Hacking! 🧄🍞
