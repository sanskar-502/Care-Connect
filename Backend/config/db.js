// ============================================================
// CareConnect — Database Configuration
// Connects to MongoDB Atlas via Mongoose
// ============================================================

const mongoose = require('mongoose');

/**
 * connectDB()
 * Establishes the MongoDB connection using the URI from .env.
 * Exits the process on failure so the server doesn't run in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
