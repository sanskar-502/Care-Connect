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

module.exports = router;
