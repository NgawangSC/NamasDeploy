# Apache SSL Proxy Fix for Railway Backend

## Problem Summary

The website (namasbhutan.com) was showing 500 Internal Server Errors due to Apache's inability to proxy HTTPS requests to the Railway backend. The error logs showed:

```
AH01961: failed to enable ssl support [Hint: if using mod_ssl, see SSLProxyEngine]
AH00961: https: failed to enable ssl support for namasdeploy-production.up.railway.app
```

## Root Cause

Apache's `mod_proxy` requires `SSLProxyEngine On` to proxy HTTPS requests, but this directive cannot be set in `.htaccess` files on most cPanel hosting environments. It requires server-level or VirtualHost configuration, which is typically not accessible to cPanel users.

## Solution

We've implemented a **PHP proxy script** (`proxy-uploads.php`) that acts as an intermediary between your website and the Railway backend. This solution:

1. ✅ Works on all cPanel hosting (no server-level configuration needed)
2. ✅ Handles HTTPS connections to Railway backend
3. ✅ Preserves CORS headers
4. ✅ Includes security measures (directory traversal prevention)
5. ✅ Forwards appropriate HTTP headers
6. ✅ Handles errors gracefully

## Files Modified/Created

1. **`public/.htaccess`** - Updated to use PHP proxy instead of Apache mod_proxy
2. **`public/proxy-uploads.php`** - New PHP proxy script for Railway backend

## Deployment Instructions

### Step 1: Deploy Files to cPanel

1. Upload the updated `public/.htaccess` file to your `public_html` directory
2. Upload the new `public/proxy-uploads.php` file to your `public_html` directory
3. Ensure both files are in the root of your `public_html` directory (same level as `index.html`)

### Step 2: Verify PHP is Enabled

Ensure PHP is enabled on your cPanel account. Most cPanel hosts have PHP enabled by default, but verify in your cPanel PHP configuration.

### Step 3: Test the Proxy

1. Visit your website: `https://namasbhutan.com`
2. Check the browser console for any errors
3. Try accessing an uploaded image directly: `https://namasbhutan.com/uploads/[image-filename]`
4. Verify the image loads correctly

### Step 4: Verify Railway Backend

Ensure your Railway backend is accessible at:
- `https://namasdeploy-production.up.railway.app`

You can test this by visiting:
- `https://namasdeploy-production.up.railway.app/uploads/[any-uploaded-image]`

## How It Works

1. User requests: `https://namasbhutan.com/uploads/image.jpg`
2. Apache `.htaccess` rewrites the request to: `proxy-uploads.php?path=image.jpg`
3. PHP script receives the request and constructs Railway URL: `https://namasdeploy-production.up.railway.app/uploads/image.jpg`
4. PHP script uses cURL to fetch the image from Railway
5. PHP script forwards the image and headers to the user's browser
6. User's browser receives the image as if it came directly from namasbhutan.com

## Configuration

### Change Railway Backend URL

If your Railway backend URL changes, update it in `proxy-uploads.php`:

```php
$RAILWAY_BACKEND = 'https://your-new-railway-url.up.railway.app';
```

### Alternative: Use Apache Proxy (If Available)

If your hosting provider enables `SSLProxyEngine` at the server level, you can use the direct Apache proxy instead. In `.htaccess`, comment out the PHP proxy section and uncomment the Apache proxy section:

```apache
# Comment out PHP proxy:
# RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
# RewriteRule ^uploads/(.*)$ proxy-uploads.php?path=$1 [L,QSA]

# Uncomment Apache proxy:
<IfModule mod_ssl.c>
    <IfModule mod_proxy.c>
        SSLProxyEngine On
        SSLProxyVerify none
        SSLProxyCheckPeerCN off
        SSLProxyCheckPeerName off
        ProxyPreserveHost On
        ProxyRequests Off
        RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
        RewriteRule ^uploads/(.*)$ https://namasdeploy-production.up.railway.app/uploads/$1 [P,L]
    </IfModule>
</IfModule>
```

## Troubleshooting

### Images Still Not Loading

1. **Check PHP Error Logs**: Look in cPanel's Error Log section for PHP errors
2. **Test PHP Script Directly**: Visit `https://namasbhutan.com/proxy-uploads.php?path=test.jpg` and check for errors
3. **Verify Railway Backend**: Ensure Railway backend is running and accessible
4. **Check File Permissions**: Ensure `proxy-uploads.php` has execute permissions (644 or 755)

### 500 Internal Server Error

1. Check Apache error logs in cPanel
2. Verify `.htaccess` syntax is correct (no typos)
3. Ensure `mod_rewrite` is enabled on your server
4. Check if PHP is enabled and working

### CORS Errors

The PHP proxy script includes CORS headers. If you still see CORS errors:
1. Verify the CORS headers are being sent (check browser DevTools → Network → Headers)
2. Ensure Railway backend also has CORS configured correctly

### Slow Image Loading

The PHP proxy adds a small overhead. If images load slowly:
1. Check Railway backend response times
2. Consider enabling caching in the PHP script
3. Verify your server's PHP and cURL performance

## Security Notes

- The PHP script includes directory traversal protection
- CORS headers are set to allow cross-origin requests (needed for images)
- SSL verification is enabled for Railway connections
- The script only proxies `/uploads/*` requests

## Performance Considerations

- Each image request goes through the PHP proxy, adding minimal overhead
- Consider implementing caching in the future to improve performance
- The proxy streams images directly (doesn't load into memory), so it's memory-efficient

## Support

If you continue to experience issues:
1. Check cPanel error logs
2. Verify Railway backend is running
3. Test the PHP script directly in a browser
4. Contact your hosting provider if mod_rewrite is not enabled

