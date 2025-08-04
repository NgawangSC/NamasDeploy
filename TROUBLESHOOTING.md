# Troubleshooting Guide - 500 Internal Server Error

## Issue Description
After implementing performance optimizations, the website was showing "Failed to load resource: the server responded with a status of 500 (Internal Server Error)" messages.

## Root Cause Analysis
The 500 errors were caused by the **Service Worker** trying to cache resources that didn't exist or weren't available during development/build process:

1. **Non-existent static files**: Service worker was trying to cache `/static/js/bundle.js` and `/static/css/main.css` which only exist after build
2. **Aggressive caching**: Using `cache.addAll()` which fails if any single resource fails to load
3. **Missing error handling**: No graceful fallback when resources couldn't be cached

## Fixes Applied

### 1. Service Worker Improvements (✅ Fixed)

**Before:**
```javascript
const urlsToCache = [
  '/',
  '/static/js/bundle.js',    // ❌ Doesn't exist in development
  '/static/css/main.css',    // ❌ Doesn't exist in development
  '/images/optimized/logo.webp',
  '/images/optimized/hero-banner.webp',
  '/manifest.json'
];

// ❌ Fails if any resource fails
return cache.addAll(urlsToCache);
```

**After:**
```javascript
const urlsToCache = [
  '/',
  '/manifest.json'  // ✅ Only cache resources that always exist
];

// ✅ Handle failures gracefully
return Promise.allSettled(
  urlsToCache.map(url => 
    cache.add(url).catch(err => {
      console.warn(`Failed to cache ${url}:`, err);
      return null;
    })
  )
);
```

### 2. Enhanced Fetch Handler (✅ Fixed)

**Improvements:**
- Skip non-GET requests
- Only cache specific file types
- Better error handling
- Graceful fallbacks

```javascript
// ✅ Skip non-GET requests
if (event.request.method !== 'GET') {
  return;
}

// ✅ Only cache certain file types
const shouldCache = 
  url.pathname.endsWith('.js') ||
  url.pathname.endsWith('.css') ||
  url.pathname.endsWith('.png') ||
  // ... other file types

// ✅ Handle fetch errors gracefully
.catch(err => {
  console.warn('Fetch failed:', err);
  throw err;
});
```

### 3. OptimizedImage Component Fixes (✅ Fixed)

**Path Resolution:**
```javascript
// ✅ Better path handling
const getOptimizedSrc = (originalSrc) => {
  try {
    // Handle both absolute and relative paths
    let cleanSrc = originalSrc;
    if (cleanSrc.startsWith('/')) {
      cleanSrc = cleanSrc.substring(1);
    }
    
    const pathParts = cleanSrc.split('/');
    const filename = pathParts[pathParts.length - 1];
    const baseName = filename.replace(/\.(jpg|jpeg|png)$/i, '');
    
    return {
      webp: `/images/optimized/${baseName}.webp`,
      fallback: `/images/optimized/${baseName}.jpg`
    };
  } catch (error) {
    // ✅ Fallback to original on error
    return { webp: originalSrc, fallback: originalSrc };
  }
};
```

## Testing Results

### Production Build Test
```bash
npm run build:production
npx serve -s build -p 3001
```

**Results:**
- ✅ Main page: `HTTP/1.1 200 OK`
- ✅ Service worker: `HTTP/1.1 200 OK`
- ✅ Manifest: `HTTP/1.1 200 OK`
- ✅ Optimized images: `HTTP/1.1 200 OK`
- ✅ No 500 errors

### File Sizes Verified
- Hero banner WebP: 190KB (was 3.1MB)
- Logo WebP: 13KB (was 28KB)
- All optimized images accessible

## Prevention Measures

### 1. Service Worker Best Practices
- Only cache resources that are guaranteed to exist
- Use `Promise.allSettled()` instead of `Promise.all()`
- Add comprehensive error handling
- Test in both development and production

### 2. Image Optimization
- Always provide fallbacks for optimized images
- Handle path resolution errors gracefully
- Test image paths in different environments

### 3. Build Process
- Test production builds locally before deployment
- Verify all static resources are accessible
- Check browser console for errors

## Deployment Checklist

1. **Build and Test Locally:**
   ```bash
   npm run build:production
   npx serve -s build -p 3001
   ```

2. **Verify Resources:**
   - [ ] Main page loads (200 OK)
   - [ ] Service worker registers successfully
   - [ ] Optimized images load
   - [ ] No console errors

3. **Upload to Server:**
   - Upload entire `build` folder contents
   - Ensure `.htaccess` is in place
   - Verify server supports WebP format

4. **Post-Deployment Verification:**
   - [ ] Test in multiple browsers
   - [ ] Check browser dev tools for errors
   - [ ] Verify service worker registration
   - [ ] Test offline functionality

## Monitoring

### Browser Console Checks
Look for these success messages:
- `"Service worker installed successfully"`
- `"Service worker activated"`
- `"SW registered: [ServiceWorkerRegistration]"`

### Error Indicators
Watch out for:
- `"Failed to cache [resource]"` (warnings are OK)
- `"Service worker installation failed"`
- `"Failed to load resource: 500"`

## Quick Fixes

### If 500 Errors Persist:

1. **Clear Browser Cache:**
   ```javascript
   // In browser console
   caches.keys().then(names => names.forEach(name => caches.delete(name)));
   ```

2. **Unregister Service Worker:**
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```

3. **Check Server Configuration:**
   - Verify `.htaccess` is working
   - Check server error logs
   - Ensure WebP support is enabled

## Summary

The 500 Internal Server Error was successfully resolved by:
- ✅ Fixing service worker resource caching
- ✅ Adding comprehensive error handling
- ✅ Improving image path resolution
- ✅ Testing production build thoroughly

**Result:** Website now loads without errors and maintains all performance optimizations.