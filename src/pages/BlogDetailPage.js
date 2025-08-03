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
    const ensureBlogsLoaded = async () => {
      if (blogs.length === 0) {
        try {
          await fetchBlogs()
        } catch (error) {
          console.error("Error fetching blogs:", error)
        }
      }
    }
    ensureBlogsLoaded()
  }, [fetchBlogs, blogs.length])

  useEffect(() => {
    if (blogs.length > 0) {
      const foundBlog = blogs.find((b) => b.id === Number(id))
      setBlog(foundBlog || null)
      setLoading(false)
    }
  }, [blogs, id])

  const handleBackClick = () => {
    navigate("/blog")
  }

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-loading">Loading blog post...</div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-not-found">
            <h2>Blog post not found</h2>
            <p>The blog post you're looking for doesn't exist or may have been removed.</p>
            <button onClick={handleBackClick} className="back-button">Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <article className="blog-detail-article">
          <header className="blog-detail-header">
            <div className="blog-detail-meta">
              <span className="blog-detail-category-tag">{blog.category}</span>
              <span className="blog-detail-read-time">{blog.readTime || "5 min read"}</span>
            </div>
            <h1 className="blog-detail-title">{blog.title}</h1>
            <div className="blog-detail-author-info">
              <span className="blog-detail-author">By {blog.author}</span>
              <span className="blog-detail-date">{blog.date}</span>
            </div>
          </header>

          <div className="blog-detail-hero-image">
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
            <div className="blog-detail-images-gallery">
              <h3>Project Images</h3>
              <div className="blog-detail-images-grid">
                {blog.images.map((image, index) => (
                  <div key={index} className="blog-detail-image-item">
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
