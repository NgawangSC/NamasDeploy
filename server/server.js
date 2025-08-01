const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const cors = require("cors") // ✅ ADDED CORS

const app = express()
const PORT = process.env.PORT || 5000
const DATA_DIR = "./data"
const UPLOADS_DIR = "./uploads"
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, "team-members.json")
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json")
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json")
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json")
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json")

// Load data from files
let teamMembers = loadData(TEAM_MEMBERS_FILE)
let projects = loadData(PROJECTS_FILE)
let blogPosts = loadData(BLOGS_FILE)
let clients = loadData(CLIENTS_FILE)
let contacts = loadData(CONTACTS_FILE)

function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"))
    }
    return []
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error)
    return []
  }
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error)
  }
}

// Setup uploads
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Middleware
app.use(express.json())

// ✅ CORS MIDDLEWARE
app.use(cors({
  origin: "https://www.namasbhutan.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))

app.use("/uploads", express.static(UPLOADS_DIR))

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the NAMAS Architecture API")
})

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "NAMAS Architecture API",
    availableRoutes: [
      "GET /api/projects",
      "POST /api/projects",
      "GET /api/blogs",
      "POST /api/blogs",
      "GET /api/clients",
      "POST /api/clients",
      "GET /api/team-members",
      "POST /api/team-members",
      "PUT /api/team-members/:id",
      "DELETE /api/team-members/:id",
      "POST /api/contact",
      "POST /api/search",
    ],
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

// TEAM MEMBERS ROUTES

// GET all team members with pagination
app.get("/api/team-members", (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 0
  const startIndex = (page - 1) * limit

  let result = teamMembers
  let totalPages = 1

  if (limit > 0) {
    result = teamMembers.slice(startIndex, startIndex + limit)
    totalPages = Math.ceil(teamMembers.length / limit)
  }

  res.json({
    success: true,
    data: result,
    count: result.length,
    total: teamMembers.length,
    page: limit > 0 ? page : 1,
    totalPages: totalPages,
    hasMore: limit > 0 ? page < totalPages : false
  })
})

// GET single team member
app.get("/api/team-members/:id", (req, res) => {
  const teamMember = teamMembers.find((member) => member.id === Number.parseInt(req.params.id))
  if (!teamMember) {
    return res.status(404).json({
      success: false,
      error: "Team member not found",
    })
  }
  res.json({
    success: true,
    data: teamMember,
  })
})

// POST create new team member
app.post("/api/team-members", upload.single("image"), (req, res) => {
  try {
    const { name, title, position } = req.body

    // Validation
    if (!name || !title || !position) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, title, position",
      })
    }

    // Generate new ID
    const newId = teamMembers.length > 0 ? Math.max(...teamMembers.map(member => member.id)) + 1 : 1

    // Create team member object
    const newTeamMember = {
      id: newId,
      name,
      title,
      position,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    teamMembers.push(newTeamMember)
    saveData(TEAM_MEMBERS_FILE, teamMembers)

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: newTeamMember,
    })
  } catch (error) {
    console.error("Error creating team member:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create team member",
      message: error.message,
    })
  }
})

// PUT update team member
app.put("/api/team-members/:id", upload.single("image"), (req, res) => {
  try {
    const teamMemberIndex = teamMembers.findIndex((member) => member.id === Number.parseInt(req.params.id))
    
    if (teamMemberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      })
    }

    const { name, title, position } = req.body
    const existingTeamMember = teamMembers[teamMemberIndex]

    // Update team member
    const updatedTeamMember = {
      ...existingTeamMember,
      name: name || existingTeamMember.name,
      title: title || existingTeamMember.title,
      position: position || existingTeamMember.position,
      image: req.file ? `/uploads/${req.file.filename}` : existingTeamMember.image,
      updatedAt: new Date().toISOString()
    }

    teamMembers[teamMemberIndex] = updatedTeamMember
    saveData(TEAM_MEMBERS_FILE, teamMembers)

    res.json({
      success: true,
      message: "Team member updated successfully",
      data: updatedTeamMember,
    })
  } catch (error) {
    console.error("Error updating team member:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update team member",
      message: error.message,
    })
  }
})

// DELETE team member
app.delete("/api/team-members/:id", (req, res) => {
  const teamMemberIndex = teamMembers.findIndex((member) => member.id === Number.parseInt(req.params.id))
  
  if (teamMemberIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Team member not found",
    })
  }

  const deletedTeamMember = teamMembers[teamMemberIndex]
  teamMembers.splice(teamMemberIndex, 1)
  saveData(TEAM_MEMBERS_FILE, teamMembers)
  
  res.json({
    success: true,
    message: "Team member deleted successfully",
    data: deletedTeamMember,
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
      "GET /api/team-members",
      "POST /api/team-members",
      "PUT /api/team-members/:id",
      "DELETE /api/team-members/:id",
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
  console.log(`📊 Loaded: ${projects.length} projects, ${blogPosts.length} blogs, ${clients.length} clients, ${teamMembers.length} team members, ${contacts.length} contacts`)
  startAutoBackup()
})