import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

// Import Routes
import todoRoutes from './routes/todo.js';
import diaryRoutes from './routes/diary.js'; 
import userRoutes from './routes/userRoute.js'; 

// Load environment variables
config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/users', userRoutes); 
app.use('/api/todos', todoRoutes);
app.use('/api/diary', diaryRoutes); // optional

// Global error handling (optional)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{ 
    logger.info(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
});
