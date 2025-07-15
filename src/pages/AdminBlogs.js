"use client"

import { useState } from "react"
import { useBlogs, useBlogOperations } from "../hooks/useApi"
import "./AdminBlogs.css"

const AdminBlogs = () => {
  const { data: blogs, loading, error, refetch } = useBlogs()
  const { createBlog, updateBlog, deleteBlog, loading: operationLoading } = useBlogOperations()

  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "NAMAS Team",
    category: "",
    tags: "",
    excerpt: "",
    status: "published",
  })
  const [selectedImage, setSelectedImage] = useState(null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, formData, selectedImage)
      } else {
        await createBlog(formData, selectedImage)
      }

      // Reset form
      setFormData({
        title: "",
        content: "",
        author: "NAMAS Team",
        category: "",
        tags: "",
        excerpt: "",
        status: "published",
      })
      setSelectedImage(null)
      setShowForm(false)
      setEditingBlog(null)
      refetch()
    } catch (error) {
      console.error("Error saving blog:", error)
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author || "NAMAS Team",
      category: blog.category || "",
      tags: blog.tags || "",
      excerpt: blog.excerpt || "",
      status: blog.status || "published",
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog(id)
        refetch()
      } catch (error) {
        console.error("Error deleting blog:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      author: "NAMAS Team",
      category: "",
      tags: "",
      excerpt: "",
      status: "published",
    })
    setSelectedImage(null)
    setShowForm(false)
    setEditingBlog(null)
  }

  if (loading) return <div className="admin-loading">Loading blogs...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-blogs">
      <div className="admin-header">
        <h1>Manage Blogs</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)} disabled={operationLoading}>
          Add New Blog
        </button>
      </div>

      {showForm && (
        <div className="blog-form-overlay">
          <div className="blog-form">
            <div className="form-header">
              <h2>{editingBlog ? "Edit Blog Post" : "Add New Blog Post"}</h2>
              <button className="btn-close" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    <option value="Design">Design</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Construction">Construction</option>
                    <option value="News">News</option>
                    <option value="Tips">Tips</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
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
                  placeholder="architecture, design, modern"
                />
              </div>

              <div className="form-group">
                <label>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the blog post..."
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="10"
                  required
                  placeholder="Write your blog content here..."
                />
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {selectedImage && <div className="selected-image">Selected: {selectedImage.name}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={operationLoading}>
                  {operationLoading ? "Saving..." : editingBlog ? "Update Blog" : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="blogs-grid">
        {blogs?.map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className="blog-image">
              <img src={blog.image || "/placeholder.svg"} alt={blog.title} />
            </div>
            <div className="blog-content">
              <h3>{blog.title}</h3>
              <div className="blog-meta">
                <span className="author">{blog.author}</span>
                <span className="category">{blog.category}</span>
                <span className={`status ${blog.status}`}>{blog.status}</span>
              </div>
              <p>{blog.excerpt}</p>
              <div className="blog-actions">
                <button className="btn-edit" onClick={() => handleEdit(blog)} disabled={operationLoading}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(blog.id)} disabled={operationLoading}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminBlogs
