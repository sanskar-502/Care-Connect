// ============================================================
// CareConnect — API Gateway Entry Point
// Express + Socket.io + MongoDB
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');

// ---------- Import Routes ----------
const patientRoutes = require('./routes/patientRoutes');
const dataRoutes = require('./routes/dataRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// ---------- Initialize Express ----------
const app = express();
const server = http.createServer(app);

// ---------- Initialize Socket.io ----------
// Allow the React frontend (port 5173) to connect via WebSocket
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make `io` accessible in controllers via req.app.get('io')
app.set('io', io);

// ---------- Global Middleware ----------
app.use(helmet());                          // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));                     // HTTP request logging
app.use(express.json());                   // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (Twilio sends this)

// ---------- Health Check ----------
app.get('/', (req, res) => {
  res.json({
    service: 'CareConnect API Gateway',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ---------- API Routes ----------
app.use('/api/patients', patientRoutes);   // CRUD for patients
app.use('/api/data', dataRoutes);          // Vitals ingestion, dictation, RAG copilot
app.use('/api/webhooks', webhookRoutes);   // Twilio WhatsApp webhooks

// ---------- Socket.io Connection Handler ----------
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start listening
  server.listen(PORT, () => {
    console.log(`\n🚀 CareConnect API Gateway running on port ${PORT}`);
    console.log(`   Health:    http://localhost:${PORT}/`);
    console.log(`   Patients:  http://localhost:${PORT}/api/patients`);
    console.log(`   Data:      http://localhost:${PORT}/api/data`);
    console.log(`   Webhooks:  http://localhost:${PORT}/api/webhooks`);
    console.log(`   Socket.io: ws://localhost:${PORT}\n`);
  });
};

startServer();
