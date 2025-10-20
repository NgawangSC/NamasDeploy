const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📡 Connection string:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // ✅ Important for Atlas
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,                      // Use SSL (TLS)
      tlsAllowInvalidCertificates: true, // Helps fix Windows TLS issues
      retryWrites: true,

      // Optional performance options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

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

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error; // rethrow so test file can handle it
  }
};

module.exports = connectDB;