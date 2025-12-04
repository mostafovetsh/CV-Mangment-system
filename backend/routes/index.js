const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cvController = require('../controllers/cvController');
const db = require('../services/databaseService');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

router.get('/cvs', cvController.getAllCVs);
router.get('/cvs/search', cvController.searchCVs);
// Place preview route before the generic '/cvs/:id' to avoid routing conflicts
router.get('/cvs/:id/preview', cvController.previewCV);
router.get('/cvs/:id', cvController.getCVById);
// Notes routes
router.get('/cvs/:id/notes', cvController.getNotes);
router.post('/cvs/:id/notes', cvController.addNote);
router.put('/cvs/:id/notes/:noteId', cvController.updateNote);
router.delete('/cvs/:id/notes/:noteId', cvController.deleteNote);
// Parse CV endpoint
router.post('/cvs/parse', upload.single('file'), cvController.parseCV);

// Accept both single file ('file') and multiple files ('files')
router.post('/cvs/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]), cvController.uploadCV);
router.put('/cvs/:id', cvController.updateCV);
router.delete('/cvs/:id', cvController.deleteCV);

// Bulk operations
router.put('/cvs/bulk-update', cvController.bulkUpdate);
router.delete('/cvs/bulk-delete', cvController.bulkDelete);
router.put('/cvs/bulk-move', cvController.bulkMove);

// Comparison endpoints
router.post('/cvs/compare', cvController.compareCVs);
router.get('/cvs/compare/export', cvController.exportComparison);

router.get('/folders', (req, res) => {
  try { res.json({ success: true, folders: db.getAllFolders() }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/folders', (req, res) => {
  try {
    console.log('POST /folders - Request body:', req.body);
    const { folderName, name } = req.body;
    const actualFolderName = folderName || name;

    if (!actualFolderName || !actualFolderName.trim()) {
      console.log('Folder name validation failed - empty or whitespace');
      return res.status(400).json({ success: false, error: 'اسم المجلد مطلوب' });
    }

    const trimmedName = actualFolderName.trim();
    console.log('Adding folder:', trimmedName);

    const added = db.addFolder(trimmedName);
    if (!added) {
      console.log('Folder already exists:', trimmedName);
      return res.status(400).json({ success: false, error: 'المجلد موجود بالفعل' });
    }

    const folderPath = path.join('uploads', trimmedName);
    console.log('Creating folder path:', folderPath);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log('Folder created successfully:', folderPath);
    }

    const allFolders = db.getAllFolders();
    console.log('All folders after creation:', allFolders);

    res.status(201).json({ success: true, folders: allFolders });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/folders/:name', (req, res) => {
  try {
    const deleted = db.deleteFolder(req.params.name);
    if (!deleted) return res.status(400).json({ success: false, error: 'Cannot delete folder' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/stats', (req, res) => {
  try { res.json({ success: true, ...db.getStats() }); }
  catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'running', timestamp: new Date().toISOString() });
});

// Reports endpoints
router.get('/reports/summary', (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const stats = db.getStats();
    // additional summary: top skills
    const allCVs = db.getAllCVs(filters);
    const skillCounts = {};
    allCVs.forEach(cv => {
      (cv.skills || []).forEach(s => {
        const key = (s || '').toLowerCase();
        if (!key) return;
        skillCounts[key] = (skillCounts[key] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, count]) => ({ skill, count }));
    res.json({ success: true, summary: { totalCVs: stats.totalCVs, totalFolders: stats.totalFolders, oldCVs: stats.oldCVs, cvsByFolder: stats.cvsByFolder, topSkills } });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/reports/by-folder', (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const folders = db.getAllFolders();
    const result = folders.map(folder => {
      const filters = { folder };
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      return { folder, cvs: db.getAllCVs(filters) };
    });
    res.json({ success: true, byFolder: result });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/reports/by-date-range', (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {};
    if (!dateFrom && !dateTo) return res.status(400).json({ success: false, error: 'dateFrom or dateTo required' });
    const cvs = db.getAllCVs({ dateFrom, dateTo });
    const total = cvs.length;
    const totalSize = cvs.reduce((s, cv) => s + (cv.fileSize || 0), 0);
    res.json({ success: true, dateFrom, dateTo, total, totalSize, cvs });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Simple development login endpoint
router.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password required' });
    const user = (config.users || []).find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    // Return a simple token (not secure) for demo purposes
    const token = Buffer.from(`${user.username}:${user.role}`).toString('base64');
    res.json({ success: true, user: { username: user.username, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get system configuration (departments, statuses)
router.get('/config', (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        departmentCategories: config.departmentCategories || [],
        cvStatuses: config.cvStatuses || [],
        logoUrl: config.logoUrl || '/logo.png'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
