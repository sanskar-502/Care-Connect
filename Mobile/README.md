# CareConnect 🏥 — React Native App (Mobile)

Welcome to the **CareConnect Mobile App**. This directory functions as **Pillar 4** of our architecture. Built smoothly on Expo (React Native), it acts as the primary "Front-Line Tool" used by both patients logging their readmission triggers, and rapid-response doctors dictating new notes on the fly.

---

## 🚀 Tech Stack

- **Framework:** React Native (via Expo).
- **Navigation:** Expo Router (Strict file-based navigation architecture mapping to URLs).
- **API Connectivity:** Axios.
- **Hardware Integration:** `expo-av` for ambient clinical voice transcription processing.
- **Styling:** Premium Mobile Glassmorphism (Deep space dark themes, high-contrast inputs, `lucide-react-native` clinical icon sets).

---

## 📂 Folder Architecture (Expo Router)

We adhere strictly to Expo Router's filesystem conventions, utilizing `()` to create isolated routing layouts without disrupting the underlying URL structures.

```text
Mobile/
├── app/                  
│   ├── (doctor)/            # 🛡️ Locked Clinical Environment
│   │   ├── copilot.jsx      # Conversational UI connecting to MongoDB Atlas Vector Search
│   │   └── dictate.jsx      # Ambient Voice Hub (Transcribing audio -> LLM JSON Schema)
│   ├── (patient)/           # 🏡 At-Home Recovery Environment
│   │   └── checklist.jsx    # Fluid biometric (BP/Sugar) input + Real-time AI Motivation
│   ├── _layout.jsx          # Root navigator (Manages global headers and back-stack)
│   └── index.jsx            # 🎭 The core Entry / Persona Selection View
├── constants/
│   ├── Colors.js            # Unified Color palette across the stack
│   └── Config.js            # Hardcoded API IPs & Patient IDs (for hackathon demoing)
├── services/
│   └── apiService.js        # The Axios proxy tunnel strictly mapped to Port 5000
├── app.json                 # Expo config declaring Native Mic/Audio Permissions
└── babel.config.js          
```

---

## ⚙️ Core Modules & Data Flows

### 1. Ambient Medical Dictation (`(doctor)/dictate.jsx`)
Takes unstructured voice blobs and turns them into secure medical records.
- Uses `expo-av` to natively capture the doctor's microphone on their physical device.
- Sends the payload as a `POST` directly to the `apiService`, which routes through the Node.js API Gateway straight into Python's NLP extraction engine.
- Instantly returns cleanly parsed JSON rendering `Symptoms`, `Actions`, and `Medication Changes` on the mobile UI for the doctor to review and save.

### 2. RAG Medical Copilot (`(doctor)/copilot.jsx`)
A specialized chart-reviewing chatbot.
- Formatted as a familiar conversational UI window tracking user (`User`) vs system (`Bot`) bubbles.
- Pings the Backend Gateway which performs the Vector Semantic Search securely through LangChain, automatically pre-filtering by the exact `DEMO_PATIENT_ID` context hardcoded above so no data ever leaks between charts.

### 3. Patient Vitals Checklist (`(patient)/checklist.jsx`)
The loop closing our Readmission pipeline.
- Specifically styled to look highly-readable and accessible for older, post-op demographic users.
- Submitting the form posts their blood pressure/blood sugar to the API Gateway.
- If their biometrics trace over safe limits, it instantly flags the Twilio dashboard on the web. Simultaneously, it renders a personalized Langchain AI Summary encouraging them to stick to their care plan.

---

## 🛠️ Networking & Local Demo Notice

During a standalone hackathon demo using your physical iPhone/Android devices, `localhost` does **not** map to the computer running your Node.js API Gateway — it maps to the phone itself, causing a network failure.

To fix this, we've structured `constants/Config.js` perfectly:
```javascript
// Replace this explicitly with your local Wi-Fi IP address assigned to your PC
export const API_BASE_URL = "http://192.168.1.5:5000/api";
```

---

## 💻 How to Start the App

1. Ensure the Node.js API Gateway (Pillar 2) is running.
2. Ensure you have the **Expo Go** application downloaded on your mobile device.
3. Boot the environment:
```bash
npm install
npx expo start
```
4. A large QR code will surface in your terminal. Use your physical iPhone or Android camera to scan it, and the CareConnect app will launch flawlessly in real-time mode!
