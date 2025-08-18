import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const SimpleImageCropper = ({ imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 45,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      console.log('SimpleImageCropper: Loading file:', imageFile.name);
      const reader = new FileReader();
      reader.onload = () => {
        console.log('SimpleImageCropper: File loaded, setting src');
        setImgSrc(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

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
    const minQualitySize = 600; // Minimum size for simple cropper
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
      const originalType = imageFile?.type || 'image/jpeg';
      let quality;
      
      if (originalType === 'image/png' || originalType === 'image/webp') {
        quality = undefined;
      } else {
        quality = 1.0;
      }
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, originalType, quality);
    });
  }, [imageFile]);

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      console.log('SimpleImageCropper: No crop or image ref available');
      return;
    }
    
    try {
      console.log('SimpleImageCropper: Processing crop...');
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      if (croppedImageBlob) {
        const originalType = imageFile?.type || 'image/jpeg';
        const extension = originalType.split('/')[1] || 'jpg';
        const croppedFile = new File([croppedImageBlob], `cropped-${imageFile.name}`, {
          type: originalType
        });
        
        console.log('SimpleImageCropper: Crop completed successfully');
        onCropComplete(croppedFile);
      }
    } catch (error) {
      console.error('SimpleImageCropper: Error cropping image:', error);
      // Fallback to original file if cropping fails
      onCropComplete(imageFile);
    }
  };

  if (!imgSrc) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white'
      }}>
        Loading image...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3>Crop Image</h3>
        
        <ReactCrop
          crop={crop}
          onChange={(c, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={16/9}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Crop preview"
            style={{ maxWidth: '100%', maxHeight: '60vh' }}
          />
        </ReactCrop>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#gray',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCropComplete}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
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

export default SimpleImageCropper;