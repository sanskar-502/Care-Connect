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

export const admitPatient = async (patientData) => {
  const { data } = await apiClient.post('/patients', patientData);
  return data.data;
};

export const ingestVitals = async (vitalsData) => {
  const { data } = await apiClient.post('/data/vitals', vitalsData);
  return data.data;
};

export const uploadMedicalDocument = async (patientId, file) => {
  const formData = new FormData();
  formData.append('patientId', patientId);
  formData.append('document', file);

  const { data } = await apiClient.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};

export const getMedicalDocuments = async (patientId) => {
  const { data } = await apiClient.get(`/data/documents/${patientId}`);
  return data.data;
};

export default apiClient;
