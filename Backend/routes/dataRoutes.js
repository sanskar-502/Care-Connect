// ============================================================
// CareConnect — Data Routes
// Vitals ingestion, ambient dictation, and RAG copilot queries
// ============================================================

const express = require('express');
const router = express.Router();
const {
  ingestVitals,
  processDictation,
  askCopilot,
  getVitalsHistory,
  getClinicalNotes,
} = require('../controllers/dataController');

// POST   /api/data/vitals            → Ingest patient vitals from Mobile App
router.post('/vitals', ingestVitals);

// POST   /api/data/dictation         → Process ambient voice dictation
router.post('/dictation', processDictation);

// POST   /api/data/copilot           → Ask the RAG Medical Copilot a question
router.post('/copilot', askCopilot);

// GET    /api/data/vitals/:patientId → Fetch vitals history (for trend charts)
router.get('/vitals/:patientId', getVitalsHistory);

// GET    /api/data/notes/:patientId  → Fetch clinical notes for a patient
router.get('/notes/:patientId', getClinicalNotes);

// GET    /api/data/documents/:patientId → Fetch medical documents for a patient
const { getMedicalDocuments } = require('../controllers/dataController');
router.get('/documents/:patientId', getMedicalDocuments);

// --- File Upload Setup ---
const multer = require('multer');
// We use memory storage to buffer the file and send to Python as Base64
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST   /api/data/upload            → Upload Medical Document
const { uploadMedicalDocument } = require('../controllers/dataController');
router.post('/upload', upload.single('document'), uploadMedicalDocument);

module.exports = router;
