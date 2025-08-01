# Quick Start: cPanel + Railway Deployment

## 🚀 Ready to Deploy? Follow These Steps:

### 1. Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-cpanel-domain.com
   CPANEL_DOMAIN=https://your-cpanel-domain.com
   ```
5. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### 2. Configure Frontend
1. Edit `.env.production` file:
   ```env
   REACT_APP_API_URL=https://your-app.railway.app/api
   REACT_APP_SERVER_URL=https://your-app.railway.app
   GENERATE_SOURCEMAP=false
   BUILD_PATH=./build
   ```

### 3. Build for cPanel
```bash
# Install dependencies
npm install

# Build for production
npm run build:cpanel
```

Or use the deployment script:
- **Linux/Mac**: `./deploy-cpanel.sh`
- **Windows**: `deploy-cpanel.bat`

### 4. Upload to cPanel
1. Open cPanel File Manager
2. Go to `public_html` directory
3. Upload ALL contents from the `build` folder
4. Copy `public/.htaccess` to `public_html/.htaccess`

### 5. Test Your Website
- Visit your cPanel domain
- Test dashboard at `yourdomain.com/dashboard`
- Check browser console for any errors

## ✅ Your Dashboard Will Work!

After deployment:
- ✅ Dashboard login works
- ✅ Content management works
- ✅ File uploads work (stored on Railway)
- ✅ Real-time website updates
- ✅ All API calls work properly

## 🔧 Need Help?
Check `DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

**Important**: Replace `your-app.railway.app` with your actual Railway URL and `your-cpanel-domain.com` with your actual domain!