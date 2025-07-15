"use client"

import { useState } from "react"
import { useData } from "../contexts/DataContext"
import "./MediaManager.css"

const MediaManager = () => {
  const { images, addImage, deleteImage } = useData()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadData, setUploadData] = useState({
    url: "",
    name: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUploadData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    addImage(uploadData)

    setUploadData({
      url: "",
      name: "",
    })
    setShowUploadForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteImage(id)
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
          Add Image
        </button>
      </div>

      {showUploadForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>Add New Image</h2>
              <button onClick={() => setShowUploadForm(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Image Name *</label>
                <input
                  type="text"
                  name="name"
                  value={uploadData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter image name"
                />
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="url"
                  value={uploadData.url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowUploadForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="images-grid">
        {images.map((image) => (
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

      {images.length === 0 && (
        <div className="empty-state">
          <h3>No images yet</h3>
          <p>Add your first image to get started</p>
          <button onClick={() => setShowUploadForm(true)} className="add-btn">
            Add Image
          </button>
        </div>
      )}
    </div>
  )
}

export default MediaManager
