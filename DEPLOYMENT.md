# Deployment Guide: cPanel Frontend + Railway Backend

## Overview
This guide will help you deploy your NAMAS Architecture website with:
- **Frontend**: React app on cPanel hosting
- **Backend**: Express.js API on Railway

## Prerequisites
- cPanel hosting account with file manager access
- Railway account (free tier available)
- Your cPanel domain name
- Git repository access

---

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Your Railway Account
1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create a new project

### Step 2: Deploy Backend
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-detect your Node.js app

### Step 3: Configure Environment Variables
In Railway dashboard → your project → Variables tab, add:
```
NODE_ENV=production
FRONTEND_URL=https://your-cpanel-domain.com
CPANEL_DOMAIN=https://your-cpanel-domain.com
```

### Step 4: Get Your Railway Backend URL
- After deployment, Railway will provide a URL like: `https://your-app-name.railway.app`
- Copy this URL - you'll need it for frontend configuration

---

## Part 2: Configure Frontend for cPanel

### Step 1: Update Environment Variables
Edit `.env.production` file:
```env
REACT_APP_API_URL=https://your-railway-app.railway.app/api
REACT_APP_SERVER_URL=https://your-railway-app.railway.app
GENERATE_SOURCEMAP=false
BUILD_PATH=./build
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build for Production
```bash
npm run build:cpanel
```

This will create a `build` folder with optimized production files.

---

## Part 3: Deploy Frontend to cPanel

### Step 1: Access cPanel File Manager
1. Log into your cPanel account
2. Open "File Manager"
3. Navigate to `public_html` directory

### Step 2: Upload Files
1. Upload all contents from the `build` folder to `public_html`
2. **Important**: Upload the contents OF the build folder, not the build folder itself
3. Your file structure should look like:
   ```
   public_html/
   ├── index.html
   ├── static/
   │   ├── css/
   │   ├── js/
   │   └── media/
   ├── favicon.ico
   └── other build files...
   ```

### Step 3: Configure .htaccess (Important for React Router)
Create/edit `.htaccess` file in `public_html`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## Part 4: Testing and Verification

### Step 1: Test Your Website
1. Visit your cPanel domain
2. Test the main website functionality
3. Test the dashboard login at `yourdomain.com/dashboard`

### Step 2: Verify API Connection
1. Open browser developer tools (F12)
2. Check Console tab for any CORS or API errors
3. Verify that API calls are going to your Railway backend

### Step 3: Test Dashboard Functionality
1. Log into the dashboard
2. Try uploading an image
3. Test creating/editing content
4. Verify that changes are saved properly

---

## Troubleshooting

### Common Issues:

#### 1. CORS Errors
- **Problem**: "Access to fetch at 'railway-url' from origin 'cpanel-domain' has been blocked by CORS policy"
- **Solution**: Update Railway environment variables with your exact cPanel domain

#### 2. API Not Found Errors
- **Problem**: 404 errors when calling API
- **Solution**: Verify your Railway backend URL in `.env.production`

#### 3. Images Not Loading
- **Problem**: Uploaded images not displaying
- **Solution**: Check that `REACT_APP_SERVER_URL` points to your Railway backend

#### 4. React Router Not Working
- **Problem**: 404 errors on page refresh or direct URLs
- **Solution**: Ensure `.htaccess` file is properly configured

#### 5. Dashboard Login Issues
- **Problem**: Can't access dashboard
- **Solution**: Check that all dashboard routes are working and API is accessible

### Environment Variables Checklist:

**Railway Backend:**
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URL=https://your-cpanel-domain.com`
- ✅ `CPANEL_DOMAIN=https://your-cpanel-domain.com`

**Frontend (.env.production):**
- ✅ `REACT_APP_API_URL=https://your-railway-app.railway.app/api`
- ✅ `REACT_APP_SERVER_URL=https://your-railway-app.railway.app`

---

## Updating Your Website

### To Update Frontend:
1. Make changes to your React code
2. Run `npm run build:cpanel`
3. Upload new build files to cPanel

### To Update Backend:
1. Push changes to your GitHub repository
2. Railway will automatically redeploy

---

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are correct
4. Ensure cPanel domain and Railway backend URL are properly configured

Your dashboard will work seamlessly with this setup, allowing you to manage content that updates your live website in real-time!