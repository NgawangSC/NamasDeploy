import React, { useState, useRef } from 'react';
import SimpleImageCropper from './SimpleImageCropper';

const SimpleImageUploadWithCrop = ({ 
  multiple = false,
  onImagesReady,
  onImageReady,
  label = "Images"
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedFiles, setCroppedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setShowCropper(true);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const handleCropComplete = (croppedFile) => {
    setShowCropper(false);
    
    if (multiple) {
      const newCroppedFiles = [...croppedFiles, croppedFile];
      setCroppedFiles(newCroppedFiles);
      onImagesReady && onImagesReady(newCroppedFiles);
    } else {
      setCroppedFiles([croppedFile]);
      onImageReady && onImageReady(croppedFile);
    }
    
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeCroppedFile = (index) => {
    const newFiles = croppedFiles.filter((_, i) => i !== index);
    setCroppedFiles(newFiles);
    if (multiple) {
      onImagesReady && onImagesReady(newFiles);
    } else if (newFiles.length === 0) {
      onImageReady && onImageReady(null);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ 
          display: 'block', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          {label}
        </label>
      </div>
      
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          type="button"
          onClick={openFileDialog}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {multiple ? 'Add Images' : 'Select Image'}
        </button>
      </div>

      {/* Show cropped files */}
      {croppedFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
            {multiple ? `Selected Images (${croppedFiles.length})` : 'Selected Image'}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '0.5rem' 
          }}>
            {croppedFiles.map((file, index) => (
              <div key={index} style={{ 
                position: 'relative',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img 
                  src={URL.createObjectURL(file)}
                  alt={`Cropped ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100px', 
                    objectFit: 'cover' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeCroppedFile(index)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && selectedFile && (
        <SimpleImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default SimpleImageUploadWithCrop;