const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const nodemailer = require("nodemailer")
require("dotenv").config() // Load environment variables
const { createBackup } = require("./data-backup")
const { isDbEnabled, initDb, query: dbQuery } = require('./db')

const app = express()
const PORT = process.env.PORT || 8080

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

// Load data from files
const teamMembers = loadData(TEAM_MEMBERS_FILE)
const projects = loadData(PROJECTS_FILE)
const blogPosts = loadData(BLOGS_FILE)
const clients = loadData(CLIENTS_FILE)
const contacts = loadData(CONTACTS_FILE)

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
    const filesToSeed = ["projects.json", "blogs.json", "clients.json", "contacts.json", "team-members.json"]
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

// Setup uploads
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
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
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
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
    const limit = Number.parseInt(req.query.limit) || 0
    const startIndex = (page - 1) * (limit || 1)

    if (isDbEnabled) {
      if (limit > 0) {
        const [{ rows: totalRows }, { rows }] = await Promise.all([
          dbQuery('SELECT COUNT(*)::int as total FROM projects'),
          dbQuery('SELECT * FROM projects ORDER BY created_at DESC OFFSET $1 LIMIT $2', [startIndex, limit]),
        ])
        const total = totalRows[0].total
        const totalPages = Math.ceil(total / limit)
        return res.json({
          success: true,
          data: rows,
          count: rows.length,
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        })
      } else {
        const { rows } = await dbQuery('SELECT * FROM projects ORDER BY created_at DESC')
        return res.json({ success: true, data: rows, count: rows.length, total: rows.length, page: 1, totalPages: 1, hasMore: false })
      }
    }

    // Fallback to JSON files
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
      totalPages,
      hasMore: limit > 0 ? page < totalPages : false,
    })
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch projects', details: error.message })
  }
})

// GET featured projects (for hero banner) - MUST come before /:id route
app.get("/api/projects/featured", async (req, res) => {
  try {
    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM projects WHERE featured = TRUE ORDER BY created_at DESC LIMIT 8')
      return res.json({ success: true, data: rows, count: rows.length })
    }
    const featuredProjects = projects.filter((project) => project.featured === true).slice(0, 8)
    res.json({ success: true, data: featuredProjects, count: featuredProjects.length })
  } catch (error) {
    console.error('❌ Error fetching featured projects:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch featured projects', details: error.message })
  }
})

// GET single project by ID - MUST come after /featured route
app.get("/api/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id

    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM projects WHERE id = $1 LIMIT 1', [projectId])
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Project not found' })
      return res.json({ success: true, data: rows[0] })
    }

    const project = projects.find(p => {
      return p.id === Number.parseInt(projectId) || p.id === projectId || p.id.toString() === projectId
    })
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (error) {
    console.error("❌ Error fetching project:", error)
    res.status(500).json({ success: false, error: "Failed to fetch project", details: error.message })
  }
})

// POST new project
app.post("/api/projects", upload.array('images', 10), async (req, res) => {
  try {
    console.log("📝 Creating new project:", req.body)
    
    // Parse project data from request body
    const projectData = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      year: req.body.year,
      client: req.body.client,
      designTeam: req.body.designTeam, 
      featured: req.body.featured === 'true' || req.body.featured === true,
      status: req.body.status || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(file => `/uploads/${file.filename}`)
      // Set the first uploaded image as the cover image
      projectData.image = projectData.images[0]
    } else {
      projectData.images = []
      projectData.image = null
    }
    
    // Validate required fields
    if (!projectData.title || !projectData.description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required"
      })
    }
    
    // Persist
    if (isDbEnabled) {
      await dbQuery(
        `INSERT INTO projects (id, title, description, category, location, year, client, design_team, featured, status, image, images, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14)`,
        [
          projectData.id,
          projectData.title,
          projectData.description,
          projectData.category || null,
          projectData.location || null,
          projectData.year || null,
          projectData.client || null,
          projectData.designTeam || null,
          projectData.featured,
          projectData.status || null,
          projectData.image || null,
          JSON.stringify(projectData.images || []),
          new Date(projectData.createdAt),
          new Date(projectData.updatedAt),
        ]
      )
    } else {
      projects.push(projectData)
      saveData(PROJECTS_FILE, projects)
    }
    
    console.log("✅ Project created successfully:", projectData.title)
    
    res.status(201).json({
      success: true,
      data: projectData,
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
    const projectId = parseInt(req.params.id)

    console.log("📝 Updating project:", projectId, req.body)

    if (isDbEnabled) {
      // Fetch existing from DB
      const { rows: [existing] } = await dbQuery('SELECT * FROM projects WHERE id = $1', [projectId])
      if (!existing) return res.status(404).json({ success: false, error: 'Project not found' })

      const updated = {
        ...existing,
        title: req.body.title || existing.title,
        description: req.body.description || existing.description,
        category: req.body.category || existing.category,
        location: req.body.location || existing.location,
        year: req.body.year || existing.year,
        client: req.body.client || existing.client,
        design_team: req.body.designTeam || existing.design_team,
        featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existing.featured,
        status: req.body.status || existing.status,
        updated_at: new Date(),
      }

      // Handle uploaded images
      let images = existing.images || []
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`)
        images = [...images, ...newImages]
        if (!updated.image && images.length > 0) updated.image = images[0]
      } else {
        images = Array.isArray(updated.images) ? updated.images : images
      }

      await dbQuery(
        `UPDATE projects SET
          title=$2, description=$3, category=$4, location=$5, year=$6, client=$7, design_team=$8, featured=$9, status=$10,
          image=$11, images=$12::jsonb, updated_at=$13
         WHERE id=$1`,
        [
          projectId,
          updated.title,
          updated.description,
          updated.category || null,
          updated.location || null,
          updated.year || null,
          updated.client || null,
          updated.design_team || null,
          updated.featured,
          updated.status || null,
          updated.image || null,
          JSON.stringify(images),
          updated.updated_at,
        ]
      )

      return res.json({ success: true, data: { ...updated, images }, message: 'Project updated successfully' })
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return res.status(404).json({ success: false, error: 'Project not found' })

    const existingProject = projects[projectIndex]
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
      status: req.body.status || existingProject.status,
      updatedAt: new Date().toISOString()
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`)
      updatedData.images = [...(existingProject.images || []), ...newImages]
      if (!updatedData.image && updatedData.images.length > 0) {
        updatedData.image = updatedData.images[0]
      }
    }

    projects[projectIndex] = updatedData
    saveData(PROJECTS_FILE, projects)

    res.json({ success: true, data: updatedData, message: 'Project updated successfully' })
  } catch (error) {
    console.error("❌ Error updating project:", error)
    res.status(500).json({ success: false, error: "Failed to update project", details: error.message })
  }
})

// DELETE project
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)

    if (isDbEnabled) {
      const { rowCount } = await dbQuery('DELETE FROM projects WHERE id = $1', [projectId])
      if (rowCount === 0) return res.status(404).json({ success: false, error: 'Project not found' })
      return res.json({ success: true, message: 'Project deleted successfully', data: { id: projectId } })
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return res.status(404).json({ success: false, error: 'Project not found' })

    const projectToDelete = projects[projectIndex]
    projects.splice(projectIndex, 1)
    saveData(PROJECTS_FILE, projects)

    res.json({ success: true, message: 'Project deleted successfully', data: { id: projectId } })
  } catch (error) {
    console.error("❌ Error deleting project:", error)
    res.status(500).json({ success: false, error: "Failed to delete project", details: error.message })
  }
})

// POST add images to existing project
app.post("/api/projects/:id/images", upload.array('images', 10), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No images uploaded" })
    }

    const newImages = req.files.map(file => `/uploads/${file.filename}`)

    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT images, image, title FROM projects WHERE id = $1', [projectId])
      if (!existing) return res.status(404).json({ success: false, error: 'Project not found' })
      const images = [...(existing.images || []), ...newImages]
      const cover = existing.image || images[0] || null
      await dbQuery('UPDATE projects SET images=$2::jsonb, image=$3, updated_at=NOW() WHERE id=$1', [projectId, JSON.stringify(images), cover])
      return res.json({ success: true, message: 'Images added successfully', data: { projectId, newImages, totalImages: images.length } })
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return res.status(404).json({ success: false, error: 'Project not found' })
    projects[projectIndex].images = [...(projects[projectIndex].images || []), ...newImages]
    projects[projectIndex].updatedAt = new Date().toISOString()
    saveData(PROJECTS_FILE, projects)
    res.json({ success: true, message: 'Images added successfully', data: { projectId, newImages, totalImages: projects[projectIndex].images.length } })
  } catch (error) {
    console.error("❌ Error adding images to project:", error)
    res.status(500).json({ success: false, error: "Failed to add images", details: error.message })
  }
})

// DELETE remove image from project
app.delete("/api/projects/:id/images", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ success: false, error: 'Image URL is required' })

    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT images, image, title FROM projects WHERE id=$1', [projectId])
      if (!existing) return res.status(404).json({ success: false, error: 'Project not found' })
      const images = Array.isArray(existing.images) ? existing.images.filter((u) => u !== imageUrl) : []
      const cover = existing.image === imageUrl ? (images[0] || null) : existing.image
      await dbQuery('UPDATE projects SET images=$2::jsonb, image=$3, updated_at=NOW() WHERE id=$1', [projectId, JSON.stringify(images), cover])
      return res.json({ success: true, message: 'Image removed successfully', data: { projectId, removedImage: imageUrl, remainingImages: images.length } })
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return res.status(404).json({ success: false, error: 'Project not found' })
    const project = projects[projectIndex]
    const imageIndex = project.images?.indexOf(imageUrl) || -1
    if (imageIndex === -1) return res.status(404).json({ success: false, error: 'Image not found in project' })
    project.images.splice(imageIndex, 1)
    project.updatedAt = new Date().toISOString()
    if (project.image === imageUrl) project.image = project.images.length > 0 ? project.images[0] : null
    saveData(PROJECTS_FILE, projects)
    res.json({ success: true, message: 'Image removed successfully', data: { projectId, removedImage: imageUrl, remainingImages: project.images.length } })
  } catch (error) {
    console.error("❌ Error removing image from project:", error)
    res.status(500).json({ success: false, error: "Failed to remove image", details: error.message })
  }
})

// PUT set cover image for project
app.put("/api/projects/:id/cover", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ success: false, error: 'Image URL is required' })

    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT images, title FROM projects WHERE id=$1', [projectId])
      if (!existing) return res.status(404).json({ success: false, error: 'Project not found' })
      if (!Array.isArray(existing.images) || !existing.images.includes(imageUrl)) return res.status(400).json({ success: false, error: 'Image not found in project images' })
      await dbQuery('UPDATE projects SET image=$2, updated_at=NOW() WHERE id=$1', [projectId, imageUrl])
      return res.json({ success: true, message: 'Cover image set successfully', data: { projectId, coverImage: imageUrl } })
    }

    const projectIndex = projects.findIndex(p => p.id === projectId)
    if (projectIndex === -1) return res.status(404).json({ success: false, error: 'Project not found' })
    const project = projects[projectIndex]
    if (!project.images || !project.images.includes(imageUrl)) return res.status(400).json({ success: false, error: 'Image not found in project images' })
    project.image = imageUrl
    project.updatedAt = new Date().toISOString()
    saveData(PROJECTS_FILE, projects)
    res.json({ success: true, message: 'Cover image set successfully', data: { projectId, coverImage: imageUrl } })
  } catch (error) {
    console.error("❌ Error setting cover image:", error)
    res.status(500).json({ success: false, error: "Failed to set cover image", details: error.message })
  }
})

// Your existing blogs logic
app.get("/api/blogs", async (req, res) => {
  try {
    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM blogs ORDER BY created_at DESC')
      return res.json({ success: true, data: rows, count: rows.length })
    }
    res.json({ success: true, data: blogPosts, count: blogPosts.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" })
  }
})

// POST create new blog
app.post("/api/blogs", upload.single('image'), async (req, res) => {
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
    
    if (isDbEnabled) {
      await dbQuery(
        `INSERT INTO blogs (id, title, content, author, excerpt, category, tags, status, image, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11)`,
        [
          newBlog.id,
          newBlog.title,
          newBlog.content,
          newBlog.author,
          newBlog.excerpt || null,
          newBlog.category || null,
          JSON.stringify(newBlog.tags || []),
          newBlog.status,
          newBlog.image || null,
          new Date(newBlog.createdAt),
          new Date(newBlog.updatedAt),
        ]
      )
    } else {
      blogPosts.push(newBlog)
      saveData(BLOGS_FILE, blogPosts)
    }
    
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
app.put("/api/blogs/:id", upload.single('image'), async (req, res) => {
  try {
    const blogId = parseInt(req.params.id)

    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT * FROM blogs WHERE id=$1', [blogId])
      if (!existing) return res.status(404).json({ success: false, error: 'Blog not found' })

      let status = existing.status || 'draft'
      if (req.body.status) status = req.body.status
      else if (req.body.published !== undefined) status = (req.body.published === 'true' || req.body.published === true) ? 'published' : 'draft'

      const tags = req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : req.body.tags) : (existing.tags || [])
      const image = req.file ? `/uploads/${req.file.filename}` : existing.image

      const updated = {
        ...existing,
        title: req.body.title || existing.title,
        content: req.body.content || existing.content,
        author: req.body.author || existing.author,
        excerpt: req.body.excerpt || existing.excerpt,
        category: req.body.category || existing.category,
        tags,
        status,
        image,
      }

      await dbQuery(
        `UPDATE blogs SET title=$2, content=$3, author=$4, excerpt=$5, category=$6, tags=$7::jsonb, status=$8, image=$9, updated_at=NOW() WHERE id=$1`,
        [blogId, updated.title, updated.content, updated.author, updated.excerpt || null, updated.category || null, JSON.stringify(updated.tags || []), updated.status, updated.image || null]
      )

      return res.json({ success: true, data: updated, message: 'Blog updated successfully' })
    }

    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    if (blogIndex === -1) return res.status(404).json({ success: false, error: 'Blog not found' })
    const existingBlog = blogPosts[blogIndex]
    let status = existingBlog.status || (existingBlog.published ? 'published' : 'draft')
    if (req.body.status) status = req.body.status
    else if (req.body.published !== undefined) status = (req.body.published === 'true' || req.body.published === true) ? 'published' : 'draft'
    const updatedBlog = {
      ...existingBlog,
      title: req.body.title || existingBlog.title,
      content: req.body.content || existingBlog.content,
      author: req.body.author || existingBlog.author,
      excerpt: req.body.excerpt || existingBlog.excerpt,
      category: req.body.category || existingBlog.category,
      tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : req.body.tags) : (existingBlog.tags || []),
      status,
      image: req.file ? `/uploads/${req.file.filename}` : existingBlog.image,
      updatedAt: new Date().toISOString()
    }
    blogPosts[blogIndex] = updatedBlog
    saveData(BLOGS_FILE, blogPosts)
    res.json({ success: true, data: updatedBlog, message: 'Blog updated successfully' })
  } catch (error) {
    console.error("❌ Error updating blog:", error)
    res.status(500).json({ success: false, error: "Failed to update blog", details: error.message })
  }
})

// DELETE blog
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const blogId = parseInt(req.params.id)

    if (isDbEnabled) {
      const { rowCount } = await dbQuery('DELETE FROM blogs WHERE id = $1', [blogId])
      if (rowCount === 0) return res.status(404).json({ success: false, error: 'Blog not found' })
      return res.json({ success: true, message: 'Blog deleted successfully', data: { id: blogId } })
    }

    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    if (blogIndex === -1) return res.status(404).json({ success: false, error: 'Blog not found' })
    blogPosts.splice(blogIndex, 1)
    saveData(BLOGS_FILE, blogPosts)
    res.json({ success: true, message: 'Blog deleted successfully', data: { id: blogId } })
  } catch (error) {
    console.error("❌ Error deleting blog:", error)
    res.status(500).json({ success: false, error: "Failed to delete blog", details: error.message })
  }
})

// Your existing clients logic
app.get("/api/clients", async (req, res) => {
  try {
    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM clients ORDER BY created_at DESC')
      return res.json({ success: true, data: rows, count: rows.length })
    }
    res.json({ success: true, data: clients, count: clients.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" })
  }
})

// POST create new client
app.post("/api/clients", upload.single('logo'), async (req, res) => {
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
    
    if (isDbEnabled) {
      await dbQuery(
        `INSERT INTO clients (id, name, description, website, contact, logo, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          newClient.id,
          newClient.name,
          newClient.description || null,
          newClient.website || null,
          newClient.contact || null,
          newClient.logo || null,
          new Date(newClient.createdAt),
          new Date(newClient.updatedAt),
        ]
      )
    } else {
      clients.push(newClient)
      saveData(CLIENTS_FILE, clients)
    }
    
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
app.put("/api/clients/:id", upload.single('logo'), async (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT * FROM clients WHERE id=$1', [clientId])
      if (!existing) return res.status(404).json({ success: false, error: 'Client not found' })
      const updated = {
        ...existing,
        name: req.body.name || existing.name,
        description: req.body.description || existing.description,
        website: req.body.website || existing.website,
        contact: req.body.contact || existing.contact,
        logo: req.file ? `/uploads/${req.file.filename}` : existing.logo,
      }
      await dbQuery(
        `UPDATE clients SET name=$2, description=$3, website=$4, contact=$5, logo=$6, updated_at=NOW() WHERE id=$1`,
        [clientId, updated.name, updated.description || null, updated.website || null, updated.contact || null, updated.logo || null]
      )
      return res.json({ success: true, data: updated, message: 'Client updated successfully' })
    }
    const clientIndex = clients.findIndex(c => c.id === clientId)
    if (clientIndex === -1) return res.status(404).json({ success: false, error: 'Client not found' })
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
    res.json({ success: true, data: updatedClient, message: 'Client updated successfully' })
  } catch (error) {
    console.error("❌ Error updating client:", error)
    res.status(500).json({ success: false, error: "Failed to update client", details: error.message })
  }
})

// DELETE client
app.delete("/api/clients/:id", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    if (isDbEnabled) {
      const { rowCount } = await dbQuery('DELETE FROM clients WHERE id=$1', [clientId])
      if (rowCount === 0) return res.status(404).json({ success: false, error: 'Client not found' })
      return res.json({ success: true, message: 'Client deleted successfully', data: { id: clientId } })
    }
    const clientIndex = clients.findIndex(c => c.id === clientId)
    if (clientIndex === -1) return res.status(404).json({ success: false, error: 'Client not found' })
    clients.splice(clientIndex, 1)
    saveData(CLIENTS_FILE, clients)
    res.json({ success: true, message: 'Client deleted successfully', data: { id: clientId } })
  } catch (error) {
    console.error("❌ Error deleting client:", error)
    res.status(500).json({ success: false, error: "Failed to delete client", details: error.message })
  }
})

// Your existing team members logic
app.get("/api/team-members", async (req, res) => {
  try {
    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM team_members ORDER BY created_at DESC')
      return res.json({ success: true, data: rows, count: rows.length })
    }
    res.json({ success: true, data: teamMembers, count: teamMembers.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" })
  }
})

// POST create new team member
app.post("/api/team-members", upload.single('image'), async (req, res) => {
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
    
    if (isDbEnabled) {
      await dbQuery(
        `INSERT INTO team_members (id, name, title, position, bio, email, phone, image, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          newMember.id,
          newMember.name,
          newMember.title || null,
          newMember.position || null,
          newMember.bio || null,
          newMember.email || null,
          newMember.phone || null,
          newMember.image || null,
          new Date(newMember.createdAt),
          new Date(newMember.updatedAt),
        ]
      )
    } else {
      teamMembers.push(newMember)
      saveData(TEAM_MEMBERS_FILE, teamMembers)
    }
    
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
app.put("/api/team-members/:id", upload.single('image'), async (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT * FROM team_members WHERE id=$1', [memberId])
      if (!existing) return res.status(404).json({ success: false, error: 'Team member not found' })
      const updated = {
        ...existing,
        name: req.body.name || existing.name,
        title: req.body.title || existing.title,
        position: req.body.position || existing.position,
        bio: req.body.bio || existing.bio,
        email: req.body.email || existing.email,
        phone: req.body.phone || existing.phone,
        image: req.file ? `/uploads/${req.file.filename}` : existing.image,
      }
      await dbQuery(
        `UPDATE team_members SET name=$2, title=$3, position=$4, bio=$5, email=$6, phone=$7, image=$8, updated_at=NOW() WHERE id=$1`,
        [memberId, updated.name, updated.title || null, updated.position || null, updated.bio || null, updated.email || null, updated.phone || null, updated.image || null]
      )
      return res.json({ success: true, data: updated, message: 'Team member updated successfully' })
    }
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return res.status(404).json({ success: false, error: 'Team member not found' })
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
    res.json({ success: true, data: updatedMember, message: 'Team member updated successfully' })
  } catch (error) {
    console.error("❌ Error updating team member:", error)
    res.status(500).json({ success: false, error: "Failed to update team member", details: error.message })
  }
})

// DELETE team member
app.delete("/api/team-members/:id", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    if (isDbEnabled) {
      const { rowCount } = await dbQuery('DELETE FROM team_members WHERE id=$1', [memberId])
      if (rowCount === 0) return res.status(404).json({ success: false, error: 'Team member not found' })
      return res.json({ success: true, message: 'Team member deleted successfully', data: { id: memberId } })
    }
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return res.status(404).json({ success: false, error: 'Team member not found' })
    teamMembers.splice(memberIndex, 1)
    saveData(TEAM_MEMBERS_FILE, teamMembers)
    res.json({ success: true, message: 'Team member deleted successfully', data: { id: memberId } })
  } catch (error) {
    console.error("❌ Error deleting team member:", error)
    res.status(500).json({ success: false, error: "Failed to delete team member", details: error.message })
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
    
    if (isDbEnabled) {
      await dbQuery(
        `INSERT INTO contacts (id, name, email, phone, subject, message, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          newContact.id,
          newContact.name,
          newContact.email || null,
          newContact.phone || null,
          newContact.subject || null,
          newContact.message || null,
          newContact.status,
          new Date(newContact.createdAt),
        ]
      )
    } else {
      contacts.push(newContact)
      saveData(CONTACTS_FILE, contacts)
    }
    
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
app.get("/api/contacts", async (req, res) => {
  try {
    if (isDbEnabled) {
      const { rows } = await dbQuery('SELECT * FROM contacts ORDER BY created_at DESC')
      return res.json({ success: true, data: rows, count: rows.length })
    }
    res.json({ success: true, data: contacts, count: contacts.length })
  } catch (error) {
    console.error("❌ Error fetching contacts:", error)
    res.status(500).json({ success: false, error: "Failed to fetch contacts" })
  }
})

// PUT update contact status
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const contactId = parseInt(req.params.id)
    const newStatus = req.body.status
    if (isDbEnabled) {
      const { rows: [existing] } = await dbQuery('SELECT * FROM contacts WHERE id=$1', [contactId])
      if (!existing) return res.status(404).json({ success: false, error: 'Contact not found' })
      const updatedAt = new Date()
      await dbQuery('UPDATE contacts SET status=$2, updated_at=$3 WHERE id=$1', [contactId, newStatus || existing.status, updatedAt])
      return res.json({ success: true, message: 'Contact updated successfully', data: { ...existing, status: newStatus || existing.status, updated_at: updatedAt } })
    }
    const contactIndex = contacts.findIndex(c => c.id === contactId)
    if (contactIndex === -1) return res.status(404).json({ success: false, error: 'Contact not found' })
    contacts[contactIndex] = { ...contacts[contactIndex], status: newStatus || contacts[contactIndex].status, updatedAt: new Date().toISOString() }
    saveData(CONTACTS_FILE, contacts)
    res.json({ success: true, message: 'Contact updated successfully', data: contacts[contactIndex] })
  } catch (error) {
    console.error("❌ Error updating contact:", error)
    res.status(500).json({ success: false, error: "Failed to update contact", details: error.message })
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
    `📊 Loaded: ${projects.length} projects, ${blogPosts.length} blogs, ${clients.length} clients, ${teamMembers.length} team members, ${contacts.length} contacts`,
  )
  if (isDbEnabled) {
    try {
      await initDb()
      console.log('🗄️  Postgres connected and ready')

      // Seed DB from JSON files if tables are empty
      try {
        const [{ rows: [{ count: prjCount }] }, { rows: [{ count: blogCount }] }, { rows: [{ count: cliCount }] }, { rows: [{ count: teamCount }] }, { rows: [{ count: contactCount }] }] = await Promise.all([
          dbQuery('SELECT COUNT(*)::int as count FROM projects'),
          dbQuery('SELECT COUNT(*)::int as count FROM blogs'),
          dbQuery('SELECT COUNT(*)::int as count FROM clients'),
          dbQuery('SELECT COUNT(*)::int as count FROM team_members'),
          dbQuery('SELECT COUNT(*)::int as count FROM contacts'),
        ])

        if (projects.length > 0 && prjCount === 0) {
          console.log(`⬆️ Seeding ${projects.length} projects to Postgres...`)
          for (const p of projects) {
            await dbQuery(
              `INSERT INTO projects (id, title, description, category, location, year, client, design_team, featured, status, image, images, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14)
               ON CONFLICT (id) DO UPDATE SET
                 title=EXCLUDED.title,
                 description=EXCLUDED.description,
                 category=EXCLUDED.category,
                 location=EXCLUDED.location,
                 year=EXCLUDED.year,
                 client=EXCLUDED.client,
                 design_team=EXCLUDED.design_team,
                 featured=EXCLUDED.featured,
                 status=EXCLUDED.status,
                 image=EXCLUDED.image,
                 images=EXCLUDED.images,
                 updated_at=EXCLUDED.updated_at`,
              [
                p.id,
                p.title,
                p.description,
                p.category || null,
                p.location || null,
                p.year || null,
                p.client || null,
                p.designTeam || null,
                Boolean(p.featured),
                p.status || null,
                p.image || null,
                JSON.stringify(p.images || []),
                p.createdAt ? new Date(p.createdAt) : new Date(),
                p.updatedAt ? new Date(p.updatedAt) : new Date(),
              ]
            )
          }
          console.log('✅ Projects seeded')
        }

        if (blogPosts.length > 0 && blogCount === 0) {
          console.log(`⬆️ Seeding ${blogPosts.length} blogs to Postgres...`)
          for (const b of blogPosts) {
            await dbQuery(
              `INSERT INTO blogs (id, title, content, author, excerpt, category, tags, status, image, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11)
               ON CONFLICT (id) DO UPDATE SET
                 title=EXCLUDED.title,
                 content=EXCLUDED.content,
                 author=EXCLUDED.author,
                 excerpt=EXCLUDED.excerpt,
                 category=EXCLUDED.category,
                 tags=EXCLUDED.tags,
                 status=EXCLUDED.status,
                 image=EXCLUDED.image,
                 updated_at=EXCLUDED.updated_at`,
              [
                b.id,
                b.title,
                b.content,
                b.author || 'Admin',
                b.excerpt || null,
                b.category || null,
                JSON.stringify(b.tags || []),
                b.status || (b.published ? 'published' : 'draft'),
                b.image || null,
                b.createdAt ? new Date(b.createdAt) : new Date(),
                b.updatedAt ? new Date(b.updatedAt) : new Date(),
              ]
            )
          }
          console.log('✅ Blogs seeded')
        }

        if (clients.length > 0 && cliCount === 0) {
          console.log(`⬆️ Seeding ${clients.length} clients to Postgres...`)
          for (const c of clients) {
            await dbQuery(
              `INSERT INTO clients (id, name, description, website, contact, logo, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
               ON CONFLICT (id) DO UPDATE SET
                 name=EXCLUDED.name,
                 description=EXCLUDED.description,
                 website=EXCLUDED.website,
                 contact=EXCLUDED.contact,
                 logo=EXCLUDED.logo,
                 updated_at=EXCLUDED.updated_at`,
              [
                c.id,
                c.name,
                c.description || null,
                c.website || null,
                c.contact || null,
                c.logo || null,
                c.createdAt ? new Date(c.createdAt) : new Date(),
                c.updatedAt ? new Date(c.updatedAt) : new Date(),
              ]
            )
          }
          console.log('✅ Clients seeded')
        }

        if (teamMembers.length > 0 && teamCount === 0) {
          console.log(`⬆️ Seeding ${teamMembers.length} team members to Postgres...`)
          for (const m of teamMembers) {
            await dbQuery(
              `INSERT INTO team_members (id, name, title, position, bio, email, phone, image, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
               ON CONFLICT (id) DO UPDATE SET
                 name=EXCLUDED.name,
                 title=EXCLUDED.title,
                 position=EXCLUDED.position,
                 bio=EXCLUDED.bio,
                 email=EXCLUDED.email,
                 phone=EXCLUDED.phone,
                 image=EXCLUDED.image,
                 updated_at=EXCLUDED.updated_at`,
              [
                m.id,
                m.name,
                m.title || null,
                m.position || null,
                m.bio || null,
                m.email || null,
                m.phone || null,
                m.image || null,
                m.createdAt ? new Date(m.createdAt) : new Date(),
                m.updatedAt ? new Date(m.updatedAt) : new Date(),
              ]
            )
          }
          console.log('✅ Team members seeded')
        }

        if (contacts.length > 0 && contactCount === 0) {
          console.log(`⬆️ Seeding ${contacts.length} contacts to Postgres...`)
          for (const ct of contacts) {
            await dbQuery(
              `INSERT INTO contacts (id, name, email, phone, subject, message, status, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (id) DO UPDATE SET
                 name=EXCLUDED.name,
                 email=EXCLUDED.email,
                 phone=EXCLUDED.phone,
                 subject=EXCLUDED.subject,
                 message=EXCLUDED.message,
                 status=EXCLUDED.status,
                 updated_at=EXCLUDED.updated_at`,
              [
                ct.id,
                ct.name,
                ct.email || null,
                ct.phone || null,
                ct.subject || null,
                ct.message || null,
                ct.status || null,
                ct.createdAt ? new Date(ct.createdAt) : new Date(),
                ct.updatedAt ? new Date(ct.updatedAt) : null,
              ]
            )
          }
          console.log('✅ Contacts seeded')
        }
      } catch (seedErr) {
        console.error('❌ Failed to seed Postgres from JSON files:', seedErr.message)
      }
    } catch (e) {
      console.error('❌ Failed to init Postgres:', e.message)
    }
  } else {
    console.warn('⚠️  Postgres not configured. Using JSON files only.')
  }
  
  // Verify email connection
  console.log('📧 Verifying email configuration...')
  await verifyEmailConnection()
})