import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

const ImageCropper = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatio = null,
  circularCrop = false,
  minWidth = 100,
  minHeight = 100,
  originalFile = null
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Set initial crop area based on image dimensions
    const cropPercentage = Math.min(width, height) * 0.8;
    const x = (width - cropPercentage) / 2;
    const y = (height - cropPercentage) / 2;
    
    const newCrop = {
      unit: 'px',
      width: cropPercentage,
      height: cropPercentage,
      x: x,
      y: y
    };
    
    setCrop(newCrop);
  }, []);

  const getCroppedImg = useCallback((image, crop) => {
    const canvas = canvasRef.current;
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
    // Use the larger of crop dimensions or minimum quality threshold
    const minQualitySize = 800; // Minimum size to maintain quality
    const outputWidth = Math.max(cropWidth, minQualitySize);
    const outputHeight = Math.max(cropHeight, minQualitySize);
    
    // If crop is smaller than minimum, scale proportionally
    const scale = Math.min(outputWidth / cropWidth, outputHeight / cropHeight);
    const finalWidth = cropWidth * scale;
    const finalHeight = cropHeight * scale;

    // Set canvas dimensions accounting for pixel ratio
    canvas.width = finalWidth * pixelRatio;
    canvas.height = finalHeight * pixelRatio;
    
    // Scale the canvas back down using CSS
    canvas.style.width = finalWidth + 'px';
    canvas.style.height = finalHeight + 'px';
    
    // Scale the context to account for device pixel ratio
    ctx.scale(pixelRatio, pixelRatio);
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cropped portion with high quality scaling
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
      // Preserve original format and use highest quality
      const originalType = originalFile?.type || 'image/jpeg';
      let quality;
      
      if (originalType === 'image/png' || originalType === 'image/webp') {
        quality = undefined; // PNG and WebP use lossless compression
      } else {
        quality = 1.0; // Maximum quality for JPEG
      }
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, originalType, quality);
    });
  }, [originalFile]);

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      if (croppedImageBlob) {
        // Create a File object from the blob, preserving original format
        const originalType = originalFile?.type || 'image/jpeg';
        const extension = originalType.split('/')[1] || 'jpg';
        const croppedFile = new File([croppedImageBlob], `cropped-image.${extension}`, {
          type: originalType
        });
        
        onCropComplete(croppedFile, URL.createObjectURL(croppedImageBlob));
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image. Please try again.');
    }
  };

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-container">
        <div className="cropper-header">
          <h3>Crop Your Image</h3>
          <button 
            className="close-btn" 
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="cropper-content">
          <div className="crop-area">
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentAspectRatio}
              circularCrop={circularCrop}
              minWidth={minWidth}
              minHeight={minHeight}
              keepSelection={true}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
            </ReactCrop>
          </div>
          
          <div className="crop-controls">
            <div className="aspect-ratio-buttons">
              <button
                type="button"
                className={`aspect-btn ${currentAspectRatio === null || currentAspectRatio === undefined ? 'active' : ''}`}
                onClick={() => setCurrentAspectRatio(undefined)}
              >
                Free
              </button>
              <button
                type="button"
                className={`aspect-btn ${currentAspectRatio === 1 ? 'active' : ''}`}
                onClick={() => setCurrentAspectRatio(1)}
              >
                Square
              </button>
              <button
                type="button"
                className={`aspect-btn ${currentAspectRatio === 16/9 ? 'active' : ''}`}
                onClick={() => setCurrentAspectRatio(16/9)}
              >
                16:9
              </button>
              <button
                type="button"
                className={`aspect-btn ${currentAspectRatio === 4/3 ? 'active' : ''}`}
                onClick={() => setCurrentAspectRatio(4/3)}
              >
                4:3
              </button>
              <button
                type="button"
                className={`aspect-btn ${currentAspectRatio === 3/2 ? 'active' : ''}`}
                onClick={() => setCurrentAspectRatio(3/2)}
              >
                3:2
              </button>
            </div>
          </div>
        </div>
        
        <div className="cropper-actions">
          <button 
            type="button"
            className="cancel-btn" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="crop-btn" 
            onClick={handleCropComplete}
            disabled={!completedCrop}
          >
            Apply Crop
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropper;