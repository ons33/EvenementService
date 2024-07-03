import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import evenementRoutes from './routes/evenementRoutes.js';
import cors from 'cors';
import connectDataBase from "./config/MongoDb.js";
import participationRoutes from './routes/participationRoutes.js';
import path from 'path';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDataBase();
// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/evenements', evenementRoutes);
app.use('/api/participations', participationRoutes);

// Start the server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const __dirname = path.resolve();

// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
export { app };
