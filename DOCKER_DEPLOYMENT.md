# Docker Deployment Guide for Render

## 🐳 Why Docker?

Docker deployment provides:
- ✅ **Consistent builds** - Same environment locally and on Render
- ✅ **Faster deployments** - Cached layers speed up rebuilds
- ✅ **Better reliability** - Isolated dependencies
- ✅ **Easier debugging** - Test exact production environment locally

## 📋 Prerequisites

- GitHub account with your code pushed
- Render account (https://render.com)
- Docker installed locally (optional, for testing)

## 🚀 Deploy to Render with Docker

### Step 1: Push Docker Files to GitHub

```bash
# Make sure all Docker files are committed
git add Dockerfile .dockerignore docker-compose.yml render.yaml
git commit -m "Add Docker deployment configuration"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `cv-mangement-system` repository

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `cv-management-system` (or your choice)
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: (leave blank)
- **Environment**: **Docker** ⚠️ (Important!)

**Docker Settings:**
- **Dockerfile Path**: `./Dockerfile`
- **Docker Context**: `.`
- These should auto-populate from `render.yaml`

**Plan:**
- Select **Free**

### Step 4: Environment Variables

Render should auto-populate these from `render.yaml`, but verify:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | (leave empty - auto-assigned) |
| `HOST` | `0.0.0.0` |
| `CORS_ORIGIN` | `*` |
| `DB_PATH` | `./database.json` |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_FILE_SIZE` | `10485760` |

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes first time)
3. Watch the logs for:
   ```
   ========================================
     CV Management System - Server Started
   ========================================
   ```

### Step 6: Access Your App

Your app will be available at:
```
https://cv-management-system-XXXX.onrender.com
```

## 🧪 Test Locally with Docker (Optional)

Before deploying, test the Docker build locally:

### Build and Run with Docker Compose

```bash
# Build and start
docker-compose up --build

# Access at http://localhost:3001
```

### Or Build Manually

```bash
# Build the image
docker build -t cv-management-system .

# Run the container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e HOST=0.0.0.0 \
  -e CORS_ORIGIN=* \
  cv-management-system

# Access at http://localhost:3001
```

### Stop Docker Compose

```bash
docker-compose down
```

## ✅ Verify Deployment

### 1. Check Build Logs

In Render Dashboard:
- Go to your service → **Events** tab
- Click latest deployment
- Look for:
  ```
  Successfully built <image-id>
  Successfully tagged <image-name>
  ```

### 2. Check Runtime Logs

In Render Dashboard:
- Go to **Logs** tab
- Look for:
  ```
  ========================================
    CV Management System - Server Started
  ========================================
  ```

### 3. Test Health Endpoint

```bash
curl https://your-app.onrender.com/api/config
```

Expected response:
```json
{
  "success": true,
  "config": {
    "maxFileSize": 10485760,
    "allowedExtensions": [".pdf", ".doc", ".docx"],
    "uploadDir": "./uploads"
  }
}
```

### 4. Test Frontend

1. Visit `https://your-app.onrender.com`
2. Login page should appear
3. Try logging in with `admin` / `admin123`

## 🔧 Troubleshooting

### Build Fails

**Check Docker logs in Render:**
```
Error: Failed to build image
```

**Solution:**
- Verify `Dockerfile` syntax
- Check that all paths are correct
- Ensure `package.json` files exist

### Container Crashes

**Check runtime logs for:**
```
Error: Cannot find module 'express'
```

**Solution:**
- Verify `npm ci` ran successfully
- Check `package.json` dependencies

### Port Binding Issues

**Error:**
```
Error: listen EADDRINUSE
```

**Solution:**
- Ensure PORT is not hardcoded
- Verify `process.env.PORT` is used
- Check `render.yaml` has `sync: false` for PORT

### Frontend Not Loading

**Symptoms:**
- API works but frontend shows 404
- `/api/config` works but `/` doesn't

**Solution:**
- Verify frontend build succeeded in Docker logs
- Check `COPY --from=frontend-builder` in Dockerfile
- Ensure `server.js` serves static files

## 📊 Docker vs Node Deployment

| Feature | Docker | Native Node |
|---------|--------|-------------|
| Build Time | Slower first time, faster after | Faster |
| Reliability | Higher | Medium |
| Debugging | Easier (test locally) | Harder |
| Caching | Better | Limited |
| **Recommended** | ✅ **Yes** | For simple apps |

## 🔄 Updating Your App

After making changes:

```bash
# Commit and push
git add .
git commit -m "Update application"
git push origin main

# Render will auto-deploy
```

## 💡 Pro Tips

1. **Test locally first**: Always run `docker-compose up` before pushing
2. **Check logs**: Monitor Render logs during first deployment
3. **Health checks**: Docker health checks help Render detect issues
4. **Layer caching**: Organize Dockerfile to maximize cache hits

## 🆘 Still Having Issues?

1. **Build logs**: Share last 50 lines from Render Events tab
2. **Runtime logs**: Share last 50 lines from Render Logs tab
3. **Local test**: Run `docker-compose up` and share any errors
4. **Service status**: Screenshot of Render service overview

## 📚 Additional Resources

- [Render Docker Documentation](https://render.com/docs/docker)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
