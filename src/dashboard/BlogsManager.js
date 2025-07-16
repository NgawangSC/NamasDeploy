"use client"

import { useState } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./BlogsManager.css"

const BlogsManager = () => {
  const { blogs, addBlog, updateBlog, deleteBlog } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    status: "draft",
    image: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const blogData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    if (editingBlog) {
      updateBlog(editingBlog.id, blogData)
    } else {
      addBlog(blogData)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
      status: "draft",
      image: "",
    })
    setShowForm(false)
    setEditingBlog(null)
  }

  const handleEdit = (blog) => {
    setFormData({
      ...blog,
      tags: blog.tags ? blog.tags.join(", ") : "",
    })
    setEditingBlog(blog)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog(id)
    }
  }

  return (
    <div className="blogs-manager">
      <div className="manager-header">
        <h1>Blogs Manager</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">
          Add New Blog
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingBlog ? "Edit Blog" : "Add New Blog"}</h2>
              <button onClick={resetForm} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Design">Design</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Technology">Technology</option>
                    <option value="Culture">Culture</option>
                    <option value="News">News</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="architecture, design, sustainability"
                />
              </div>

              <div className="form-group">
                <label>Featured Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Brief description of the blog post"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea name="content" value={formData.content} onChange={handleInputChange} rows="10" required />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingBlog ? "Update Blog" : "Add Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="blogs-grid">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className="blog-image">
              <img src={getImageUrl(blog.image) || "/placeholder.svg?height=200&width=300&text=No+Image"} alt={blog.title} />
            </div>
            <div className="blog-info">
              <h3>{blog.title}</h3>
              <p className="blog-meta">
                By {blog.author} • {blog.category}
              </p>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-tags">
                {blog.tags &&
                  blog.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
              </div>
              <div className="blog-status">
                <span className={`status ${blog.status}`}>{blog.status}</span>
              </div>
              <div className="blog-actions">
                <button onClick={() => handleEdit(blog)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(blog.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="empty-state">
          <h3>No blog posts yet</h3>
          <p>Write your first blog post to get started</p>
          <button onClick={() => setShowForm(true)} className="add-btn">
            Add Blog
          </button>
        </div>
      )}
    </div>
  )
}

export default BlogsManager
