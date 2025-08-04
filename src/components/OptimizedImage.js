import React, { useState, useEffect } from 'react';
import { getImageUrl, validateImageUrl } from '../utils/imageUtils';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/images/placeholder-logo.png',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!src) {
      setImageUrl(fallback);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Get the optimized image URL
        const optimizedUrl = getImageUrl(src, retryCount > 0);
        
        // Validate the URL is accessible
        const isValid = await validateImageUrl(optimizedUrl);
        
        if (isValid) {
          setImageUrl(optimizedUrl);
        } else {
          throw new Error('Image not accessible');
        }
      } catch (error) {
        console.warn('Image loading failed:', src, error);
        
        // Retry once with cache busting
        if (retryCount === 0) {
          setRetryCount(1);
          return;
        }
        
        // Use fallback after retry
        setHasError(true);
        setImageUrl(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src, fallback, retryCount]);

  const handleImageLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    console.warn('Image failed to load:', imageUrl);
    
    // Try fallback if not already using it
    if (imageUrl !== fallback && !hasError) {
      setHasError(true);
      setImageUrl(fallback);
    }
    
    if (onError) onError(e);
  };

  return (
    <div className={`image-container ${className}`} {...props}>
      {isLoading && !hasError && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          display: isLoading ? 'none' : 'block',
          opacity: hasError ? 0.7 : 1,
        }}
        {...props}
      />
      
      {hasError && (
        <div className="image-error-indicator" title="Image failed to load">
          ⚠️
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;