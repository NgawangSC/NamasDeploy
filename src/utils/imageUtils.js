const SERVER_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

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
    // In production, ensure we're using the correct server URL
    const serverUrl = SERVER_BASE_URL;
    
    // Handle case where imagePath already starts with /uploads
    if (imagePath.startsWith('/uploads')) {
      fullUrl = `${serverUrl}${imagePath}`;
    } else {
      fullUrl = `${serverUrl}/uploads/${imagePath}`;
    }
  }
  
  // Add cache-busting parameter if requested (but not for blob or data URLs)
  if (bustCache && !imagePath.startsWith('blob:') && !imagePath.startsWith('data:')) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${separator}v=${Date.now()}`;
  }
  
  return fullUrl;
}

/**
 * Validates if an image URL is accessible
 * @param {string} imageUrl - The image URL to validate
 * @returns {Promise<boolean>} - Promise that resolves to true if accessible
 */
export const validateImageUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image URL validation failed:', imageUrl, error);
    return false;
  }
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
 * Compresses an image file and converts it to base64 with high quality
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image  
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Promise that resolves to compressed base64 data URL
 */
export const compressImageToBase64 = (file, maxWidth = 1200, maxHeight = 800, quality = 0.9) => {
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
      
      // Use device pixel ratio for high-DPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Set canvas dimensions accounting for pixel ratio
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      // Scale the context to account for device pixel ratio
      ctx.scale(pixelRatio, pixelRatio);
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw with high quality
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with preserved format if possible
      const originalType = file.type;
      const outputType = (originalType === 'image/png' || originalType === 'image/webp') 
        ? originalType 
        : 'image/jpeg';
      const finalQuality = (outputType === 'image/jpeg') ? quality : undefined;
      
      const dataUrl = canvas.toDataURL(outputType, finalQuality);
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

/**
 * Creates a high-quality cropped image from canvas
 * @param {HTMLImageElement} image - Source image element
 * @param {Object} crop - Crop configuration
 * @param {File} originalFile - Original file for format preservation
 * @param {number} minQualitySize - Minimum output size to maintain quality
 * @returns {Promise<Blob>} - Promise that resolves to cropped image blob
 */
export const createHighQualityCrop = async (image, crop, originalFile, minQualitySize = 800) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!crop || !image) {
    return null;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calculate actual crop dimensions in original image coordinates
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  // Use device pixel ratio for high-DPI displays
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Set canvas size to maintain high quality
  const outputWidth = Math.max(cropWidth, minQualitySize);
  const outputHeight = Math.max(cropHeight, minQualitySize);
  
  const scale = Math.min(outputWidth / cropWidth, outputHeight / cropHeight);
  const finalWidth = cropWidth * scale;
  const finalHeight = cropHeight * scale;

  // Set canvas dimensions accounting for pixel ratio
  canvas.width = finalWidth * pixelRatio;
  canvas.height = finalHeight * pixelRatio;
  
  canvas.style.width = finalWidth + 'px';
  canvas.style.height = finalHeight + 'px';
  
  ctx.scale(pixelRatio, pixelRatio);
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    finalWidth,
    finalHeight
  );

  return new Promise((resolve) => {
    const originalType = originalFile?.type || 'image/jpeg';
    let quality;
    
    if (originalType === 'image/png' || originalType === 'image/webp') {
      quality = undefined; // Lossless formats
    } else {
      quality = 1.0; // Maximum quality for JPEG
    }
    
    canvas.toBlob((blob) => {
      resolve(blob);
    }, originalType, quality);
  });
};

/**
 * Resizes an image while maintaining aspect ratio and quality
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Quality for lossy formats (0-1)
 * @returns {Promise<Blob>} - Promise that resolves to resized image blob
 */
export const resizeImageWithQuality = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.95) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
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
      
      // Use device pixel ratio for high-DPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(pixelRatio, pixelRatio);
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Preserve original format
      const originalType = file.type;
      const finalQuality = (originalType === 'image/png' || originalType === 'image/webp') 
        ? undefined 
        : quality;
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, originalType, finalQuality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Optimizes an image file for web usage while preserving quality
 * @param {File} file - Image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<File>} - Promise that resolves to optimized file
 */
export const optimizeImageForWeb = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.95,
    maintainOriginalSize = false
  } = options;
  
  try {
    let optimizedBlob;
    
    if (maintainOriginalSize) {
      // Just improve quality settings without resizing
      optimizedBlob = await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          const pixelRatio = window.devicePixelRatio || 1;
          
          canvas.width = img.naturalWidth * pixelRatio;
          canvas.height = img.naturalHeight * pixelRatio;
          canvas.style.width = img.naturalWidth + 'px';
          canvas.style.height = img.naturalHeight + 'px';
          
          ctx.scale(pixelRatio, pixelRatio);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
          
          const finalQuality = (file.type === 'image/png' || file.type === 'image/webp') 
            ? undefined 
            : quality;
          
          canvas.toBlob(resolve, file.type, finalQuality);
        };
        
        img.src = URL.createObjectURL(file);
      });
    } else {
      optimizedBlob = await resizeImageWithQuality(file, maxWidth, maxHeight, quality);
    }
    
    if (optimizedBlob) {
      return new File([optimizedBlob], `optimized-${file.name}`, {
        type: file.type,
        lastModified: Date.now()
      });
    }
    
    return file; // Return original if optimization fails
  } catch (error) {
    console.error('Image optimization failed:', error);
    return file; // Return original if optimization fails
  }
};

