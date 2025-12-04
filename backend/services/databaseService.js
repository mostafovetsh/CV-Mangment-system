const fs = require('fs');
const config = require('../config/config');

const DB_FILE = config.database.path;
const DEFAULT_DB = {
  cvs: [],
  folders: [
    'general',
    // ready-made workflow folders
    'متقدمين جدد',
    'مقابلات',
    'مقبولين',
    'مرفوضين',
    // department folders
    'IT',
    'مبيعات',
    'تسويق',
    // fallback / legacy
    'engineering',
    'marketing',
    'hr',
    'finance'
  ]
};

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(DEFAULT_DB);
      return DEFAULT_DB;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    console.error('Database read error:', error);
    return DEFAULT_DB;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getAllCVs(filters = {}) {
  const db = readDB();
  let cvs = [...db.cvs];
  if (filters.name) {
    cvs = cvs.filter(cv => cv.candidateName.toLowerCase().includes(filters.name.toLowerCase()));
  }
  if (filters.skills) {
    const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
    cvs = cvs.filter(cv => cv.skills.some(skill => searchSkills.some(s => skill.toLowerCase().includes(s))));
  }
  if (filters.folder) {
    cvs = cvs.filter(cv => cv.folder === filters.folder);
  }
  if (filters.status) {
    cvs = cvs.filter(cv => cv.status === filters.status);
  }
  if (filters.age) {
    cvs = cvs.filter(cv => cv.age && cv.age.toString() === filters.age.toString());
  }
  if (filters.dateFrom) {
    cvs = cvs.filter(cv => new Date(cv.uploadDate) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    cvs = cvs.filter(cv => new Date(cv.uploadDate) <= new Date(filters.dateTo));
  }
  return cvs;
}

function addCV(cvData) {
  const db = readDB();
  const newCV = {
    id: Date.now().toString(),
    status: 'new',
    ...cvData,
    uploadDate: new Date().toISOString()
  };
  db.cvs.push(newCV);
  if (cvData.folder && !db.folders.includes(cvData.folder)) {
    db.folders.push(cvData.folder);
  }
  writeDB(db);
  return newCV;
}

function deleteCV(id) {
  const db = readDB();
  const index = db.cvs.findIndex(cv => cv.id === id);
  if (index === -1) return null;
  const deleted = db.cvs.splice(index, 1)[0];
  writeDB(db);
  return deleted;
}

function getCVById(id) {
  const db = readDB();
  return db.cvs.find(cv => cv.id === id) || null;
}

function updateCV(id, updates) {
  const db = readDB();
  const index = db.cvs.findIndex(cv => cv.id === id);
  if (index === -1) return null;
  db.cvs[index] = { ...db.cvs[index], ...updates, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.cvs[index];
}

function getAllFolders() {
  return readDB().folders;
}

function addFolder(folderName) {
  const db = readDB();
  // Check if folder already exists (exact match)
  if (db.folders.includes(folderName)) {
    console.log('Folder already exists (exact match):', folderName);
    return false;
  }
  console.log('Adding new folder:', folderName);
  db.folders.push(folderName);
  writeDB(db);
  console.log('Folder added successfully');
  return true;
}

function deleteFolder(folderName) {
  const db = readDB();
  const index = db.folders.indexOf(folderName);
  if (index === -1 || folderName === 'general') return false;
  db.folders.splice(index, 1);
  db.cvs.forEach(cv => { if (cv.folder === folderName) cv.folder = 'general'; });
  writeDB(db);
  return true;
}

function getStats() {
  const db = readDB();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const oldCVs = db.cvs.filter(cv => {
    const uploadDate = new Date(cv.uploadDate);
    return uploadDate < thirtyDaysAgo;
  }).length;

  return {
    totalCVs: db.cvs.length,
    totalFolders: db.folders.length,
    oldCVs: oldCVs,
    cvsByFolder: db.folders.map(folder => ({ folder, count: db.cvs.filter(cv => cv.folder === folder).length })),
    cvsByStatus: ['new', 'progress', 'complete', 'rejected'].map(status => ({ status, count: db.cvs.filter(cv => cv.status === status).length })),
    recentUploads: db.cvs.slice(-5).reverse()
  };
}

module.exports = { readDB, writeDB, getAllCVs, addCV, deleteCV, getCVById, updateCV, getAllFolders, addFolder, deleteFolder, getStats };
