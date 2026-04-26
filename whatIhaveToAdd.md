# CareConnect - Project Completion Checklist

Based on an audit of the codebase, here is everything you need to complete to move this from a "Mock/Demo" state to a fully functional product for the hackathon judging:

## 1. AI Engine (Python FastAPI)
- **Databricks ML Integration:** In `ai_engine/services/databricks_client.py`, the `get_risk_score` function instantly returns `_calculate_mock_risk(patient_features)`. You need to uncomment the actual `requests.post()` to your Databricks Model Serving endpoint and add your `DATABRICKS_HOST` and `DATABRICKS_TOKEN` to your config/`.env` file.
- **MongoDB Atlas Vector Search:** The RAG Copilot in `llm_rag_service.py` is configured to use Atlas Vector Search, but has a fallback to standard text search. You need to log into MongoDB Atlas, create a Search Index named (whatever is in `settings.VECTOR_INDEX_NAME`), and map it to the `embedding` field of your `ClinicalNote` collection.
- **Environment Variables:** Ensure your `ai_engine/.env` file has a valid `GOOGLE_API_KEY` (for Gemini) and `MONGO_URI`.

## 2. Mobile App (React Native/Expo)
- **Real Voice Transcription (Whisper):** In `Mobile/app/(doctor)/dictate.jsx`, the audio recording is currently mocked (`// For the hackathon, we simulate Whisper transcription with hardcoded text or text input`). You need to implement `expo-av` to actually record the doctor's microphone, capture the audio file, and send it to an actual transcription service (like OpenAI Whisper or a local transcribe endpoint).

## 3. Backend (Node.js API Gateway)
- **Twilio SMS Webhooks:** The Twilio integration for the real-time escalation pipeline (`Backend/controllers/webhookController.js`) needs to be connected to a live Twilio Phone Number. You have to expose your local Node.js server to the internet (e.g., using `ngrok http 5000`) and paste that URL into the Twilio Console so WhatsApp/SMS replies actually hit the webhook.
- **AI Engine Bridge Fallbacks:** In `Backend/services/aiEngineBridge.js`, Axios calls to the Python server currently have a 10-second timeout that returns `[Mock Summary]` or `[Mock Response]`. Once your Python AI Engine is running smoothly, you should rely on the actual LLM responses instead of the fallbacks.

## 4. Frontend & Data Pipeline
- **Real Time Synchronization:** You have Socket.io set up in `Dashboard.jsx`, but make sure the `seed.js` payload or real mobile inputs actually broadcast the `vitals_updated` and `chart_updated` Socket events correctly so the frontend Triage risk scores re-sort dynamically without page refreshes.

## Summary of Next Steps for the Hackathon
1. Provide actual `.env` keys across `ai_engine` and `Backend`.
2. Connect the Twilio webhook via `ngrok`.
3. Set up the MongoDB Atlas Vector Search Index.
4. Implement actual Expo audio recording if you want the "Ambient Dictation" to perform live instead of using a text placeholder!