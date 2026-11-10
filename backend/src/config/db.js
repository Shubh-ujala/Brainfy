
import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI?.trim() ||
    process.env.MONGO_URL?.trim() ||
    process.env.MONGODB_URI?.trim();

  // Never silently fall back to localhost in production
  if (!mongoURI) {
    throw new Error(
      'MongoDB URI is missing. Check Railway environment variables.'
    );
  }

  // Validate the connection string without exposing credentials
  if (!/^mongodb(\+srv)?:\/\//i.test(mongoURI)) {
    throw new Error(
      'Invalid MongoDB URI. It must start with mongodb:// or mongodb+srv://'
    );
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(
      `[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database');
    });

    return conn;
  } catch (error) {
    console.error('[MongoDB] Initial connection error:', error.message);
    throw error;
  }
};

export default connectDB;
