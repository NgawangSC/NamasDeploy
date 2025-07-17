import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ 
  projectId, 
  onImagesUploaded, 
  existingImages = [], 
  isEditing = false,
  maxFiles = 10 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
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

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadImages = async () => {
    if (!selectedFiles.length || !projectId) return;

    setUploading(true);
    try {
      const files = selectedFiles.map(f => f.file);
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/images`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          files.forEach(file => {
            formData.append('images', file);
          });
          return formData;
        })(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Clean up previews
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);
      
      // Notify parent component
      if (onImagesUploaded) {
        onImagesUploaded(data.newImages, data.project);
      }
      
      alert(`${data.newImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <div className="form-group">
        <label>Project Images</label>
        
        {/* Existing Images Display */}
        {existingImages.length > 0 && (
          <div className="existing-images">
            <h4>Current Images ({existingImages.length})</h4>
            <div className="image-grid">
              {existingImages.map((image, index) => (
                <div key={index} className="image-preview existing">
                  <img src={image} alt={`Project image ${index + 1}`} />
                  <span className="image-label">Current</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.828 14.828L21 21M16.5 10.5C16.5 13.8137 13.8137 16.5 10.5 16.5C7.18629 16.5 4.5 13.8137 4.5 10.5C4.5 7.18629 7.18629 4.5 10.5 4.5C13.8137 4.5 16.5 7.18629 16.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12M12 12V8M12 12L9 9M12 12L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Click to select images or drag and drop</p>
            <span>Maximum {maxFiles} images, JPEG, PNG, GIF, WebP</span>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="selected-images">
            <h4>Selected Images ({selectedFiles.length})</h4>
            <div className="image-grid">
              {selectedFiles.map((fileObj) => (
                <div key={fileObj.id} className="image-preview">
                  <img src={fileObj.preview} alt={fileObj.file.name} />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileObj.id);
                    }}
                    className="remove-image"
                  >
                    ×
                  </button>
                  <span className="image-label">{fileObj.file.name}</span>
                </div>
              ))}
            </div>
            
            {/* Upload Button */}
            {isEditing && projectId && (
              <div className="upload-actions">
                <button 
                  type="button"
                  onClick={uploadImages}
                  disabled={uploading || !selectedFiles.length}
                  className="upload-btn"
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;