const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📡 Connection string:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs

    // Enhanced connection options for better reliability
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options for production
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 15000, // Increased timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 15000, // Increased connection timeout
      bufferCommands: false, // Disable mongoose buffering
      // Retry configuration
      maxIdleTimeMS: 30000,
      // Additional options for Atlas
      retryWrites: true,
      w: 'majority',
      // Handle SSL issues
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log specific error details to help with debugging
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('🔒 SSL/TLS Error: This might be a network or certificate issue');
      console.error('💡 Try: 1) Check network connectivity, 2) Verify MongoDB Atlas IP whitelist, 3) Check firewall settings');
    }
    
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication Error: Check your MongoDB credentials');
    }
    
    if (error.message.includes('timeout')) {
      console.error('⏱️ Timeout Error: MongoDB server might be unreachable');
    }
    
    // Rethrow so callers can decide whether to fallback or not
    throw error;
  }
};

module.exports = connectDB;