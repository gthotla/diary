import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swagger.js'; // Import swagger spec
import cors from 'cors';
import cron from 'node-cron';
import multer from 'multer';
//import {processTodosForAllUsers} from './cron/eodProcessor.js';

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
// cron.schedule('*/2 * * * *', async () => {
//   console.log('Running EOD processor...');
//   await processTodosForAllUsers();
// });
// Middlewares
app.use(cookieParser()); // ✅ THIS MUST BE FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true,
}));
app.use(requestLogger); // if this logs tokens, it must be after cookieParser

const stroage = multer.memoryStorage();
const upload = multer({ storage: stroage });
// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/users', userRoutes); 
app.use('/api/todos', todoRoutes);
app.use('/api/diary', diaryRoutes); // optional
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
