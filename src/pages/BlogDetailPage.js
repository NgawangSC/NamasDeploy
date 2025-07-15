"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./BlogDetailPage.css"

const BlogDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)

  const blogPosts = [
    {
      id: 1,
      title: "Sustainable Architecture in Bhutan",
      excerpt:
        "Exploring traditional building techniques and modern sustainable practices in contemporary Bhutanese architecture.",
      content: `
        <p>Bhutan's unique approach to architecture has always been deeply rooted in sustainability and harmony with nature. In this comprehensive exploration, we delve into how traditional building techniques are being integrated with modern sustainable practices to create architecture that is both environmentally conscious and culturally authentic.</p>
        
        <p>Traditional Bhutanese architecture has inherently sustainable characteristics that modern architects are now recognizing and incorporating into contemporary designs. The use of local materials, passive solar design principles, and natural ventilation systems have been part of Bhutanese building practices for centuries.</p>
        
        <p>Our recent projects demonstrate how these time-tested principles can be enhanced with modern sustainable technologies. From solar panels integrated seamlessly into traditional roof designs to advanced insulation techniques that maintain the aesthetic integrity of traditional walls, we're pioneering a new era of sustainable architecture in Bhutan.</p>
        
        <p>The future of sustainable architecture in Bhutan lies in this careful balance between honoring our cultural heritage and embracing innovative solutions that address contemporary environmental challenges. Through thoughtful design and careful material selection, we can create buildings that serve both present needs and future generations.</p>
      `,
      date: "March 15, 2024",
      author: "NAMAS Architecture Team",
      category: "Sustainability",
      image: "/images/project1.png",
      images: ["/images/project1.png", "/images/project2.png", "/images/project3.png"],
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "The Future of Traditional Design",
      excerpt: "How we blend traditional Bhutanese architectural elements with modern functionality and aesthetics.",
      content: `
        <p>The evolution of traditional design in contemporary architecture represents one of the most exciting challenges facing architects today. How do we honor centuries-old design principles while meeting the functional requirements of modern living?</p>
        
        <p>In Bhutan, this question takes on particular significance as we strive to maintain our cultural identity while embracing progress. Our approach involves a deep study of traditional architectural elements - from the distinctive sloping roofs to the intricate woodwork that adorns our buildings.</p>
        
        <p>Modern functionality doesn't have to compromise traditional aesthetics. Through innovative engineering solutions and creative design approaches, we've successfully integrated contemporary amenities like modern plumbing, electrical systems, and climate control into buildings that maintain their traditional character.</p>
        
        <p>The key lies in understanding the underlying principles that make traditional design so enduring and finding ways to express these principles through contemporary means. This approach ensures that our architecture remains relevant and functional while preserving the cultural essence that makes Bhutanese architecture unique.</p>
      `,
      date: "March 10, 2024",
      author: "NAMAS Architecture Team",
      category: "Design",
      image: "/images/project2.png",
      images: ["/images/project2.png", "/images/project4.png", "/images/project5.png"],
      readTime: "4 min read",
    },
    {
      id: 3,
      title: "Cultural Heritage Preservation",
      excerpt:
        "Our approach to preserving and celebrating Bhutanese cultural heritage through thoughtful architectural design.",
      content: `
        <p>Cultural heritage preservation in architecture goes beyond simply maintaining old buildings. It involves understanding the cultural significance of architectural elements and finding ways to celebrate and perpetuate these traditions in new construction.</p>
        
        <p>Our approach to heritage preservation is multifaceted. We begin with extensive research into traditional building techniques, materials, and design principles. This research informs every aspect of our design process, from the initial concept to the final construction details.</p>
        
        <p>Working closely with traditional craftsmen and cultural experts, we ensure that our interpretations of traditional elements are authentic and respectful. This collaboration has led to innovative solutions that maintain cultural integrity while meeting contemporary building standards and requirements.</p>
        
        <p>The goal is not to create museum pieces, but to create living, breathing spaces that honor our heritage while serving the needs of modern users. Through this approach, we contribute to the ongoing evolution of Bhutanese architectural tradition.</p>
      `,
      date: "March 5, 2024",
      author: "NAMAS Architecture Team",
      category: "Heritage",
      image: "/images/project3.png",
      images: ["/images/project3.png", "/images/project1.png", "/images/project6.png"],
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "Modern Materials, Traditional Forms",
      excerpt:
        "Innovative use of contemporary materials while maintaining the essence of traditional Bhutanese architecture.",
      content: `
        <p>The integration of modern materials with traditional architectural forms presents both opportunities and challenges. How do we leverage the benefits of contemporary building materials while maintaining the visual and cultural integrity of traditional design?</p>
        
        <p>Our research into modern materials focuses on finding options that can replicate or enhance the performance characteristics of traditional materials while offering improved durability, efficiency, or functionality. This might involve using modern timber treatments that extend the life of wooden elements or incorporating advanced insulation materials that improve energy efficiency.</p>
        
        <p>The key is to ensure that the use of modern materials is invisible to the casual observer while providing tangible benefits to the building's performance and longevity. This requires careful selection and application of materials, as well as innovative construction techniques that hide modern elements behind traditional facades.</p>
        
        <p>Through this approach, we create buildings that look and feel traditional while benefiting from the advantages of modern construction technology. This ensures that our buildings will serve their users well for generations to come while maintaining their cultural significance.</p>
      `,
      date: "February 28, 2024",
      author: "NAMAS Architecture Team",
      category: "Innovation",
      image: "/images/project4.png",
      images: ["/images/project4.png", "/images/project2.png", "/images/project5.png"],
      readTime: "5 min read",
    },
    {
      id: 5,
      title: "Community-Centered Design",
      excerpt: "Creating spaces that foster community interaction and reflect the values of Bhutanese society.",
      content: `
        <p>Architecture has the power to bring people together or drive them apart. In Bhutanese culture, community is central to our way of life, and our architectural designs must reflect and support this fundamental value.</p>
        
        <p>Community-centered design begins with understanding how people interact in traditional Bhutanese settings. From the central courtyards of traditional homes to the communal spaces in monasteries, our architecture has always facilitated social interaction and community building.</p>
        
        <p>In contemporary projects, we incorporate these principles by creating flexible spaces that can accommodate various community activities, designing circulation patterns that encourage chance encounters, and providing outdoor spaces that serve as natural gathering points.</p>
        
        <p>The success of community-centered design is measured not just in aesthetic terms, but in how well the spaces serve their users and contribute to the social fabric of the community. Through careful observation and ongoing dialogue with users, we continuously refine our approach to create spaces that truly serve the community.</p>
      `,
      date: "February 20, 2024",
      author: "NAMAS Architecture Team",
      category: "Community",
      image: "/images/project5.png",
      images: ["/images/project5.png", "/images/project3.png", "/images/project1.png"],
      readTime: "4 min read",
    },
    {
      id: 6,
      title: "Climate-Responsive Architecture",
      excerpt: "Designing buildings that respond to Bhutan's unique climate and environmental conditions.",
      content: `
        <p>Bhutan's diverse climate zones, from subtropical lowlands to alpine highlands, present unique challenges and opportunities for architectural design. Climate-responsive architecture is not just about comfort - it's about creating buildings that work in harmony with their environment.</p>
        
        <p>Traditional Bhutanese architecture has always been climate-responsive, with features like deep overhangs for monsoon protection, thick walls for thermal mass, and strategic window placement for natural ventilation. Our contemporary approach builds on these time-tested strategies.</p>
        
        <p>Modern climate-responsive design involves careful analysis of local weather patterns, solar angles, prevailing winds, and seasonal variations. This data informs decisions about building orientation, window sizing and placement, material selection, and mechanical system design.</p>
        
        <p>The goal is to create buildings that require minimal artificial heating and cooling while maintaining comfortable interior conditions year-round. This approach not only reduces energy consumption but also creates healthier, more comfortable living and working environments for occupants.</p>
      `,
      date: "February 15, 2024",
      author: "NAMAS Architecture Team",
      category: "Environment",
      image: "/images/project6.png",
      images: ["/images/project6.png", "/images/project4.png", "/images/project2.png"],
      readTime: "6 min read",
    },
  ]

  useEffect(() => {
    const foundBlog = blogPosts.find((b) => b.id === Number.parseInt(id))
    setBlog(foundBlog)
  }, [id])

  const handleBackClick = () => {
    navigate("/blog")
  }

  if (!blog) {
    return <div className="blog-loading">Loading...</div>
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
              <span className="blog-read-time">{blog.readTime}</span>
            </div>
            <h1 className="blog-detail-title">{blog.title}</h1>
            <div className="blog-author-info">
              <span className="blog-author">By {blog.author}</span>
              <span className="blog-date">{blog.date}</span>
            </div>
          </header>

          <div className="blog-hero-image">
            <img src={blog.image || "/placeholder.svg"} alt={blog.title} />
          </div>

          <div className="blog-detail-content">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          <div className="blog-images-gallery">
            <h3>Project Images</h3>
            <div className="blog-images-grid">
              {blog.images?.map((image, index) => (
                <div key={index} className="blog-image-item">
                  <img src={image || "/placeholder.svg"} alt={`${blog.title} - Image ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogDetailPage
