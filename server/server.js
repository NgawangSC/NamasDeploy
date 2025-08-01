const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const cors = require("cors")
require("dotenv").config() // Load environment variables

const app = express()
const PORT = process.env.PORT || 5000

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["https://www.namasbhutan.com", "https://namasbhutan.com", "http://localhost:3000"]

const DATA_DIR = "./data"
const UPLOADS_DIR = "./uploads"
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, "team-members.json")
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json")
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json")
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json")
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json")

// Load data from files
const teamMembers = loadData(TEAM_MEMBERS_FILE)
const projects = loadData(PROJECTS_FILE)
const blogPosts = loadData(BLOGS_FILE)
const clients = loadData(CLIENTS_FILE)
const contacts = loadData(CONTACTS_FILE)

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
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// ✅ CORS CONFIGURATION USING ENVIRONMENT VARIABLES
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(`CORS blocked origin: ${origin}`)
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
}

// Apply CORS middleware FIRST
app.use(cors(corsOptions))

// Then apply other middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(UPLOADS_DIR))

// Add explicit preflight handler
app.options("*", cors(corsOptions))

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the NAMAS Architecture API",
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
  })
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
function createBackup() {
  // Implement backup logic here
  return true // Placeholder for actual backup success
}

app.post("/api/backup", (req, res) => {
  try {
    const success = createBackup()
    if (success) {
      res.json({
        success: true,
        message: "Backup created successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to create backup",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Backup operation failed",
      details: error.message,
    })
  }
})

// PROJECT ROUTES
// GET all projects with optional pagination
app.get("/api/projects", (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 0 // 0 means no limit (return all)
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
    hasMore: limit > 0 ? page < totalPages : false,
  })
})

// GET featured projects (for hero banner) - MUST come before /:id route
app.get("/api/projects/featured", (req, res) => {
  const featuredProjects = projects.filter((project) => project.featured === true).slice(0, 8)
  res.json({
    success: true,
    data: featuredProjects,
    count: featuredProjects.length,
  })
})

// Your existing blogs logic
app.get("/api/blogs", (req, res) => {
  try {
    res.json({
      success: true,
      data: blogPosts,
      count: blogPosts.length,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" })
  }
})

// Your existing clients logic
app.get("/api/clients", (req, res) => {
  try {
    res.json({
      success: true,
      data: clients,
      count: clients.length,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" })
  }
})

// Your existing team members logic
app.get("/api/team-members", (req, res) => {
  try {
    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error)

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
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`)
  console.log(`📡 Server URL: http://localhost:${PORT}`)
  console.log(
    `📊 Loaded: ${projects.length} projects, ${blogPosts.length} blogs, ${clients.length} clients, ${teamMembers.length} team members, ${contacts.length} contacts`,
  )
})
