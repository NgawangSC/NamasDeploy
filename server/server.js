const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { startAutoBackup, createBackup } = require('./data-backup')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Data file paths
const DATA_DIR = path.join(__dirname, 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json')
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json')
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Data persistence functions
const loadData = (filePath, defaultData = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
    return defaultData
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error)
    return defaultData
  }
}

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error)
    return false
  }
}

// Load initial data
let projects = loadData(PROJECTS_FILE, [])
let blogPosts = loadData(BLOGS_FILE, [
  {
    id: 1,
    title: "Sustainable Architecture in Bhutan",
    excerpt:
      "Exploring traditional building techniques and modern sustainable practices in contemporary Bhutanese architecture.",
    content: "<p>Bhutan's unique approach to architecture has always been deeply rooted in sustainability...</p>",
    date: "March 15, 2024",
    author: "NAMAS Architecture Team",
    category: "Sustainability",
    image: "/images/project1.png",
    readTime: "5 min read",
  },
])
let clients = loadData(CLIENTS_FILE, [])
let contacts = loadData(CONTACTS_FILE, [])

// ROOT ROUTE - Fix for "Cannot GET /"
app.get("/", (req, res) => {
  res.json({
    message: "NAMAS Architecture API Server",
    version: "1.0.0",
    endpoints: {
      projects: "/api/projects",
      blogs: "/api/blogs",
      contacts: "/api/contact",
      search: "/api/search",
    },
    status: "Server is running successfully",
  })
})

// API STATUS ROUTE
app.get("/api", (req, res) => {
  res.json({
    message: "NAMAS Architecture API",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/projects - Get all projects (supports ?page=1&limit=10)",
      "POST /api/projects - Create new project",
      "GET /api/projects/:id - Get single project",
      "PUT /api/projects/:id - Update project",
      "DELETE /api/projects/:id - Delete project",
      "GET /api/blogs - Get all blog posts (supports ?page=1&limit=10)",
      "POST /api/blogs - Create new blog post",
      "GET /api/blogs/:id - Get single blog post",
      "PUT /api/blogs/:id - Update blog post",
      "DELETE /api/blogs/:id - Delete blog post",
      "GET /api/clients - Get all clients (supports ?page=1&limit=10)",
      "POST /api/contact - Submit contact form",
      "GET /api/contacts - Get all contacts",
      "PUT /api/contacts/:id - Update contact status",
      "POST /api/search - Search projects and blogs",
      "POST /api/backup - Create manual backup",
    ],
    stats: {
      projects: projects.length,
      blogs: blogPosts.length,
      clients: clients.length,
      contacts: contacts.length
    }
  })
})

// BACKUP ROUTE
app.post("/api/backup", (req, res) => {
  try {
    const success = createBackup()
    if (success) {
      res.json({
        success: true,
        message: "Backup created successfully",
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create backup"
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Backup operation failed",
      details: error.message
    })
  }
})

// PROJECT ROUTES

// GET all projects with optional pagination
app.get("/api/projects", (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 0 // 0 means no limit (return all)
  const startIndex = (page - 1) * limit
  
  let result = projects
  let totalPages = 1
  
  if (limit > 0) {
    result = projects.slice(startIndex, startIndex + limit)
    totalPages = Math.ceil(projects.length / limit)
  }
  
  res.json({
    success: true,
    data: result,
    count: result.length,
    total: projects.length,
    page: limit > 0 ? page : 1,
    totalPages: totalPages,
    hasMore: limit > 0 ? page < totalPages : false
  })
})

// GET featured projects (for hero banner) - MUST come before /:id route
app.get("/api/projects/featured", (req, res) => {
  const featuredProjects = projects.filter(project => project.featured === true).slice(0, 8)
  res.json({
    success: true,
    data: featuredProjects,
    count: featuredProjects.length,
  })
})

// GET single project
app.get("/api/projects/:id", (req, res) => {
  const project = projects.find((p) => p.id === Number.parseInt(req.params.id))
  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }
  res.json({
    success: true,
    data: project,
  })
})

// POST create new project
app.post("/api/projects", upload.array("images", 25), (req, res) => {
  try {
    const { title, category, location, year, status, client, designTeam, description, featured } = req.body

    // Validation
    if (!title || !category || !location || !year) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, category, location, year",
      })
    }

    const newProject = {
      id: projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1,
      title,
      category,
      location,
      year,
      status: status || "Ongoing",
      client: client || "",
      designTeam: designTeam || "NAMAS Architecture",
      description: description || "",
      featured: featured === 'true' || featured === true || false,
      image: req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : "/images/placeholder.png",
      images: req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [],
      createdAt: new Date().toISOString(),
    }

    projects.push(newProject)
    saveData(PROJECTS_FILE, projects)
    res.status(201).json({
      success: true,
      data: newProject,
      message: "Project created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create project",
      details: error.message,
    })
  }
})

// PUT update project
app.put("/api/projects/:id", upload.array("images", 25), (req, res) => {
  try {
    const projectId = Number.parseInt(req.params.id)
    const projectIndex = projects.findIndex((p) => p.id === projectId)

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      })
    }

    const { featured, ...otherUpdates } = req.body;

    const updatedProject = {
      ...projects[projectIndex],
      ...otherUpdates,
      id: projectId,
      updatedAt: new Date().toISOString(),
    }

    // Handle featured field properly (convert string to boolean)
    if (featured !== undefined) {
      updatedProject.featured = featured === 'true' || featured === true;
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      updatedProject.image = `/uploads/${req.files[0].filename}`
      updatedProject.images = req.files.map((file) => `/uploads/${file.filename}`)
    }

    projects[projectIndex] = updatedProject
    saveData(PROJECTS_FILE, projects)
    res.json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update project",
      details: error.message,
    })
  }
})

// PATCH project (for simple updates like featured status)
app.patch("/api/projects/:id", express.json(), (req, res) => {
  try {
    const projectId = Number.parseInt(req.params.id)
    const projectIndex = projects.findIndex((p) => p.id === projectId)

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      })
    }

    const updates = req.body;
    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      id: projectId,
      updatedAt: new Date().toISOString(),
    }

    // Handle featured field properly (convert to boolean)
    if (updates.featured !== undefined) {
      updatedProject.featured = Boolean(updates.featured);
    }

    projects[projectIndex] = updatedProject
    saveData(PROJECTS_FILE, projects)
    res.json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update project",
      details: error.message,
    })
  }
})

// DELETE project
app.delete("/api/projects/:id", (req, res) => {
  const projectId = Number.parseInt(req.params.id)
  const projectIndex = projects.findIndex((p) => p.id === projectId)

  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  const deletedProject = projects[projectIndex]
  projects.splice(projectIndex, 1)
  saveData(PROJECTS_FILE, projects)
  res.json({
    success: true,
    message: "Project deleted successfully",
    data: deletedProject,
  })
})

// POST add images to existing project
app.post("/api/projects/:id/images", upload.array("images", 25), (req, res) => {
  try {
    const projectId = Number.parseInt(req.params.id)
    const projectIndex = projects.findIndex((p) => p.id === projectId)

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images uploaded",
      })
    }

    const project = projects[projectIndex]
    const newImages = req.files.map((file) => `/uploads/${file.filename}`)
    
    // Add new images to existing images array
    project.images = [...(project.images || []), ...newImages]
    
    // If project doesn't have a cover image, set the first uploaded image as cover
    if (!project.image || project.image === "/images/placeholder.png") {
      project.image = newImages[0]
    }
    
    project.updatedAt = new Date().toISOString()
    projects[projectIndex] = project
    saveData(PROJECTS_FILE, projects)

    res.json({
      success: true,
      data: {
        project: project,
        newImages: newImages
      },
      message: `${newImages.length} image(s) added successfully`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add images",
      details: error.message,
    })
  }
})

// PUT set cover image for project
app.put("/api/projects/:id/cover", (req, res) => {
  try {
    const projectId = Number.parseInt(req.params.id)
    const { imageUrl } = req.body

    const projectIndex = projects.findIndex((p) => p.id === projectId)

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      })
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Image URL is required",
      })
    }

    const project = projects[projectIndex]
    
    // Verify that the image exists in the project's images array
    if (!project.images || !project.images.includes(imageUrl)) {
      return res.status(400).json({
        success: false,
        error: "Image not found in project images",
      })
    }

    project.image = imageUrl
    project.updatedAt = new Date().toISOString()
    projects[projectIndex] = project
    saveData(PROJECTS_FILE, projects)

    res.json({
      success: true,
      data: project,
      message: "Cover image updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update cover image",
      details: error.message,
    })
  }
})

// DELETE remove image from project
app.delete("/api/projects/:id/images", (req, res) => {
  try {
    const projectId = Number.parseInt(req.params.id)
    const { imageUrl } = req.body

    const projectIndex = projects.findIndex((p) => p.id === projectId)

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      })
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Image URL is required",
      })
    }

    const project = projects[projectIndex]
    
    if (!project.images || !project.images.includes(imageUrl)) {
      return res.status(400).json({
        success: false,
        error: "Image not found in project",
      })
    }

    // Remove image from images array
    project.images = project.images.filter(img => img !== imageUrl)
    
    // If the removed image was the cover image, set a new cover image
    if (project.image === imageUrl) {
      project.image = project.images.length > 0 ? project.images[0] : "/images/placeholder.png"
    }
    
    project.updatedAt = new Date().toISOString()
    projects[projectIndex] = project
    saveData(PROJECTS_FILE, projects)

    res.json({
      success: true,
      data: project,
      message: "Image removed successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to remove image",
      details: error.message,
    })
  }
})

// BLOG ROUTES

// GET all blog posts with optional pagination
app.get("/api/blogs", (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 0 // 0 means no limit (return all)
  const startIndex = (page - 1) * limit
  
  let result = blogPosts
  let totalPages = 1
  
  if (limit > 0) {
    result = blogPosts.slice(startIndex, startIndex + limit)
    totalPages = Math.ceil(blogPosts.length / limit)
  }
  
  res.json({
    success: true,
    data: result,
    count: result.length,
    total: blogPosts.length,
    page: limit > 0 ? page : 1,
    totalPages: totalPages,
    hasMore: limit > 0 ? page < totalPages : false
  })
})

// GET single blog post
app.get("/api/blogs/:id", (req, res) => {
  const blog = blogPosts.find((b) => b.id === Number.parseInt(req.params.id))
  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog post not found",
    })
  }
  res.json({
    success: true,
    data: blog,
  })
})

// POST create new blog post
app.post("/api/blogs", upload.single("image"), (req, res) => {
  try {
    const { title, excerpt, content, author, category, readTime } = req.body

    // Validation
    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, content, author",
      })
    }

    const newBlog = {
      id: blogPosts.length > 0 ? Math.max(...blogPosts.map((b) => b.id)) + 1 : 1,
      title,
      excerpt: excerpt || title.substring(0, 150) + "...",
      content,
      author,
      category: category || "General",
      readTime: readTime || "5 min read",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      image: req.file ? `/uploads/${req.file.filename}` : "/images/placeholder.png",
      createdAt: new Date().toISOString(),
    }

    blogPosts.push(newBlog)
    saveData(BLOGS_FILE, blogPosts)
    res.status(201).json({
      success: true,
      data: newBlog,
      message: "Blog post created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create blog post",
      details: error.message,
    })
  }
})

// PUT update blog post
app.put("/api/blogs/:id", upload.single("image"), (req, res) => {
  try {
    const blogId = Number.parseInt(req.params.id)
    const blogIndex = blogPosts.findIndex((b) => b.id === blogId)

    if (blogIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Blog post not found",
      })
    }

    const updatedBlog = {
      ...blogPosts[blogIndex],
      ...req.body,
      id: blogId,
      updatedAt: new Date().toISOString(),
    }

    // Handle new image if uploaded
    if (req.file) {
      updatedBlog.image = `/uploads/${req.file.filename}`
    }

    blogPosts[blogIndex] = updatedBlog
    saveData(BLOGS_FILE, blogPosts)
    res.json({
      success: true,
      data: updatedBlog,
      message: "Blog post updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update blog post",
      details: error.message,
    })
  }
})

// DELETE blog post
app.delete("/api/blogs/:id", (req, res) => {
  const blogId = Number.parseInt(req.params.id)
  const blogIndex = blogPosts.findIndex((b) => b.id === blogId)

  if (blogIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Blog post not found",
    })
  }

  const deletedBlog = blogPosts[blogIndex]
  blogPosts.splice(blogIndex, 1)
  saveData(BLOGS_FILE, blogPosts)
  res.json({
    success: true,
    message: "Blog post deleted successfully",
    data: deletedBlog,
  })
})

// CONTACT ROUTES

// POST contact form submission
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, phone, subject, message, projectType } = req.body

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, message",
      })
    }

    const newContact = {
      id: contacts.length > 0 ? Math.max(...contacts.map((c) => c.id)) + 1 : 1,
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      projectType: projectType || "General",
      status: "New",
      createdAt: new Date().toISOString(),
    }

    contacts.push(newContact)
    saveData(CONTACTS_FILE, contacts)

    // Here you would typically send an email notification
    console.log("New contact inquiry:", newContact)

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: { id: newContact.id },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to submit contact form",
      details: error.message,
    })
  }
})

// GET all contacts (for admin)
app.get("/api/contacts", (req, res) => {
  res.json({
    success: true,
    data: contacts,
    count: contacts.length,
  })
})

// PUT update contact status
app.put("/api/contacts/:id", (req, res) => {
  try {
    const contactId = Number.parseInt(req.params.id)
    const contactIndex = contacts.findIndex((c) => c.id === contactId)

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      })
    }

    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...req.body,
      id: contactId,
      updatedAt: new Date().toISOString(),
    }

          contacts[contactIndex] = {
        ...contacts[contactIndex],
        ...req.body,
        id: contactId,
        updatedAt: new Date().toISOString(),
      }
      saveData(CONTACTS_FILE, contacts)

      res.json({
      success: true,
      data: contacts[contactIndex],
      message: "Contact updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update contact",
      details: error.message,
    })
  }
})

// CLIENT ROUTES

// GET all clients with optional pagination
app.get("/api/clients", (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 0 // 0 means no limit (return all)
  const startIndex = (page - 1) * limit
  
  let result = clients
  let totalPages = 1
  
  if (limit > 0) {
    result = clients.slice(startIndex, startIndex + limit)
    totalPages = Math.ceil(clients.length / limit)
  }
  
  res.json({
    success: true,
    data: result,
    count: result.length,
    total: clients.length,
    page: limit > 0 ? page : 1,
    totalPages: totalPages,
    hasMore: limit > 0 ? page < totalPages : false
  })
})

// GET single client
app.get("/api/clients/:id", (req, res) => {
  const client = clients.find((c) => c.id === Number.parseInt(req.params.id))
  if (!client) {
    return res.status(404).json({
      success: false,
      error: "Client not found",
    })
  }
  res.json({
    success: true,
    data: client,
  })
})

// POST create new client
app.post("/api/clients", upload.single("logo"), (req, res) => {
  try {
    const { name, description, website, category, status } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: name",
      })
    }

    const newClient = {
      id: clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1,
      name,
      description: description || "",
      website: website || "",
      category: category || "General",
      status: status || "Active",
      logo: req.file ? `/uploads/${req.file.filename}` : "/images/placeholder-logo.png",
      createdAt: new Date().toISOString(),
    }

    clients.push(newClient)
    saveData(CLIENTS_FILE, clients)
    res.status(201).json({
      success: true,
      data: newClient,
      message: "Client created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create client",
      details: error.message,
    })
  }
})

// PUT update client
app.put("/api/clients/:id", upload.single("logo"), (req, res) => {
  try {
    const clientId = Number.parseInt(req.params.id)
    const clientIndex = clients.findIndex((c) => c.id === clientId)

    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Client not found",
      })
    }

    const updatedClient = {
      ...clients[clientIndex],
      ...req.body,
      id: clientId,
      updatedAt: new Date().toISOString(),
    }

    // Handle new logo if uploaded
    if (req.file) {
      updatedClient.logo = `/uploads/${req.file.filename}`
    }

    clients[clientIndex] = updatedClient
    saveData(CLIENTS_FILE, clients)
    res.json({
      success: true,
      data: updatedClient,
      message: "Client updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update client",
      details: error.message,
    })
  }
})

// DELETE client
app.delete("/api/clients/:id", (req, res) => {
  const clientId = Number.parseInt(req.params.id)
  const clientIndex = clients.findIndex((c) => c.id === clientId)

  if (clientIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Client not found",
    })
  }

  const deletedClient = clients[clientIndex]
  clients.splice(clientIndex, 1)
  saveData(CLIENTS_FILE, clients)
  res.json({
    success: true,
    message: "Client deleted successfully",
    data: deletedClient,
  })
})

// SEARCH ROUTES

// POST search projects and blogs
app.post("/api/search", (req, res) => {
  try {
    const { query, type } = req.body

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      })
    }

    const searchQuery = query.toLowerCase()
    let results = []

    if (!type || type === "projects") {
      const projectResults = projects
        .filter(
          (project) =>
            project.title.toLowerCase().includes(searchQuery) ||
            project.category.toLowerCase().includes(searchQuery) ||
            project.location.toLowerCase().includes(searchQuery) ||
            project.description.toLowerCase().includes(searchQuery),
        )
        .map((project) => ({ ...project, type: "project" }))

      results = [...results, ...projectResults]
    }

    if (!type || type === "blogs") {
      const blogResults = blogPosts
        .filter(
          (blog) =>
            blog.title.toLowerCase().includes(searchQuery) ||
            blog.excerpt.toLowerCase().includes(searchQuery) ||
            blog.content.toLowerCase().includes(searchQuery) ||
            blog.category.toLowerCase().includes(searchQuery),
        )
        .map((blog) => ({ ...blog, type: "blog" }))

      results = [...results, ...blogResults]
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: query,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Search failed",
      details: error.message,
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large",
      })
    }
  }
  res.status(500).json({
    success: false,
    error: error.message,
  })
})

// POST upload media files
app.post("/api/media/upload", upload.array("images", 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images uploaded",
      })
    }

    // Return the file paths for the uploaded images
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`)
    
    res.json({
      success: true,
      message: `Successfully uploaded ${req.files.length} image(s)`,
      data: imagePaths,
      count: req.files.length,
    })
  } catch (error) {
    console.error("Error uploading media:", error)
    res.status(500).json({
      success: false,
      error: "Failed to upload images",
      message: error.message,
    })
  }
})

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /",
      "GET /api",
      "GET /api/projects",
      "POST /api/projects",
      "GET /api/blogs",
      "POST /api/blogs",
      "GET /api/clients",
      "POST /api/clients",
      "POST /api/contact",
      "POST /api/search",
    ],
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NAMAS Architecture API Server running on port ${PORT}`)
  console.log(`📡 Server URL: http://localhost:${PORT}`)
  console.log(`📋 API Documentation: http://localhost:${PORT}/api`)
  console.log(`📁 Upload directory: uploads/`)
  console.log(`💾 Data directory: ${DATA_DIR}`)
  console.log(`📊 Loaded: ${projects.length} projects, ${blogPosts.length} blogs, ${clients.length} clients, ${contacts.length} contacts`)
  
  // Start automatic backup system
  startAutoBackup()
})