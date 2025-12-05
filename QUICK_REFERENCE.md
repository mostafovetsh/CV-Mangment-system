# Quick Reference Card - Folder Operations

## 🚀 Create New Folder

### Method 1: Folders Panel (Recommended)
1. Look at **left sidebar** (folders panel)
2. Click **"+"** button at the top
3. Type folder name: `مجلد جديد` or `new_folder`
4. Press **Enter** or click **"إضافة"**
5. ✅ Success message appears
6. ✅ Folder appears in "Custom Folders" section

### Method 2: Add Folder Section
1. Scroll to **bottom of filters section**
2. Find **"إضافة فولدر"** field
3. Type folder name
4. Click **"إضافة فولدر"** button
5. ✅ Folder appears immediately

---

## 📁 Move CV to Folder

### Drag & Drop (Easy!)
1. **Click and hold** any CV card
2. **Drag** to target folder (left panel)
3. Folder highlights with "إسقاط هنا" message
4. **Release** to drop
5. ✅ CV moved instantly

---

## 🔍 Filter by Folder

1. Go to **"الفلاتر والبحث"** section
2. Click **folder dropdown**
3. Select folder from list
4. Click **"بحث"** button
5. ✅ Only CVs in that folder shown

---

## ✅ Success Messages

| Action | Message |
|--------|---------|
| Folder created | تم إنشاء المجلد بنجاح! |
| CV uploaded | File uploaded! |
| CV moved | (Auto-refreshes) |
| CV deleted | (Confirmation required) |

---

## ❌ Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| الرجاء إدخال اسم المجلد | Empty input | Type a folder name |
| المجلد موجود بالفعل | Duplicate | Use different name |
| فشل الاتصال بالخادم | Server offline | Restart backend |

---

## 🎨 Pre-defined Folders

| Icon | Folder | Arabic | Color |
|------|--------|--------|-------|
| 🖥️ | engineering | هندسة | Purple |
| 💻 | it | تكنولوجيا المعلومات | Blue |
| 📈 | marketing | تسويق | Green |
| 👥 | hr | موارد بشرية | Orange |
| 💰 | finance | مالية | Purple |
| 🎨 | design | تصميم | Red |
| 🎧 | customer-service | خدمة العملاء | Teal |
| ⚙️ | operations | عمليات | Gray |
| 📁 | general | عام | Light Gray |

---

## 🔧 Troubleshooting

### Folder Creation Not Working?
1. **Check backend running:** http://localhost:3001
2. **Check console:** Press F12 → Console tab
3. **Refresh page:** Press F5
4. **Clear cache:** Ctrl+Shift+Delete

### Drag & Drop Not Working?
1. **Click and HOLD** the CV card
2. **Drag slowly** to folder
3. **Wait** for highlight
4. **Release** mouse button
5. If fails, refresh page (F5)

---

## 🎯 Tips

✅ **DO:**
- Use descriptive folder names
- Create folders BEFORE uploading CVs
- Use pre-defined departments when possible
- Test with simple names first (e.g., "test")

❌ **DON'T:**
- Use only spaces as folder name
- Create folders with same name (case-sensitive)
- Use special characters: `\ / : * ? " < > |`
- Create too many folders (use existing ones)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F5 | Refresh page |
| F12 | Open Developer Tools |
| Ctrl+F | Search in page |
| Enter | Submit folder name |
| Esc | Close modal/popup |

---

## 📊 Folder Statistics

Location: **Bottom of Folders Panel**

Shows:
- 📁 Total folders count
- 📄 Total CVs count
- Updates in real-time

---

## 🔍 Search Folders

1. Find **search box** at top of folders panel
2. Type: `هندسة` or `engineering`
3. ✅ Only matching folders shown
4. Clear to see all folders

---

## 📱 Mobile/Tablet

- Folders panel may be **collapsible**
- Use **"+"** button to add folders
- **Tap and hold** to drag CVs
- **Swipe** to scroll folders list

---

## 🆘 Need Help?

1. **Check logs:**
   - Backend: Terminal where you ran `npm start`
   - Frontend: Browser Console (F12)

2. **Test API:**
   ```bash
   curl -X POST http://localhost:3001/api/folders -H "Content-Type: application/json" -d "{\"folderName\":\"test\"}"
   ```

3. **Read full guides:**
   - TROUBLESHOOTING.md
   - ENHANCEMENTS.md
   - FIXES_APPLIED.md

---

## 📞 Quick Links

- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- API Folders: http://localhost:3001/api/folders
- API CVs: http://localhost:3001/api/cvs

---

## 🎉 You're Ready!

**Folder creation is now:**
- ✅ Fast and reliable
- ✅ Arabic text supported
- ✅ Error-free
- ✅ User-friendly

**Just:**
1. Click "+"
2. Type name
3. Press Enter
4. Done! 🎊

---

**Version:** 2.0.1
**Last Updated:** January 2025
**Status:** ✅ Production Ready