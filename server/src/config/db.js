import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connects to MongoDB Atlas.
 * In development the server may run without a database so the API can be
 * started before Atlas is configured; in production a missing URI is fatal
 * (enforced in env.js).
 */
export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not set. Starting without a database connection.');
    return;
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

/** Closes the connection; used during graceful shutdown. */
export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/** Human-readable connection state for the health endpoint. */
export function databaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}
