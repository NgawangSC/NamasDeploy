const SERVER_BASE_URL = 'http://localhost:5000';

// Cache for image URLs to prevent flickering
const imageUrlCache = new Map();

/**
 * Constructs the full URL for an uploaded image
 * @param {string} imagePath - The image path from the API (e.g., "/uploads/logo-123.png")
 * @param {boolean} bustCache - Whether to add cache-busting parameter
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath, bustCache = false) => {
  if (!imagePath) {
    return "/images/placeholder-logo.png";
  }
  
  // For cache busting or immediate processing, skip cache check
  if (bustCache) {
    return constructImageUrl(imagePath, true);
  }
  
  // Check cache first to prevent flickering
  const cacheKey = imagePath;
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey);
  }
  
  // Construct URL and cache it
  const fullUrl = constructImageUrl(imagePath, false);
  imageUrlCache.set(cacheKey, fullUrl);
  
  return fullUrl;
};

/**
 * Helper function to construct image URLs
 */
function constructImageUrl(imagePath, bustCache = false) {
  let fullUrl;
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http')) {
    fullUrl = imagePath;
  }
  // If it's a blob URL (from file uploads), return as is
  else if (imagePath.startsWith('blob:')) {
    fullUrl = imagePath;
  }
  // If it's a data URL (base64 images), return as is
  else if (imagePath.startsWith('data:')) {
    fullUrl = imagePath;
  }
  // If it's a local placeholder image, return as is
  else if (imagePath.startsWith('/images/') || imagePath.startsWith('/placeholder')) {
    fullUrl = imagePath;
  }
  // For uploaded images, prepend the server base URL
  else {
    fullUrl = `${SERVER_BASE_URL}${imagePath}`;
  }
  
  // Add cache-busting parameter if requested (but not for blob or data URLs)
  if (bustCache && !imagePath.startsWith('blob:') && !imagePath.startsWith('data:')) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${separator}v=${Date.now()}`;
  }
  
  return fullUrl;
}

/**
 * Determines if cache should be busted for an image
 * @param {string} imagePath - The image path
 * @returns {boolean} - Whether to bust cache
 */
const shouldBustCache = (imagePath) => {
  if (!imagePath) return false;
  
  // Reduced aggressive cache busting to prevent flickering
  // Only bust cache when explicitly needed
  return false;
};

/**
 * Preloads an image to prevent flickering on display
 * @param {string} imageUrl - The URL of the image to preload
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });
};

/**
 * Clears the image URL cache
 */
export const clearImageCache = () => {
  imageUrlCache.clear();
};

/**
 * Clears cache for a specific image path
 */
export const clearImageCacheForPath = (imagePath) => {
  if (!imagePath) return;
  const keysToDelete = [];
  for (const key of imageUrlCache.keys()) {
    if (key.startsWith(imagePath)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => imageUrlCache.delete(key));
};

/**
 * Creates an optimized image URL with fallback
 * @param {string} imagePath - The image path
 * @param {string} fallback - Fallback image path
 * @returns {string} - Image URL
 */
export const getImageUrlWithFallback = (imagePath, fallback = "/images/placeholder.png") => {
  if (!imagePath) return fallback;
  return getImageUrl(imagePath);
};

/**
 * Converts a File object to a base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise that resolves to base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses an image file and converts it to base64
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image  
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Promise that resolves to compressed base64 data URL
 */
export const compressImageToBase64 = (file, maxWidth = 1200, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Stores an image in localStorage with a unique key
 * @param {string} blogId - The blog ID
 * @param {string} base64Data - The base64 image data
 */
export const storeImageLocally = (blogId, base64Data) => {
  try {
    const key = `blog_image_${blogId}`;
    localStorage.setItem(key, base64Data);
    return key;
  } catch (error) {
    console.warn('Failed to store image locally:', error);
    return null;
  }
};

/**
 * Retrieves an image from localStorage
 * @param {string} blogId - The blog ID
 * @returns {string|null} - The base64 image data or null
 */
export const getStoredImage = (blogId) => {
  try {
    const key = `blog_image_${blogId}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to retrieve stored image:', error);
    return null;
  }
};

/**
 * Removes a stored image from localStorage
 * @param {string} blogId - The blog ID
 */
export const removeStoredImage = (blogId) => {
  try {
    const key = `blog_image_${blogId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove stored image:', error);
  }
};

