// ============================================================
// CareConnect — VitalsLog Model
// Time-series biometric data submitted by patients via Mobile App
// ============================================================

const mongoose = require('mongoose');

const vitalsLogSchema = new mongoose.Schema({
  // Reference to the patient who submitted this reading
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },

  // Blood Pressure (split into systolic/diastolic for proper thresholding)
  systolicBP: {
    type: Number,
    required: true,
    min: 50,
    max: 300,
  },
  diastolicBP: {
    type: Number,
    required: true,
    min: 30,
    max: 200,
  },

  // Blood Glucose (mg/dL)
  bloodSugar: {
    type: Number,
    required: true,
    min: 20,
    max: 600,
  },

  // Did the patient take their meds today?
  medicationsTaken: {
    type: Boolean,
    default: false,
  },

  // Auto-set on creation
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('VitalsLog', vitalsLogSchema);
