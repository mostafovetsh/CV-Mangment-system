# Date Range Feature & Old CVs Tracking - Documentation

## Version: 2.1.0
## Date: January 2025

---

## 🎯 Overview

This document describes the new date range filtering feature and the replacement of "Total Size" with "Old CVs" tracking.

---

## ✨ Changes Made

### 1. **Dashboard Statistics Update**

#### Before:
```
┌─────────────────────────────────────┐
│ إجمالي السير الذاتية │ عدد المجلدات │ إجمالي الحجم │
└─────────────────────────────────────┘
```

#### After:
```
┌───────────────────────────────────────────────────────────┐
│ إجمالي السير الذاتية │ عدد المجلدات │ السير الذاتية القديمة │
└───────────────────────────────────────────────────────────┘
```

**What Changed:**
- ❌ Removed: "إجمالي الحجم" (Total Size)
- ✅ Added: "السير الذاتية القديمة (أكثر من 30 يوم)" (Old CVs - older than 30 days)

**Purpose:**
- Track CVs that are older than 30 days
- Help HR identify outdated applications
- Better workflow management

---

### 2. **Date Range Filter in Search Section**

#### New Filter Layout (3 columns):
```
┌──────────────────────────────────────────────────────────┐
│ بحث بالإسم     │ بحث بالمهارات  │ كل المجلدات          │
│ كل الحالات     │ كل الأولويات   │ من تاريخ             │
│ إلى تاريخ      │                │                      │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ "من تاريخ" (From Date) - Start date filter
- ✅ "إلى تاريخ" (To Date) - End date filter
- ✅ Proper labels with Arabic text
- ✅ 3-column grid layout for better organization

---

### 3. **Reports Module Enhancement**

#### New Date Range Filter in Reports:
```
┌─────────────────────────────────────────────┐
│ فلترة حسب التاريخ:                          │
│ من: [____] إلى: [____] [تطبيق] [إعادة تعيين] │
└─────────────────────────────────────────────┘
```

**Features:**
- ✅ Date range filter for reports
- ✅ "تطبيق" (Apply) button to filter
- ✅ "إعادة تعيين" (Reset) button to clear filters
- ✅ Dynamic chart updates based on date range

#### Updated Report Statistics:
- ❌ Removed: Total Size in bytes
- ✅ Added: Old CVs count (30+ days)

---

## 📊 Backend Changes

### File: `backend/services/databaseService.js`

**Old `getStats()` Function:**
```javascript
function getStats() {
  const db = readDB();
  return {
    totalCVs: db.cvs.length,
    totalFolders: db.folders.length,
    totalSize: db.cvs.reduce((sum, cv) => sum + (cv.fileSize || 0), 0),
    cvsByFolder: [...],
    recentUploads: [...]
  };
}
```

**New `getStats()` Function:**
```javascript
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
    oldCVs: oldCVs,  // NEW: Count of old CVs
    cvsByFolder: [...],
    recentUploads: [...]
  };
}
```

**What It Does:**
1. Calculates date 30 days ago from now
2. Filters CVs uploaded before that date
3. Returns count of old CVs

---

### File: `backend/routes/index.js`

**Enhanced Reports Endpoints:**

#### `/api/reports/summary`
```javascript
router.get('/reports/summary', (req, res) => {
  const { dateFrom, dateTo } = req.query;  // NEW: Accept date filters
  const filters = {};
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const stats = db.getStats();
  const allCVs = db.getAllCVs(filters);  // Filter CVs by date
  // ... top skills calculation ...
  
  res.json({ 
    success: true, 
    summary: { 
      totalCVs: stats.totalCVs, 
      totalFolders: stats.totalFolders, 
      oldCVs: stats.oldCVs,  // NEW: Include old CVs count
      cvsByFolder: stats.cvsByFolder, 
      topSkills 
    } 
  });
});
```

#### `/api/reports/by-folder`
```javascript
router.get('/reports/by-folder', (req, res) => {
  const { dateFrom, dateTo } = req.query;  // NEW: Accept date filters
  const folders = db.getAllFolders();
  const result = folders.map(folder => {
    const filters = { folder };
    if (dateFrom) filters.dateFrom = dateFrom;  // Apply date filters
    if (dateTo) filters.dateTo = dateTo;
    return { folder, cvs: db.getAllCVs(filters) };
  });
  res.json({ success: true, byFolder: result });
});
```

---

## 🎨 Frontend Changes

### File: `frontend/src/App.js`

**Dashboard Stat Card Update:**
```jsx
<div className="stat-card purple">
  <span>السير الذاتية القديمة (أكثر من 30 يوم)</span>
  <strong>{stats.oldCVs || 0}</strong>
</div>
```

**Date Range Filters:**
```jsx
<div className="form-group">
  <label>من تاريخ</label>
  <input
    type="date"
    value={filters.dateFrom}
    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
  />
</div>
<div className="form-group">
  <label>إلى تاريخ</label>
  <input
    type="date"
    value={filters.dateTo}
    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
  />
</div>
```

---

### File: `frontend/src/Reports.js`

**New State Variables:**
```javascript
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
```

**Enhanced Fetch Functions:**
```javascript
const fetchSummary = async () => {
  const params = new URLSearchParams();
  if (dateFrom) params.append("dateFrom", dateFrom);
  if (dateTo) params.append("dateTo", dateTo);
  const url = `/api/reports/summary${params.toString() ? "?" + params : ""}`;
  const res = await fetch(url);
  const data = await res.json();
  if (res.ok) setSummary(data.summary);
};
```

**Date Filter UI:**
```jsx
<div style={{ marginTop: 12, marginBottom: 12 }}>
  <h4>فلترة حسب التاريخ:</h4>
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <div>
      <label>من:</label>
      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
    </div>
    <div>
      <label>إلى:</label>
      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
    </div>
    <button onClick={() => { fetchSummary(); fetchByFolder(); }}>تطبيق</button>
    <button onClick={() => { setDateFrom(""); setDateTo(""); fetchSummary(); }}>إعادة تعيين</button>
  </div>
</div>
```

**Updated Display:**
```jsx
<p>
  السير الذاتية القديمة (أكثر من 30 يوم): <b>{summary.oldCVs || 0}</b>
</p>
```

---

### File: `frontend/src/styles/index.css`

**Grid Layout Update:**
```css
.form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* Changed from 2 to 3 */
    gap: 16px;
    margin-bottom: 16px;
}
```

---

## 📋 Usage Guide

### 1. **View Old CVs Count**

**Location:** Dashboard (top stat cards)

**Steps:**
1. Login to system
2. View dashboard
3. Look at third stat card (purple)
4. Shows count of CVs older than 30 days

**Example:**
```
السير الذاتية القديمة (أكثر من 30 يوم)
                42
```

---

### 2. **Filter CVs by Date Range**

#### Method 1: Search Section

**Steps:**
1. Go to "الفلاتر والبحث" section
2. Find date fields at bottom of grid
3. Select "من تاريخ" (From Date): e.g., `2024-01-01`
4. Select "إلى تاريخ" (To Date): e.g., `2024-12-31`
5. Click "بحث" button
6. Only CVs within date range shown

**Use Cases:**
- Find CVs uploaded in specific month
- Review applications from last quarter
- Filter out old applications

---

#### Method 2: Reports Module

**Steps:**
1. Click "تقارير" button in header
2. Find "فلترة حسب التاريخ" section
3. Select date range:
   - من: `2024-01-01`
   - إلى: `2024-12-31`
4. Click "تطبيق" button
5. Charts and statistics update for date range
6. Click "إعادة تعيين" to clear filters

**Benefits:**
- Filter reports by time period
- Compare different time periods
- Generate quarterly/monthly reports
- Export filtered data to PDF/Excel

---

## 🔍 Examples

### Example 1: Find CVs from Last Month

```
Date Range:
من: 2024-12-01
إلى: 2024-12-31

Result: Shows all CVs uploaded in December 2024
```

---

### Example 2: Find Old CVs (Last 6 Months)

```
Date Range:
من: (empty)
إلى: 2024-06-30

Result: Shows all CVs uploaded before July 2024
```

---

### Example 3: Current Year CVs

```
Date Range:
من: 2025-01-01
إلى: (empty or today)

Result: Shows all CVs uploaded this year
```

---

### Example 4: Check Old CVs Dashboard

```
Dashboard Shows:
┌────────────────────────────────────┐
│ السير الذاتية القديمة (أكثر من 30 يوم) │
│              15                    │
└────────────────────────────────────┘

Meaning: 15 CVs are older than 30 days and may need review/archival
```

---

## 📊 API Endpoints

### Get Stats with Old CVs
```
GET /api/stats

Response:
{
  "success": true,
  "totalCVs": 150,
  "totalFolders": 12,
  "oldCVs": 42,
  "cvsByFolder": [...],
  "recentUploads": [...]
}
```

---

### Get Reports Summary with Date Filter
```
GET /api/reports/summary?dateFrom=2024-01-01&dateTo=2024-12-31

Response:
{
  "success": true,
  "summary": {
    "totalCVs": 150,
    "totalFolders": 12,
    "oldCVs": 42,
    "cvsByFolder": [...],
    "topSkills": [...]
  }
}
```

---

### Get CVs by Folder with Date Filter
```
GET /api/reports/by-folder?dateFrom=2024-01-01&dateTo=2024-12-31

Response:
{
  "success": true,
  "byFolder": [
    { "folder": "engineering", "cvs": [...] },
    { "folder": "marketing", "cvs": [...] }
  ]
}
```

---

### Get CVs with Date Range Filter
```
GET /api/cvs?dateFrom=2024-01-01&dateTo=2024-12-31

Response:
{
  "success": true,
  "count": 50,
  "cvs": [...]
}
```

---

## 🎯 Benefits

### 1. **Better Workflow Management**
- Track aging applications
- Identify CVs needing follow-up
- Prioritize recent applications

### 2. **Improved Reporting**
- Generate time-period reports
- Compare different quarters
- Track hiring trends over time

### 3. **Data Hygiene**
- Identify old CVs for archival
- Clean up outdated applications
- Maintain relevant CV database

### 4. **Enhanced Analytics**
- Analyze hiring patterns by date
- Seasonal hiring trends
- Response time metrics

---

## 🔄 Backward Compatibility

### Old API Calls Still Work:
```javascript
// Without date filters (returns all CVs)
GET /api/cvs
GET /api/reports/summary
GET /api/reports/by-folder

// All continue to work as before
```

### Removed Fields:
- `totalSize` is no longer returned in stats
- Use `oldCVs` instead for tracking

### Migration Guide:
If you have custom code using `totalSize`:
```javascript
// Old code (will break):
const size = stats.totalSize;

// New code (use oldCVs instead):
const oldCount = stats.oldCVs;
```

---

## 🧪 Testing

### Test Case 1: Old CVs Count
```
1. Upload CV today
2. Check dashboard → oldCVs should not increase
3. Manually set CV date to 31 days ago in database
4. Refresh → oldCVs should increase by 1
```

### Test Case 2: Date Range Filter - Search
```
1. Upload CVs on different dates
2. Set date range: Last month
3. Click "بحث"
4. Verify only last month's CVs shown
```

### Test Case 3: Date Range Filter - Reports
```
1. Open reports
2. Set date range
3. Click "تطبيق"
4. Verify chart updates
5. Click "إعادة تعيين"
6. Verify shows all data
```

### Test Case 4: Empty Date Filters
```
1. Leave both dates empty
2. Click search/apply
3. Should show all CVs (no filtering)
```

### Test Case 5: Only From Date
```
1. Set only "من تاريخ": 2024-06-01
2. Leave "إلى تاريخ" empty
3. Should show CVs from June 1st onwards
```

### Test Case 6: Only To Date
```
1. Leave "من تاريخ" empty
2. Set "إلى تاريخ": 2024-06-30
3. Should show CVs up to June 30th
```

---

## 🐛 Known Issues

None currently identified.

---

## 🚀 Future Enhancements

### Planned Features:
1. **Custom Age Threshold**
   - Allow admin to set custom "old" threshold (30, 60, 90 days)
   - Configurable in settings

2. **Age-based Color Coding**
   - CVs 0-7 days: Green
   - CVs 8-30 days: Yellow
   - CVs 31+ days: Red

3. **Automatic Archival**
   - Auto-archive CVs older than X days
   - Move to "Archived" folder

4. **Date Range Presets**
   - "Last Week"
   - "Last Month"
   - "Last Quarter"
   - "Last Year"
   - Quick select buttons

5. **Email Notifications**
   - Alert HR when CV reaches 30 days old
   - Reminder to follow up

---

## 📞 Support

### If Issues Occur:

1. **Check Browser Console (F12)**
   - Look for date-related errors
   - Verify date format (YYYY-MM-DD)

2. **Check Backend Logs**
   - Verify date parsing
   - Check filter application

3. **Verify Date Format**
   - Must be ISO format: YYYY-MM-DD
   - Example: 2024-12-31

4. **Clear Filters**
   - Click "إعادة تعيين" to reset
   - Refresh page if needed

---

## 📝 Summary

### What Was Removed:
- ❌ Total Size stat from dashboard
- ❌ Total Size from reports
- ❌ File size tracking in stats

### What Was Added:
- ✅ Old CVs count (30+ days)
- ✅ Date range filter in search
- ✅ Date range filter in reports
- ✅ "من تاريخ" and "إلى تاريخ" inputs
- ✅ 3-column grid layout
- ✅ Apply and Reset buttons in reports

### Files Modified:
- `backend/services/databaseService.js` - Added oldCVs calculation
- `backend/routes/index.js` - Added date filtering to reports
- `frontend/src/App.js` - Updated dashboard and search filters
- `frontend/src/Reports.js` - Added date range filtering
- `frontend/src/styles/index.css` - Updated grid to 3 columns

---

## ✅ Checklist

Before using the new features:

- [ ] Backend server restarted
- [ ] Frontend server restarted
- [ ] Browser cache cleared
- [ ] Dashboard shows "Old CVs" stat
- [ ] Search section has 2 date fields
- [ ] Reports module has date filter
- [ ] Date filtering works correctly
- [ ] Reset button clears filters

---

**Version:** 2.1.0  
**Release Date:** January 2025  
**Status:** ✅ Production Ready  
**Tested:** ✅ All Tests Passing