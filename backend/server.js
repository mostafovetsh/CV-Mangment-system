const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const routes = require('./routes');

const app = express();

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure UTF-8 encoding for Arabic text
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

// Serve frontend build (SPA) in production/dev
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Fallback to SPA for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('========================================');
  console.log('  CV Management System - Server Started');
  console.log('========================================');
  console.log('  Local:   http://localhost:' + PORT);
  console.log('  Network: http://YOUR_IP:' + PORT);
  console.log('========================================');
});
