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
    gender: {
      type: String,
      default: 'Unknown'
    },
    address: {
      type: String,
      default: ''
    },
    bloodGroup: {
      type: String,
      default: 'Unknown'
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required for WhatsApp follow-ups'],
      trim: true,
    },
    
    // Initial Health Details
    vitals: {
      systolicBP: Number,
      diastolicBP: Number,
      bloodSugar: Number,
      pulseRate: Number,
      spo2: Number,
      temperature: Number,
      weight: Number,
      height: Number,
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

    // AI Generated Holistic Insights
    aiInsights: {
      currentCondition: { type: String, default: 'No recent insights available.' },
      risks: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Patient', patientSchema);
