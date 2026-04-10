// ============================================================
// CareConnect — Patient Routes
// CRUD endpoints for Patient management
// ============================================================

const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');

// GET    /api/patients          → List all patients (sorted by risk)
router.get('/', getAllPatients);

// GET    /api/patients/:id      → Get single patient
router.get('/:id', getPatientById);

// POST   /api/patients          → Admit new patient
router.post('/', createPatient);

// PUT    /api/patients/:id      → Update patient record
router.put('/:id', updatePatient);

// DELETE /api/patients/:id      → Remove patient
router.delete('/:id', deletePatient);

module.exports = router;
