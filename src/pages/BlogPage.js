"use client"

import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./BlogPage.css"

const BlogPage = () => {
  const navigate = useNavigate()
  const { blogs, fetchBlogs, loading } = useData()

  // Fetch blogs when component mounts
  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const heroStyle = {
    backgroundImage: `url("/images/about-hero-bg.jpg")`,
  }

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`)
  }

  return (
    <div className="blog-page">
      {/* Hero Banner */}
      <section className="blog-hero" style={heroStyle}>
        <div className="blog-hero-content">
          <h1>Our Blog</h1>
          <p>Insights, stories, and perspectives on architecture, design, and culture in Bhutan</p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="blog-content">
        <div className="container">
          {loading.blogs ? (
            <div className="loading-state">
              <p>Loading blog posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <h3>No blog posts available</h3>
              <p>Check back soon for new content!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {blogs
                .filter(blog => blog.status === 'published') // Only show published blogs
                .map((post) => (
                  <article key={post.id} className="blog-card">
                    <div className="blog-card-image">
                      <img 
                        src={getImageUrl(post.image) || "/placeholder.svg"} 
                        alt={post.title}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=300&text=No+Image"
                        }}
                      />
                      <div className="blog-category">{post.category}</div>
                    </div>
                    <div className="blog-card-content">
                      <div className="blog-date">{post.date}</div>
                      <h3 className="blog-title">{post.title}</h3>
                      <p className="blog-excerpt">{post.excerpt}</p>
                      <button className="read-more-btn" onClick={() => handleReadMore(post.id)}>
                        Read More
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BlogPage
