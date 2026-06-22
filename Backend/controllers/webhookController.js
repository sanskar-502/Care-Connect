// ============================================================
// CareConnect — Webhook Controller
// Handles incoming Twilio WhatsApp webhooks
// When a patient replies "NO" or sends a critical message,
// this fires a real-time Socket.io alert to the clinician dashboard.
// ============================================================

const Patient = require('../models/Patient');
const Alert = require('../models/Alert');

// ============================================================
// Twilio integration removed. Will be implemented from scratch.
// ============================================================


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
  getAllAlerts,
  resolveAlert,
};
