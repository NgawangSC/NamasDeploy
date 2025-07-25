import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';
import './ImageUploadWithCrop.css';

const ImageUploadWithCrop = ({ 
  multiple = false,
  onImagesReady,
  onImageReady,
  aspectRatio = null, // null means free crop, or specify like 16/9, 1, etc.
  maxFiles = 10,
  accept = "image/*",
  label = "Images",
  helperText = "Select images to upload"
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [currentCropFile, setCurrentCropFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (!multiple && imageFiles.length > 1) {
      alert('Please select only one image');
      return;
    }
    
    if (multiple && imageFiles.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      processed: false
    }));

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    } else {
      setSelectedFiles(newFiles);
      setProcessedFiles([]);
    }

    // Auto-start cropping for the first file
    if (newFiles.length > 0) {
      setCurrentCropFile(newFiles[0]);
    }
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

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    setProcessedFiles(prev => prev.filter(f => f.originalId !== fileId));
  };

  const startCropping = (fileObj) => {
    setCurrentCropFile(fileObj);
  };

  const handleCropComplete = (croppedFile) => {
    if (!currentCropFile) return;

    const processedFile = {
      file: croppedFile,
      preview: URL.createObjectURL(croppedFile),
      id: Math.random().toString(36).substr(2, 9),
      originalId: currentCropFile.id,
      originalName: currentCropFile.file.name
    };

    // Update processed files
    setProcessedFiles(prev => {
      const filtered = prev.filter(f => f.originalId !== currentCropFile.id);
      return [...filtered, processedFile];
    });

    // Mark original file as processed
    setSelectedFiles(prev => prev.map(f => 
      f.id === currentCropFile.id ? { ...f, processed: true } : f
    ));

    setCurrentCropFile(null);

    // Notify parent component
    if (multiple) {
      const allProcessed = [...processedFiles, processedFile];
      onImagesReady && onImagesReady(allProcessed.map(f => f.file));
    } else {
      onImageReady && onImageReady(croppedFile);
    }
  };

  const handleCropCancel = () => {
    setCurrentCropFile(null);
  };

  const getNextUnprocessedFile = () => {
    return selectedFiles.find(f => !f.processed);
  };

  const openNextCrop = () => {
    const nextFile = getNextUnprocessedFile();
    if (nextFile) {
      setCurrentCropFile(nextFile);
    }
  };

  const allFilesProcessed = selectedFiles.length > 0 && selectedFiles.every(f => f.processed);
  const hasUnprocessedFiles = selectedFiles.some(f => !f.processed);

  return (
    <div className="image-upload-with-crop">
      <div className="form-group">
        <label>{label}</label>
        
        {/* Upload Area */}
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${selectedFiles.length > 0 ? 'has-files' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 14L12 11L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Click to select {multiple ? 'images' : 'an image'} or drag and drop</p>
            <span>{helperText} • {multiple ? `Maximum ${maxFiles} images` : 'Single image'} • JPEG, PNG, GIF, WebP</span>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <div className="files-header">
              <h4>Selected Files ({selectedFiles.length})</h4>
              {hasUnprocessedFiles && (
                <span className="crop-status">
                  {processedFiles.length} of {selectedFiles.length} cropped
                </span>
              )}
            </div>
            
            <div className="files-grid">
              {selectedFiles.map((fileObj) => {
                const isProcessed = fileObj.processed;
                const processedFile = processedFiles.find(p => p.originalId === fileObj.id);
                
                return (
                  <div key={fileObj.id} className={`file-preview ${isProcessed ? 'processed' : 'pending'}`}>
                    <div className="image-container">
                      <img 
                        src={isProcessed && processedFile ? processedFile.preview : fileObj.preview} 
                        alt={fileObj.file.name} 
                      />
                      <div className="image-overlay">
                        {!isProcessed && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startCropping(fileObj);
                            }}
                            className="crop-btn"
                          >
                            Crop
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(fileObj.id);
                          }}
                          className="remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="file-info">
                      <span className="file-name">{fileObj.file.name}</span>
                      <span className={`file-status ${isProcessed ? 'cropped' : 'pending'}`}>
                        {isProcessed ? '✓ Cropped' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Crop Actions */}
            {hasUnprocessedFiles && (
              <div className="crop-actions">
                <button 
                  type="button" 
                  onClick={openNextCrop}
                  className="btn-primary"
                >
                  Crop Next Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {allFilesProcessed && selectedFiles.length > 0 && (
          <div className="success-message">
            ✓ All images cropped and ready!
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {currentCropFile && (
        <ImageCropper
          imageFile={currentCropFile.file}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
};

export default ImageUploadWithCrop;