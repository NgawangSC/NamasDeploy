const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const nodemailer = require("nodemailer")
require("dotenv").config() // Load environment variables
const { createBackup } = require("./data-backup")

// MongoDB connection and models
const connectDB = require("./config/database")
const { Project, TeamMember, Blog, Client, Contact, Partner } = require("./models")
const projectService = require("./services/projectService")

const app = express()
const PORT = process.env.PORT || 8080

// Initialize MongoDB connection
let isMongoConnected = false
const initializeMongoDB = async () => {
  try {
    await connectDB()
    isMongoConnected = true
    console.log('✅ MongoDB initialized successfully')
  } catch (error) {
    console.log('⚠️ MongoDB not available, falling back to file-based storage')
    isMongoConnected = false
  }
}

// Initialize MongoDB on startup
initializeMongoDB()

// Get allowed origins from environment variables
const allowedOrigins = (() => {
  const candidates = [
    process.env.ALLOWED_ORIGINS,
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGINS,
    [process.env.FRONTEND_URL, process.env.CPANEL_DOMAIN].filter(Boolean).join(","),
  ].filter(Boolean)
  const selected = candidates.find((v) => typeof v === "string" && v.trim().length > 0)
  if (selected) {
    return selected
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return ["https://www.namasbhutan.com", "https://namasbhutan.com", "http://localhost:3000"]
})()

// Global CORS headers middleware (defensive): ensure headers on all responses
// and short-circuit preflight even if downstream middleware throws
const addCorsHeaders = (req, res, next) => {
  try {
    const requestOrigin = req.headers.origin
    
    // Set CORS headers for allowed origins
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
      )
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204)
    }
  } catch (error) {
    console.error('CORS middleware error:', error)
  }
  next()
}

// Prefer external volume at /data when available unless explicitly overridden
const DEFAULT_BASE_DIR = (() => {
  if (fs.existsSync('/data')) return '/data'
  // cPanel File Manager alias path (UI)
  const CPANEL_ALIAS = '/MyFiles/domains/namasbhutan.com/storage'
  if (fs.existsSync(CPANEL_ALIAS)) return CPANEL_ALIAS
  // Likely real filesystem path on cPanel servers
  const CPANEL_REAL = '/home/namasbhutan/domains/namasbhutan.com/storage'
  if (fs.existsSync(CPANEL_REAL)) return CPANEL_REAL
  return __dirname
})()

const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(DEFAULT_BASE_DIR, 'data')
)
const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(DEFAULT_BASE_DIR, 'uploads')
)
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, "team-members.json")
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json")
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json")
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json")
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json")
const PARTNERS_FILE = path.join(DATA_DIR, "partners.json")

// Ensure uploads directory exists EARLY for multer
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Initialize multer EARLY so routes can reference it
const earlyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: earlyStorage })

// Startup diagnostics
console.log("Runtime configuration:")
console.log("  PORT:", PORT)
console.log("  DATA_DIR:", DATA_DIR, DATA_DIR.includes(__dirname) ? "(internal)" : "(external)")
console.log("  UPLOADS_DIR:", UPLOADS_DIR, UPLOADS_DIR.includes(__dirname) ? "(internal)" : "(external)")
console.log("  ALLOWED_ORIGINS:", allowedOrigins)

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'namasdesign2021@gmail.com',
    pass: process.env.EMAIL_PASS || 'ojsy ayyj igap htko'
  },
  // Add additional configuration for better reliability
  port: 587,
  secure: false, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false
  }
})

// Partners routes moved after CORS middleware (see line ~1182)

// Target email for contact form submissions
const CONTACT_EMAIL = 'namasdesign2021@gmail.com'

// Verify email connection on startup
const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email server connection verified successfully')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message)
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER ? '***configured***' : 'NOT SET',
      pass: process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'
    })
    return false
  }
}

// Load data from files (fallback when MongoDB is not available)
let teamMembers = []
let projects = []
let blogPosts = []
let clients = []
let contacts = []
let partners = []

// Function to load data from MongoDB or fallback to files
const loadDataFromSource = async () => {
  if (isMongoConnected) {
    try {
      console.log('📊 Loading data from MongoDB...')
      teamMembers = await TeamMember.find({}).sort({ order: 1 })
      projects = await Project.find({}).sort({ createdAt: -1 })
      blogPosts = await Blog.find({ published: true }).sort({ createdAt: -1 })
      clients = await Client.find({ active: true }).sort({ order: 1 })
      partners = await Partner.find({ active: true }).sort({ order: 1 })
      contacts = await Contact.find({}).sort({ createdAt: -1 })
      console.log('✅ Data loaded from MongoDB')
    } catch (error) {
      console.error('❌ Error loading from MongoDB, falling back to files:', error)
      loadDataFromFiles()
    }
  } else {
    loadDataFromFiles()
  }
}

const loadDataFromFiles = () => {
  console.log('📁 Loading data from files...')
  teamMembers = loadData(TEAM_MEMBERS_FILE)
  projects = loadData(PROJECTS_FILE)
  blogPosts = loadData(BLOGS_FILE)
  clients = loadData(CLIENTS_FILE)
  contacts = loadData(CONTACTS_FILE)
  partners = loadData(PARTNERS_FILE)
  console.log('✅ Data loaded from files')
}

// Initialize data loading
loadDataFromSource()

// Migration: Fix existing projects without cover images
function migrateProjectCoverImages() {
  let needsSave = false
  
  projects.forEach(project => {
    // If project has images but no cover image, set the first image as cover
    if (!project.image && project.images && Array.isArray(project.images) && project.images.length > 0) {
      project.image = project.images[0]
      needsSave = true
      console.log(`🔧 Fixed cover image for project: ${project.title}`)
    }
  })
  
  if (needsSave) {
    saveData(PROJECTS_FILE, projects)
    console.log(`✅ Migration completed: Fixed cover images for existing projects`)
  }
}

// Run migration on startup
migrateProjectCoverImages()

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
    const sizeHint = Array.isArray(data) ? data.length : Object.keys(data || {}).length
    console.log(`💾 Writing ${sizeHint} record(s) to`, filePath)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error)
  }
}

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Bootstrap data directory with default files from repo on first run
try {
  const defaultDataDir = path.join(__dirname, "data")
  if (path.resolve(DATA_DIR) !== path.resolve(defaultDataDir)) {
    const filesToSeed = ["projects.json", "blogs.json", "clients.json", "contacts.json", "team-members.json", "partners.json"]
    filesToSeed.forEach((fileName) => {
      const targetPath = path.join(DATA_DIR, fileName)
      const defaultPath = path.join(defaultDataDir, fileName)
      if (!fs.existsSync(targetPath) && fs.existsSync(defaultPath)) {
        fs.copyFileSync(defaultPath, targetPath)
        console.log(`📦 Seeded ${fileName} to external DATA_DIR`)
      }
    })
  }
} catch (seedErr) {
  console.warn("Could not seed external DATA_DIR:", seedErr.message)
}

// Setup uploads (already initialized above); keep for clarity but no-op now

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

// Apply CORS middleware - use the standard cors package
app.use(cors(corsOptions))

// Add request logging middleware EARLY
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} from ${req.ip}`)
  next()
})

// Then apply other middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files with proper CORS headers
app.use("/uploads", cors(corsOptions), express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath, stat) => {
    const requestOrigin = res.req && res.req.headers ? res.req.headers.origin : undefined
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.set('Access-Control-Allow-Origin', requestOrigin)
      res.set('Access-Control-Allow-Credentials', 'true')
    } else {
      // Explicitly vary on Origin and avoid wildcard when credentials may be used
      res.set('Access-Control-Allow-Origin', 'null')
    }
    res.set('Vary', 'Origin')
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.set('Cache-Control', 'public, max-age=31536000') // 1 year cache
  }
}))

// Add explicit preflight handler
app.options("*", cors(corsOptions))

// TEST ROUTE - Add this EARLY
app.get("/test", (req, res) => {
  console.log("🧪 Test route hit!")
  res.json({
    status: "working",
    message: "Server is responding!",
    timestamp: new Date().toISOString(),
  })
})

// CONFIG ROUTE - for diagnostics
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    data: {
      port: PORT,
      dataDir: DATA_DIR,
      uploadsDir: UPLOADS_DIR,
      allowedOrigins,
      usingExternalDataDir: !DATA_DIR.includes(__dirname),
      usingExternalUploadsDir: !UPLOADS_DIR.includes(__dirname),
    },
  })
})

// Backward-compatible alias without /api prefix
app.get("/config", (req, res) => {
  res.json({
    success: true,
    data: {
      port: PORT,
      dataDir: DATA_DIR,
      uploadsDir: UPLOADS_DIR,
      allowedOrigins,
      usingExternalDataDir: !DATA_DIR.includes(__dirname),
      usingExternalUploadsDir: !UPLOADS_DIR.includes(__dirname),
    },
  })
})

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

// Dynamic sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || process.env.REACT_APP_SITE_URL || 'https://www.namasbhutan.com'

    // static routes from the SPA
    const staticRoutes = [
      '/',
      '/about',
      '/design',
      '/build',
      '/architecture',
      '/planning',
      '/interior',
      '/landscape',
      '/supervision',
      '/management',
      '/real-estate',
      '/private-homes',
      '/commercial-buildings',
      '/office',
      '/institute',
      '/hospitality',
      '/interior-design',
      '/renovation',
      '/blog',
      '/contact'
    ]

    const urls = []

    const now = new Date().toISOString()

    // Home with highest priority
    urls.push({ loc: siteUrl + '/', changefreq: 'daily', priority: '1.0', lastmod: now })

    // Other static routes
    staticRoutes.filter(p => p !== '/').forEach(p => {
      urls.push({ loc: siteUrl + p, changefreq: 'weekly', priority: '0.8', lastmod: now })
    })

    // Dynamic projects
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        const lastmod = p.updatedAt || p.createdAt || now
        urls.push({ loc: `${siteUrl}/project/${p.id}`, changefreq: 'monthly', priority: '0.6', lastmod })
      })
    }

    // Dynamic blogs (only published if status present)
    if (Array.isArray(blogPosts)) {
      blogPosts
        .filter(b => !b.status || b.status === 'published')
        .forEach(b => {
          const lastmod = b.updatedAt || b.createdAt || now
          urls.push({ loc: `${siteUrl}/blog/${b.id}`, changefreq: 'weekly', priority: '0.6', lastmod })
        })
    }

    const xmlItems = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (err) {
    console.error('Failed to generate sitemap:', err)
    res.status(500).send('Error generating sitemap')
  }
})

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "NAMAS Architecture API",
    availableRoutes: [
      "GET /",
      "GET /api",
      "GET /test",
      "GET /config",
      "GET /api/config",
      "GET /api/projects",
      "GET /api/projects/featured",
      "GET /api/projects/:id",
      "POST /api/projects",
      "PUT /api/projects/:id",
      "DELETE /api/projects/:id",
      "POST /api/projects/:id/images",
      "DELETE /api/projects/:id/images",
      "PUT /api/projects/:id/cover",
      "GET /api/blogs",
      "POST /api/blogs",
      "PUT /api/blogs/:id",
      "DELETE /api/blogs/:id",
      "GET /api/clients",
      "POST /api/clients",
      "PUT /api/clients/:id",
      "DELETE /api/clients/:id",
      "GET /api/partners",
      "POST /api/partners",
      "PUT /api/partners/:id",
      "DELETE /api/partners/:id",
      "GET /api/team-members",
      "POST /api/team-members",
      "PUT /api/team-members/:id",
      "DELETE /api/team-members/:id",
      "GET /api/contacts",
      "POST /api/contact",
      "PUT /api/contacts/:id",
      "POST /api/search",
      "POST /api/media/upload",
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
app.get("/api/projects", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 0 // 0 means no limit (return all)
    const startIndex = (page - 1) * limit

    let result, totalCount

    if (isMongoConnected) {
      try {
        if (limit > 0) {
          result = await Project.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit)
          totalCount = await Project.countDocuments({})
        } else {
          result = await Project.find({}).sort({ createdAt: -1 })
          totalCount = result.length
        }
      } catch (dbErr) {
        console.warn('⚠️ MongoDB query failed, falling back to files:', dbErr.message)
        isMongoConnected = false
      }
    }

    if (!isMongoConnected) {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      if (limit > 0) {
        result = projects.slice(startIndex, startIndex + limit)
        totalCount = projects.length
      } else {
        result = projects
        totalCount = projects.length
      }
    }

    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 1

    res.json({
      success: true,
      data: result,
      count: result.length,
      total: totalCount,
      page: limit > 0 ? page : 1,
      totalPages: totalPages,
      hasMore: limit > 0 ? page < totalPages : false,
    })
  } catch (error) {
    console.error("❌ Error fetching projects:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
      details: error.message
    })
  }
})

// GET featured projects (for hero banner) - MUST come before /:id route
app.get("/api/projects/featured", async (req, res) => {
  try {
    let featuredProjects

    if (isMongoConnected) {
      try {
        featuredProjects = await Project.find({ featured: true })
          .sort({ createdAt: -1 })
          .limit(8)
      } catch (dbErr) {
        console.warn('⚠️ MongoDB query failed, falling back to files:', dbErr.message)
        isMongoConnected = false
      }
    }

    if (!isMongoConnected) {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      featuredProjects = projects.filter((project) => project.featured === true).slice(0, 8)
    }

    res.json({
      success: true,
      data: featuredProjects,
      count: featuredProjects.length,
    })
  } catch (error) {
    console.error("❌ Error fetching featured projects:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured projects",
      details: error.message
    })
  }
})

// GET single project by ID - MUST come after /featured route
app.get("/api/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id
    
    let project

    if (isMongoConnected) {
      // Try to find by MongoDB ObjectId first
      if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
        project = await Project.findById(projectId)
      }
      
      // If not found by ObjectId, try to find by legacy ID
      if (!project) {
        project = await Project.findOne({ 
          $or: [
            { id: Number.parseInt(projectId) },
            { id: projectId },
            { id: projectId.toString() }
          ]
        })
      }
    } else {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      project = projects.find(p => {
        return p.id === Number.parseInt(projectId) || p.id === projectId || p.id.toString() === projectId
      })
    }
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }
    
    res.json({
      success: true,
      data: project
    })
    
  } catch (error) {
    console.error("❌ Error fetching project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
      details: error.message
    })
  }
})

// POST new project
app.post("/api/projects", upload.array('images', 10), async (req, res) => {
  try {
    console.log("📝 Creating new project:", req.body)
    
    // Normalize status to known canonical values
    const normalizeStatus = (value) => {
      if (!value) return 'In Progress'
      const normalized = String(value).trim()
      const map = new Map([
        ['completed', 'Completed'],
        ['Completed', 'Completed'],
        ['in progress', 'In Progress'],
        ['In Progress', 'In Progress'],
        ['ongoing', 'In Progress'],
        ['on hold', 'On Hold'],
        ['On Hold', 'On Hold'],
        ['planned', 'In Progress']
      ])
      return map.get(normalized) || map.get(normalized.toLowerCase()) || 'In Progress'
    }

    // Parse project data from request body
    const projectData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      year: req.body.year,
      client: req.body.client,
      designTeam: req.body.designTeam, 
      featured: req.body.featured === 'true' || req.body.featured === true,
      status: normalizeStatus(req.body.status)
    }
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(file => `/uploads/${file.filename}`)
      // Set the first uploaded image as the cover image
      projectData.coverImage = projectData.images[0]
    } else {
      projectData.images = []
      projectData.coverImage = null
    }
    
    // Validate required fields
    if (!projectData.title || !projectData.description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required"
      })
    }
    
    let savedProject

    if (isMongoConnected) {
      try {
        // Save to MongoDB
        const project = new Project(projectData)
        savedProject = await project.save()
        console.log("✅ Project created successfully in MongoDB:", savedProject.title)
      } catch (dbErr) {
        console.warn('⚠️ MongoDB save failed, falling back to files:', dbErr.message)
        isMongoConnected = false
      }
    }

    if (!isMongoConnected) {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      projectData.id = Date.now()
      projectData.createdAt = new Date().toISOString()
      projectData.updatedAt = new Date().toISOString()
      projects.push(projectData)
      saveData(PROJECTS_FILE, projects)
      savedProject = projectData
      console.log("✅ Project created successfully in file:", savedProject.title)
    }
    
    res.status(201).json({
      success: true,
      data: savedProject,
      message: "Project created successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create project",
      details: error.message
    })
  }
})

// PUT update existing project
app.put("/api/projects/:id", upload.array('images', 10), async (req, res) => {
  try {
    const projectId = req.params.id
    console.log("📝 Updating project:", projectId, req.body)
    
    let existingProject, updatedProject

    if (isMongoConnected) {
      // Find project in MongoDB
      if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
        existingProject = await Project.findById(projectId)
      } else {
        existingProject = await Project.findOne({ 
          $or: [
            { id: Number.parseInt(projectId) },
            { id: projectId },
            { id: projectId.toString() }
          ]
        })
      }
      
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        })
      }

      // Normalize status to known canonical values
      const normalizeStatus = (value) => {
        if (!value) return existingProject.status
        const normalized = String(value).trim()
        const map = new Map([
          ['completed', 'Completed'],
          ['Completed', 'Completed'],
          ['in progress', 'In Progress'],
          ['In Progress', 'In Progress'],
          ['ongoing', 'In Progress'],
          ['on hold', 'On Hold'],
          ['On Hold', 'On Hold'],
          ['planned', 'In Progress']
        ])
        return map.get(normalized) || map.get(normalized.toLowerCase()) || existingProject.status
      }

      // Parse updated data from request body
      const updatedData = {
        title: req.body.title || existingProject.title,
        description: req.body.description || existingProject.description,
        category: req.body.category || existingProject.category,
        location: req.body.location || existingProject.location,
        year: req.body.year || existingProject.year,
        client: req.body.client || existingProject.client,
        designTeam: req.body.designTeam || existingProject.designTeam,
        featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existingProject.featured,
        status: normalizeStatus(req.body.status)
      }
      
      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`)
        // Keep existing images and add new ones
        updatedData.images = [...(existingProject.images || []), ...newImages]
        
        // If no cover image exists, set the first image as cover
        if (!updatedData.coverImage && updatedData.images.length > 0) {
          updatedData.coverImage = updatedData.images[0]
        }
      }

      updatedProject = await Project.findByIdAndUpdate(projectId, updatedData, { new: true })
      console.log("✅ Project updated successfully in MongoDB:", updatedProject.title)
    } else {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      const projectIndex = projects.findIndex(p => p.id === parseInt(projectId))
      
      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        })
      }
      
      existingProject = projects[projectIndex]
      
      // Normalize status to known canonical values
      const normalizeStatus = (value, fallback) => {
        if (!value) return fallback
        const normalized = String(value).trim()
        const map = new Map([
          ['completed', 'Completed'],
          ['Completed', 'Completed'],
          ['in progress', 'In Progress'],
          ['In Progress', 'In Progress'],
          ['ongoing', 'In Progress'],
          ['on hold', 'On Hold'],
          ['On Hold', 'On Hold'],
          ['planned', 'In Progress']
        ])
        return map.get(normalized) || map.get(normalized.toLowerCase()) || fallback
      }

      // Parse updated data from request body
      const updatedData = {
        ...existingProject,
        title: req.body.title || existingProject.title,
        description: req.body.description || existingProject.description,
        category: req.body.category || existingProject.category,
        location: req.body.location || existingProject.location,
        year: req.body.year || existingProject.year,
        client: req.body.client || existingProject.client,
        designTeam: req.body.designTeam || existingProject.designTeam,
        featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existingProject.featured,
        status: normalizeStatus(req.body.status, existingProject.status),
        updatedAt: new Date().toISOString()
      }
      
      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`)
        // Keep existing images and add new ones
        updatedData.images = [...(existingProject.images || []), ...newImages]
        
        // If no cover image exists, set the first image as cover
        if (!updatedData.image && updatedData.images.length > 0) {
          updatedData.image = updatedData.images[0]
        }
      }
      
      // Update the project in the array
      projects[projectIndex] = updatedData
      saveData(PROJECTS_FILE, projects)
      updatedProject = updatedData
      console.log("✅ Project updated successfully in file:", updatedProject.title)
    }
    
    res.json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully"
    })
    
  } catch (error) {
    console.error("❌ Error updating project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update project",
      details: error.message
    })
  }
})

// DELETE project
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id
    console.log("🗑️ Deleting project:", projectId)
    
    let deletedProject

    if (isMongoConnected) {
      // Delete from MongoDB
      if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
        deletedProject = await Project.findByIdAndDelete(projectId)
      } else {
        deletedProject = await Project.findOneAndDelete({ 
          $or: [
            { id: Number.parseInt(projectId) },
            { id: projectId },
            { id: projectId.toString() }
          ]
        })
      }
      
      if (!deletedProject) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        })
      }
      
      console.log("✅ Project deleted successfully from MongoDB:", deletedProject.title)
    } else {
      // Fallback to file-based storage
      const projects = loadData(PROJECTS_FILE)
      const projectIndex = projects.findIndex(p => p.id === parseInt(projectId))
      
      if (projectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        })
      }
      
      deletedProject = projects[projectIndex]
      projects.splice(projectIndex, 1)
      saveData(PROJECTS_FILE, projects)
      console.log("✅ Project deleted successfully from file:", deletedProject.title)
    }
    
    res.json({
      success: true,
      data: deletedProject,
      message: "Project deleted successfully"
    })
    
  } catch (error) {
    console.error("❌ Error deleting project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete project",
      details: error.message
    })
  }
})

// POST add images to existing project
app.post("/api/projects/:id/images", upload.array('images', 10), (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images uploaded"
      })
    }
    
    // Add new images to the project
    const newImages = req.files.map(file => `/uploads/${file.filename}`)
    projects[projectIndex].images = [...(projects[projectIndex].images || []), ...newImages]
    projects[projectIndex].updatedAt = new Date().toISOString()
    
    // Save to file
    saveData(PROJECTS_FILE, projects)
    
    console.log("📷 Images added to project:", projects[projectIndex].title)
    
    res.json({
      success: true,
      message: "Images added successfully",
      data: {
        project: projects[projectIndex],
        projectId: projectId,
        newImages: newImages,
        totalImages: projects[projectIndex].images.length
      }
    })
    
  } catch (error) {
    console.error("❌ Error adding images to project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add images",
      details: error.message
    })
  }
})

// DELETE remove image from project
app.delete("/api/projects/:id/images", (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const { imageUrl } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Image URL is required"
      })
    }
    
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }
    
    // Remove image from project
    const project = projects[projectIndex]
    
    // Ensure project has images array
    if (!project.images || !Array.isArray(project.images)) {
      return res.status(400).json({
        success: false,
        error: "Project has no images array"
      })
    }
    
    const imageIndex = project.images.indexOf(imageUrl)
    
    console.log(`🔍 Looking for image: ${imageUrl}`)
    console.log(`📋 Current images:`, project.images)
    console.log(`📍 Image index: ${imageIndex}`)
    
    if (imageIndex === -1) {
      console.log(`❌ Image not found in project images`)
      return res.status(404).json({
        success: false,
        error: "Image not found in project"
      })
    }
    
    // Remove the image
    project.images.splice(imageIndex, 1)
    project.updatedAt = new Date().toISOString()
    
    console.log(`✂️ Removed image at index ${imageIndex}`)
    console.log(`📋 Remaining images:`, project.images)
    
    // If this was the cover image, update it
    if (project.image === imageUrl) {
      const newCoverImage = project.images.length > 0 ? project.images[0] : null
      project.image = newCoverImage
      console.log(`🖼️ Updated cover image to: ${newCoverImage}`)
    }
    
    // Save to file
    saveData(PROJECTS_FILE, projects)
    
    console.log("🗑️ Image removed from project:", project.title)
    
    res.json({
      success: true,
      message: "Image removed successfully",
      data: project
    })
    
  } catch (error) {
    console.error("❌ Error removing image from project:", error)
    res.status(500).json({
      success: false,
      error: "Failed to remove image",
      details: error.message
    })
  }
})

// PUT set cover image for project
app.put("/api/projects/:id/cover", (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const { imageUrl } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Image URL is required"
      })
    }
    
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }
    
    // Check if the image exists in the project's images
    const project = projects[projectIndex]
    if (!project.images || !project.images.includes(imageUrl)) {
      return res.status(400).json({
        success: false,
        error: "Image not found in project images"
      })
    }
    
    // Set as cover image
    project.image = imageUrl
    project.updatedAt = new Date().toISOString()
    
    // Save to file
    saveData(PROJECTS_FILE, projects)
    
    console.log("🖼️ Cover image set for project:", project.title)
    
    res.json({
      success: true,
      message: "Cover image set successfully",
      data: project
    })
    
  } catch (error) {
    console.error("❌ Error setting cover image:", error)
    res.status(500).json({
      success: false,
      error: "Failed to set cover image",
      details: error.message
    })
  }
})

// PARTNERS ROUTES
app.get("/api/partners", (req, res) => {
  try {
    res.json({
      success: true,
      data: partners,
      count: partners.length,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch partners" })
  }
})

// POST create new partner
app.post("/api/partners", upload.single('logo'), (req, res) => {
  try {
    const parsedOrder = Number.parseInt(req.body.order)
    const isActive = req.body.active !== undefined ? (req.body.active === 'true' || req.body.active === true) : true

    const newPartner = {
      id: Date.now(),
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      logo: req.file ? `/uploads/${req.file.filename}` : null,
      order: Number.isNaN(parsedOrder) ? partners.length : parsedOrder,
      active: isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    partners.push(newPartner)
    saveData(PARTNERS_FILE, partners)

    console.log("✅ Partner created successfully:", newPartner.name)

    res.json({
      success: true,
      data: newPartner,
      message: "Partner created successfully"
    })
  } catch (error) {
    console.error("❌ Error creating partner:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create partner",
      details: error.message
    })
  }
})

// PUT update existing partner
app.put("/api/partners/:id", upload.single('logo'), (req, res) => {
  try {
    const partnerId = Number.parseInt(req.params.id)
    const partnerIndex = partners.findIndex(p => p.id === partnerId)

    if (partnerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Partner not found"
      })
    }

    const existingPartner = partners[partnerIndex]
    const parsedOrder = Number.parseInt(req.body.order)
    const isActive = req.body.active !== undefined
      ? (req.body.active === 'true' || req.body.active === true)
      : existingPartner.active

    const updatedPartner = {
      ...existingPartner,
      name: req.body.name || existingPartner.name,
      description: req.body.description || existingPartner.description,
      website: req.body.website || existingPartner.website,
      logo: req.file ? `/uploads/${req.file.filename}` : existingPartner.logo,
      order: Number.isNaN(parsedOrder) ? existingPartner.order : parsedOrder,
      active: isActive,
      updatedAt: new Date().toISOString()
    }

    partners[partnerIndex] = updatedPartner
    saveData(PARTNERS_FILE, partners)

    console.log("✅ Partner updated successfully:", updatedPartner.name)

    res.json({
      success: true,
      data: updatedPartner,
      message: "Partner updated successfully"
    })
  } catch (error) {
    console.error("❌ Error updating partner:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update partner",
      details: error.message
    })
  }
})

// DELETE partner
app.delete("/api/partners/:id", (req, res) => {
  try {
    const partnerId = Number.parseInt(req.params.id)
    const partnerIndex = partners.findIndex(p => p.id === partnerId)

    if (partnerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Partner not found"
      })
    }

    const deletedPartner = partners[partnerIndex]
    partners.splice(partnerIndex, 1)
    saveData(PARTNERS_FILE, partners)

    console.log("🗑️ Partner deleted successfully:", deletedPartner.name)

    res.json({
      success: true,
      message: "Partner deleted successfully",
      data: { id: partnerId }
    })
  } catch (error) {
    console.error("❌ Error deleting partner:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete partner",
      details: error.message
    })
  }
})

// BLOG ROUTES
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

// POST create new blog
app.post("/api/blogs", upload.single('image'), (req, res) => {
  try {
    // Handle both 'status' and 'published' fields for backward compatibility
    let status = 'draft'; // Default to draft
    if (req.body.status) {
      status = req.body.status;
    } else if (req.body.published !== undefined) {
      status = (req.body.published === 'true' || req.body.published === true) ? 'published' : 'draft';
    }
    
    const newBlog = {
      id: Date.now(),
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || "Admin",
      excerpt: req.body.excerpt || req.body.content?.substring(0, 200),
      category: req.body.category || "",
      tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : req.body.tags) : [],
      status: status,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    blogPosts.push(newBlog)
    saveData(BLOGS_FILE, blogPosts)
    
    console.log("✅ Blog created successfully:", newBlog.title)
    
    res.json({
      success: true,
      data: newBlog,
      message: "Blog created successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating blog:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create blog",
      details: error.message
    })
  }
})

// PUT update existing blog
app.put("/api/blogs/:id", upload.single('image'), (req, res) => {
  try {
    const blogId = parseInt(req.params.id)
    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    
    if (blogIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Blog not found"
      })
    }
    
    const existingBlog = blogPosts[blogIndex]
    
    // Handle both 'status' and 'published' fields for backward compatibility
    let status = existingBlog.status || (existingBlog.published ? 'published' : 'draft');
    if (req.body.status) {
      status = req.body.status;
    } else if (req.body.published !== undefined) {
      status = (req.body.published === 'true' || req.body.published === true) ? 'published' : 'draft';
    }
    
    const updatedBlog = {
      ...existingBlog,
      title: req.body.title || existingBlog.title,
      content: req.body.content || existingBlog.content,
      author: req.body.author || existingBlog.author,
      excerpt: req.body.excerpt || existingBlog.excerpt,
      category: req.body.category || existingBlog.category,
      tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : req.body.tags) : (existingBlog.tags || []),
      status: status,
      image: req.file ? `/uploads/${req.file.filename}` : existingBlog.image,
      updatedAt: new Date().toISOString()
    }
    
    blogPosts[blogIndex] = updatedBlog
    saveData(BLOGS_FILE, blogPosts)
    
    console.log("✅ Blog updated successfully:", updatedBlog.title)
    
    res.json({
      success: true,
      data: updatedBlog,
      message: "Blog updated successfully"
    })
    
  } catch (error) {
    console.error("❌ Error updating blog:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update blog",
      details: error.message
    })
  }
})

// DELETE blog
app.delete("/api/blogs/:id", (req, res) => {
  try {
    const blogId = parseInt(req.params.id)
    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    
    if (blogIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Blog not found"
      })
    }
    
    const deletedBlog = blogPosts[blogIndex]
    blogPosts.splice(blogIndex, 1)
    saveData(BLOGS_FILE, blogPosts)
    
    console.log("🗑️ Blog deleted successfully:", deletedBlog.title)
    
    res.json({
      success: true,
      message: "Blog deleted successfully",
      data: { id: blogId }
    })
    
  } catch (error) {
    console.error("❌ Error deleting blog:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete blog",
      details: error.message
    })
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

// POST create new client
app.post("/api/clients", upload.single('logo'), (req, res) => {
  try {
    const newClient = {
      id: Date.now(),
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      contact: req.body.contact,
      logo: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    clients.push(newClient)
    saveData(CLIENTS_FILE, clients)
    
    console.log("✅ Client created successfully:", newClient.name)
    
    res.json({
      success: true,
      data: newClient,
      message: "Client created successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating client:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create client",
      details: error.message
    })
  }
})

// PUT update existing client
app.put("/api/clients/:id", upload.single('logo'), (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const clientIndex = clients.findIndex(c => c.id === clientId)
    
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Client not found"
      })
    }
    
    const existingClient = clients[clientIndex]
    
    const updatedClient = {
      ...existingClient,
      name: req.body.name || existingClient.name,
      description: req.body.description || existingClient.description,
      website: req.body.website || existingClient.website,
      contact: req.body.contact || existingClient.contact,
      logo: req.file ? `/uploads/${req.file.filename}` : existingClient.logo,
      updatedAt: new Date().toISOString()
    }
    
    clients[clientIndex] = updatedClient
    saveData(CLIENTS_FILE, clients)
    
    console.log("✅ Client updated successfully:", updatedClient.name)
    
    res.json({
      success: true,
      data: updatedClient,
      message: "Client updated successfully"
    })
    
  } catch (error) {
    console.error("❌ Error updating client:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update client",
      details: error.message
    })
  }
})

// DELETE client
app.delete("/api/clients/:id", (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const clientIndex = clients.findIndex(c => c.id === clientId)
    
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Client not found"
      })
    }
    
    const deletedClient = clients[clientIndex]
    clients.splice(clientIndex, 1)
    saveData(CLIENTS_FILE, clients)
    
    console.log("🗑️ Client deleted successfully:", deletedClient.name)
    
    res.json({
      success: true,
      message: "Client deleted successfully",
      data: { id: clientId }
    })
    
  } catch (error) {
    console.error("❌ Error deleting client:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete client",
      details: error.message
    })
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

// POST create new team member
app.post("/api/team-members", upload.single('image'), (req, res) => {
  try {
    const newMember = {
      id: Date.now(),
      name: req.body.name,
      title: req.body.title,
      position: req.body.position,
      bio: req.body.bio,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    teamMembers.push(newMember)
    saveData(TEAM_MEMBERS_FILE, teamMembers)
    
    console.log("✅ Team member created successfully:", newMember.name)
    
    res.json({
      success: true,
      data: newMember,
      message: "Team member created successfully"
    })
    
  } catch (error) {
    console.error("❌ Error creating team member:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create team member",
      details: error.message
    })
  }
})

// PUT update existing team member
app.put("/api/team-members/:id", upload.single('image'), (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Team member not found"
      })
    }
    
    const existingMember = teamMembers[memberIndex]
    
    const updatedMember = {
      ...existingMember,
      name: req.body.name || existingMember.name,
      title: req.body.title || existingMember.title,
      position: req.body.position || existingMember.position,
      bio: req.body.bio || existingMember.bio,
      email: req.body.email || existingMember.email,
      phone: req.body.phone || existingMember.phone,
      image: req.file ? `/uploads/${req.file.filename}` : existingMember.image,
      updatedAt: new Date().toISOString()
    }
    
    teamMembers[memberIndex] = updatedMember
    saveData(TEAM_MEMBERS_FILE, teamMembers)
    
    console.log("✅ Team member updated successfully:", updatedMember.name)
    
    res.json({
      success: true,
      data: updatedMember,
      message: "Team member updated successfully"
    })
    
  } catch (error) {
    console.error("❌ Error updating team member:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update team member",
      details: error.message
    })
  }
})

// DELETE team member
app.delete("/api/team-members/:id", (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Team member not found"
      })
    }
    
    const deletedMember = teamMembers[memberIndex]
    teamMembers.splice(memberIndex, 1)
    saveData(TEAM_MEMBERS_FILE, teamMembers)
    
    console.log("🗑️ Team member deleted successfully:", deletedMember.name)
    
    res.json({
      success: true,
      message: "Team member deleted successfully",
      data: { id: memberId }
    })
    
  } catch (error) {
    console.error("❌ Error deleting team member:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete team member",
      details: error.message
    })
  }
})

// POST upload media files
app.post("/api/media/upload", upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded"
      })
    }
    
    const uploadedFiles = req.files.map(file => `/uploads/${file.filename}`)
    
    console.log("📷 Media files uploaded:", uploadedFiles.length)
    
    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles
    })
    
  } catch (error) {
    console.error("❌ Error uploading media:", error)
    res.status(500).json({
      success: false,
      error: "Failed to upload media",
      details: error.message
    })
  }
})

// POST contact form submission
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = {
      id: Date.now(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
      status: "new",
      createdAt: new Date().toISOString()
    }
    
    contacts.push(newContact)
    saveData(CONTACTS_FILE, contacts)
    
    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@namasarchitecture.com',
        to: CONTACT_EMAIL,
        subject: `New Contact Form Submission from ${newContact.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${newContact.name}</p>
          <p><strong>Email:</strong> ${newContact.email}</p>
          <p><strong>Phone:</strong> ${newContact.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${newContact.subject || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <p>${newContact.message.replace(/\n/g, '<br>')}</p>
          <p><strong>Submitted:</strong> ${new Date(newContact.createdAt).toLocaleString()}</p>
          <hr>
          <p><em>This message was sent from the Namas Architecture website contact form.</em></p>
        `
      }

      console.log('📧 Attempting to send email to:', CONTACT_EMAIL)
      console.log('📧 From:', mailOptions.from)
      console.log('📧 Subject:', mailOptions.subject)
      
      const info = await transporter.sendMail(mailOptions)
      console.log("✅ Contact form submitted and email sent successfully:", newContact.name)
      console.log("📧 Email info:", info.messageId)
    } catch (emailError) {
      console.error("❌ Error sending email notification:", emailError.message)
      console.error("❌ Email error details:", {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode
      })
      // Don't fail the request if email fails - still save the contact
    }
    
    res.json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact
    })
    
  } catch (error) {
    console.error("❌ Error submitting contact form:", error)
    res.status(500).json({
      success: false,
      error: "Failed to submit contact form",
      details: error.message
    })
  }
})

// Test email endpoint (for debugging)
app.post("/api/test-email", async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...')
    
    // First verify connection
    await transporter.verify()
    console.log('✅ Email connection verified')
    
    // Send test email
    const testMailOptions = {
      from: process.env.EMAIL_USER || 'noreply@namasarchitecture.com',
      to: CONTACT_EMAIL,
      subject: 'Test Email from Namas Architecture Server',
      html: `
        <h2>Email Test</h2>
        <p>This is a test email to verify the email configuration is working.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>Server URL:</strong> ${req.protocol}://${req.get('host')}</p>
      `
    }
    
    const info = await transporter.sendMail(testMailOptions)
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        messageId: info.messageId,
        from: testMailOptions.from,
        to: testMailOptions.to,
        timestamp: new Date().toISOString()
      }
    })
    
    console.log('✅ Test email sent successfully:', info.messageId)
    
  } catch (error) {
    console.error('❌ Test email failed:', error)
    res.status(500).json({
      success: false,
      error: "Test email failed",
      details: {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      }
    })
  }
})

// GET contacts (for admin)
app.get("/api/contacts", (req, res) => {
  try {
    res.json({
      success: true,
      data: contacts,
      count: contacts.length
    })
  } catch (error) {
    console.error("❌ Error fetching contacts:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch contacts"
    })
  }
})

// PUT update contact status
app.put("/api/contacts/:id", (req, res) => {
  try {
    const contactId = parseInt(req.params.id)
    const contactIndex = contacts.findIndex(c => c.id === contactId)
    
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Contact not found"
      })
    }
    
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      status: req.body.status || contacts[contactIndex].status,
      updatedAt: new Date().toISOString()
    }
    
    saveData(CONTACTS_FILE, contacts)
    
    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contacts[contactIndex]
    })
    
  } catch (error) {
    console.error("❌ Error updating contact:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update contact",
      details: error.message
    })
  }
})

// POST search functionality
app.post("/api/search", (req, res) => {
  try {
    const { query, type } = req.body
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      })
    }
    
    let results = []
    const searchQuery = query.toLowerCase()
    
    // Search in projects
    if (!type || type === 'projects') {
      const projectResults = projects.filter(project => 
        project.title?.toLowerCase().includes(searchQuery) ||
        project.description?.toLowerCase().includes(searchQuery) ||
        project.category?.toLowerCase().includes(searchQuery) ||
        project.location?.toLowerCase().includes(searchQuery)
      ).map(project => ({ ...project, type: 'project' }))
      
      results = results.concat(projectResults)
    }
    
    // Search in blogs
    if (!type || type === 'blogs') {
      const blogResults = blogPosts.filter(blog => 
        blog.title?.toLowerCase().includes(searchQuery) ||
        blog.content?.toLowerCase().includes(searchQuery) ||
        blog.excerpt?.toLowerCase().includes(searchQuery)
      ).map(blog => ({ ...blog, type: 'blog' }))
      
      results = results.concat(blogResults)
    }
    
    console.log(`🔍 Search performed for "${query}", found ${results.length} results`)
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query: query
    })
    
  } catch (error) {
    console.error("❌ Error performing search:", error)
    res.status(500).json({
      success: false,
      error: "Search failed",
      details: error.message
    })
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
      "GET /test",
      "GET /config",
      "GET /api/config",
      "GET /api/projects",
      "GET /api/projects/featured",
      "GET /api/projects/:id",
      "POST /api/projects",
      "PUT /api/projects/:id",
      "DELETE /api/projects/:id",
      "POST /api/projects/:id/images",
      "DELETE /api/projects/:id/images",
      "PUT /api/projects/:id/cover",
      "GET /api/blogs",
      "POST /api/blogs",
      "PUT /api/blogs/:id",
      "DELETE /api/blogs/:id",
      "GET /api/clients",
      "POST /api/clients",
      "PUT /api/clients/:id",
      "DELETE /api/clients/:id",
      "GET /api/partners",
      "POST /api/partners",
      "PUT /api/partners/:id",
      "DELETE /api/partners/:id",
      "GET /api/team-members",
      "POST /api/team-members",
      "PUT /api/team-members/:id",
      "DELETE /api/team-members/:id",
      "GET /api/contacts",
      "POST /api/contact",
      "PUT /api/contacts/:id",
      "POST /api/search",
      "POST /api/media/upload",
    ],
  })
})

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 NAMAS Architecture API Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`)
  console.log(`📡 Server URL: http://0.0.0.0:${PORT}`)
  console.log(
    `📊 Loaded: ${projects.length} projects, ${blogPosts.length} blogs, ${clients.length} clients, ${partners.length} partners, ${teamMembers.length} team members, ${contacts.length} contacts`,
  )
  
  // Verify email connection
  console.log('📧 Verifying email configuration...')
  await verifyEmailConnection()
})