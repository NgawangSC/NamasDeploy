import React, { useState, useRef } from 'react';
import './ProjectImageUpload.css';

const ProjectImageUpload = ({ 
  selectedImages, 
  onImagesChange, 
  maxFiles = 10,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + selectedImages.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file sizes
    const invalidFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert('Some files are larger than 10MB and will be skipped');
    }

    const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);
    onImagesChange([...selectedImages, ...validFiles]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
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
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`project-image-upload ${className}`}>
      <label className="upload-label">Project Images</label>
      
      {selectedImages.length > 0 && (
        <div className="selected-images">
          <h4>Selected Images ({selectedImages.length})</h4>
          <div className="images-grid">
            {selectedImages.map((file, index) => (
              <div key={index} className="image-preview">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`}
                  onLoad={(e) => {
                    // Clean up the object URL after the image loads
                    URL.revokeObjectURL(e.target.src);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image-btn"
                >
                  ×
                </button>
                <div className="image-info">
                  <span className="image-name">{file.name}</span>
                  <span className="image-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          multiple
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
          <p>Click to select images or drag and drop</p>
          <span className="upload-hint">
            {selectedImages.length > 0 ? 
              `Add more images (${selectedImages.length}/${maxFiles})` : 
              `Select up to ${maxFiles} images`
            } • JPEG, PNG, GIF, WebP • Max 10MB each
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectImageUpload;