const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const JSZip = require('jszip');
const prettier = require('prettier');
const mime = require('mime-types');
const { URL } = require('url');
const fs = require('fs');

// Import middleware
const { errorLogger, errorHandler, notFoundHandler, validationErrorHandler } = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes/api');

// Import services
const scraperService = require('./services/scraperService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://clonecraft-i0mf.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from React build
const clientBuildPath = path.join(__dirname, 'client/build');
const clientBuildPathAlt = path.join(__dirname, '../client/build');

// Try the primary path first, then fallback
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
} else if (fs.existsSync(clientBuildPathAlt)) {
  app.use(express.static(clientBuildPathAlt));
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/build/index.html');
  const indexPathAlt = path.join(__dirname, '../client/build/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(indexPathAlt)) {
    res.sendFile(indexPathAlt);
  } else {
    res.status(404).send('Build files not found');
  }
});

// Error handling middleware
app.use(validationErrorHandler);
app.use(errorLogger);
app.use(errorHandler);
app.use(notFoundHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await scraperService.closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await scraperService.closeBrowser();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://server-clonecraft-production-b992.up.railway.app'
    : `http://localhost:${PORT}`;
    
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at ${baseUrl}/api`);
  console.log(`🌐 Frontend available at ${baseUrl}`);
  console.log(`📊 Health check at ${baseUrl}/health`);
});

module.exports = app; 