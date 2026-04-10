// ============================================================
// CareConnect — Webhook Routes
// Twilio WhatsApp webhook + Alert management
// ============================================================

const express = require('express');
const router = express.Router();
const {
  handleWhatsAppWebhook,
  getAllAlerts,
  resolveAlert,
} = require('../controllers/webhookController');

// POST   /api/webhooks/whatsapp           → Twilio sends incoming WhatsApp messages here
router.post('/whatsapp', handleWhatsAppWebhook);

// GET    /api/webhooks/alerts             → Fetch all alerts for the Escalation Center
router.get('/alerts', getAllAlerts);

// PUT    /api/webhooks/alerts/:id/resolve → Mark an alert as resolved
router.put('/alerts/:id/resolve', resolveAlert);

module.exports = router;
