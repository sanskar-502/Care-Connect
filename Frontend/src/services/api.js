import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPatients = async () => {
  const { data } = await apiClient.get('/patients');
  return data.data; // Server returns { success: true, count: X, data: [...] }
};

export const getPatientById = async (id) => {
  const { data } = await apiClient.get(`/patients/${id}`);
  return data.data;
};

export const getVitalsHistory = async (patientId) => {
  const { data } = await apiClient.get(`/data/vitals/${patientId}`);
  return data.data;
};

export const getClinicalNotes = async (patientId) => {
  const { data } = await apiClient.get(`/data/notes/${patientId}`);
  return data.data;
};

export const getAlerts = async () => {
  const { data } = await apiClient.get('/webhooks/alerts');
  return data.data;
};

export const resolveAlert = async (id) => {
  const { data } = await apiClient.put(`/webhooks/alerts/${id}/resolve`);
  return data.data;
};

export default apiClient;
