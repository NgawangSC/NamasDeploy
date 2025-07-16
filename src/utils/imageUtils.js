const SERVER_BASE_URL = 'http://localhost:5000';

/**
 * Constructs the full URL for an uploaded image
 * @param {string} imagePath - The image path from the API (e.g., "/uploads/logo-123.png")
 * @param {boolean} bustCache - Whether to add cache-busting parameter
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath, bustCache = false) => {
  if (!imagePath) return "/images/placeholder-logo.png";
  
  let fullUrl;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
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
  
  // Add cache-busting parameter if requested or if image seems new
  if (bustCache || shouldBustCache(imagePath)) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${separator}v=${Date.now()}`;
  }
  
  return fullUrl;
};

/**
 * Determines if cache should be busted for an image
 * @param {string} imagePath - The image path
 * @returns {boolean} - Whether to bust cache
 */
const shouldBustCache = (imagePath) => {
  if (!imagePath) return false;
  
  // Always bust cache for server-uploaded images in development
  if (imagePath.startsWith('/uploads/') || imagePath.includes('localhost')) {
    return true;
  }
  
  return false;
};

/**
 * Preloads an image to check if it exists and loads properly
 * @param {string} imagePath - The image path to preload
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads successfully
 */
export const preloadImage = (imagePath) => {
  return new Promise((resolve) => {
    if (!imagePath) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = getImageUrl(imagePath, true); // Use cache-busting for preload
  });
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