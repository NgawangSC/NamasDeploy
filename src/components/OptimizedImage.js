import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder.png',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef(null);
  const loadedImageSrc = useRef(null);

  // Get optimized image URL
  const imageUrl = getImageUrl(src);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(placeholder);
    if (onError) onError();
  }, [onError, placeholder]);

  // Preload the actual image
  useEffect(() => {
    if (!imageUrl || imageUrl === placeholder) {
      setIsLoading(false);
      return;
    }

    // If we've already loaded this image URL, don't reload it
    if (loadedImageSrc.current === imageUrl) {
      setIsLoading(false);
      setImageSrc(imageUrl);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      // Only update if the component is still mounted and the URL hasn't changed
      if (loadedImageSrc.current !== imageUrl) {
        loadedImageSrc.current = imageUrl;
        setImageSrc(imageUrl);
        handleImageLoad();
      }
    };

    img.onerror = () => {
      if (loadedImageSrc.current !== imageUrl) {
        handleImageError();
      }
    };

    // Start loading the image
    img.src = imageUrl;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, handleImageLoad, handleImageError, placeholder]);

  return (
    <div className={`optimized-image-container ${className}`} style={{ position: 'relative' }}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
        style={{
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.3s ease-in-out',
          ...props.style
        }}
        {...props}
      />
      {isLoading && (
        <div 
          className="image-loading-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(240, 240, 240, 0.8)',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;