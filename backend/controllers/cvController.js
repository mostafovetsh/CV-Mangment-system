const fs = require('fs');
const db = require('../services/databaseService');

exports.getAllCVs = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      skills: req.query.skills,
      folder: req.query.folder,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      status: req.query.status,
      age: req.query.age
    };
    const cvs = db.getAllCVs(filters);
    res.json({ success: true, count: cvs.length, cvs });
  } catch (error) {
    console.error('Error getting CVs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCVById = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, cv });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadCV = async (req, res) => {
  try {
    // Support both single and multiple file uploads
    let files = [];
    if (req.files) {
      // Handle upload.fields() - req.files is an object
      if (req.files.file) {
        files = files.concat(req.files.file);
      }
      if (req.files.files) {
        files = files.concat(req.files.files);
      }
    } else if (req.file) {
      // Handle upload.single()
      files = [req.file];
    }

    if (!files || files.length === 0) {
      console.log('No file uploaded. req.files:', req.files, 'req.file:', req.file);
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('Files received:', files.length, 'file(s)');

    const pdfParse = require('pdf-parse');
    const mammoth = require('mammoth');

    // expanded skills keywords
    const SKILLS = [
      'javascript', 'react', 'reactjs', 'redux', 'node', 'nodejs', 'express', 'python', 'django', 'flask', 'java', 'spring',
      'c++', 'c#', 'csharp', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'kubectl',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'flutter', 'dart', 'android', 'ios', 'swift', 'objective-c', 'php', 'laravel',
      'ruby', 'rails', 'go', 'golang', 'typescript', 'graphql', 'rest', 'graphql', 'redux-saga', 'rxjs', 'selenium', 'jest', 'mocha', 'chai',
      'terraform', 'ansible', 'linux', 'bash', 'powershell', 'webpack', 'parcel', 'vite', 'react-native'
    ];

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function fuzzyContains(text, keyword) {
      if (!text || !keyword) return false;
      const k = keyword.toLowerCase();
      const t = text.toLowerCase();
      // exact word boundary match
      const re = new RegExp('\\b' + escapeRegExp(k) + '\\b', 'i');
      if (re.test(t)) return true;
      // prefix match on tokens (first 4 chars)
      const prefix = k.slice(0, 4);
      if (prefix.length >= 3) {
        const tokenRe = new RegExp('\\b' + escapeRegExp(prefix) + '\\w*', 'i');
        if (tokenRe.test(t)) return true;
      }
      // fallback simple includes
      return t.includes(k);
    }

    const results = [];
    // optional per-file metadata sent as JSON in field 'meta'
    let metaMap = {};
    try { if (req.body && req.body.meta) metaMap = JSON.parse(req.body.meta); } catch (e) { metaMap = {}; }
    for (const file of files) {
      try {
        // per-file metadata (candidateName, skills, folder) can be provided in req.body.meta keyed by original file name
        const originalName = file.originalname || file.filename || '';
        const fileMeta = metaMap[originalName] || {};
        const folder = (fileMeta.folder) || req.body.folder || 'general';
        const filePath = file.path;
        const mimeType = file.mimetype || '';

        // Extract text from PDF/Word files
        let textContent = '';
        if (mimeType.includes('pdf') || (originalName && originalName.toLowerCase().endsWith('.pdf'))) {
          try {
            const buffer = require('fs').readFileSync(filePath);
            const data = await pdfParse(buffer);
            textContent = (data && data.text) ? data.text : '';
          } catch (e) {
            console.warn('PDF parse failed for', filePath, e.message);
            textContent = '';
          }
        } else if (
          mimeType.includes('word') ||
          (originalName && (originalName.toLowerCase().endsWith('.docx') || originalName.toLowerCase().endsWith('.doc')))
        ) {
          try {
            const result = await mammoth.extractRawText({ path: filePath });
            textContent = (result && result.value) ? result.value : '';
          } catch (e) {
            console.warn('Word parse failed for', filePath, e.message);
            textContent = '';
          }
        }

        // Candidate name extraction: prefer provided candidateName, else filename, else first non-empty line from text
        let candidateName = fileMeta.candidateName || req.body.candidateName || '';
        if (!candidateName && originalName) {
          // Strip extension and numbers
          candidateName = originalName.replace(/\.[^/.]+$/, '').replace(/[_\-0-9]+/g, ' ').trim();
        }
        if (!candidateName && textContent) {
          const lines = textContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const firstThree = lines.slice(0, 3);
          const nameLine = firstThree.find(l => /[A-Za-z\u0621-\u064A]{2,}\s+[A-Za-z\u0621-\u064A]{2,}/.test(l)) || firstThree[0];
          if (nameLine) candidateName = nameLine.slice(0, 100);
        }

        // Email and phone detection
        let email = fileMeta.email || req.body.email || '';
        let phone = fileMeta.phone || req.body.phone || '';
        if (textContent) {
          if (!email) {
            const m = textContent.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
            if (m) email = m[0];
          }
          if (!phone) {
            // Egyptian mobile formats: +20xxxxxxxxxxx, 0020xxxxxxxxxxx, 01xxxxxxxxx
            const eg = textContent.match(/(?:(?:\+20|0020)\s?)?0?(10|11|12|15)[\s\-()]*\d{3}[\s\-()]*\d{4}/);
            if (eg) {
              phone = eg[0].replace(/\s+/g, ' ').trim();
            } else {
              const m2 = textContent.match(/(\+?\d[\d\s\-().]{6,}\d)/);
              if (m2) phone = m2[0].replace(/\s+/g, ' ');
            }
          }
        }

        // Skill detection (fuzzy)
        const detectedSkills = [];
        const lowerText = (textContent || '').toLowerCase();
        SKILLS.forEach(k => { if (fuzzyContains(lowerText, k)) detectedSkills.push(k); });
        // fallback to skills param or per-file meta
        const skillsFromBody = (fileMeta.skills && Array.isArray(fileMeta.skills)) ? fileMeta.skills : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
        const skills = Array.from(new Set([...(skillsFromBody || []), ...detectedSkills]));

        // Experience (years)
        let experienceYears = '';
        const expMatchEn = lowerText.match(/(\d{1,2})\+?\s*(years?|yrs?)/);
        const expMatchAr = lowerText.match(/خبرة\s*(\d{1,2})\s*(سنة|سنوات)/);
        if (expMatchEn) experienceYears = expMatchEn[1];
        else if (expMatchAr) experienceYears = expMatchAr[1];

        // Education degrees
        const EDUCATION_KW = [
          'bachelor', 'master', 'phd', 'bsc', 'msc', 'degree', 'university', 'college', 'faculty',
          'بكالوريوس', 'ماجستير', 'دكتوراه', 'جامعة', 'كلية', 'معهد'
        ];
        const educationMatches = [];
        EDUCATION_KW.forEach(kw => { if (lowerText.includes(kw)) educationMatches.push(kw); });

        // Languages
        const LANG_KW = [
          'arabic', 'english', 'french', 'german', 'spanish', 'italian', 'chinese', 'japanese',
          'العربية', 'الانجليزية', 'إنجليزي', 'الإنجليزية', 'الفرنسية', 'الألمانية', 'الإسبانية', 'الإيطالية', 'الصينية', 'اليابانية'
        ];
        const languages = [];
        LANG_KW.forEach(kw => { if (lowerText.includes(kw)) languages.push(kw); });

        const cvData = {
          candidateName: candidateName || 'Unknown',
          email: email || '',
          phone: phone || '',
          notes: req.body.notes || '',
          skills,
          folder,
          status: fileMeta.status || req.body.status || 'new',
          age: fileMeta.age || req.body.age || '',
          experienceYears,
          education: educationMatches,
          languages,
          fileName: file.filename,
          originalName,
          filePath,
          fileSize: file.size,
          mimeType,
          fileUrl: '/uploads/' + folder + '/' + file.filename,
          textContent
        };

        const newCV = db.addCV(cvData);
        results.push({ file: originalName, success: true, cv: newCV });
      } catch (innerErr) {
        results.push({ file: file.originalname || file.filename, success: false, error: innerErr.message });
      }
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCV = async (req, res) => {
  try {
    const { candidateName, skills, folder, email, phone, notes, status } = req.body;
    const updates = {};
    if (candidateName) updates.candidateName = candidateName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;
    if (skills) updates.skills = skills.split(',').map(s => s.trim()).filter(s => s);

    // Handle folder change - move the actual file
    if (folder) {
      const cv = db.getCVById(req.params.id);
      if (cv && cv.folder !== folder && cv.filePath && fs.existsSync(cv.filePath)) {
        const path = require('path');
        const oldPath = cv.filePath;
        const fileName = cv.fileName;
        const newFolderPath = path.join('uploads', folder);

        // Create new folder if it doesn't exist
        if (!fs.existsSync(newFolderPath)) {
          fs.mkdirSync(newFolderPath, { recursive: true });
        }

        const newPath = path.join(newFolderPath, fileName);

        // Move the file
        try {
          fs.renameSync(oldPath, newPath);
          updates.filePath = newPath;
          updates.fileUrl = `/uploads/${folder}/${fileName}`;
          console.log(`Moved file from ${oldPath} to ${newPath}`);
        } catch (err) {
          console.error('Error moving file:', err);
          // If move fails, try copy and delete
          try {
            fs.copyFileSync(oldPath, newPath);
            fs.unlinkSync(oldPath);
            updates.filePath = newPath;
            updates.fileUrl = `/uploads/${folder}/${fileName}`;
            console.log(`Copied and deleted file from ${oldPath} to ${newPath}`);
          } catch (err2) {
            console.error('Error copying file:', err2);
          }
        }
      }
      updates.folder = folder;
    }

    const updatedCV = db.updateCV(req.params.id, updates);
    if (!updatedCV) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, cv: updatedCV });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    if (cv.filePath && fs.existsSync(cv.filePath)) fs.unlinkSync(cv.filePath);
    db.deleteCV(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchCVs = async (req, res) => {
  try {
    const { q, experience, education, searchInContent } = req.query;
    if (!q && !experience && !education) {
      return res.status(400).json({ success: false, error: 'Search query or filters required' });
    }

    const allCVs = db.getAllCVs();
    let results = allCVs;

    // Fuzzy search if query provided
    if (q) {
      const Fuse = require('fuse.js');
      const options = {
        keys: [
          { name: 'candidateName', weight: 0.4 },
          { name: 'skills', weight: 0.3 },
          { name: 'originalName', weight: 0.2 },
          ...(searchInContent === 'true' ? [{ name: 'textContent', weight: 0.2 }] : [])
        ],
        threshold: 0.4, // Relaxed threshold
        includeScore: true,
        ignoreLocation: true,
        useExtendedSearch: true
      };

      const fuse = new Fuse(allCVs, options);
      const fuseResults = fuse.search(q);
      results = fuseResults.map(r => r.item);
    }

    // Filter by experience (simple regex for now, can be enhanced)
    if (experience) {
      const minExp = parseInt(experience);
      if (!isNaN(minExp)) {
        // This assumes we have an 'experience' field or parse it from text. 
        // For now, let's try to match numbers in textContent near "years" or "experience"
        // Or just rely on structured data if available. 
        // Since we don't have structured experience yet, we'll skip complex filtering 
        // and just return results, or implemented a basic check if 'experience' field exists.
        results = results.filter(cv => (cv.experience || 0) >= minExp);
      }
    }

    // Filter by education
    if (education) {
      results = results.filter(cv =>
        (cv.education || '').toLowerCase().includes(education.toLowerCase()) ||
        (cv.textContent || '').toLowerCase().includes(education.toLowerCase())
      );
    }

    res.json({ success: true, count: results.length, cvs: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Preview endpoint: returns PDF buffer for PDF files or converted Word files
exports.previewCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const filePath = cv.filePath;
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found' });

    const ext = (cv.originalName || '').split('.').pop().toLowerCase();
    // If PDF, stream directly
    if (ext === 'pdf' || cv.mimeType === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // For Word documents (.docx/.doc), convert to plain-text PDF using mammoth + pdf-lib
    if (ext === 'docx' || ext === 'doc' || (cv.mimeType && cv.mimeType.includes('word'))) {
      const mammoth = require('mammoth');
      const { PDFDocument, StandardFonts } = require('pdf-lib');

      // Extract raw text from Word file
      let rawText = '';
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value || '';
      } catch (e) {
        rawText = '';
      }

      if (!rawText) rawText = cv.candidateName || 'Document';

      // Create a simple PDF and write text with basic wrapping
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const maxLineWidth = pageWidth - margin * 2;

      const words = rawText.replace(/\r\n/g, '\n').split(/\s+/);
      let lines = [];
      let currentLine = '';
      words.forEach(w => {
        const testLine = currentLine ? currentLine + ' ' + w : w;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxLineWidth && currentLine) { lines.push(currentLine); currentLine = w; }
        else { currentLine = testLine; }
      });
      if (currentLine) lines.push(currentLine);

      // paginate lines into pages
      const linesPerPage = Math.floor((pageHeight - margin * 2) / (fontSize + 4));
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const { height } = page.getSize();
        let y = height - margin - fontSize;
        const chunk = lines.slice(i, i + linesPerPage);
        chunk.forEach(line => {
          page.drawText(line, { x: margin, y, size: fontSize, font });
          y -= fontSize + 4;
        });
      }

      const pdfBytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${cv.candidateName || 'preview'}.pdf"`);
      return res.send(Buffer.from(pdfBytes));
    }

    // Fallback: attempt to stream if unknown type
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Notes endpoints
exports.getNotes = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, notes: cv.notes || [] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const { note_text, author } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const note = { id: Date.now().toString(), note_text, author: author || 'unknown', timestamp: new Date().toISOString() };
    notes.push(note);
    db.updateCV(req.params.id, { notes });
    res.status(201).json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note_text } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
    notes[idx].note_text = note_text;
    notes[idx].editedAt = new Date().toISOString();
    db.updateCV(req.params.id, { notes });
    res.json({ success: true, note: notes[idx] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.updateCV = async (req, res) => {
  try {
    const { candidateName, skills, folder, email, phone, notes, rating, status } = req.body;
    const updates = {};
    if (candidateName) updates.candidateName = candidateName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (notes !== undefined) updates.notes = notes;
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (status !== undefined) updates.status = status;
    if (skills) updates.skills = skills.split(',').map(s => s.trim()).filter(s => s);
    if (folder) updates.folder = folder;
    const updatedCV = db.updateCV(req.params.id, updates);
    if (!updatedCV) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, cv: updatedCV });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    if (cv.filePath && fs.existsSync(cv.filePath)) fs.unlinkSync(cv.filePath);
    db.deleteCV(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchCVs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query required' });
    const allCVs = db.getAllCVs();
    const searchTerm = q.toLowerCase();
    const results = allCVs.filter(cv => cv.candidateName.toLowerCase().includes(searchTerm) || cv.skills.some(skill => skill.toLowerCase().includes(searchTerm)));
    res.json({ success: true, count: results.length, cvs: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Preview endpoint: returns PDF buffer for PDF files or converted Word files
exports.previewCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const filePath = cv.filePath;
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found' });

    const ext = (cv.originalName || '').split('.').pop().toLowerCase();
    // If PDF, stream directly
    if (ext === 'pdf' || cv.mimeType === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // For Word documents (.docx/.doc), convert to plain-text PDF using mammoth + pdf-lib
    if (ext === 'docx' || ext === 'doc' || (cv.mimeType && cv.mimeType.includes('word'))) {
      const mammoth = require('mammoth');
      const { PDFDocument, StandardFonts } = require('pdf-lib');

      // Extract raw text from Word file
      let rawText = '';
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value || '';
      } catch (e) {
        rawText = '';
      }

      if (!rawText) rawText = cv.candidateName || 'Document';

      // Create a simple PDF and write text with basic wrapping
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const maxLineWidth = pageWidth - margin * 2;

      const words = rawText.replace(/\r\n/g, '\n').split(/\s+/);
      let lines = [];
      let currentLine = '';
      words.forEach(w => {
        const testLine = currentLine ? currentLine + ' ' + w : w;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxLineWidth && currentLine) { lines.push(currentLine); currentLine = w; }
        else { currentLine = testLine; }
      });
      if (currentLine) lines.push(currentLine);

      // paginate lines into pages
      const linesPerPage = Math.floor((pageHeight - margin * 2) / (fontSize + 4));
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const { height } = page.getSize();
        let y = height - margin - fontSize;
        const chunk = lines.slice(i, i + linesPerPage);
        chunk.forEach(line => {
          page.drawText(line, { x: margin, y, size: fontSize, font });
          y -= fontSize + 4;
        });
      }

      const pdfBytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${cv.candidateName || 'preview'}.pdf"`);
      return res.send(Buffer.from(pdfBytes));
    }

    // Fallback: attempt to stream if unknown type
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Notes endpoints
exports.getNotes = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, notes: cv.notes || [] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const { note_text, author } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const note = { id: Date.now().toString(), note_text, author: author || 'unknown', timestamp: new Date().toISOString() };
    notes.push(note);
    db.updateCV(req.params.id, { notes });
    res.status(201).json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note_text } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
    notes[idx].note_text = note_text;
    notes[idx].editedAt = new Date().toISOString();
    db.updateCV(req.params.id, { notes });
    res.json({ success: true, note: notes[idx] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.updateCV = async (req, res) => {
  try {
    const { candidateName, skills, folder, email, phone, notes, rating, status } = req.body;
    const updates = {};
    if (candidateName) updates.candidateName = candidateName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (notes !== undefined) updates.notes = notes;
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (status !== undefined) updates.status = status;
    if (skills) updates.skills = skills.split(',').map(s => s.trim()).filter(s => s);
    if (folder) updates.folder = folder;
    const updatedCV = db.updateCV(req.params.id, updates);
    if (!updatedCV) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, cv: updatedCV });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    if (cv.filePath && fs.existsSync(cv.filePath)) fs.unlinkSync(cv.filePath);
    db.deleteCV(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.parseCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { extractText, parseCVText } = require('../services/cvParser');

    // Extract text from the uploaded file
    const text = await extractText(req.file.path, req.file.mimetype);

    // Parse the text to get structured data
    const parsedData = parseCVText(text);

    // Clean up the temp file
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('Parse error:', error);
    // Try to clean up temp file even on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { }
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchCVs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query required' });
    const allCVs = db.getAllCVs();
    const searchTerm = q.toLowerCase();
    const results = allCVs.filter(cv => cv.candidateName.toLowerCase().includes(searchTerm) || cv.skills.some(skill => skill.toLowerCase().includes(searchTerm)));
    res.json({ success: true, count: results.length, cvs: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Preview endpoint: returns PDF buffer for PDF files or converted Word files
exports.previewCV = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const filePath = cv.filePath;
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found' });

    const ext = (cv.originalName || '').split('.').pop().toLowerCase();
    // If PDF, stream directly
    if (ext === 'pdf' || cv.mimeType === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // For Word documents (.docx/.doc), convert to plain-text PDF using mammoth + pdf-lib
    if (ext === 'docx' || ext === 'doc' || (cv.mimeType && cv.mimeType.includes('word'))) {
      const mammoth = require('mammoth');
      const { PDFDocument, StandardFonts } = require('pdf-lib');

      // Extract raw text from Word file
      let rawText = '';
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value || '';
      } catch (e) {
        rawText = '';
      }

      if (!rawText) rawText = cv.candidateName || 'Document';

      // Create a simple PDF and write text with basic wrapping
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const maxLineWidth = pageWidth - margin * 2;

      const words = rawText.replace(/\r\n/g, '\n').split(/\s+/);
      let lines = [];
      let currentLine = '';
      words.forEach(w => {
        const testLine = currentLine ? currentLine + ' ' + w : w;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxLineWidth && currentLine) { lines.push(currentLine); currentLine = w; }
        else { currentLine = testLine; }
      });
      if (currentLine) lines.push(currentLine);

      // paginate lines into pages
      const linesPerPage = Math.floor((pageHeight - margin * 2) / (fontSize + 4));
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const { height } = page.getSize();
        let y = height - margin - fontSize;
        const chunk = lines.slice(i, i + linesPerPage);
        chunk.forEach(line => {
          page.drawText(line, { x: margin, y, size: fontSize, font });
          y -= fontSize + 4;
        });
      }

      const pdfBytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${cv.candidateName || 'preview'}.pdf"`);
      return res.send(Buffer.from(pdfBytes));
    }

    // Fallback: attempt to stream if unknown type
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Notes endpoints
exports.getNotes = async (req, res) => {
  try {
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    res.json({ success: true, notes: cv.notes || [] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const { note_text, author } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const note = { id: Date.now().toString(), note_text, author: author || 'unknown', timestamp: new Date().toISOString() };
    notes.push(note);
    db.updateCV(req.params.id, { notes });
    res.status(201).json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note_text } = req.body || {};
    if (!note_text) return res.status(400).json({ success: false, error: 'note_text required' });
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
    notes[idx].note_text = note_text;
    notes[idx].editedAt = new Date().toISOString();
    db.updateCV(req.params.id, { notes });
    res.json({ success: true, note: notes[idx] });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const cv = db.getCVById(req.params.id);
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });
    const notes = cv.notes || [];
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
    const deleted = notes.splice(idx, 1)[0];
    db.updateCV(req.params.id, { notes });
    res.json({ success: true, note: deleted });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// Bulk operations
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'IDs array required' });
    }
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Updates object required' });
    }

    const results = [];
    for (const id of ids) {
      try {
        const updatedCV = db.updateCV(id, updates);
        if (updatedCV) {
          results.push({ id, success: true, cv: updatedCV });
        } else {
          results.push({ id, success: false, error: 'CV not found' });
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Updated ${successCount} of ${ids.length} CVs`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'IDs array required' });
    }

    const results = [];
    for (const id of ids) {
      try {
        const cv = db.getCVById(id);
        if (!cv) {
          results.push({ id, success: false, error: 'CV not found' });
          continue;
        }

        // Delete file if exists
        if (cv.filePath && fs.existsSync(cv.filePath)) {
          fs.unlinkSync(cv.filePath);
        }

        db.deleteCV(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Deleted ${successCount} of ${ids.length} CVs`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkMove = async (req, res) => {
  try {
    const { ids, folder } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'IDs array required' });
    }
    if (!folder) {
      return res.status(400).json({ success: false, error: 'Folder required' });
    }

    const path = require('path');
    const newFolderPath = path.join('uploads', folder);

    // Create new folder if it doesn't exist
    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, { recursive: true });
    }

    const results = [];
    for (const id of ids) {
      try {
        const cv = db.getCVById(id);
        if (!cv) {
          results.push({ id, success: false, error: 'CV not found' });
          continue;
        }

        // Prepare updates object
        const updates = { folder };

        // Handle file movement if CV has a file and folder is changing
        if (cv.folder !== folder && cv.filePath && fs.existsSync(cv.filePath)) {
          const oldPath = cv.filePath;
          const fileName = cv.fileName;
          const newPath = path.join(newFolderPath, fileName);

          // Move the file
          try {
            fs.renameSync(oldPath, newPath);
            updates.filePath = newPath;
            updates.fileUrl = `/uploads/${folder}/${fileName}`;
            console.log(`Moved file from ${oldPath} to ${newPath}`);
          } catch (err) {
            console.error('Error moving file:', err);
            // If move fails, try copy and delete
            try {
              fs.copyFileSync(oldPath, newPath);
              fs.unlinkSync(oldPath);
              updates.filePath = newPath;
              updates.fileUrl = `/uploads/${folder}/${fileName}`;
              console.log(`Copied and deleted file from ${oldPath} to ${newPath}`);
            } catch (err2) {
              console.error('Error copying file:', err2);
              results.push({ id, success: false, error: `Failed to move file: ${err2.message}` });
              continue;
            }
          }
        }

        // Update CV in database
        const updatedCV = db.updateCV(id, updates);
        if (updatedCV) {
          results.push({ id, success: true, cv: updatedCV });
        } else {
          results.push({ id, success: false, error: 'Failed to update CV' });
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Moved ${successCount} of ${ids.length} CVs to ${folder}`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Comparison endpoints
exports.compareCVs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'IDs array required' });
    }

    const cvs = [];
    for (const id of ids) {
      const cv = db.getCVById(id);
      if (cv) cvs.push(cv);
    }

    res.json({ success: true, cvs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportComparison = async (req, res) => {
  try {
    // For now, just return success. Real PDF generation can happen here or frontend.
    // Given the complexity of PDF generation, we'll rely on frontend PDF generation for now.
    res.json({ success: true, message: 'Export logic to be implemented or handled by frontend' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
