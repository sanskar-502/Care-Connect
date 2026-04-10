import axios from 'axios';
import { API_BASE_URL } from '../constants/Config';

// ============================================================
// Axios Configuration
// ============================================================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// API Endpoints
// ============================================================

/**
 * Submit daily vitals from Patient Checklist
 */
export const submitVitals = async (vitalsData) => {
  try {
    const response = await apiClient.post('/data/vitals', vitalsData);
    return response.data;
  } catch (error) {
    console.error('Error submitting vitals:', error.message);
    throw error;
  }
};

/**
 * Upload Ambient Dictation from Doctor Dictate tool
 */
export const uploadDictation = async (patientId, rawText) => {
  try {
    const payload = { patientId, rawText };
    const response = await apiClient.post('/data/dictation', payload);
    return response.data;
  } catch (error) {
    console.error('Error uploading dictation:', error.message);
    throw error;
  }
};

/**
 * Ask the RAG Copilot a query about a patient
 */
export const askCopilot = async (patientId, query) => {
  try {
    const payload = { patientId, query };
    const response = await apiClient.post('/data/copilot', payload);
    return response.data;
  } catch (error) {
    console.error('Error querying copilot:', error.message);
    throw error;
  }
};

export default {
  submitVitals,
  uploadDictation,
  askCopilot,
};
