import React, { useState, useRef } from 'react';
import './BlogImageUpload.css';

const BlogImageUpload = ({ 
  selectedImage, 
  onImageChange, 
  existingImageUrl = null,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Set preview when selectedImage changes
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedImage]);

  const handleFiles = (files) => {
    const file = files[0]; // Only take the first file for blog featured image
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    onImageChange(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || existingImageUrl;

  return (
    <div className={`blog-image-upload ${className}`}>
      <label className="upload-label">Featured Image</label>
      
      {displayImage ? (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={displayImage} alt="Blog featured image" />
            <div className="image-overlay">
              <button 
                type="button"
                onClick={openFileDialog}
                className="change-image-btn"
              >
                Change Image
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="remove-image-btn"
              >
                Remove
              </button>
            </div>
          </div>
          {selectedImage && (
            <div className="image-info">
              <span className="image-name">{selectedImage.name}</span>
              <span className="image-size">
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>Click to select an image or drag and drop</p>
            <span className="upload-hint">JPEG, PNG, GIF, WebP • Max 10MB</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogImageUpload;