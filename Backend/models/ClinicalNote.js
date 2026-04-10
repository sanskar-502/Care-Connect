// ============================================================
// CareConnect — ClinicalNote Model
// Stores raw physician dictation along with NLP-extracted intent
// ============================================================

const mongoose = require('mongoose');

const clinicalNoteSchema = new mongoose.Schema({
  // Reference to the patient this note is about
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },

  // The original raw dictation text from the doctor
  rawText: {
    type: String,
    required: [true, 'Raw dictation text is required'],
  },

  // NLP-extracted structured intent from the Python AI Engine
  // Flexible schema — typically: { symptoms: [], medications: [], actions: [] }
  extractedIntent: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // When the note was recorded
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ClinicalNote', clinicalNoteSchema);
