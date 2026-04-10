// ============================================================
// CareConnect — Webhook Controller
// Handles incoming Twilio WhatsApp webhooks
// When a patient replies "NO" or sends a critical message,
// this fires a real-time Socket.io alert to the clinician dashboard.
// ============================================================

const Patient = require('../models/Patient');
const Alert = require('../models/Alert');

// ============================================================
// POST /api/webhooks/whatsapp
// Twilio sends POST with application/x-www-form-urlencoded body:
//   - From: "whatsapp:+919876543210"
//   - Body: "NO"  (or any patient reply)
// ============================================================
const handleWhatsAppWebhook = async (req, res) => {
  try {
    // --- Step 1: Extract Twilio payload ---
    // Twilio sends `From` as "whatsapp:+91XXXXXXXXXX"
    const rawFrom = req.body.From || '';
    const messageBody = req.body.Body || '';

    // Strip the "whatsapp:" prefix to get clean phone number
    const phoneNumber = rawFrom.replace('whatsapp:', '').trim();

    console.log(`📱 WhatsApp webhook received from ${phoneNumber}: "${messageBody}"`);

    if (!phoneNumber || !messageBody) {
      return res.status(400).json({ success: false, error: 'Missing From or Body in webhook' });
    }

    // --- Step 2: Find the patient by phone number ---
    const patient = await Patient.findOne({ phone: phoneNumber });

    if (!patient) {
      // Log it but still return 200 to Twilio (so it doesn't retry)
      console.warn(`⚠️  No patient found for phone: ${phoneNumber}`);
      return res.status(200).json({
        success: false,
        message: 'No matching patient found for this phone number',
      });
    }

    // --- Step 3: Save the alert to MongoDB ---
    const alert = await Alert.create({
      patientId: patient._id,
      alertType: 'WhatsApp',
      message: `Patient replied: "${messageBody}"`,
      resolved: false,
    });

    console.log(`🚨 Alert created for ${patient.name}: "${messageBody}"`);

    // --- Step 4: Fire Socket.io real-time event ---
    // The React Escalation Center listens for 'critical_alert'
    const io = req.app.get('io');
    io.emit('critical_alert', {
      alertId: alert._id,
      patientId: patient._id,
      patientName: patient.name,
      message: `Patient replied: "${messageBody}"`,
      alertType: 'WhatsApp',
      phone: phoneNumber,
      timestamp: alert.timestamp,
    });

    console.log(`📡 Socket event 'critical_alert' emitted for ${patient.name}`);

    // --- Step 5: Return 200 to Twilio ---
    // Twilio REQUIRES a 200 response or it will keep retrying the webhook
    res.status(200).json({
      success: true,
      message: 'Webhook processed',
      alertId: alert._id,
    });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error.message);
    // Still return 200 to prevent Twilio retries on server errors
    res.status(200).json({ success: false, error: 'Internal processing error' });
  }
};

// ============================================================
// GET /api/webhooks/alerts
// Fetch all alerts (for the Escalation Center UI)
// ============================================================
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('patientId', 'name phone')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
};

// ============================================================
// PUT /api/webhooks/alerts/:id/resolve
// Mark an alert as resolved
// ============================================================
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    // Notify frontend that the alert was resolved
    const io = req.app.get('io');
    io.emit('alert_resolved', { alertId: alert._id });

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error resolving alert:', error.message);
    res.status(500).json({ success: false, error: 'Failed to resolve alert' });
  }
};

module.exports = {
  handleWhatsAppWebhook,
  getAllAlerts,
  resolveAlert,
};
