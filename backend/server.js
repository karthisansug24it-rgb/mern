const express = require('express');
const cors = require('cors');
const path = require('node:path');
require('dotenv').config();

const db = require('./db/database');
const seed = require('./db/seed');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const studentRoutes = require('./routes/students');
const librarianRoutes = require('./routes/librarians');
const issueRoutes = require('./routes/issues');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/librarians', librarianRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Bibliotech Library API', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server and ensure seed
async function startServer() {
  try {
    await seed();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Bibliotech API Server running on port ${PORT}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
