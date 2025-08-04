# Deployment Guide - Fixing Broken Images

## Problem Description
After deployment, images appear broken when creating projects. This happens because the frontend and backend are deployed separately, causing URL mismatches for uploaded images.

## Root Cause
1. **Frontend**: Deployed on cPanel at `https://www.namasbhutan.com`
2. **Backend**: Deployed on Railway at `https://namasdeploy-production.up.railway.app`
3. **Images**: Uploaded to Railway backend but frontend tries to serve them incorrectly

## Solution Overview
The fix involves multiple components:
1. Proper CORS configuration for image serving
2. Image URL construction improvements
3. .htaccess proxy rules for cPanel deployment
4. Environment variable configuration

## Step-by-Step Deployment Fix

### 1. Backend Fixes (Railway)

The server has been updated with proper CORS headers for images:
```javascript
// Serve uploaded files with proper CORS headers
app.use("/uploads", cors(corsOptions), express.static(UPLOADS_DIR, {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  }
}))
```

### 2. Frontend Fixes

#### Environment Configuration
Updated `.env.production`:
```
REACT_APP_API_URL=https://namasdeploy-production.up.railway.app/api
REACT_APP_SERVER_URL=https://namasdeploy-production.up.railway.app
REACT_APP_IMAGE_BASE_URL=https://namasdeploy-production.up.railway.app
GENERATE_SOURCEMAP=false
BUILD_PATH=./build
REACT_APP_DEBUG_IMAGES=true
```

#### Image URL Handling
Updated `src/utils/imageUtils.js` with:
- Better URL construction logic
- Image validation functionality
- Proper error handling

#### New OptimizedImage Component
Created `src/components/OptimizedImage.js` with:
- Loading states
- Error handling
- Automatic fallbacks
- Retry logic

### 3. cPanel Deployment (.htaccess)

Updated `public/.htaccess` to proxy image requests:
```apache
# Proxy uploaded images to Railway backend
RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
RewriteRule ^uploads/(.*)$ https://namasdeploy-production.up.railway.app/uploads/$1 [P,L]
```

**Important**: Your cPanel hosting must support mod_proxy for this to work. If not available, see Alternative Solutions below.

## Deployment Steps

### For Railway (Backend)
1. Push the updated server code to Railway
2. Ensure environment variables are set:
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://www.namasbhutan.com,https://namasbhutan.com,http://localhost:3000
   ```

### For cPanel (Frontend)
1. Build the project:
   ```bash
   npm run build:production
   ```

2. Upload the `build` folder contents to your cPanel `public_html` directory

3. Ensure the `.htaccess` file is uploaded and active

4. Test image loading

## Alternative Solutions (if mod_proxy not available)

### Option 1: Client-Side Proxy
If your cPanel doesn't support mod_proxy, update the image URL construction to always use the full Railway URL:

In `src/utils/imageUtils.js`, modify the `constructImageUrl` function:
```javascript
// Always use full Railway URL for images
else {
  fullUrl = `https://namasdeploy-production.up.railway.app${imagePath}`;
}
```

### Option 2: Image Sync Script
Create a script to periodically sync images from Railway to cPanel:

```bash
#!/bin/bash
# sync-images.sh
rsync -av https://namasdeploy-production.up.railway.app/uploads/ ./public_html/uploads/
```

### Option 3: Use CDN/Cloud Storage
Consider moving to a cloud storage solution like:
- Cloudinary
- AWS S3
- Google Cloud Storage

## Testing the Fix

### 1. Test Image Upload
1. Go to the admin dashboard
2. Create a new project with images
3. Verify images appear correctly

### 2. Test Image Display
1. Check project gallery pages
2. Verify images load without errors
3. Check browser console for any CORS errors

### 3. Debug Mode
If `REACT_APP_DEBUG_IMAGES=true`, check browser console for detailed image loading logs.

## Common Issues and Solutions

### Issue: Images still broken after deployment
**Solution**: 
1. Clear browser cache
2. Check if .htaccess proxy rules are working
3. Verify Railway backend is accessible
4. Check browser console for specific error messages

### Issue: CORS errors
**Solution**:
1. Verify Railway CORS configuration
2. Check if domain is in ALLOWED_ORIGINS
3. Test direct image URLs in browser

### Issue: Images load slowly
**Solution**:
1. Implement image optimization
2. Use WebP format where possible
3. Add image compression
4. Consider CDN usage

## Monitoring and Maintenance

### 1. Log Monitoring
Monitor Railway logs for:
- Image upload errors
- CORS issues
- File serving problems

### 2. Performance Monitoring
Track:
- Image load times
- Failed image requests
- User experience metrics

### 3. Regular Testing
- Test image uploads monthly
- Verify cross-browser compatibility
- Check mobile image loading

## Support

If issues persist:
1. Check Railway deployment logs
2. Verify cPanel .htaccess is active
3. Test direct image URLs
4. Contact hosting provider about mod_proxy support

---

**Last Updated**: January 2025
**Version**: 1.0