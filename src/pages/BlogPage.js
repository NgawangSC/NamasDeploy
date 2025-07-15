"use client"

import { useNavigate } from "react-router-dom"
import "./BlogPage.css"

const BlogPage = () => {
  const navigate = useNavigate()

  const blogPosts = [
    {
      id: 1,
      title: "Sustainable Architecture in Bhutan",
      excerpt:
        "Exploring traditional building techniques and modern sustainable practices in contemporary Bhutanese architecture.",
      date: "March 15, 2024",
      category: "Sustainability",
      image: "/images/project1.png",
    },
    {
      id: 2,
      title: "The Future of Traditional Design",
      excerpt: "How we blend traditional Bhutanese architectural elements with modern functionality and aesthetics.",
      date: "March 10, 2024",
      category: "Design",
      image: "/images/project2.png",
    },
    {
      id: 3,
      title: "Cultural Heritage Preservation",
      excerpt:
        "Our approach to preserving and celebrating Bhutanese cultural heritage through thoughtful architectural design.",
      date: "March 5, 2024",
      category: "Heritage",
      image: "/images/project3.png",
    },
    {
      id: 4,
      title: "Modern Materials, Traditional Forms",
      excerpt:
        "Innovative use of contemporary materials while maintaining the essence of traditional Bhutanese architecture.",
      date: "February 28, 2024",
      category: "Innovation",
      image: "/images/project4.png",
    },
    {
      id: 5,
      title: "Community-Centered Design",
      excerpt: "Creating spaces that foster community interaction and reflect the values of Bhutanese society.",
      date: "February 20, 2024",
      category: "Community",
      image: "/images/project5.png",
    },
    {
      id: 6,
      title: "Climate-Responsive Architecture",
      excerpt: "Designing buildings that respond to Bhutan's unique climate and environmental conditions.",
      date: "February 15, 2024",
      category: "Environment",
      image: "/images/project6.png",
    },
  ]

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
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} />
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
        </div>
      </section>
    </div>
  )
}

export default BlogPage
