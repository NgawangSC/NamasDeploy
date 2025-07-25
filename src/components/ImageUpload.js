import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

const ImageCropper = ({ 
  imageFile, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 16 / 9, // Default aspect ratio
  minWidth = 150,
  minHeight = 150
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Convert file to image URL
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Set initial crop to center of image
    const centerX = 5;
    const centerY = 5;
    const cropWidth = 90;
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : 90;
    
    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: centerX,
      y: centerY,
    });
  }, [aspectRatio]);

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await generateCroppedImage();
      if (croppedImageBlob) {
        // Create a new File object from the blob
        const croppedFile = new File([croppedImageBlob], imageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
      }
    } catch (error) {
      console.error('Error generating cropped image:', error);
    }
  };

  if (!imgSrc) {
    return (
      <div className="image-cropper-loading">
        <p>Loading image...</p>
      </div>
    );
  }

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-overlay" onClick={onCancel} />
      <div className="image-cropper-container">
        <div className="image-cropper-header">
          <h3>Crop Image</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="image-cropper-content">
          <div className="crop-area">
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={minWidth}
              minHeight={minHeight}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
              />
            </ReactCrop>
          </div>
          
          {/* Hidden canvas for generating cropped image */}
          <canvas
            ref={previewCanvasRef}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="image-cropper-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleCropComplete}
            disabled={!completedCrop}
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;