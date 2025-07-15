const SERVER_BASE_URL = 'http://localhost:5000';

/**
 * Constructs the full URL for an uploaded image
 * @param {string} imagePath - The image path from the API (e.g., "/uploads/logo-123.png")
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/placeholder-logo.png";
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local placeholder image, return as is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // For uploaded images, prepend the server base URL
  return `${SERVER_BASE_URL}${imagePath}`;
};