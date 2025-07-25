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
  minHeight = 100
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState(null);
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

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      if (croppedImageBlob) {
        // Create a File object from the blob
        const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', {
          type: 'image/jpeg'
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
              aspect={aspectRatio}
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
                className={`aspect-btn ${aspectRatio === null ? 'active' : ''}`}
                onClick={() => setCrop({ ...crop, aspect: undefined })}
              >
                Free
              </button>
              <button
                type="button"
                className={`aspect-btn ${aspectRatio === 1 ? 'active' : ''}`}
                onClick={() => setCrop({ ...crop, aspect: 1 })}
              >
                Square
              </button>
              <button
                type="button"
                className={`aspect-btn ${aspectRatio === 16/9 ? 'active' : ''}`}
                onClick={() => setCrop({ ...crop, aspect: 16/9 })}
              >
                16:9
              </button>
              <button
                type="button"
                className={`aspect-btn ${aspectRatio === 4/3 ? 'active' : ''}`}
                onClick={() => setCrop({ ...crop, aspect: 4/3 })}
              >
                4:3
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