// ============================================================
// CareConnect — Webhook Routes
// Twilio WhatsApp webhook + Alert management
// ============================================================

const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  resolveAlert,
} = require('../controllers/webhookController');

// GET    /api/webhooks/alerts             → Fetch all alerts for the Escalation Center
router.get('/alerts', getAllAlerts);

// PUT    /api/webhooks/alerts/:id/resolve → Mark an alert as resolved
router.put('/alerts/:id/resolve', resolveAlert);

module.exports = router;
