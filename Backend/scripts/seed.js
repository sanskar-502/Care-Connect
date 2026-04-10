require('dotenv').config();
const mongoose = require('mongoose');

// Import schemas
const Patient = require('../models/Patient');
const VitalsLog = require('../models/VitalsLog');
const ClinicalNote = require('../models/ClinicalNote');
const Alert = require('../models/Alert');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    console.log('🌱 Connected to MongoDB. Purging existing data...');

    // 2. Wipe existing databases
    await Patient.deleteMany();
    await VitalsLog.deleteMany();
    await ClinicalNote.deleteMany();
    await Alert.deleteMany();

    console.log('🗑️  Databases purged. Seeding new mock data...');

    // 3. Seed Patients
    const patientsData = [
      {
        name: 'Rajesh Mehta',
        age: 72,
        phone: '+15551234567',
        baselineRiskScore: 60,
        currentRiskScore: 82,
        currentMedications: ['Lisinopril', 'Carvedilol', 'Lasix', 'Aspirin'],
      },
      {
        name: 'Srishti Patel',
        age: 58,
        phone: '+15559876543',
        baselineRiskScore: 35,
        currentRiskScore: 45,
        currentMedications: ['Metformin', 'Glipizide', 'Gabapentin'],
      },
      {
        name: 'Amir Khan',
        age: 84,
        phone: '+15555551212',
        baselineRiskScore: 75,
        currentRiskScore: 88,
        currentMedications: ['Oxycodone', 'Senna', 'Ibuprofen'],
      }
    ];

    const insertedPatients = await Patient.insertMany(patientsData);
    console.log(`✅ Seeded ${insertedPatients.length} patients.`);

    // 4. Seed Vitals Logs
    const vitalsData = [];
    const notesData = [];
    const alertsData = [];

    // Rajesh's Data (High Risk)
    const p1 = insertedPatients[0]._id;
    vitalsData.push({
      patientId: p1,
      systolicBP: 148,
      diastolicBP: 92,
      bloodSugar: 115,
      medicationsTaken: false,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    });
    
    notesData.push({
      patientId: p1,
      rawText: 'Patient reports persistent fatigue. Mild edema in lower extremities observed. Increased Lasix dosage to 40mg BID. Will reassess in 24 hrs.',
      extractedIntent: {
        symptoms: ['Fatigue', 'Edema'],
        medicationChanges: ['Increased Lasix to 40mg BID'],
        actions: ['Reassess in 24 hours']
      },
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    });

    alertsData.push({
      patientId: p1,
      alertType: 'WhatsApp',
      message: 'Patient replied: "NO" to taking medications today.',
      resolved: false
    });

    // Srishti's Data (Stable)
    const p2 = insertedPatients[1]._id;
    vitalsData.push({
      patientId: p2,
      systolicBP: 132,
      diastolicBP: 84,
      bloodSugar: 132,
      medicationsTaken: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });
    // Add multiple days of history for Srishti's chart
    vitalsData.push({
      patientId: p2,
      systolicBP: 140,
      diastolicBP: 88,
      bloodSugar: 148,
      medicationsTaken: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // Amir's Data (Critical Vital Alert)
    const p3 = insertedPatients[2]._id;
    alertsData.push({
      patientId: p3,
      alertType: 'Critical_Vital',
      message: 'CRITICAL VITAL: BP 185/95, Sugar 110 mg/dL',
      resolved: false,
      timestamp: new Date()
    });

    await VitalsLog.insertMany(vitalsData);
    await ClinicalNote.insertMany(notesData);
    await Alert.insertMany(alertsData);

    console.log(`✅ Seeded ${vitalsData.length} VitalsLogs, ${notesData.length} ClinicalNotes, ${alertsData.length} Alerts.`);
    console.log('🎉 Data Seeding Complete. The Hackathon Demo is ready.');
    process.exit();

  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
