# Quick Deployment Guide

## 🚀 Deploy to Render (Free Hosting)

### Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)

### Quick Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `cv-mangement-system` repository

3. **Configure Service**
   - **Name**: `cv-management-system` (or your preferred name)
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Environment**: Node
   - **Build Command**: 
     ```
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command**: 
     ```
     npm start --prefix backend
     ```
   - **Plan**: Free

4. **Add Environment Variables** (in Render dashboard)
   - `NODE_ENV` = `production`
   - `PORT` = (leave empty - Render auto-assigns)
   - `HOST` = `0.0.0.0`
   - `CORS_ORIGIN` = `*`
   - `DB_PATH` = `./database.json`
   - `UPLOAD_DIR` = `./uploads`
   - `MAX_FILE_SIZE` = `10485760`

5. **Deploy!**
   Click "Create Web Service" and wait for deployment to complete (~5-10 minutes)

### Your App URL
After deployment: `https://cv-management-system.onrender.com`

### Important Notes
- ⚠️ **Free tier limitations**: 
  - Service sleeps after 15 min inactivity (30s cold start)
  - Ephemeral storage (uploads reset on restart)
  - Database resets on restart
- 💡 **For production**: Consider upgrading to paid plan or using external database/storage

### Testing
1. Visit your Render URL
2. Test login (admin/admin123)
3. Upload a test CV
4. Verify all features work

## 📖 Full Documentation
See `render_deployment_guide.md` for detailed information.

## 🔄 Local Development (Unchanged)

### Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 🆘 Troubleshooting

### Build Fails
- Check Render logs
- Verify all dependencies are installed
- Ensure `package.json` scripts are correct

### App Won't Start
- Verify environment variables are set
- Check Render logs for errors
- Ensure PORT is not hardcoded

### API Errors
- Check CORS settings
- Verify API endpoints
- Check browser console for errors

## 📞 Support
Check Render documentation: https://render.com/docs
