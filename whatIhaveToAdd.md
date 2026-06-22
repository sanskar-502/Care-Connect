# CareConnect - Project Completion Checklist

Based on an audit of the codebase and our latest discussions, here is everything we need to complete to move this from a "Mock/Demo" state to a fully functional product for the hackathon judging.

## 1. Automated Twilio Escalation System
We need an automated alerting pipeline to ensure patient safety and keep the family informed:
- **Trigger Condition:** The Node.js backend must continuously monitor the patient's dynamically calculated `currentRiskScore`. If this score crosses a critical threshold (e.g., > 80%), it should immediately trigger an escalation event.
- **Twilio SMS Integration:** Using the Twilio SDK, the system will look up the emergency contact or family member's phone number associated with the patient profile.
- **Message Content:** The system will dispatch an automated, reassuring, yet urgent SMS to the family. Example: *"URGENT: CareConnect Alert for John Doe. John's risk indicators have elevated. Our medical staff is currently attending to him. We will keep you updated."*
- **Action Items:** We need to set up a Twilio account, acquire a Twilio phone number, store the `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in our `.env`, and implement the `sendEscalationSMS` function in the backend controllers.

## 2. Comprehensive Mobile App for Doctors
The current React Native / Expo mobile app needs to be upgraded to have feature parity with the React Web Dashboard so doctors can manage patients entirely on the go.
- **Ambient Voice Dictation (Whisper):** Implement `expo-av` to allow doctors to hit a "Record" button, speak their clinical notes into their phone, and send the audio file to an OpenAI Whisper endpoint for accurate, real-time transcription.
- **Document Scanning & Upload:** Integrate `expo-camera` or `expo-image-picker` so doctors can snap a photo of a lab report or medical document right at the patient's bedside, which is then sent to the Gemini Vision AI for structured data extraction.
- **RAG Medical Copilot:** Bring the conversational chat interface to mobile so doctors can text the AI Copilot to quickly query a patient's medical history from the ChromaDB vector database.
- **Patient Triage & Vitals:** A mobile-optimized view of the triage dashboard where patients are sorted by risk score, allowing the doctor to dive into vital graphs and AI insights seamlessly.

---

## 3. Machine Learning (ML) — Current State & Future Roadmap

### What We Currently Have (v1 — Heuristic Baseline)

Right now, CareConnect uses a **rule-based heuristic scoring engine** inside `ai_engine/services/databricks_client.py`. This is NOT a trained ML model — it is a hand-crafted function (`_calculate_mock_risk()`) that applies simple clinical thresholds to generate a risk score:

```
Base Score: 30 (every patient starts here)
  + Age > 70 → +15 points
  + Age > 60 → +8 points
  + Systolic BP > 160 → +20 points
  + Systolic BP > 140 → +12 points
  + Systolic BP < 90 → +10 points
  + Blood Sugar > 250 → +15 points
  + Blood Sugar > 180 → +8 points
  + Medication NOT taken → +12 points
  + Baseline Risk > 60 → +10 points
  = Final Score (clamped 0-100)
```

**Strengths:** Deterministic, fast, no training data required, works instantly for the demo.
**Weaknesses:** No learning from actual outcomes, no interaction effects between features, no personalization, and no temporal pattern recognition. A 72-year-old with BP 165 will always get the same score regardless of their full medical history.

The infrastructure is already wired end-to-end: the Python FastAPI calls `get_risk_score()`, the Node.js backend stores it in MongoDB, and the React dashboard renders it in the animated risk dial. **All we need to do is swap the heuristic function with a real model call.**

---

### Future Plan A — XGBoost on Databricks (Production Target)

This is the primary plan: train a proper supervised ML model and deploy it behind a REST endpoint.

**Dataset Required:**

| Feature | Type | Source | Description |
|---------|------|--------|-------------|
| `age` | Numeric | Patient Profile | Patient age at time of admission |
| `gender` | Categorical | Patient Profile | Male / Female / Other |
| `systolicBP` | Numeric | VitalsLog | Latest systolic blood pressure reading |
| `diastolicBP` | Numeric | VitalsLog | Latest diastolic blood pressure reading |
| `heartRate` | Numeric | VitalsLog | Resting heart rate (bpm) |
| `spo2` | Numeric | VitalsLog | Oxygen saturation level (%) |
| `temperature` | Numeric | VitalsLog | Body temperature (°F) |
| `bloodSugar` | Numeric | VitalsLog | Fasting blood glucose (mg/dL) |
| `numMedications` | Numeric | ClinicalNote | Count of active medications |
| `medicationAdherence` | Boolean | VitalsLog | Whether patient has been taking meds |
| `numPriorAdmissions` | Numeric | Patient History | Count of previous hospital admissions |
| `lengthOfStay` | Numeric | Patient Profile | Days in hospital during current admission |
| `numComorbidities` | Numeric | NLP Extraction | Count of co-existing conditions (diabetes, COPD, etc.) |
| `riskSignal` | Categorical | NLP Extraction | LLM-assessed trajectory: positive / negative / neutral |
| `diagnosisSeverity` | Numeric | NLP Extraction | 1-5 severity score derived from clinical notes |
| **`readmitted_30d`** | **Boolean (Target)** | **Outcome Data** | **Was the patient readmitted within 30 days? (1 = yes, 0 = no)** |

**Training Pipeline on Databricks:**
1. **Data Collection:** Export historical patient records from MongoDB (demographics + vitals + notes). Merge with outcome labels (`readmitted_30d`) from the hospital's discharge records.
2. **Feature Engineering:** 
   - Compute rolling averages of vitals over the last 3, 7, and 14 days
   - Extract NLP features (symptom count, risk signal, medication count) from clinical notes using our existing LangChain pipeline
   - One-hot encode categorical features (gender, riskSignal)
   - Handle missing values via median imputation
3. **Model Training:** Use **Databricks AutoML** to automatically benchmark XGBoost, LightGBM, and Random Forest classifiers. Optimize for **ROC-AUC** with a secondary focus on **Recall** (minimizing false negatives — we'd rather over-alert than miss a readmission).
4. **Model Evaluation:** Target metrics:
   - ROC-AUC ≥ 0.80
   - Recall ≥ 0.75 (catch at least 75% of actual readmissions)
   - Precision ≥ 0.60
5. **Deployment:** Register the best model in MLflow → Deploy as a REST endpoint via Databricks Model Serving → Our `databricks_client.py` already has the `requests.post()` code ready to call it (currently commented out, just needs uncommenting).
6. **Inference Flow:** Patient vitals arrive → Node.js proxies to Python → Python calls Databricks REST endpoint → XGBoost returns probability (0.0–1.0) → Multiply by 100 → Store as `currentRiskScore` → Dashboard updates in real-time.

---

### Future Plan B — Federated Learning Across Hospital Networks

Once Plan A is validated at a single hospital, we can scale by training across multiple hospitals **without sharing raw patient data** (HIPAA-compliant).

**How it works:**
1. Each participating hospital runs a local copy of CareConnect with its own MongoDB and ChromaDB.
2. A central **aggregation server** distributes the current global model weights to each hospital.
3. Each hospital trains the model locally on their private patient data for a few epochs (local gradient descent).
4. Only the **model weight updates (gradients)** — NOT the patient data — are sent back to the aggregation server.
5. The server averages the gradients using **Federated Averaging (FedAvg)** and redistributes the improved global model.
6. This cycle repeats, producing a model trained on diverse patient populations across hospitals, without ever exposing individual patient records.

**Benefits:** Larger effective training set, better generalization across demographics, full HIPAA/GDPR compliance since raw data never leaves the hospital.

**Tech Stack:** PyTorch + PySyft or TensorFlow Federated, deployed on Databricks as a scheduled job.

---

### Future Plan C — Real-Time Anomaly Detection with LSTM

Beyond predicting readmission at a single point in time, we want to detect **deterioration patterns in real-time** as vitals stream in.

**How it works:**
1. Train an **LSTM (Long Short-Term Memory)** recurrent neural network on the time-series vitals data (BP, heart rate, SpO2, blood sugar) for each patient.
2. The LSTM learns the patient's **normal vital trajectory** during their hospital stay.
3. At inference time, every new vitals reading is fed into the LSTM. If the model predicts a value significantly different from the actual reading (high reconstruction error), it flags an **anomaly**.
4. Anomalies trigger an immediate WebSocket alert to the nurse's dashboard AND an automated Twilio SMS to the family.

**Why LSTM over XGBoost for this?**
- XGBoost works on a **single snapshot** of features (current BP, current sugar) — it cannot understand temporal patterns like "BP has been steadily climbing for 3 days."
- LSTMs are specifically designed to capture **sequential dependencies** — they can learn that a patient whose heart rate has increased by 5 bpm every day for a week is more dangerous than a patient who had one random spike.

**Data Required:**
- Time-series vitals: `[timestamp, systolicBP, diastolicBP, heartRate, spo2, bloodSugar, temperature]`
- Minimum 72 hours of continuous readings per patient (one reading every 4-6 hours)
- Labels: binary anomaly flag (derived from subsequent ICU transfer, emergency intervention, or readmission within 48 hours)

**Deployment:** Train on Databricks using PyTorch → Export as ONNX → Deploy alongside the XGBoost model as a second Databricks Model Serving endpoint → Python AI Engine calls both models in parallel: XGBoost for the overall risk dial, LSTM for real-time spike detection.