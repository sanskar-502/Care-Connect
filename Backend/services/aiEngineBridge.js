// ============================================================
// CareConnect — AI Engine Bridge
// Axios service layer for communicating with the Python
// FastAPI microservice (Folder 3). Falls back to mock data
// if the Python server is offline.
// ============================================================

const axios = require('axios');

const PYTHON_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

const safePost = async (endpoint, payload, fallback) => {
  try {
    const response = await axios.post(`${PYTHON_URL}${endpoint}`, payload, {
      timeout: 30000, // 30-second timeout to allow slow Gemini LLM calls (e.g. RAG Copilot) to complete
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.warn(`⚠️  AI Engine offline or error at ${endpoint}: ${error.message}`);
    if (error.response && error.response.data) {
      console.warn(`   → Details:`, JSON.stringify(error.response.data));
    }
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
const extractClinicalIntent = async (patientId, rawText) => {
  const fallback = {
    symptoms: ['Unable to extract — AI Engine offline'],
    medications: [],
    actions: ['Review note manually'],
    riskSignal: 'neutral',
    rawText: rawText,
  };

  return safePost('/api/extract-note', { patientId, rawText }, fallback);
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
  };

  return safePost('/api/predict-risk', { patient_features: patientData }, fallback);
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

// ============================================================
// 5. Process Medical Document
//    Sends file base64 to Gemini Vision for extraction
// ============================================================
const processDocument = async (patientId, mimeType, fileBase64) => {
  const fallback = {
    extracted: { diagnosis: 'AI Engine offline', medications: [], testResults: [], recommendations: [] },
    rawText: 'AI Engine offline',
    embedding: new Array(768).fill(0.0)
  };
  return safePost('/api/process-document', { patientId, mimeType, fileBase64 }, fallback);
};

// ============================================================
// 6. Generate Patient Insights
//    Sends full context to LLM to generate holistic summary
// ============================================================
const generatePatientInsights = async (context) => {
  const fallback = {
    currentCondition: 'AI Engine offline. Unable to generate insights.',
    risks: [],
    recommendations: []
  };
  return safePost('/api/generate-insights', { context }, fallback);
};

module.exports = {
  generateSummary,
  extractClinicalIntent,
  recalculateRisk,
  queryRAGCopilot,
  processDocument,
  generatePatientInsights,
};
