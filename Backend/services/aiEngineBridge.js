// ============================================================
// CareConnect — AI Engine Bridge
// Axios service layer for communicating with the Python
// FastAPI microservice (Folder 3). Falls back to mock data
// if the Python server is offline.
// ============================================================

const axios = require('axios');

const PYTHON_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

// ---------- Helper: safe POST with graceful fallback ----------
const safePost = async (endpoint, payload, fallback) => {
  try {
    const response = await axios.post(`${PYTHON_URL}${endpoint}`, payload, {
      timeout: 10000, // 10-second timeout
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.warn(`⚠️  AI Engine offline or error at ${endpoint}: ${error.message}`);
    console.warn(`   → Returning mock fallback data.`);
    return fallback;
  }
};

// ============================================================
// 1. Generate Patient Summary
//    Sends vitals data to the LLM for a Grade-6 readability summary
// ============================================================
const generateSummary = async (vitalsData) => {
  const fallback = {
    summary: `[Mock Summary] Patient vitals received — BP: ${vitalsData.systolicBP}/${vitalsData.diastolicBP}, ` +
             `Blood Sugar: ${vitalsData.bloodSugar} mg/dL. ` +
             `Medications ${vitalsData.medicationsTaken ? 'taken' : 'NOT taken'}. ` +
             `Please continue monitoring and follow your care plan.`,
  };

  return safePost('/api/generate-summary', vitalsData, fallback);
};

// ============================================================
// 2. Extract Clinical Intent from Dictation
//    Sends raw doctor text to the NLP pipeline for structured extraction
// ============================================================
const extractClinicalIntent = async (rawText) => {
  const fallback = {
    symptoms: ['Unable to extract — AI Engine offline'],
    medications: [],
    actions: ['Review note manually'],
    rawText: rawText,
  };

  return safePost('/api/extract-note', { rawText }, fallback);
};

// ============================================================
// 3. Recalculate Readmission Risk Score
//    Forwards patient feature data to the Databricks model endpoint
//    (proxied through the Python service)
// ============================================================
const recalculateRisk = async (patientData) => {
  const fallback = {
    riskScore: patientData.currentRiskScore || 50,
    confidence: 0.0,
    source: 'mock_fallback',
  };

  return safePost('/api/predict-risk', patientData, fallback);
};

// ============================================================
// 4. Query RAG Copilot
//    Sends a natural language question about a specific patient
//    to the vector-search-backed RAG pipeline
// ============================================================
const queryRAGCopilot = async (patientId, query) => {
  const fallback = {
    answer: `[Mock Response] The AI Engine is currently offline. Your question "${query}" ` +
            `for patient ${patientId} has been logged. In production, this would query ` +
            `the RAG pipeline backed by MongoDB Atlas Vector Search.`,
    sources: [],
  };

  return safePost('/api/rag-query', { patientId, query }, fallback);
};

module.exports = {
  generateSummary,
  extractClinicalIntent,
  recalculateRisk,
  queryRAGCopilot,
};
