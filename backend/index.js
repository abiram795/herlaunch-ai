const express = require('express');
const cors = require('cors');
require('dotenv').config();

const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // In production, replace with actual frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/ai', geminiRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('HERLaunch AI Backend API is running successfully.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'An unexpected server error occurred',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`HERLaunch AI server started on port ${PORT}`);
});
