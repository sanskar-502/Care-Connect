// ============================================================
// CareConnect — Data Controller
// Handles vitals ingestion, ambient dictation, and RAG copilot
// These are the core data flow pipelines of CareConnect.
// ============================================================

const Patient = require('../models/Patient');
const VitalsLog = require('../models/VitalsLog');
const ClinicalNote = require('../models/ClinicalNote');
const Alert = require('../models/Alert');
const MedicalDocument = require('../models/MedicalDocument');
const aiEngine = require('../services/aiEngineBridge');

// --- Helper: Refresh AI Insights ---
const refreshPatientInsights = async (patientId) => {
  try {
    const vitals = await VitalsLog.find({ patientId }).sort({ timestamp: -1 }).limit(10);
    const notes = await ClinicalNote.find({ patientId }).sort({ timestamp: -1 }).limit(10);
    const docs = await MedicalDocument.find({ patientId }).sort({ uploadDate: -1 }).limit(5);

    const context = `
Vitals: ${JSON.stringify(vitals)}
Notes: ${JSON.stringify(notes)}
Docs: ${JSON.stringify(docs)}
    `;

    const result = await aiEngine.generatePatientInsights(context);
    
    if (result && result.currentCondition) {
      await Patient.findByIdAndUpdate(patientId, {
        aiInsights: {
          currentCondition: result.currentCondition,
          risks: result.risks || [],
          recommendations: result.recommendations || [],
          lastUpdated: new Date()
        }
      });
      console.log(`🧠 AI Insights refreshed for patient ${patientId}`);
    }
  } catch (error) {
    console.error('Failed to refresh AI Insights:', error.message);
  }
};

// ============================================================
// 1. POST /api/data/vitals
//    FLOW: Mobile App → Save VitalsLog → AI Summary → Risk Update
// ============================================================
const ingestVitals = async (req, res) => {
  try {
    const { patientId, systolicBP, diastolicBP, bloodSugar, medicationsTaken } = req.body;

    // --- Validate patient exists ---
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // --- Step 1: Save the raw vitals to MongoDB ---
    const vitalsLog = await VitalsLog.create({
      patientId,
      systolicBP,
      diastolicBP,
      bloodSugar,
      medicationsTaken,
    });
    console.log(`📊 Vitals logged for ${patient.name}: BP ${systolicBP}/${diastolicBP}, Sugar ${bloodSugar}`);

    // --- Step 2: Check for critical thresholds and create alert ---
    const isCritical = systolicBP > 180 || systolicBP < 90 || bloodSugar > 300 || bloodSugar < 50;
    if (isCritical) {
      const alertMsg = `CRITICAL VITAL: BP ${systolicBP}/${diastolicBP}, Sugar ${bloodSugar} mg/dL`;
      const alert = await Alert.create({
        patientId,
        alertType: 'Critical_Vital',
        message: alertMsg,
      });

      // Fire real-time WebSocket event to clinician dashboard
      const io = req.app.get('io');
      io.emit('critical_alert', {
        alertId: alert._id,
        patientId: patient._id,
        patientName: patient.name,
        message: alertMsg,
        alertType: 'Critical_Vital',
        timestamp: alert.timestamp,
      });
      console.log(`🚨 CRITICAL ALERT fired for ${patient.name}`);
    }

    // --- Step 3: Forward to Python AI Engine for LLM summary ---
    const summaryResult = await aiEngine.generateSummary({
      patientId,
      patientName: patient.name,
      systolicBP,
      diastolicBP,
      bloodSugar,
      medicationsTaken,
      currentMedications: patient.currentMedications,
    });

    // --- Step 4: Forward to Python AI Engine for risk recalculation ---
    const riskResult = await aiEngine.recalculateRisk({
      patientId,
      age: patient.age,
      systolicBP,
      diastolicBP,
      bloodSugar,
      medicationsTaken,
      currentRiskScore: patient.currentRiskScore,
      baselineRiskScore: patient.baselineRiskScore,
    });

    // --- Step 5: Update the patient's risk score in MongoDB ---
    patient.currentRiskScore = riskResult.riskScore || patient.currentRiskScore;
    await patient.save();

    // --- Step 6: Notify the frontend that data has changed ---
    const io = req.app.get('io');
    io.emit('vitals_updated', {
      patientId: patient._id,
      patientName: patient.name,
      newRiskScore: patient.currentRiskScore,
    });

    // --- Step 7: Refresh AI Insights in background ---
    refreshPatientInsights(patientId);

    // --- Return the summary to the mobile app ---
    res.json({
      success: true,
      data: {
        vitalsLog,
        summary: summaryResult.summary || summaryResult,
        updatedRiskScore: patient.currentRiskScore,
        isCritical,
      },
    });
  } catch (error) {
    console.error('Error ingesting vitals:', error.message);
    res.status(500).json({ success: false, error: 'Failed to process vitals' });
  }
};

// ============================================================
// 2. POST /api/data/dictation
//    FLOW: Doctor App → NLP Extraction → Save ClinicalNote → Socket emit
// ============================================================
const processDictation = async (req, res) => {
  try {
    const { patientId, rawText } = req.body;

    // --- Validate patient exists ---
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // --- Step 1: Forward raw text to Python NLP pipeline ---
    const extracted = await aiEngine.extractClinicalIntent(patientId, rawText);
    console.log(`🎤 Dictation processed for ${patient.name}:`, extracted);

    // --- Step 2: Save the ClinicalNote to MongoDB ---
    const clinicalNote = await ClinicalNote.create({
      patientId,
      rawText,
      extractedIntent: extracted,
    });

    // --- Step 3: Update patient medications if NLP found new ones ---
    if (extracted.medications && extracted.medications.length > 0) {
      const existingMeds = new Set(patient.currentMedications.map((m) => m.toLowerCase()));
      const newMeds = extracted.medications.filter((m) => !existingMeds.has(m.toLowerCase()));

      if (newMeds.length > 0) {
        patient.currentMedications.push(...newMeds);
        console.log(`💊 New medications added for ${patient.name}:`, newMeds);
      }
    }

    // --- Step 3.5: Dynamically adjust Risk Score based on AI's riskSignal ---
    let riskModifier = 0;
    const signal = extracted.riskSignal || "neutral";
    
    if (signal === "positive") {
      riskModifier -= 15;
    } else if (signal === "negative") {
      riskModifier += 20;
    }
    
    // Apply modifier and clamp to 0-100
    if (riskModifier !== 0) {
      patient.currentRiskScore = Math.max(0, Math.min(100, patient.currentRiskScore + riskModifier));
      console.log(`🎯 Risk score adjusted by ${riskModifier} for ${patient.name}. New score: ${patient.currentRiskScore}`);
    }

    await patient.save();

    // Refresh AI Insights in background
    refreshPatientInsights(patientId);

    // --- Step 4: Fire Socket.io event so the React dashboard refreshes ---
    const io = req.app.get('io');
    io.emit('chart_updated', {
      patientId: patient._id,
      patientName: patient.name,
      noteId: clinicalNote._id,
      extractedIntent: extracted,
      timestamp: clinicalNote.timestamp,
    });

    res.json({
      success: true,
      data: {
        clinicalNote,
        extractedIntent: extracted,
      },
    });
  } catch (error) {
    console.error('Error processing dictation:', error.message);
    res.status(500).json({ success: false, error: 'Failed to process dictation' });
  }
};

// ============================================================
// 3. POST /api/data/copilot
//    FLOW: Frontend/Mobile → RAG Query → Return LLM answer
// ============================================================
const askCopilot = async (req, res) => {
  try {
    const { patientId, query } = req.body;

    if (!patientId || !query) {
      return res.status(400).json({
        success: false,
        error: 'Both patientId and query are required',
      });
    }

    // --- Forward to the RAG pipeline ---
    const result = await aiEngine.queryRAGCopilot(patientId, query);

    res.json({
      success: true,
      data: {
        answer: result.answer || result,
        sources: result.sources || [],
      },
    });
  } catch (error) {
    console.error('Error querying copilot:', error.message);
    res.status(500).json({ success: false, error: 'Failed to query copilot' });
  }
};

// ============================================================
// 4. GET /api/data/vitals/:patientId
//    Fetch vitals history for a patient (for trend charts)
// ============================================================
const getVitalsHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit) || 30; // default 30 readings

    const vitals = await VitalsLog.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, count: vitals.length, data: vitals });
  } catch (error) {
    console.error('Error fetching vitals history:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch vitals' });
  }
};

// ============================================================
// 5. GET /api/data/notes/:patientId
//    Fetch clinical notes for a patient
// ============================================================
const getClinicalNotes = async (req, res) => {
  try {
    const { patientId } = req.params;

    const notes = await ClinicalNote.find({ patientId })
      .sort({ timestamp: -1 });

    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    console.error('Error fetching clinical notes:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
};

// ============================================================
// 6. POST /api/data/upload
//    Upload and process a medical document
// ============================================================
const uploadMedicalDocument = async (req, res) => {
  try {
    const { patientId } = req.body;
    const file = req.file;

    if (!patientId || !file) {
      return res.status(400).json({ success: false, error: 'Patient ID and file are required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Convert buffer to base64
    const fileBase64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    // Send to Python AI Engine
    const result = await aiEngine.processDocument(patientId, mimeType, fileBase64);

    // Save metadata to MongoDB
    const newDoc = await MedicalDocument.create({
      patientId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      extractedData: result.extracted,
    });

    // Also save as a ClinicalNote so RAG Copilot can easily search it via Vector DB fallback
    await ClinicalNote.create({
      patientId,
      rawText: `[DOCUMENT: ${file.originalname}] ${result.rawText}`,
      extractedIntent: result.extracted,
    });

    // Refresh AI Insights
    refreshPatientInsights(patientId);

    res.json({ success: true, data: newDoc });
  } catch (error) {
    console.error('Error uploading document:', error.message);
    res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
};

// ============================================================
// 7. GET /api/data/documents/:patientId
//    Fetch medical documents for a patient
// ============================================================
const getMedicalDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const documents = await MedicalDocument.find({ patientId }).sort({ uploadDate: -1 });
    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    console.error('Error fetching medical documents:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
};

module.exports = {
  ingestVitals,
  processDictation,
  askCopilot,
  getVitalsHistory,
  getClinicalNotes,
  uploadMedicalDocument,
  getMedicalDocuments,
  refreshPatientInsights,
};
