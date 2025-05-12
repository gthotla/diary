import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDb');
    console.log(`MongoDB connected on ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message)
    console.error("Error: ", error.message);

    process.exit(1);
  }
};

export default connectDB;