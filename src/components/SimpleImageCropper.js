import React, { useState, useRef, useEffect } from 'react';
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
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);

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

  const handleCropComplete = () => {
    if (!imgRef.current) return;
    
    // For now, just return the original file
    console.log('SimpleImageCropper: Crop completed');
    onCropComplete(imageFile);
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
    </div>
  );
};

export default SimpleImageCropper;