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
  if (!imagePath) return "/images/placeholder-logo.png";
  
  // Check cache first to prevent flickering
  const cacheKey = `${imagePath}-${bustCache}`;
  if (!bustCache && imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey);
  }
  
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
  
  // Only add cache-busting parameter if explicitly requested
  // Removed automatic cache busting to prevent image flickering
  if (bustCache) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${separator}v=${Date.now()}`;
  }
  
  // Cache the result for consistent URLs
  if (!bustCache) {
    imageUrlCache.set(cacheKey, fullUrl);
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
 * Creates an optimized image URL with fallback
 * @param {string} imagePath - The image path
 * @param {string} fallback - Fallback image path
 * @returns {string} - Image URL
 */
export const getImageUrlWithFallback = (imagePath, fallback = "/images/placeholder.png") => {
  if (!imagePath) return fallback;
  return getImageUrl(imagePath);
};