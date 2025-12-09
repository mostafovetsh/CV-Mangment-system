# Render Deployment Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Issue: Application Shows Loading Forever

**Symptoms:**
- Page loads but shows infinite loading spinner
- No content appears
- Console shows API errors

**Root Causes & Solutions:**

#### 1. Missing PORT Environment Variable ✅ FIXED
**Problem:** Render assigns a dynamic PORT, but it wasn't configured in `render.yaml`

**Solution:** Updated `render.yaml` to include:
```yaml
- key: PORT
  sync: false
```

This tells Render to use its dynamically assigned PORT.

#### 2. Frontend Can't Connect to Backend API

**Check These:**

**A. Browser Console Errors**
1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors like:
   - `Failed to fetch`
   - `CORS error`
   - `404 Not Found`
   - `ERR_CONNECTION_REFUSED`

**B. Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests to `/api/`
5. Check the request URL - should be relative like `/api/cvs`, not `http://localhost:3001/api/cvs`

**C. Render Logs**
1. Go to https://dashboard.render.com
2. Click on your service
3. Go to "Logs" tab
4. Look for:
   - Server startup message: "CV Management System - Server Started"
   - Port number being used
   - Any error messages

### Issue: Build Fails

**Check Render Build Logs:**
1. Missing dependencies
2. Build command errors
3. Memory issues (upgrade to paid plan if needed)

**Common Fixes:**
```bash
# Ensure package.json has all dependencies
npm install

# Test build locally
cd frontend
npm run build

cd ../backend
npm install
```

### Issue: 404 Errors for Static Files

**Problem:** Frontend build files not being served

**Solution:**
1. Verify build command in `render.yaml`:
   ```
   npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
   ```

2. Check that `backend/server.js` serves static files:
   ```javascript
   app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
   ```

### Issue: CORS Errors

**Symptoms:**
- Console shows: "Access to fetch at '...' has been blocked by CORS policy"

**Solution:**
1. Check `CORS_ORIGIN` environment variable in Render dashboard
2. Should be set to `*` for testing, or your specific domain for production

### Issue: Database/Uploads Reset

**This is EXPECTED on Render Free Tier:**
- Render free tier uses ephemeral storage
- Data resets when service restarts (every ~15 minutes of inactivity)
- Uploads are lost on restart

**Solutions:**
1. **For Testing:** Accept this limitation
2. **For Production:** 
   - Upgrade to paid Render plan with persistent disk
   - Use external storage (AWS S3, Cloudinary)
   - Use external database (MongoDB Atlas, PostgreSQL)

## 🔍 Debugging Steps

### Step 1: Verify Deployment Status
1. Go to Render Dashboard
2. Check service status is "Live" (green)
3. If "Deploy failed", check build logs

### Step 2: Check Server Logs
```
Look for:
✅ "CV Management System - Server Started"
✅ "Local: http://localhost:XXXX"
❌ Any error messages
❌ Crash/restart messages
```

### Step 3: Test API Directly
Visit: `https://your-app.onrender.com/api/stats`

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalCVs": 0,
    "totalFolders": 0,
    ...
  }
}
```

**If you get 404:** Backend routing issue
**If you get CORS error:** CORS configuration issue
**If timeout:** Server not starting properly

### Step 4: Check Frontend Build
1. In Render logs, verify:
   ```
   > frontend@1.0.0 build
   > react-scripts build
   
   Creating an optimized production build...
   Compiled successfully.
   ```

2. If build fails, check:
   - Memory limits (free tier has 512MB)
   - Dependencies installation
   - Build script in `package.json`

### Step 5: Environment Variables
Go to Render Dashboard → Your Service → Environment

**Required Variables:**
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = (should be auto-set by Render)
- ✅ `HOST` = `0.0.0.0`
- ✅ `CORS_ORIGIN` = `*`
- ✅ `DB_PATH` = `./database.json`
- ✅ `UPLOAD_DIR` = `./uploads`
- ✅ `MAX_FILE_SIZE` = `10485760`

## 🚀 Redeployment Steps

After making fixes:

### Option 1: Auto-Deploy (Recommended)
```bash
git add .
git commit -m "Fix: Updated Render configuration"
git push origin main
```
Render will auto-deploy from GitHub.

### Option 2: Manual Deploy
1. Go to Render Dashboard
2. Click your service
3. Click "Manual Deploy" → "Deploy latest commit"

### Option 3: Clear Build Cache
If issues persist:
1. Go to Render Dashboard
2. Settings → "Clear build cache & deploy"

## 📱 Testing Checklist

After deployment:

- [ ] Site loads (not just loading spinner)
- [ ] Can see login page
- [ ] Can login (admin/admin123)
- [ ] Can see dashboard
- [ ] Can upload a CV
- [ ] Can view uploaded CV
- [ ] Can delete CV
- [ ] Can create folder
- [ ] API calls work (check Network tab)

## 🆘 Still Having Issues?

### Get Detailed Logs
1. Render Dashboard → Your Service → Logs
2. Copy the last 100 lines
3. Look for error messages

### Common Error Messages

**"Error: listen EADDRINUSE"**
- Port already in use (shouldn't happen on Render)
- Check if PORT is hardcoded somewhere

**"Cannot find module"**
- Missing dependency
- Run: `npm install` locally and commit `package-lock.json`

**"ENOENT: no such file or directory"**
- File path issue
- Check paths are relative, not absolute
- Verify build created `frontend/build` directory

**"Module build failed"**
- Frontend build issue
- Test locally: `cd frontend && npm run build`
- Check for syntax errors

## 💡 Pro Tips

1. **Always check Render logs first** - They show exactly what's happening
2. **Test locally before deploying** - Run production build locally
3. **Use browser DevTools** - Console and Network tabs are your friends
4. **Check environment variables** - Missing or wrong values cause most issues
5. **Free tier limitations** - Cold starts take 30s, storage is ephemeral

## 🔗 Useful Links

- [Render Dashboard](https://dashboard.render.com)
- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com)
