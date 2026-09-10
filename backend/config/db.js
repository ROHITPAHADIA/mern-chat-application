const mongoose = require("mongoose");
const dns = require("dns");

// Ensure robust SRV record resolution on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore in environments where custom DNS is restricted
}

/**
 * Connect to MongoDB Database
 * Handles connection lifecycle and errors cleanly
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
