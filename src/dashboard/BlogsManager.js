"use client"

import { useState, useMemo } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import ViewFilter from "../components/ViewFilter"
import BlogImageUpload from "../components/BlogImageUpload"
import "./BlogsManager.css"

const BlogsManager = () => {
  const { blogs, addBlog, updateBlog, deleteBlog } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [viewMode, setViewMode] = useState("detail") // 'list' or 'detail'
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    status: "published",
    image: "",
  })

  // Extract unique categories from blogs
  const categories = useMemo(() => {
    const cats = [...new Set(blogs.map(blog => blog.category).filter(Boolean))]
    return cats.sort()
  }, [blogs])

  // Filter and sort blogs based on search term and category
  const filteredBlogs = useMemo(() => {
    const filtered = blogs.filter(blog => {
      const matchesSearch = !searchTerm || 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesCategory = !selectedCategory || blog.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    
    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || a.publishedAt || a.date || 0)
      const dateB = new Date(b.createdAt || b.updatedAt || b.publishedAt || b.date || 0)
      return dateB - dateA
    })
  }, [blogs, searchTerm, selectedCategory])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (file) => {
    // Clean up previous blob URL to prevent memory leaks
    if (selectedImage && formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image)
    }
    
    setSelectedImage(file)
    if (file) {
      // Create a temporary URL for the image to store in formData
      const imageUrl = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        image: imageUrl,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        image: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const blogData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    // Remove the blob URL from blogData since we'll pass the file separately
    if (selectedImage) {
      // Don't include the blob URL in the data sent to server
      delete blogData.image
    }

    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, blogData, selectedImage)
      } else {
        await addBlog(blogData, selectedImage)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Error saving blog. Please try again.')
    }
  }

  const resetForm = () => {
    // Clean up blob URL to prevent memory leaks
    if (formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image)
    }
    
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
      status: "published",
      image: "",
    })
    setSelectedImage(null)
    setShowForm(false)
    setEditingBlog(null)
  }

  const handleEdit = (blog) => {
    setFormData({
      ...blog,
      tags: blog.tags ? blog.tags.join(", ") : "",
    })
    setEditingBlog(blog)
    setSelectedImage(null) // Reset selected image when editing
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog(id)
    }
  }

  // List view component
  const BlogListView = ({ blog }) => (
    <div className="blog-list-item">
      <div className="blog-list-image">
        <img src={getImageUrl(blog.image) || "/placeholder.svg"} alt={blog.title} />
      </div>
      <div className="blog-list-content">
        <div className="blog-list-main">
          <h3>{blog.title}</h3>
          <p className="blog-meta">By {blog.author} • {blog.category}</p>
          <p className="blog-excerpt">{blog.excerpt}</p>
          <div className="blog-tags">
            {blog.tags &&
              blog.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            {blog.tags && blog.tags.length > 3 && (
              <span className="tag-more">+{blog.tags.length - 3}</span>
            )}
          </div>
        </div>
        <div className="blog-list-sidebar">
          <span className={`status ${blog.status}`}>{blog.status}</span>
          <div className="blog-actions">
            <button onClick={() => handleEdit(blog)} className="edit-btn">Edit</button>
            <button onClick={() => handleDelete(blog.id)} className="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )

  // Detail view component (existing card view)
  const BlogDetailView = ({ blog }) => (
    <div className="blog-card">
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
  )

  return (
    <div className="blogs-manager">
      <div className="manager-header">
        <h1>Blogs Manager</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">
          Add New Blog
        </button>
      </div>

      <ViewFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalItems={filteredBlogs.length}
        itemType="Blogs"
      />

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
                <BlogImageUpload
                  selectedImage={selectedImage}
                  onImageChange={handleImageChange}
                  existingImageUrl={editingBlog ? formData.image : null}
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

      <div className={`blogs-container ${viewMode}`}>
        {viewMode === 'list' ? (
          <div className="blogs-list">
            {filteredBlogs.map((blog) => (
              <BlogListView key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="blogs-grid">
            {filteredBlogs.map((blog) => (
              <BlogDetailView key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {filteredBlogs.length === 0 && blogs.length > 0 && (
        <div className="empty-state">
          <h3>No blogs found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button onClick={() => {
            setSearchTerm("")
            setSelectedCategory("")
          }} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      )}

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
