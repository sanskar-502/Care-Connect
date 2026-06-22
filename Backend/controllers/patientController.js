// ============================================================
// CareConnect — Patient Controller
// CRUD operations for the Patient model
// ============================================================

const Patient = require('../models/Patient');
const aiEngineBridge = require('../services/aiEngineBridge');

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
    const { 
      name, age, phone, notes, 
      systolicBP, diastolicBP, bloodSugar, pulseRate, spo2, temperature 
    } = req.body;

    // Default values if not provided from frontend modal
    const patientAge = age || 50;
    const patientPhone = phone || '+15550000000';
    let currentMedications = [];
    let riskScore = 40;

    // 1. Create the patient first so we have a valid ID for ChromaDB
    const patient = await Patient.create({
      name,
      age: patientAge,
      phone: patientPhone,
      baselineRiskScore: riskScore,
      currentRiskScore: riskScore,
      currentMedications: currentMedications,
    });

    // 2. Save the admission vitals so they appear on the graph immediately
    const VitalsLog = require('../models/VitalsLog');
    const sysBP = Number(systolicBP) || 120;
    const diaBP = Number(diastolicBP) || 80;
    const sugar = Number(bloodSugar) || 100;
    
    await VitalsLog.create({
      patientId: patient._id,
      systolicBP: sysBP,
      diastolicBP: diaBP,
      bloodSugar: sugar,
      hr: Number(pulseRate) || 80,
      spo2: Number(spo2) || 98,
      temperature: Number(temperature) || 98.6,
      medicationsTaken: true, // assume true on admit
    });

    // 3. If we received raw notes, use the AI Engine to extract structured intent
    if (notes) {
      console.log(`🧠 AI Engine extracting data for ${name}...`);
      const extracted = await aiEngineBridge.extractClinicalIntent(patient._id.toString(), notes);

      currentMedications = extracted.medicationChanges || extracted.medications || [];

      // Generate a risk score using the ML model based on the extracted data and real vitals
      const patientFeatures = {
        age: patientAge,
        systolicBP: sysBP,
        diastolicBP: diaBP,
        bloodSugar: sugar,
        medicationsTaken: true,
        baselineRiskScore: 30
      };

      const riskData = await aiEngineBridge.recalculateRisk(patientFeatures);
      riskScore = riskData.riskScore || 40;

      // Update the patient with the newly extracted data
      patient.currentMedications = currentMedications;
      patient.baselineRiskScore = riskScore;
      patient.currentRiskScore = riskScore;
      await patient.save();
      
      // Save the admission note so it shows in the UI
      const ClinicalNote = require('../models/ClinicalNote');
      await ClinicalNote.create({
        patientId: patient._id,
        rawText: `[ADMISSION NOTE] ${notes}`,
        extractedIntent: extracted,
      });
    }

    // 4. Trigger AI Insights generation for the new patient in the background
    const dataController = require('./dataController');
    dataController.refreshPatientInsights(patient._id);

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
