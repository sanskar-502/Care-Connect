// ============================================================
// CareConnect — Patient Model
// Core patient record linked to vitals, notes, and alerts
// ============================================================

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // Basic demographics
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: 0,
      max: 150,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required for WhatsApp follow-ups'],
      trim: true,
    },

    // Risk scores (0-100)
    baselineRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Active medications list
    currentMedications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Patient', patientSchema);
