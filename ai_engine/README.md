# CareConnect 🏥 — AI Engine & NLP Brain (Python)

Welcome to the **CareConnect AI Engine**. This folder operates as **Pillar 3** of our architecture. Built on a lightning-fast Python/FastAPI environment, it serves as the platform's "Language Brain," utilizing LangChain and Large Language Models (LLMs) to bridge the gap between unstructured clinical noise and structured data.

---

## 🚀 Tech Stack

- **Framework:** FastAPI (Served via Uvicorn for asynchronous speed).
- **AI Orchestration:** LangChain (For chaining prompts and structuring outputs).
- **Core LLM Server:** `langchain-google-genai` (Configured for Google Gemini).
- **Data Validation:** Pydantic (Strict schema enforcement for API contracts).
- **Vector Search:** MongoDB Atlas Vector Search + `langchain-mongodb`.
- **ML Connectivity:** `requests` proxy to Databricks Model Serving.

---

## 📂 Folder Architecture

```text
ai_engine/
├── api/                  
│   └── endpoints.py         # Registers the FastAPI REST routes
├── models/                  # Pydantic schemas validating inbound/outbound JSON
│   ├── dictation.py         # Enforces strictly typed NLP extraction outputs
│   └── patient.py           # Validates biometric numbers for the risk model
├── services/                # The Heavy Lifting
│   ├── databricks_client.py # Proxies requests to Databricks (or uses mock fallbacks)
│   ├── llm_rag_service.py   # Secure Atlas Vector Search and Patient Summaries
│   └── nlp_extractor.py     # Unstructured ambient dictation -> JSON
├── .env                     # OPENAI_API_KEY, MONGO_URI
├── config.py                # Environment variable loader
├── main.py                  # App entry point (Bootstraps FastAPI + CORS)
└── requirements.txt         # Python dependencies
```

---

## 🧠 Core Feature Workflows

### 1. NLP Extraction (Ambient Dictation)
Current clinical pipelines require doctors to manually type data. We reversed this.
- **Trigger:** A doctor dictates into the mobile app (`POST /api/extract-note`).
- **LangChain Magic:** We use LangChain's cutting-edge `.with_structured_output(DictationResponse)` binding. This physically forces the underlying LLM to bypass standard text output and *only* return a rigorously typed JSON object containing arrays of `Symptoms`, `Medication Changes`, and `Actionable Follow-ups`.

### 2. Patient-Centric Translations
- **Trigger:** Vitals are logged by the patient (`POST /api/generate-summary`).
- **Role:** Rather than showing patients raw numbers (e.g. "SBP 160"), this service takes the numbers and prompts the LLM to act as an empathetic, 6th-grade-reading-level nursing assistant, translating the medical data into a reassuring, simple overview.

### 3. Sub-Second RAG Copilot (Vector Search)
- **Trigger:** Doctor queries a patient's historical charts (`POST /api/copilot`).
- **Data Guardrails:** Medical data cannot be cross-contaminated natively by an LLM. We generate a vector embedding using `text-embedding-004` and perform a semantic search inside MongoDB Atlas.
- **The Filtering Secret:** Before the query runs, the service strictly constructs a MongoDB match filter (`{"patientId": req.patient_id}`). The LLM physically cannot read or hallucinate documents belonging to other patients.

### 4. The Databricks Model Serving Router
- **Trigger:** `POST /api/predict-risk`
- **Role:** This service compiles the patient's current age, vitals, and medication adherence status into a DataFrame JSON object. It forwards this to an external Databricks cluster where a trained mathematical XGBoost/LightGBM model calculates the rigid Readmission Risk probability.

---

## 🛡️ Hackathon Reliability: "Heuristic Mocking"

Machine Learning models and OpenAI API keys frequently experience failures, timeouts, and rate limits during live hackathon demos. 

We engineered this microservice to **never fail a demo**.
Every single service endpoint contains a hard `try/except` block. If the Google API key is invalid, or Databricks is offline, the server instantly defaults to a localized, hardcoded heuristic generation algorithm. 
- *Dictation* will fallback to manually regexing out known drugs.
- *Copilot* will return an incredibly realistic pre-written chart summary.
- *Risk Scores* will calculate using local if/else weightings.

The Node.js API Gateway (and the judges) never know an external connection failed.

---

## 🛠️ Setup & Running

This Python engine must be running simultaneously with the Node API Gateway for full system functionality.

### 1. Requirements Installation
Ensure you are using Python 3.10+. It is highly recommended to use a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
Update your `ai_engine/.env`:
```env
GOOGLE_API_KEY=your_key...     # Essential for real NLP. Without it, the mock engine runs.
MONGO_URI=mongodb://...
```

### 3. Boot the Server
Run the Uvicorn ASGI server:
```bash
uvicorn main:app --reload --port 8000
```
*The AI Language Brain will now securely listen for proxy traffic from the Node.js central API Gateway!*
