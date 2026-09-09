const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tourist_guide';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/tourist_guide';

  const connectionOptions = {
    serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 30s
  };

  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(primaryUri, connectionOptions);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    await createIndexes();

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas connection error: ${error.message}`);

    // If Atlas failed and wasn't local, try local MongoDB
    if (!primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
      try {
        console.log('🔄 Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/tourist_guide)...');
        const localConn = await mongoose.connect(localFallbackUri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ Connected to local MongoDB fallback: ${localConn.connection.host}`);
        await createIndexes();
        return localConn;
      } catch (localErr) {
        console.warn('⚠️  Local MongoDB fallback also unavailable:', localErr.message);
      }
    }

    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB CONNECTION NOTICE');
    console.warn('1. If using MongoDB Atlas, check your IP Whitelist:');
    console.warn('   Go to: https://cloud.mongodb.com -> Network Access -> Add IP Address');
    console.warn('   Click "Allow Access from Anywhere" (0.0.0.0/0) or add your current IP.');
    console.warn('2. Or start local MongoDB service on 127.0.0.1:27017');
    console.warn('ℹ️  Server remains running so /health and APIs can report status.');
    console.warn('======================================================\n');

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const createIndexes = async () => {
  try {
    const Destination = require('../models/Destination');

    const createIfMissing = async (collection, indexSpec, options = {}) => {
      try {
        await collection.createIndex(indexSpec, options);
      } catch (error) {
        const message = error.message || '';
        if (!/already exists|same name as the requested index/i.test(message)) {
          throw error;
        }
      }
    };

    await createIfMissing(Destination.collection, { 'location.state': 1 });
    await createIfMissing(Destination.collection, { category: 1 });

    console.log('✅ Database indexes verified');
  } catch (error) {
    console.error('Error verifying indexes:', error.message);
  }
};

module.exports = connectDB;
