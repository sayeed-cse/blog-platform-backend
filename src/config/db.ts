import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    console.log('MongoDB connected:', conn.connection.host);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};