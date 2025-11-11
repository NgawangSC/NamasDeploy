# CORS Configuration Fix

## Problem

The website (namasbhutan.com) was experiencing CORS errors when trying to access the Railway backend API. All API requests were being blocked with the error:

```
Access to fetch at 'https://namasdeploy-production.up.railway.app/api/*' from origin 'https://www.namasbhutan.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

The server.js file was missing proper CORS configuration:
1. `corsOptions` was referenced but never defined
2. No global CORS middleware was applied
3. OPTIONS preflight requests were not being handled correctly
4. The custom CORS middleware was incomplete and didn't handle preflight requests

## Solution

### 1. Defined `corsOptions` Configuration

Added a proper CORS configuration object that:
- Checks if the request origin is in the allowed origins list
- Allows requests from `https://www.namasbhutan.com` and `https://namasbhutan.com`
- Handles requests without origin (for server-to-server requests)
- Includes all necessary headers and methods
- Sets `credentials: true` for authenticated requests
- Configures preflight request handling

### 2. Applied CORS Middleware Globally

Applied the `cors()` middleware globally **before** all other middleware:
```javascript
app.use(cors(corsOptions));
```

This ensures that:
- All routes automatically get CORS headers
- OPTIONS preflight requests are handled automatically
- CORS headers are added to all responses

### 3. Removed Duplicate/Conflicting Middleware

Removed the custom CORS middleware that was incomplete and could conflict with the `cors()` middleware.

### 4. Added Diagnostic Endpoint

Added `/api/cors-test` endpoint to help debug CORS issues:
- Shows the request origin
- Shows the allowed origins
- Indicates if the origin is allowed

## Configuration

### Allowed Origins

The server allows requests from:
- `https://www.namasbhutan.com`
- `https://namasbhutan.com`
- `http://localhost:3000` (for development)

These can be configured via environment variables:
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- `CORS_ORIGIN` - Single allowed origin
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `FRONTEND_URL` - Frontend URL
- `CPANEL_DOMAIN` - cPanel domain

### Railway Configuration

The Railway configuration (`server/railway.json`) already has the correct environment variables:
```json
{
  "environments": {
    "production": {
      "variables": {
        "ALLOWED_ORIGINS": "https://www.namasbhutan.com,https://namasbhutan.com"
      }
    }
  }
}
```

## Deployment Steps

### 1. Deploy Updated Server to Railway

The server.js file has been updated with the CORS fix. You need to:

1. **Commit the changes:**
   ```bash
   git add server/server.js
   git commit -m "Fix CORS configuration for production"
   git push
   ```

2. **Railway will automatically redeploy** if you have auto-deploy enabled, or manually trigger a deployment.

3. **Verify the deployment:**
   - Check Railway logs to ensure the server started successfully
   - Look for CORS logging messages in the logs

### 2. Test CORS Configuration

After deployment, test the CORS configuration:

1. **Test the CORS test endpoint:**
   ```bash
   curl -H "Origin: https://www.namasbhutan.com" https://namasdeploy-production.up.railway.app/api/cors-test
   ```

2. **Test a real API endpoint:**
   ```bash
   curl -H "Origin: https://www.namasbhutan.com" https://namasdeploy-production.up.railway.app/api/projects
   ```

3. **Check the browser console:**
   - Visit https://www.namasbhutan.com
   - Open browser DevTools → Console
   - Verify that API requests are no longer blocked by CORS

### 3. Verify CORS Headers

Check that the response includes CORS headers:
```bash
curl -I -H "Origin: https://www.namasbhutan.com" https://namasdeploy-production.up.railway.app/api/projects
```

You should see headers like:
```
Access-Control-Allow-Origin: https://www.namasbhutan.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers
```

## Troubleshooting

### If CORS errors persist after deployment:

1. **Check Railway logs:**
   - Look for CORS-related log messages
   - Verify that the server started successfully
   - Check for any errors in the logs

2. **Verify environment variables:**
   - Check Railway dashboard → Variables
   - Ensure `ALLOWED_ORIGINS` is set correctly
   - Verify the format: `https://www.namasbhutan.com,https://namasbhutan.com`

3. **Test the CORS test endpoint:**
   - Visit: `https://namasdeploy-production.up.railway.app/api/cors-test`
   - Check the response to see if your origin is allowed

4. **Check browser console:**
   - Look for detailed CORS error messages
   - Check the Network tab to see the preflight OPTIONS request
   - Verify that the OPTIONS request returns 200 status

5. **Verify the origin:**
   - Make sure you're accessing the site from `https://www.namasbhutan.com` or `https://namasbhutan.com`
   - Check that the origin in the browser matches the allowed origins

### If OPTIONS requests are failing:

1. **Check that the cors() middleware is applied first:**
   - The `app.use(cors(corsOptions))` must be before all other middleware
   - Verify the order in server.js

2. **Check Railway logs for OPTIONS requests:**
   - Look for log entries showing OPTIONS requests
   - Verify that they're returning 200 status

3. **Test OPTIONS request directly:**
   ```bash
   curl -X OPTIONS -H "Origin: https://www.namasbhutan.com" -H "Access-Control-Request-Method: GET" https://namasdeploy-production.up.railway.app/api/projects
   ```

## Security Notes

### Current Configuration

The CORS configuration currently allows:
- Requests from allowed origins (production domains)
- Requests without origin (for server-to-server requests)
- All unknown origins (temporarily, for debugging)

### Production Hardening

For production, you should:
1. **Restrict unknown origins:**
   - Change the CORS configuration to reject unknown origins
   - Update the `origin` function in `corsOptions` to return an error for unknown origins

2. **Review allowed methods:**
   - Ensure only necessary HTTP methods are allowed
   - Remove unused methods if possible

3. **Review allowed headers:**
   - Ensure only necessary headers are allowed
   - Remove unused headers if possible

4. **Set appropriate maxAge:**
   - The current `maxAge` is 24 hours (86400 seconds)
   - Adjust based on your needs

## Files Changed

- `server/server.js` - Added CORS configuration and applied middleware globally

## Related Files

- `server/railway.json` - Railway environment configuration
- `server/cors-fix.js` - Alternative CORS configuration (not currently used)
- `server/cors-fix-temp.js` - Temporary permissive CORS configuration (not currently used)

## Next Steps

1. ✅ CORS configuration added to server.js
2. ⏳ Deploy updated server to Railway
3. ⏳ Test CORS configuration
4. ⏳ Verify API requests work from production site
5. ⏳ Monitor logs for any CORS-related issues
6. ⏳ Consider hardening CORS configuration for production (restrict unknown origins)

## Additional Resources

- [CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Railway Documentation](https://docs.railway.app/)

