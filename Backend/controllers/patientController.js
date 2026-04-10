// ============================================================
// CareConnect — Patient Controller
// CRUD operations for the Patient model
// ============================================================

const Patient = require('../models/Patient');

// ---------- GET /api/patients ----------
// Fetch all patients, sorted by highest risk first
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ currentRiskScore: -1 });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    console.error('Error fetching patients:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
};

// ---------- GET /api/patients/:id ----------
// Fetch a single patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error fetching patient:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch patient' });
  }
};

// ---------- POST /api/patients ----------
// Create a new patient (Admission)
const createPatient = async (req, res) => {
  try {
    const { name, age, phone, baselineRiskScore, currentMedications } = req.body;

    const patient = await Patient.create({
      name,
      age,
      phone,
      baselineRiskScore: baselineRiskScore || 0,
      currentRiskScore: baselineRiskScore || 0, // starts at baseline
      currentMedications: currentMedications || [],
    });

    console.log(`✅ New patient admitted: ${patient.name} (ID: ${patient._id})`);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error('Error creating patient:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------- PUT /api/patients/:id ----------
// Update a patient's record
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error updating patient:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------- DELETE /api/patients/:id ----------
// Remove a patient (discharge from system)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, message: `Patient ${patient.name} removed` });
  } catch (error) {
    console.error('Error deleting patient:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete patient' });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
