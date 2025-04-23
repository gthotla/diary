import express, { json } from 'express';
import { config } from 'dotenv';
import connectDB from './config/db';

config();
const app = express();
connectDB();

app.use(json());

app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
