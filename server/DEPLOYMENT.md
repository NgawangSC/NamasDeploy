# Railway Deployment Guide - Namas Architecture API

## 🚀 Fixed Issues

### 1. CORS Configuration ✅
- Added proper CORS middleware to `server.js`
- Environment-based origin configuration
- Production mode fallback for Railway proxy issues

### 2. API Routes ✅
- Added missing `/api/projects` endpoint
- Added `/api/projects/featured` endpoint  
- Added `/api/projects/:id` endpoint
- Proper error handling and logging

### 3. Health Check ✅
- Enhanced `/` route for Railway health checks
- Detailed response with server status
- Proper error handling middleware

### 4. Railway Configuration ✅
- Updated `railway.json` with proper environment variables
- Added PORT configuration for Railway
- Updated ALLOWED_ORIGINS for production

## 🔧 Deployment Steps

### 1. Deploy to Railway
```bash
# In the server directory
railway deploy
```

### 2. Set Environment Variables in Railway Dashboard
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://www.namasbhutan.com,https://namasbhutan.com`
- `HOST=0.0.0.0`

### 3. Update Frontend Environment
Update `.env.production` with your Railway URL:
```env
REACT_APP_API_URL=https://your-app-name.railway.app/api
REACT_APP_SERVER_URL=https://your-app-name.railway.app
```

### 4. Build and Deploy Frontend
```bash
npm run build:production
```

## 🐛 Troubleshooting

### 502 Bad Gateway Errors
1. **Check Railway Logs**: Look for startup errors
2. **Health Check**: Ensure `/` endpoint returns 200 status
3. **Port Binding**: Server binds to `0.0.0.0:$PORT`
4. **Memory Limits**: Check if app exceeds Railway limits

### CORS Issues
1. **Check Allowed Origins**: Verify frontend domain in CORS config
2. **Options Requests**: Ensure preflight requests are handled
3. **Credentials**: Set `credentials: true` for cookie support
4. **Production Fallback**: CORS allows all origins in production mode

### Common Railway Issues
1. **Build Failures**: Check `nixpacks.toml` configuration
2. **Start Command**: Verify `railway.json` start command
3. **Environment Variables**: Set all required env vars in Railway dashboard
4. **Health Check Timeout**: Increase timeout in `railway.json` if needed

## 📊 API Endpoints

### Health Check
- `GET /` - Server status and health check

### Test Endpoint  
- `GET /test` - Simple test endpoint

### Projects API
- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:id` - Get single project

## 🔍 Monitoring

### Check Server Status
```bash
curl https://your-app-name.railway.app/
```

### Test CORS
```bash
curl -H "Origin: https://www.namasbhutan.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-app-name.railway.app/api/projects
```

### View Logs
```bash
railway logs
```

## 🎯 Next Steps

1. **Data Implementation**: Add actual project data to API endpoints
2. **Database Integration**: Connect to database for persistent storage  
3. **Authentication**: Add user authentication if needed
4. **File Uploads**: Implement image upload functionality
5. **Rate Limiting**: Add rate limiting for production use

## 🆘 Still Having Issues?

If you continue to experience 502 errors:

1. Check Railway service logs for specific error messages
2. Verify the Railway app URL is correct in frontend `.env.production`
3. Ensure Railway service is not sleeping (upgrade plan if needed)
4. Test API endpoints directly with curl to isolate frontend vs backend issues
5. Check Railway dashboard for any service disruptions or alerts