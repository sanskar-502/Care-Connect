// ============================================================
// CareConnect — Alert Model
// Stores escalation alerts triggered by patient responses
// or critical vital signs
// ============================================================

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Reference to the patient who triggered this alert
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },

  // Type of alert — determines the icon/color on the frontend
  alertType: {
    type: String,
    enum: ['WhatsApp', 'Critical_Vital'],
    required: true,
  },

  // Human-readable alert message
  message: {
    type: String,
    required: [true, 'Alert message is required'],
  },

  // Whether the care team has addressed this alert
  resolved: {
    type: Boolean,
    default: false,
  },

  // When the alert was created
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
