const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  // Extracted data from Gemini Vision
  extractedData: {
    diagnosis: String,
    medications: [String],
    testResults: [String],
    recommendations: [String],
  },
  // We don't save the actual file binary to MongoDB to save space in this hackathon, 
  // but in production, we'd save it to S3 and put the URL here.
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
