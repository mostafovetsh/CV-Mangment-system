# CV Management System - Quick Start Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

---

## 📦 Installation

### 1. Install Backend Dependencies
```bash
cd cv-management-system/backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd cv-management-system/frontend
npm install
```

---

## ▶️ Running the System

### Step 1: Start the Backend Server
Open a terminal and run:

```bash
cd cv-management-system/backend
npm start
```

**Expected Output:**
```
========================================
  CV Management System - Server Started
========================================
  Local:   http://localhost:3001
  Network: http://YOUR_IP:3001
========================================
```

The backend API will be available at `http://localhost:3001`

---

### Step 2: Start the Frontend Application
Open a **new terminal** (keep the backend running) and run:

```bash
cd cv-management-system/frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view cv-management-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://YOUR_IP:3000
```

The application will automatically open in your default browser at `http://localhost:3000`

---

## 🔐 Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (full access)

### Regular User Account
- **Username:** `user`
- **Password:** `user123`
- **Role:** User (standard access)

> ⚠️ **Security Note:** These are development credentials. Change them in production!

---

## ✨ New Features Overview

### 1. Enhanced Folder Panel (Left Sidebar)
- **Pre-defined Departments:** 9 color-coded categories
- **Search:** Find folders quickly
- **Collapsible Sections:** Organize main departments and custom folders
- **Real-time Counts:** See CV count per folder
- **Quick Add:** Create new folders with one click

### 2. Drag-and-Drop
- **Drag CV cards** to any folder
- **Visual feedback** shows where to drop
- **Instant update** after moving

### 3. Status Tracking
- **7 Status Options:**
  - جديد (New) - Blue
  - قيد المراجعة (Reviewing) - Orange
  - تمت المقابلة (Interviewed) - Purple
  - مرشح (Shortlisted) - Green
  - تم التوظيف (Hired) - Teal
  - مرفوض (Rejected) - Red
  - معلق (On Hold) - Gray

### 4. Priority Levels
- **4 Priority Levels:**
  - منخفض (Low) - Light Gray
  - متوسط (Medium) - Orange
  - عالي (High) - Red
  - عاجل (Urgent) - Purple

### 5. Advanced Filtering
- Filter by: Name, Skills, Folder, Status, Priority, Date
- Reset all filters with one click
- Real-time search results

---

## 📝 Common Tasks

### Upload a CV
1. Click **"رفع ملف جديد"** (Upload New File)
2. Fill in:
   - Candidate Name
   - Skills (comma-separated)
   - Folder
   - Status (select from dropdown)
   - Priority (select from dropdown)
3. Choose file (.pdf, .doc, .docx)
4. Click **"رفع"** (Upload)

### Bulk Upload CVs
1. Click **"رفع ملفات متعددة"** (Upload Multiple Files)
2. Select multiple files
3. Choose folder for all files
4. Click Upload

### Move a CV to Different Folder
**Method 1: Drag & Drop**
1. Click and hold CV card
2. Drag to target folder in left panel
3. Release to drop

**Method 2: Via Folder Filter**
- Use the folder dropdown to organize

### Create a New Folder
**From Folders Panel:**
1. Click **"+"** button at top of folders panel
2. Enter folder name
3. Click **"إضافة"** (Add)

**From Search Section:**
1. Scroll to "إضافة فولدر" section
2. Enter folder name
3. Click **"إضافة فولدر"** (Add Folder)

### Search for CVs
1. Use filters in the search section:
   - **Name:** Type candidate name
   - **Skills:** Type skills (e.g., "React, Node.js")
   - **Folder:** Select from dropdown
   - **Status:** Select from dropdown
   - **Priority:** Select from dropdown
   - **Date:** Choose start date
2. Click **"بحث"** (Search)
3. Click **"إعادة تعيين"** (Reset) to clear filters

### Preview a CV
1. Find the CV card
2. Click the **👁️ (Eye)** icon
3. View CV in popup modal
4. Close when done

### Add Notes to a CV
1. Find the CV card
2. Click **"ملاحظات"** (Notes) button
3. Add your note
4. Save

### Delete a CV
1. Find the CV card
2. Click the **🗑️ (Trash)** icon
3. Confirm deletion

### Generate Reports
1. Click **"تقارير"** (Reports) in header
2. View summary statistics
3. Export to PDF or Excel
4. Close when done

---

## 🎨 Visual Guide

### Folder Panel Features
```
┌─────────────────────────────┐
│ المجلدات            [+]    │ ← Header with add button
├─────────────────────────────┤
│ 🔍 [Search folders...]      │ ← Search box
├─────────────────────────────┤
│ ▼ الأقسام الرئيسية (9)    │ ← Collapsible section
│   🖥️  هندسة              [5]│ ← Department with count
│   💻  تكنولوجيا المعلومات [3]│
│   📈  تسويق               [8]│
│   👥  موارد بشرية         [12]│
│   💰  مالية               [4]│
│   🎨  تصميم               [6]│
│   🎧  خدمة العملاء        [9]│
│   ⚙️   عمليات              [2]│
│   📁  عام                 [15]│
├─────────────────────────────┤
│ ▼ مجلدات مخصصة (2)        │
│   📁  Custom Folder 1     [3]│
│   📁  Custom Folder 2     [1]│
├─────────────────────────────┤
│ 📊 إجمالي المجلدات: 11    │ ← Quick stats
│ 📄 إجمالي السير الذاتية: 68│
└─────────────────────────────┘
```

### CV Card with Status & Priority
```
┌─────────────────────────────────┐
│ 📄 أحمد محمد                   │ ← Name
│    resume.pdf                   │ ← Filename
├─────────────────────────────────┤
│ [React] [Node.js] [JavaScript] │ ← Skills
├─────────────────────────────────┤
│ 📁 هندسة | [مرشح] | [عالي]    │ ← Folder, Status, Priority
│ 2025-01-15 | 2.5 MB            │ ← Date, Size
├─────────────────────────────────┤
│ [⬇️] [👁️] [📝 ملاحظات (2)] [🗑️]│ ← Actions
└─────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Backend won't start
**Error:** Port 3001 already in use
```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Frontend won't start
**Error:** Port 3000 already in use
- Press `Y` when asked to run on different port
- Or kill the process using port 3000

### CVs not showing
1. Check backend is running (http://localhost:3001)
2. Check browser console for errors (F12)
3. Clear browser cache and reload
4. Check `backend/database.json` exists

### Upload fails
1. Check file format (.pdf, .doc, .docx only)
2. Check file size (max 10MB by default)
3. Ensure backend server is running
4. Check `backend/uploads` folder exists

### Drag-and-drop not working
1. Make sure you're clicking and holding the CV card
2. Ensure folders panel is visible
3. Try refreshing the page
4. Check browser console for errors

---

## 📁 Project Structure

```
cv-management-system/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── middleware/      # Middleware (upload, etc.)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── uploads/         # Uploaded CV files
│   ├── database.json    # JSON database
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── styles/      # CSS files
│   │   ├── App.js       # Main component
│   │   └── index.js     # Entry point
│   └── package.json
├── ENHANCEMENTS.md      # Detailed feature documentation
└── QUICKSTART.md        # This file
```

---

## 🌐 API Endpoints

### CVs
- `GET /api/cvs` - Get all CVs (with filters)
- `POST /api/cvs/upload` - Upload CV(s)
- `GET /api/cvs/:id` - Get CV by ID
- `PUT /api/cvs/:id` - Update CV
- `DELETE /api/cvs/:id` - Delete CV
- `GET /api/cvs/:id/preview` - Preview CV

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:name` - Delete folder

### Configuration
- `GET /api/config` - Get system configuration (departments, statuses, priorities)

### Reports
- `GET /api/reports/summary` - Get summary report
- `GET /api/reports/by-folder` - Get CVs grouped by folder
- `GET /api/reports/by-date-range` - Get CVs by date range

### Authentication
- `POST /api/auth/login` - Login

### Stats
- `GET /api/stats` - Get system statistics

---

## 🎯 Tips for Best Experience

1. **Use Predefined Folders:** Start with the 9 predefined departments
2. **Set Status Early:** Assign status when uploading CVs
3. **Prioritize Wisely:** Use urgent/high priority sparingly
4. **Regular Cleanup:** Archive or delete old CVs
5. **Use Filters:** Combine multiple filters for precise searches
6. **Drag to Organize:** Use drag-and-drop for quick organization
7. **Add Notes:** Document important information on CV cards
8. **Generate Reports:** Export regular reports for analysis

---

## 📞 Need Help?

- Check `ENHANCEMENTS.md` for detailed feature documentation
- Review browser console (F12) for error messages
- Verify both backend and frontend are running
- Ensure all dependencies are installed

---

## ✅ System Requirements

### Minimum
- Node.js 14+
- 2GB RAM
- Modern browser (Chrome, Firefox, Safari, Edge)
- 500MB disk space

### Recommended
- Node.js 16+
- 4GB RAM
- Latest Chrome or Edge
- 1GB disk space

---

## 🎉 You're Ready!

Your CV Management System is now running with:
- ✅ Color-coded department folders
- ✅ Drag-and-drop functionality
- ✅ Status tracking system
- ✅ Priority levels
- ✅ Advanced filtering
- ✅ Modern, interactive UI

Start organizing CVs efficiently! 🚀

---

**Version:** 2.0  
**Last Updated:** January 2025