"use client"

import { useState } from "react"
import { useData } from "../contexts/DataContext"
import "./MediaManager.css"

const MediaManager = () => {
  const { data, addMedia, deleteMedia } = useData()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadData, setUploadData] = useState({
    name: "",
    files: []
  })
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUploadData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setUploadData((prev) => ({
      ...prev,
      files: files
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (uploadData.files.length === 0) {
      alert("Please select at least one image to upload")
      return
    }

    setUploading(true)

    try {
      // Upload files to server
      const formData = new FormData()
      uploadData.files.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      // Add each uploaded image to the media collection
      if (result.success && result.data) {
        result.data.forEach((imagePath, index) => {
          const fileName = uploadData.files[index]?.name || `Image ${index + 1}`
          addMedia({
            name: uploadData.name || fileName,
            url: imagePath
          })
        })
      }

      setUploadData({
        name: "",
        files: []
      })
      setShowUploadForm(false)
      alert(`Successfully uploaded ${uploadData.files.length} image(s)!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading images: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteMedia(id)
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    alert("Image URL copied to clipboard!")
  }

  return (
    <div className="media-manager">
      <div className="manager-header">
        <h1>Media Manager</h1>
        <button onClick={() => setShowUploadForm(true)} className="add-btn">
          Upload Images
        </button>
      </div>

      {showUploadForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>Upload Images</h2>
              <button onClick={() => setShowUploadForm(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Image Name Prefix (optional)</label>
                <input
                  type="text"
                  name="name"
                  value={uploadData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name prefix for images"
                />
                <small>If provided, images will be named with this prefix. Otherwise, original filenames will be used.</small>
              </div>

              <div className="form-group">
                <label>Select Images *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  required
                />
                <small>You can select multiple images at once. Supported formats: JPG, PNG, GIF, WebP</small>
                {uploadData.files.length > 0 && (
                  <div className="selected-files">
                    <p>Selected files ({uploadData.files.length}):</p>
                    <ul>
                      {uploadData.files.map((file, index) => (
                        <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowUploadForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="images-grid">
        {data?.media?.map((image) => (
          <div key={image.id} className="image-card">
            <div className="image-preview">
              <img src={image.url || "/placeholder.svg"} alt={image.name} />
            </div>
            <div className="image-info">
              <h4>{image.name}</h4>
              <p className="image-url">{image.url}</p>
              <div className="image-actions">
                <button onClick={() => copyToClipboard(image.url)} className="copy-btn">
                  Copy URL
                </button>
                <button onClick={() => handleDelete(image.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!data?.media || data.media.length === 0) && (
        <div className="empty-state">
          <h3>No images yet</h3>
          <p>Upload your first images to get started</p>
          <button onClick={() => setShowUploadForm(true)} className="add-btn">
            Upload Images
          </button>
        </div>
      )}
    </div>
  )
}

export default MediaManager