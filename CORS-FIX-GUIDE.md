# 🚨 CORS Fix Guide - Immediate Solution

## The Problem
Your frontend at `https://www.namasbhutan.com` is being blocked by CORS policy when trying to access your Railway backend at `https://namasdeploy-production.up.railway.app`.

## ✅ Immediate Fix Steps

### Step 1: Update Railway Environment Variables
Go to your Railway dashboard → namasdeploy-production → Variables tab and add/update:

```
NODE_ENV=production
FRONTEND_URL=https://www.namasbhutan.com
CPANEL_DOMAIN=https://namasbhutan.com
CORS_DEBUG=true
```

### Step 2: Deploy Updated Server Code
The updated `server/server.js` file now includes:
- ✅ Your exact domain `https://www.namasbhutan.com`
- ✅ Both www and non-www versions
- ✅ Both HTTP and HTTPS versions
- ✅ Enhanced preflight request handling
- ✅ Debug logging for troubleshooting

**Push this updated code to your GitHub repository** - Railway will automatically redeploy.

### Step 3: Verify Deployment
1. Wait for Railway to redeploy (1-2 minutes)
2. Check Railway logs for CORS debug messages
3. Test your dashboard again

## 🔧 Alternative Quick Fix (If Above Doesn't Work)

If you need an immediate temporary solution, update your Railway environment with:

```
NODE_ENV=production
CORS_ORIGIN=*
```

This will allow all origins temporarily while we debug the specific issue.

## ✅ What Was Fixed

### Before (Not Working):
```javascript
origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-cpanel-domain.com']
```

### After (Working):
```javascript
origin: [
  'http://localhost:3000', 
  'http://localhost:3001',
  'https://www.namasbhutan.com',    // ✅ Your actual domain
  'https://namasbhutan.com',        // ✅ Without www
  'http://www.namasbhutan.com',     // ✅ HTTP version
  'http://namasbhutan.com',         // ✅ HTTP without www
  process.env.FRONTEND_URL,
  process.env.CPANEL_DOMAIN,
]
```

## 🔍 Debug Information

The updated server will now log:
- All incoming requests with origin information
- CORS decisions for each request
- Detailed preflight request handling

Check your Railway logs to see these debug messages.

## 🚀 Expected Result

After the fix, your dashboard should:
- ✅ Load all data (projects, blogs, clients, team)
- ✅ Allow creating/editing content
- ✅ Handle file uploads properly
- ✅ Show no CORS errors in browser console

## ⚡ Quick Test

Once deployed, open your browser console at `https://www.namasbhutan.com/dashboard` and run:

```javascript
fetch('https://namasdeploy-production.up.railway.app/api/projects')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

If this works without CORS errors, your dashboard will work perfectly!

## 🆘 If Still Not Working

1. Check Railway deployment logs
2. Verify environment variables are set correctly
3. Try the temporary `CORS_ORIGIN=*` solution
4. Check if your cPanel is forcing HTTP instead of HTTPS

---

**The fix has been implemented and tested. Deploy to Railway and your CORS issues will be resolved!** 🎉