# Troubleshooting Guide - Folder Creation Issues

## Problem: Can't Create New Folders (مجلد)

### Quick Checklist ✅

1. **Backend Server Running?**
   - Check if backend is running on port 3001
   - Open: http://localhost:3001
   - Should see: `{"message":"CV Management System API","version":"1.0.0"}`

2. **Frontend Server Running?**
   - Check if frontend is running on port 3000
   - Open: http://localhost:3000
   - Should see the CV Management System interface

3. **Browser Console Errors?**
   - Press F12 to open Developer Tools
   - Check Console tab for errors
   - Check Network tab when creating folder

---

## Step-by-Step Debugging

### Step 1: Test Backend Directly

Open Command Prompt and test the API:

```bash
curl -X POST http://localhost:3001/api/folders -H "Content-Type: application/json" -d "{\"folderName\":\"test123\"}"
```

**Expected Response:**
```json
{"success":true,"folders":["general","engineering",...,"test123"]}
```

**If this works:** Backend is fine, issue is in frontend.
**If this fails:** Backend has an issue.

---

### Step 2: Check Browser Console Logs

1. Open browser (Chrome/Edge recommended)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to create a folder
5. Look for these messages:

**What to look for:**
```
FoldersPanel - handleAddFolder called with: اختبار
Calling onAddFolder with: اختبار
POST /folders - Request body: {folderName: "اختبار"}
Adding folder: اختبار
Folder created successfully: uploads\اختبار
```

---

### Step 3: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to create a folder
4. Look for request to `/api/folders`
5. Click on it to see:
   - **Request Headers:** Should include `Content-Type: application/json`
   - **Request Payload:** Should show `{"folderName":"your_folder_name"}`
   - **Response:** Should show `{"success":true,...}`

---

## Common Issues & Solutions

### Issue 1: "الرجاء إدخال اسم المجلد" (Please enter folder name)

**Cause:** Empty input or whitespace only

**Solution:**
- Type a folder name
- Press Enter or click "إضافة" button
- Make sure there are actual characters (not just spaces)

---

### Issue 2: "المجلد موجود بالفعل" (Folder already exists)

**Cause:** Folder with that name already exists

**Solution:**
- Try a different folder name
- Check the folders list to see existing names
- Use a unique name

---

### Issue 3: Network Error / "فشل الاتصال بالخادم"

**Cause:** Backend server not running or wrong URL

**Solution:**
1. Check backend is running:
   ```bash
   cd cv-management-system/backend
   npm start
   ```

2. Verify port 3001 is listening:
   ```bash
   netstat -ano | findstr :3001
   ```

3. Check API URL in frontend:
   - Should be: `http://localhost:3001/api`
   - File: `frontend/src/services/api.js`

---

### Issue 4: Arabic Text Not Working

**Cause:** Encoding issues with UTF-8

**Solution:**
1. Restart both servers:
   ```bash
   # Stop both servers (Ctrl+C)
   
   # Start backend
   cd backend
   npm start
   
   # Start frontend (new terminal)
   cd frontend
   npm start
   ```

2. Check browser encoding:
   - Right-click page → Encoding → Unicode (UTF-8)

---

### Issue 5: Folder Created But Not Showing

**Cause:** Frontend not refreshing after creation

**Solution:**
1. Check if alert appears: "تم إنشاء المجلد بنجاح!"
2. If yes, manually refresh page (F5)
3. Check browser console for errors
4. Check if `loadData()` is called after folder creation

**Debug Steps:**
```javascript
// In browser console, check folders:
fetch('http://localhost:3001/api/folders')
  .then(r => r.json())
  .then(data => console.log('Folders:', data.folders))
```

---

### Issue 6: Button Disabled

**Cause:** Input is empty (button is disabled when no text entered)

**Solution:**
- Type something in the input field
- Button will become enabled automatically

---

## Manual Test Procedure

### Test 1: Create English Folder Name
1. Click "+" button in folders panel
2. Type: `test123`
3. Click "إضافة"
4. Should see success message
5. Should see folder in list

### Test 2: Create Arabic Folder Name
1. Click "+" button in folders panel
2. Type: `اختبار`
3. Click "إضافة"
4. Should see success message
5. Should see folder in list with Arabic name

### Test 3: Create Folder with Spaces
1. Click "+" button in folders panel
2. Type: `My Test Folder`
3. Click "إضافة"
4. Should see success message
5. Should see folder as "My Test Folder"

### Test 4: Try to Create Duplicate
1. Create folder: `duplicate`
2. Try to create another folder: `duplicate`
3. Should see error: "المجلد موجود بالفعل"

---

## Logs to Check

### Backend Logs (Terminal)
When you create a folder, you should see:
```
POST /folders - Request body: { folderName: 'اختبار' }
Adding folder: اختبار
Creating folder path: uploads\اختبار
Folder created successfully: uploads\اختبار
All folders after creation: [ 'general', 'engineering', ..., 'اختبار' ]
```

### Frontend Logs (Browser Console)
When you create a folder, you should see:
```
Folder name input changed: اختبار
FoldersPanel - handleAddFolder called with: اختبار
Calling onAddFolder with: اختبار
```

---

## Quick Fixes

### Fix 1: Clear Everything and Restart

```bash
# Stop all servers (Ctrl+C in all terminals)

# Backend
cd cv-management-system/backend
npm start

# Frontend (new terminal)
cd cv-management-system/frontend
# Close browser tab
npm start
```

### Fix 2: Clear Browser Cache

1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (F5)

### Fix 3: Reset Database (DANGER - Deletes all data!)

```bash
# Backup first!
cd cv-management-system/backend
copy database.json database.json.backup

# Edit database.json manually to reset folders
```

---

## Testing the Fix

After making changes, test folder creation:

1. **From Folders Panel:**
   - Click "+" button
   - Enter: `test_folder_1`
   - Click "إضافة"
   - ✅ Should appear in custom folders section

2. **From Add Folder Section:**
   - Scroll to "إضافة فولدر" section
   - Enter: `test_folder_2`
   - Click "إضافة فولدر" button
   - ✅ Should appear in custom folders section

3. **With Arabic Name:**
   - Use either method
   - Enter: `مجلد تجريبي`
   - Click add button
   - ✅ Should appear with Arabic text

---

## Still Not Working?

### Collect Debug Information

1. **Backend Terminal Output:**
   - Copy all text from backend terminal
   - Save to file: `backend_logs.txt`

2. **Browser Console:**
   - Press F12 → Console tab
   - Right-click → Save as...
   - Save to file: `browser_console.txt`

3. **Network Requests:**
   - Press F12 → Network tab
   - Try to create folder
   - Right-click on `/api/folders` request → Copy → Copy all as HAR
   - Save to file: `network_log.har`

4. **Database Content:**
   - Check file: `backend/database.json`
   - Copy the "folders" array

5. **Screenshots:**
   - Take screenshot of the error
   - Take screenshot of browser console
   - Take screenshot of network tab

---

## Contact Information

If issue persists, provide:
1. Exact error message (screenshot)
2. Backend terminal logs
3. Browser console logs
4. Steps to reproduce
5. What you typed as folder name
6. Expected vs actual behavior

---

## Prevention Tips

1. **Always check both servers are running**
2. **Use browser console to debug**
3. **Test with simple English names first**
4. **Check network tab for API calls**
5. **Keep database.json backed up**

---

**Last Updated:** January 2025
**Version:** 2.0