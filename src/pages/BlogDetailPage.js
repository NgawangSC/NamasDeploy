"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./BlogDetailPage.css"

const BlogDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const { blogs, fetchBlogs } = useData()

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true)
        
        // If blogs are not loaded yet, fetch them
        if (blogs.length === 0) {
          await fetchBlogs()
        }
        
        // Find the blog by ID from the context
        const foundBlog = blogs.find((b) => b.id === Number.parseInt(id))
        setBlog(foundBlog)
      } catch (error) {
        console.error('Error loading blog:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBlog()
  }, [id, blogs, fetchBlogs])

  const handleBackClick = () => {
    navigate("/blog")
  }

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-loading">Loading blog post...</div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-not-found">
            <h2>Blog post not found</h2>
            <p>The blog post you're looking for doesn't exist or may have been removed.</p>
            <button className="back-button" onClick={handleBackClick}>
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <button className="back-button" onClick={handleBackClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Blog
        </button>

        <article className="blog-detail-article">
          <header className="blog-detail-header">
            <div className="blog-meta">
              <span className="blog-category-tag">{blog.category}</span>
              <span className="blog-read-time">{blog.readTime || "5 min read"}</span>
            </div>
            <h1 className="blog-detail-title">{blog.title}</h1>
            <div className="blog-author-info">
              <span className="blog-author">By {blog.author}</span>
              <span className="blog-date">{blog.date}</span>
            </div>
          </header>

          <div className="blog-hero-image">
            <img 
              src={getImageUrl(blog.image) || "/placeholder.svg"} 
              alt={blog.title}
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=400&width=800&text=No+Image"
              }}
            />
          </div>

          <div className="blog-detail-content">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          {blog.images && blog.images.length > 0 && (
            <div className="blog-images-gallery">
              <h3>Project Images</h3>
              <div className="blog-images-grid">
                {blog.images.map((image, index) => (
                  <div key={index} className="blog-image-item">
                    <img 
                      src={getImageUrl(image) || "/placeholder.svg"} 
                      alt={`${blog.title} - Image ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}

export default BlogDetailPage
