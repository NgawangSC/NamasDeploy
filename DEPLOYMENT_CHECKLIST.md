# Deployment Checklist - Apache SSL Proxy Fix

## Quick Deployment Steps

### ✅ Files Modified/Created
- [x] `public/.htaccess` - Updated to use PHP proxy
- [x] `public/proxy-uploads.php` - New PHP proxy script
- [x] `package.json` - Build script updated
- [x] Deployment scripts updated

### 📦 Build Process

1. **Run the build command:**
   ```bash
   npm run build:production
   ```

2. **Verify these files are in the `build/` directory:**
   - `build/.htaccess` (explicitly copied)
   - `build/proxy-uploads.php` (automatically copied by react-scripts)
   - `build/index.html`
   - `build/static/` directory

### 🚀 Deploy to cPanel

1. **Upload to cPanel:**
   - Open cPanel File Manager
   - Navigate to `public_html` directory
   - Upload ALL contents from the `build/` folder
   - **IMPORTANT:** Ensure `proxy-uploads.php` is in the root of `public_html`

2. **Verify file permissions:**
   - `.htaccess` should be readable (644)
   - `proxy-uploads.php` should be executable (644 or 755)
   - All files should be owned by your cPanel user

3. **Test the deployment:**
   - Visit: `https://namasbhutan.com`
   - Check browser console for errors
   - Test an uploaded image: `https://namasbhutan.com/uploads/[image-name]`
   - Verify images load correctly

### 🔍 Troubleshooting

#### If images still don't load:

1. **Check if PHP is enabled:**
   - Visit: `https://namasbhutan.com/proxy-uploads.php`
   - You should see an error message (not a 404)
   - If you see 404, PHP might not be enabled or file wasn't uploaded

2. **Check Apache error logs in cPanel:**
   - Look for any rewrite rule errors
   - Check for PHP errors

3. **Test Railway backend directly:**
   - Visit: `https://namasdeploy-production.up.railway.app/uploads/[image-name]`
   - Verify the backend is accessible

4. **Verify .htaccess syntax:**
   - Check that mod_rewrite is enabled on your server
   - Verify the rewrite rules are correct

#### If you see 500 errors:

1. Check Apache error logs
2. Verify `.htaccess` syntax (no typos)
3. Ensure `mod_rewrite` is enabled
4. Check if PHP is enabled and working

#### If you see 404 errors for images:

1. Verify `proxy-uploads.php` is in `public_html` root
2. Check that the rewrite rule in `.htaccess` is working
3. Test the proxy script directly: `https://namasbhutan.com/proxy-uploads.php?path=test.jpg`

### 📝 Notes

- The PHP proxy script works around Apache's `SSLProxyEngine` limitations on cPanel
- No server-level configuration is required
- The proxy handles HTTPS connections to Railway backend
- CORS headers are automatically added
- The solution is secure and includes directory traversal protection

### 🔄 Alternative: If Your Host Enables SSLProxyEngine

If your hosting provider enables `SSLProxyEngine` at the server level, you can use the direct Apache proxy instead:

1. In `.htaccess`, comment out the PHP proxy section
2. Uncomment the Apache proxy section
3. Remove or don't upload `proxy-uploads.php`

However, the PHP proxy solution is more reliable for cPanel hosting.

