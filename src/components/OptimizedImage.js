import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  loading = 'lazy',
  placeholder = null,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  // Get optimized image paths
  const getOptimizedSrc = (originalSrc) => {
    try {
      // Handle both absolute and relative paths
      let cleanSrc = originalSrc;
      if (cleanSrc.startsWith('/')) {
        cleanSrc = cleanSrc.substring(1);
      }
      
      // Extract the filename without extension
      const pathParts = cleanSrc.split('/');
      const filename = pathParts[pathParts.length - 1];
      const baseName = filename.replace(/\.(jpg|jpeg|png)$/i, '');
      
      return {
        webp: `/images/optimized/${baseName}.webp`,
        fallback: `/images/optimized/${baseName}.jpg`
      };
    } catch (error) {
      console.warn('Error processing image path:', originalSrc, error);
      return {
        webp: originalSrc,
        fallback: originalSrc
      };
    }
  };

  const optimizedSrcs = getOptimizedSrc(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    console.warn('Failed to load optimized image, falling back to original:', e.target.src);
    // Fallback to original image if optimized version fails
    if (e.target.src !== src) {
      e.target.src = src;
    }
  };

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        ...style 
      }}
    >
      {/* Placeholder while loading */}
      {!isLoaded && placeholder && (
        <div 
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#999'
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Main image with WebP support */}
      {isInView && (
        <picture>
          <source srcSet={optimizedSrcs.webp} type="image/webp" />
          <source srcSet={optimizedSrcs.fallback} type="image/jpeg" />
          <img
            src={optimizedSrcs.fallback}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            {...props}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;