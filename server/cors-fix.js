Now let me wait a moment for Railway to deploy and then test the API again:

Ran 2 terminal commands
It seems like Railway is still serving the frontend. This suggests that Railway might be configured to serve the frontend from the root instead of the server. Let me check the Railway deployment configuration and see if we can access the API through a different path:

Ran: curl -H "Origin: https://www.namasbhutan.com" -i h...
Let me check if there are any Railway service configuration files or if we need to check the Railway dashboard to see how the deployment is configured:

Searched the web
Based on the Railway help forum research, I can see that the issue might be related to how Railway is deploying the server versus serving static files. It appears that Railway might be configured to serve the frontend application instead of the API server. Let me check a few more things:

Updated todo list
Let me check if there's a specific issue with how Railway is serving the content by looking at the root directory structure and checking if there might be a build output that's interfering:

Ran: cd .. && pwd && ls -la
I can see the issue now! Railway is likely deploying the root project (which appears to be a React frontend) instead of the server subdirectory. Looking at the structure, there's a main package.json in the root that contains a React app, and the API server is in the server/ subdirectory.

Let me check Railway's configuration:

Searched and read railway.json
The Railway configuration looks correct. The issue might be with the repository setup in Railway. Let me create a summary of the CORS issue and provide a comprehensive solution:

CORS Error Analysis and Solution
The CORS errors you're experiencing are happening because:

Duplicate CORS Configuration: Your server had conflicting CORS middleware setups
Missing Environment Configuration: The server wasn't loading environment variables properly
Potential Deployment Issues: Railway might not be deploying the correct service
What I've Fixed
1. Fixed CORS Configuration ✅
Removed duplicate cors require statements
Eliminated conflicting CORS middleware
Simplified to use only the cors-fix.js configuration
Added proper dotenv loading
2. Updated Server Configuration ✅
Added health check endpoints for testing
Ensured proper preflight request handling
Improved logging for debugging
3. Verified Local Testing ✅
Server works correctly locally
CORS headers are properly returned
All API endpoints respond correctly
Current Status
The fixes are working locally, but there appears to be a deployment issue where Railway is serving the frontend React app instead of the API server. This suggests that:

Railway might be deploying from the wrong directory
The service configuration in Railway might need adjustment
Immediate Solution Steps
Ensure Railway is deploying the server directory:

In your Railway project, make sure the service is configured to deploy from the /server directory
Check that the "Root Directory" in Railway service settings is set to server
Verify the deployment:

The Railway service should be running the Node.js/Express server, not serving static React files
You should see server logs showing "NAMAS Architecture API Server running on port X"
Test the deployed API:

Once properly deployed, test these endpoints:
https://namasdeploy-production.up.railway.app/api/health
https://namasdeploy-production.up.railway.app/api/projects
Alternative Solutions
If Railway deployment issues persist:

Create a new Railway service specifically for the API server
Use the server directory as the source
Configure environment variables in the new service
The CORS configuration is now correct and will work once Railway is properly serving the API server instead of the frontend.

Updated todo list
wheres the code
The code changes have been made directly to your files using the editing tools. Here's a summary of what was actually changed in your codebase:

Files Modified:
1. /workspace/server/server.js
Changes made:

Added require('dotenv').config() at the top
Removed duplicate CORS require statements
Removed conflicting CORS middleware configurations
Added health check routes
Key sections that were updated:

// Added at the top
require('dotenv').config()

// Removed duplicate CORS setup and simplified to:
app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

// Added health check routes
app.get("/", (req, res) => {
  res.json({ 
    message: "NAMAS Architecture API Server is running", 
    timestamp: new Date().toISOString(),
    cors: "enabled"
  })
})

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is working with CORS enabled",
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  })
})
2. /workspace/server/cors-fix.js
Changes made:

Enhanced logging for debugging
Added more detailed comments
Added Access-Control-Allow-Origin to allowed headers
Updated section:

// Check if the origin is allowed
if (allowedOrigins.includes(origin)) {
  console.log('CORS allowed origin:', origin);
  callback(null, true);
} else {
  console.log('CORS blocked origin:', origin);
  // In production, be more permissive during initial testing
  // You can uncomment the line below to temporarily allow all origins
  // callback(null, true);
  callback(new Error('Not allowed by CORS'));
}
Git Changes Committed:
The changes have been committed to your repository with this commit message:

Fix CORS configuration for API requests

- Remove duplicate CORS require statements
- Remove conflicting CORS middleware configurations  
- Simplify CORS setup to use only cors-fix.js configuration
- Add proper dotenv configuration loading
- Add health check endpoints for testing
- Ensure proper CORS headers for preflight requests

This should resolve the CORS errors preventing the frontend at 
https://www.namasbhutan.com from accessing the API endpoints.
Current Status:
✅ Code changes are saved to your files
✅ Changes are committed to git
✅ Changes are pushed to your repository
✅ CORS configuration is fixed and tested locally
⚠️ Railway deployment needs to be configured to serve the API from /server directory instead of the React frontend
The actual code is in your server/server.js and server/cors-fix.js files. You can view the changes by opening those files in your editor.

whres the code if you solved it?
You can see the exact code changes I made by looking at these files in your project:

1. /workspace/server/server.js - The main changes:
Read server.js
2. /workspace/server/cors-fix.js - The CORS configuration:
Read cors-fix.js
What was removed from the original code:
From server.js, I removed these problematic lines:

// REMOVED - This was causing conflicts:
const cors = require('cors'); // (duplicate require)
app.use(cors({
  origin: 'https://www.namasbhutan.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// REMOVED - This manual CORS middleware was conflicting:
app.use((req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [/*...*/];
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    // ... more manual headers
  }
  next();
});
The fix works by:
Single CORS configuration: Using only the cors-fix.js configuration
Proper environment loading: Added require('dotenv').config()
Health check endpoints: Added / and /api/health for testing
Simplified setup: Removed conflicting middleware
The code is live in your files and has been committed to git. The issue now is that Railway needs to be configured to deploy the server directory instead of serving the React frontend.

give me the code here in unified view left side
Here's the complete code in a unified view:

/workspace/server/server.js (Complete File)
require('dotenv').config()
const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { startAutoBackup, createBackup } = require('./data-backup')
const corsOptions = require('./cors-fix')

const app = express()
const PORT = process.env.PORT || 5000

// Use the CORS options from cors-fix.js
app.use(cors(corsOptions))

// Handle preflight requests explicitly with the same options
app.options("*", cors(corsOptions))

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "NAMAS Architecture API Server is running", 
    timestamp: new Date().toISOString(),
    cors: "enabled"
  })
})

// CORS test route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is working with CORS enabled",
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  })
})

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

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
    // Allow only specific file types
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
const DATA_DIR = "data"
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json")
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json")
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json")
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json")
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, "team-members.json")

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize data files with empty arrays if they don't exist
const initializeDataFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
  }
}

initializeDataFile(PROJECTS_FILE)
initializeDataFile(BLOGS_FILE)
initializeDataFile(CONTACTS_FILE)
initializeDataFile(CLIENTS_FILE)
initializeDataFile(TEAM_MEMBERS_FILE)

// Helper functions for data management
const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    return false
  }
}

// Load initial data
let projects = readJSONFile(PROJECTS_FILE)
let blogPosts = readJSONFile(BLOGS_FILE)
let contacts = readJSONFile(CONTACTS_FILE)
let clients = readJSONFile(CLIENTS_FILE)
let teamMembers = readJSONFile(TEAM_MEMBERS_FILE)

// Add auto-increment ID function
const getNextId = (array) => {
  if (array.length === 0) return 1
  return Math.max(...array.map(item => item.id || 0)) + 1
}

// Helper function to handle file deletion
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Deleted file: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error)
  }
}

// Helper function to delete project images
const deleteProjectImages = (images) => {
  if (Array.isArray(images)) {
    images.forEach(imagePath => {
      const fullPath = path.join(__dirname, imagePath)
      deleteFile(fullPath)
    })
  }
}

// API endpoint to trigger manual backup
app.post("/api/backup", (req, res) => {
  try {
    const backupPath = createBackup()
    res.json({
      success: true,
      message: "Manual backup created successfully",
      backupPath: backupPath,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Manual backup failed:", error)
    res.status(500).json({
      success: false,
      message: "Backup creation failed",
      error: error.message
    })
  }
})

// PROJECTS ENDPOINTS

// Get all projects with pagination and filtering
app.get("/api/projects", (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, featured, search } = req.query
    
    let filteredProjects = [...projects]
    
    // Apply filters
    if (category && category !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.category?.toLowerCase() === category.toLowerCase()
      )
    }
    
    if (status && status !== 'all') {
      filteredProjects = filteredProjects.filter(project => 
        project.status?.toLowerCase() === status.toLowerCase()
      )
    }
    
    if (featured === 'true') {
      filteredProjects = filteredProjects.filter(project => project.featured === true)
    }
    
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredProjects = filteredProjects.filter(project =>
        project.title?.toLowerCase().includes(searchTerm) ||
        project.description?.toLowerCase().includes(searchTerm) ||
        project.location?.toLowerCase().includes(searchTerm) ||
        project.client?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort by creation date (newest first)
    filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedProjects,
      count: paginatedProjects.length,
      total: filteredProjects.length,
      page: pageNum,
      totalPages: Math.ceil(filteredProjects.length / limitNum),
      hasMore: endIndex < filteredProjects.length
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ success: false, message: "Failed to fetch projects" })
  }
})

// Get featured projects
app.get("/api/projects/featured", (req, res) => {
  try {
    const featuredProjects = projects.filter(project => project.featured === true)
    res.json({ success: true, data: featuredProjects })
  } catch (error) {
    console.error("Error fetching featured projects:", error)
    res.status(500).json({ success: false, message: "Failed to fetch featured projects" })
  }
})

// Get project by ID
app.get("/api/projects/:id", (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const project = projects.find(p => p.id === projectId)
    
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }
    
    res.json({ success: true, data: project })
  } catch (error) {
    console.error("Error fetching project:", error)
    res.status(500).json({ success: false, message: "Failed to fetch project" })
  }
})

// Create new project
app.post("/api/projects", upload.array("images", 25), (req, res) => {
  try {
    const {
      title,
      category,
      location,
      year,
      status,
      client,
      designTeam,
      description,
      featured
    } = req.body

    // Validation
    if (!title || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and location are required"
      })
    }

    const newProject = {
      id: getNextId(projects),
      title,
      category,
      location,
      year: year || new Date().getFullYear().toString(),
      status: status || "In Progress",
      client: client || "",
      designTeam: designTeam || "",
      description: description || "",
      featured: featured === 'true' || featured === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`)
      newProject.images = imagePaths
      newProject.image = imagePaths[0] // Set first image as main image
    } else {
      newProject.images = []
      newProject.image = ""
    }

    projects.push(newProject)
    
    if (writeJSONFile(PROJECTS_FILE, projects)) {
      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: newProject
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save project"
      })
    }
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message
    })
  }
})

// Update project
app.put("/api/projects/:id", upload.array("images", 25), (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }

    const {
      title,
      category,
      location,
      year,
      status,
      client,
      designTeam,
      description,
      featured,
      existingImages
    } = req.body

    const updatedProject = {
      ...projects[projectIndex],
      title: title || projects[projectIndex].title,
      category: category || projects[projectIndex].category,
      location: location || projects[projectIndex].location,
      year: year || projects[projectIndex].year,
      status: status || projects[projectIndex].status,
      client: client || projects[projectIndex].client,
      designTeam: designTeam || projects[projectIndex].designTeam,
      description: description || projects[projectIndex].description,
      featured: featured === 'true' || featured === true,
      updatedAt: new Date().toISOString()
    }

    // Handle image updates
    let currentImages = []
    
    // Keep existing images if specified
    if (existingImages) {
      try {
        currentImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages
      } catch (e) {
        currentImages = []
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`)
      currentImages = [...currentImages, ...newImagePaths]
    }

    updatedProject.images = currentImages
    updatedProject.image = currentImages.length > 0 ? currentImages[0] : ""

    projects[projectIndex] = updatedProject
    
    if (writeJSONFile(PROJECTS_FILE, projects)) {
      res.json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update project"
      })
    }
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message
    })
  }
})

// Add images to existing project
app.post("/api/projects/:id/images", upload.array("images", 25), (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" })
    }

    const newImagePaths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`)
    const currentImages = projects[projectIndex].images || []
    const updatedImages = [...currentImages, ...newImagePaths]

    projects[projectIndex].images = updatedImages
    projects[projectIndex].updatedAt = new Date().toISOString()
    
    // Set main image if none exists
    if (!projects[projectIndex].image && updatedImages.length > 0) {
      projects[projectIndex].image = updatedImages[0]
    }

    if (writeJSONFile(PROJECTS_FILE, projects)) {
      res.json({
        success: true,
        message: "Images added successfully",
        data: projects[projectIndex],
        newImages: newImagePaths
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save images"
      })
    }
  } catch (error) {
    console.error("Error adding images:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add images",
      error: error.message
    })
  }
})

// Delete project
app.delete("/api/projects/:id", (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }

    const projectToDelete = projects[projectIndex]
    
    // Delete associated images
    if (projectToDelete.images && projectToDelete.images.length > 0) {
      deleteProjectImages(projectToDelete.images)
    }

    projects.splice(projectIndex, 1)
    
    if (writeJSONFile(PROJECTS_FILE, projects)) {
      res.json({
        success: true,
        message: "Project deleted successfully"
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete project"
      })
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message
    })
  }
})

// Remove specific image from project
app.delete("/api/projects/:id/images/:imageIndex", (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const imageIndex = parseInt(req.params.imageIndex)
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }

    const project = projects[projectIndex]
    
    if (!project.images || imageIndex < 0 || imageIndex >= project.images.length) {
      return res.status(400).json({ success: false, message: "Invalid image index" })
    }

    const imageToDelete = project.images[imageIndex]
    const fullPath = path.join(__dirname, imageToDelete)
    
    // Delete the physical file
    deleteFile(fullPath)
    
    // Remove from array
    project.images.splice(imageIndex, 1)
    project.updatedAt = new Date().toISOString()
    
    // Update main image if the deleted image was the main one
    if (project.image === imageToDelete) {
      project.image = project.images.length > 0 ? project.images[0] : ""
    }

    if (writeJSONFile(PROJECTS_FILE, projects)) {
      res.json({
        success: true,
        message: "Image removed successfully",
        data: project
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update project"
      })
    }
  } catch (error) {
    console.error("Error removing image:", error)
    res.status(500).json({
      success: false,
      message: "Failed to remove image",
      error: error.message
    })
  }
})

// BLOG ENDPOINTS

// Get all blog posts
app.get("/api/blogs", (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query
    
    let filteredBlogs = [...blogPosts]
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredBlogs = filteredBlogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm) ||
        blog.content?.toLowerCase().includes(searchTerm) ||
        blog.excerpt?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply category filter
    if (category && category !== 'all') {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.category?.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Sort by creation date (newest first)
    filteredBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedBlogs,
      count: paginatedBlogs.length,
      total: filteredBlogs.length,
      page: pageNum,
      totalPages: Math.ceil(filteredBlogs.length / limitNum),
      hasMore: endIndex < filteredBlogs.length
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    res.status(500).json({ success: false, message: "Failed to fetch blogs" })
  }
})

// Get blog post by ID
app.get("/api/blogs/:id", (req, res) => {
  try {
    const blogId = parseInt(req.params.id)
    const blog = blogPosts.find(b => b.id === blogId)
    
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found" })
    }
    
    res.json({ success: true, data: blog })
  } catch (error) {
    console.error("Error fetching blog:", error)
    res.status(500).json({ success: false, message: "Failed to fetch blog post" })
  }
})

// Create new blog post
app.post("/api/blogs", upload.single("image"), (req, res) => {
  try {
    const { title, content, excerpt, category, tags, published } = req.body

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      })
    }

    const newBlog = {
      id: getNextId(blogPosts),
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      category: category || "General",
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      published: published === 'true' || published === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "NAMAS Team" // You can make this dynamic
    }

    // Handle uploaded image
    if (req.file) {
      newBlog.image = `/${req.file.path.replace(/\\/g, '/')}`
    } else {
      newBlog.image = ""
    }

    blogPosts.push(newBlog)
    
    if (writeJSONFile(BLOGS_FILE, blogPosts)) {
      res.status(201).json({
        success: true,
        message: "Blog post created successfully",
        data: newBlog
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save blog post"
      })
    }
  } catch (error) {
    console.error("Error creating blog post:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message
    })
  }
})

// Update blog post
app.put("/api/blogs/:id", upload.single("image"), (req, res) => {
  try {
    const blogId = parseInt(req.params.id)
    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    
    if (blogIndex === -1) {
      return res.status(404).json({ success: false, message: "Blog post not found" })
    }

    const { title, content, excerpt, category, tags, published } = req.body
    const currentBlog = blogPosts[blogIndex]

    const updatedBlog = {
      ...currentBlog,
      title: title || currentBlog.title,
      content: content || currentBlog.content,
      excerpt: excerpt || (content ? content.substring(0, 200) + "..." : currentBlog.excerpt),
      category: category || currentBlog.category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : currentBlog.tags,
      published: published === 'true' || published === true,
      updatedAt: new Date().toISOString()
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (currentBlog.image) {
        const oldImagePath = path.join(__dirname, currentBlog.image)
        deleteFile(oldImagePath)
      }
      updatedBlog.image = `/${req.file.path.replace(/\\/g, '/')}`
    }

    blogPosts[blogIndex] = updatedBlog
    
    if (writeJSONFile(BLOGS_FILE, blogPosts)) {
      res.json({
        success: true,
        message: "Blog post updated successfully",
        data: updatedBlog
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update blog post"
      })
    }
  } catch (error) {
    console.error("Error updating blog post:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message
    })
  }
})

// Delete blog post
app.delete("/api/blogs/:id", (req, res) => {
  try {
    const blogId = parseInt(req.params.id)
    const blogIndex = blogPosts.findIndex(b => b.id === blogId)
    
    if (blogIndex === -1) {
      return res.status(404).json({ success: false, message: "Blog post not found" })
    }

    const blogToDelete = blogPosts[blogIndex]
    
    // Delete associated image
    if (blogToDelete.image) {
      const imagePath = path.join(__dirname, blogToDelete.image)
      deleteFile(imagePath)
    }

    blogPosts.splice(blogIndex, 1)
    
    if (writeJSONFile(BLOGS_FILE, blogPosts)) {
      res.json({
        success: true,
        message: "Blog post deleted successfully"
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete blog post"
      })
    }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message
    })
  }
})

// CONTACT ENDPOINTS

// Submit contact form
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, phone, subject, message, projectType, budget, timeline } = req.body

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required"
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      })
    }

    const newContact = {
      id: getNextId(contacts),
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      projectType: projectType || "",
      budget: budget || "",
      timeline: timeline || "",
      status: "New",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    contacts.push(newContact)
    
    if (writeJSONFile(CONTACTS_FILE, contacts)) {
      res.status(201).json({
        success: true,
        message: "Contact form submitted successfully. We'll get back to you soon!",
        data: { id: newContact.id }
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form"
      })
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
      error: error.message
    })
  }
})

// Get all contacts (admin only)
app.get("/api/contacts", (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    
    let filteredContacts = [...contacts]
    
    // Apply status filter
    if (status && status !== 'all') {
      filteredContacts = filteredContacts.filter(contact => 
        contact.status?.toLowerCase() === status.toLowerCase()
      )
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredContacts = filteredContacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.subject?.toLowerCase().includes(searchTerm) ||
        contact.message?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort by creation date (newest first)
    filteredContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedContacts,
      count: paginatedContacts.length,
      total: filteredContacts.length,
      page: pageNum,
      totalPages: Math.ceil(filteredContacts.length / limitNum),
      hasMore: endIndex < filteredContacts.length
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    res.status(500).json({ success: false, message: "Failed to fetch contacts" })
  }
})

// Update contact status
app.put("/api/contacts/:id", (req, res) => {
  try {
    const contactId = parseInt(req.params.id)
    const contactIndex = contacts.findIndex(c => c.id === contactId)
    
    if (contactIndex === -1) {
      return res.status(404).json({ success: false, message: "Contact not found" })
    }

    const { status, notes } = req.body
    
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      status: status || contacts[contactIndex].status,
      notes: notes || contacts[contactIndex].notes,
      updatedAt: new Date().toISOString()
    }
    
    if (writeJSONFile(CONTACTS_FILE, contacts)) {
      res.json({
        success: true,
        message: "Contact updated successfully",
        data: contacts[contactIndex]
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update contact"
      })
    }
  } catch (error) {
    console.error("Error updating contact:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update contact",
      error: error.message
    })
  }
})

// CLIENT ENDPOINTS

// Get all clients
app.get("/api/clients", (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    
    let filteredClients = [...clients]
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredClients = filteredClients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm) ||
        client.description?.toLowerCase().includes(searchTerm) ||
        client.industry?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort by creation date (newest first)
    filteredClients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedClients = filteredClients.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedClients,
      count: paginatedClients.length,
      total: filteredClients.length,
      page: pageNum,
      totalPages: Math.ceil(filteredClients.length / limitNum),
      hasMore: endIndex < filteredClients.length
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    res.status(500).json({ success: false, message: "Failed to fetch clients" })
  }
})

// Get client by ID
app.get("/api/clients/:id", (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const client = clients.find(c => c.id === clientId)
    
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" })
    }
    
    res.json({ success: true, data: client })
  } catch (error) {
    console.error("Error fetching client:", error)
    res.status(500).json({ success: false, message: "Failed to fetch client" })
  }
})

// Create new client
app.post("/api/clients", upload.single("logo"), (req, res) => {
  try {
    const { name, description, industry, website, contactPerson, email, phone } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Client name is required"
      })
    }

    const newClient = {
      id: getNextId(clients),
      name,
      description: description || "",
      industry: industry || "",
      website: website || "",
      contactPerson: contactPerson || "",
      email: email || "",
      phone: phone || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Handle uploaded logo
    if (req.file) {
      newClient.logo = `/${req.file.path.replace(/\\/g, '/')}`
    } else {
      newClient.logo = ""
    }

    clients.push(newClient)
    
    if (writeJSONFile(CLIENTS_FILE, clients)) {
      res.status(201).json({
        success: true,
        message: "Client created successfully",
        data: newClient
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save client"
      })
    }
  } catch (error) {
    console.error("Error creating client:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message
    })
  }
})

// Update client
app.put("/api/clients/:id", upload.single("logo"), (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const clientIndex = clients.findIndex(c => c.id === clientId)
    
    if (clientIndex === -1) {
      return res.status(404).json({ success: false, message: "Client not found" })
    }

    const { name, description, industry, website, contactPerson, email, phone } = req.body
    const currentClient = clients[clientIndex]

    const updatedClient = {
      ...currentClient,
      name: name || currentClient.name,
      description: description || currentClient.description,
      industry: industry || currentClient.industry,
      website: website || currentClient.website,
      contactPerson: contactPerson || currentClient.contactPerson,
      email: email || currentClient.email,
      phone: phone || currentClient.phone,
      updatedAt: new Date().toISOString()
    }

    // Handle logo update
    if (req.file) {
      // Delete old logo if exists
      if (currentClient.logo) {
        const oldLogoPath = path.join(__dirname, currentClient.logo)
        deleteFile(oldLogoPath)
      }
      updatedClient.logo = `/${req.file.path.replace(/\\/g, '/')}`
    }

    clients[clientIndex] = updatedClient
    
    if (writeJSONFile(CLIENTS_FILE, clients)) {
      res.json({
        success: true,
        message: "Client updated successfully",
        data: updatedClient
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update client"
      })
    }
  } catch (error) {
    console.error("Error updating client:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message
    })
  }
})

// Delete client
app.delete("/api/clients/:id", (req, res) => {
  try {
    const clientId = parseInt(req.params.id)
    const clientIndex = clients.findIndex(c => c.id === clientId)
    
    if (clientIndex === -1) {
      return res.status(404).json({ success: false, message: "Client not found" })
    }

    const clientToDelete = clients[clientIndex]
    
    // Delete associated logo
    if (clientToDelete.logo) {
      const logoPath = path.join(__dirname, clientToDelete.logo)
      deleteFile(logoPath)
    }

    clients.splice(clientIndex, 1)
    
    if (writeJSONFile(CLIENTS_FILE, clients)) {
      res.json({
        success: true,
        message: "Client deleted successfully"
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete client"
      })
    }
  } catch (error) {
    console.error("Error deleting client:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message
    })
  }
})

// TEAM MEMBERS ENDPOINTS

// Get all team members
app.get("/api/team-members", (req, res) => {
  try {
    const { page = 1, limit = 10, search, position } = req.query
    
    let filteredMembers = [...teamMembers]
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredMembers = filteredMembers.filter(member =>
        member.name?.toLowerCase().includes(searchTerm) ||
        member.position?.toLowerCase().includes(searchTerm) ||
        member.bio?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply position filter
    if (position && position !== 'all') {
      filteredMembers = filteredMembers.filter(member => 
        member.position?.toLowerCase() === position.toLowerCase()
      )
    }
    
    // Sort by creation date (newest first)
    filteredMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)
    
    res.json({
      success: true,
      data: paginatedMembers,
      count: paginatedMembers.length,
      total: filteredMembers.length,
      page: pageNum,
      totalPages: Math.ceil(filteredMembers.length / limitNum),
      hasMore: endIndex < filteredMembers.length
    })
  } catch (error) {
    console.error("Error fetching team members:", error)
    res.status(500).json({ success: false, message: "Failed to fetch team members" })
  }
})

// Get team member by ID
app.get("/api/team-members/:id", (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    const member = teamMembers.find(m => m.id === memberId)
    
    if (!member) {
      return res.status(404).json({ success: false, message: "Team member not found" })
    }
    
    res.json({ success: true, data: member })
  } catch (error) {
    console.error("Error fetching team member:", error)
    res.status(500).json({ success: false, message: "Failed to fetch team member" })
  }
})

// Create new team member
app.post("/api/team-members", upload.single("image"), (req, res) => {
  try {
    const { name, position, bio, email, phone, linkedin, skills, experience } = req.body

    // Validation
    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: "Name and position are required"
      })
    }

    const newMember = {
      id: getNextId(teamMembers),
      name,
      position,
      bio: bio || "",
      email: email || "",
      phone: phone || "",
      linkedin: linkedin || "",
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim())) : [],
      experience: experience || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Handle uploaded image
    if (req.file) {
      newMember.image = `/${req.file.path.replace(/\\/g, '/')}`
    } else {
      newMember.image = ""
    }

    teamMembers.push(newMember)
    
    if (writeJSONFile(TEAM_MEMBERS_FILE, teamMembers)) {
      res.status(201).json({
        success: true,
        message: "Team member created successfully",
        data: newMember
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save team member"
      })
    }
  } catch (error) {
    console.error("Error creating team member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create team member",
      error: error.message
    })
  }
})

// Update team member
app.put("/api/team-members/:id", upload.single("image"), (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "Team member not found" })
    }

    const { name, position, bio, email, phone, linkedin, skills, experience } = req.body
    const currentMember = teamMembers[memberIndex]

    const updatedMember = {
      ...currentMember,
      name: name || currentMember.name,
      position: position || currentMember.position,
      bio: bio || currentMember.bio,
      email: email || currentMember.email,
      phone: phone || currentMember.phone,
      linkedin: linkedin || currentMember.linkedin,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim())) : currentMember.skills,
      experience: experience || currentMember.experience,
      updatedAt: new Date().toISOString()
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (currentMember.image) {
        const oldImagePath = path.join(__dirname, currentMember.image)
        deleteFile(oldImagePath)
      }
      updatedMember.image = `/${req.file.path.replace(/\\/g, '/')}`
    }

    teamMembers[memberIndex] = updatedMember
    
    if (writeJSONFile(TEAM_MEMBERS_FILE, teamMembers)) {
      res.json({
        success: true,
        message: "Team member updated successfully",
        data: updatedMember
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update team member"
      })
    }
  } catch (error) {
    console.error("Error updating team member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update team member",
      error: error.message
    })
  }
})

// Delete team member
app.delete("/api/team-members/:id", (req, res) => {
  try {
    const memberId = parseInt(req.params.id)
    const memberIndex = teamMembers.findIndex(m => m.id === memberId)
    
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "Team member not found" })
    }

    const memberToDelete = teamMembers[memberIndex]
    
    // Delete associated image
    if (memberToDelete.image) {
      const imagePath = path.join(__dirname, memberToDelete.image)
      deleteFile(imagePath)
    }

    teamMembers.splice(memberIndex, 1)
    
    if (writeJSONFile(TEAM_MEMBERS_FILE, teamMembers)) {
      res.json({
        success: true,
        message: "Team member deleted successfully"
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete team member"
      })
    }
  } catch (error) {
    console.error("Error deleting team member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete team member",
      error: error.message
    })
  }
})

// SEARCH ENDPOINT
app.post("/api/search", (req, res) => {
  try {
    const { query, type = 'all' } = req.body
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      })
    }

    const searchTerm = query.toLowerCase().trim()
    const results = {
      projects: [],
      blogs: [],
      teamMembers: [],
      clients: []
    }

    // Search projects
    if (type === 'all' || type === 'projects') {
      results.projects = projects.filter(project =>
        project.title?.toLowerCase().includes(searchTerm) ||
        project.description?.toLowerCase().includes(searchTerm) ||
        project.location?.toLowerCase().includes(searchTerm) ||
        project.category?.toLowerCase().includes(searchTerm) ||
        project.client?.toLowerCase().includes(searchTerm)
      ).slice(0, 5) // Limit results
    }

    // Search blogs
    if (type === 'all' || type === 'blogs') {
      results.blogs = blogPosts.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm) ||
        blog.content?.toLowerCase().includes(searchTerm) ||
        blog.excerpt?.toLowerCase().includes(searchTerm) ||
        blog.category?.toLowerCase().includes(searchTerm)
      ).slice(0, 5)
    }

    // Search team members
    if (type === 'all' || type === 'team') {
      results.teamMembers = teamMembers.filter(member =>
        member.name?.toLowerCase().includes(searchTerm) ||
        member.position?.toLowerCase().includes(searchTerm) ||
        member.bio?.toLowerCase().includes(searchTerm) ||
        (member.skills && member.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
      ).slice(0, 5)
    }

    // Search clients
    if (type === 'all' || type === 'clients') {
      results.clients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm) ||
        client.description?.toLowerCase().includes(searchTerm) ||
        client.industry?.toLowerCase().includes(searchTerm)
      ).slice(0, 5)
    }

    const totalResults = results.projects.length + results.blogs.length + 
                        results.teamMembers.length + results.clients.length

    res.json({
      success: true,
      query: query,
      totalResults,
      data: results
    })
  } catch (error) {
    console.error("Error performing search:", error)
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message
    })
  }
})

// MEDIA UPLOAD ENDPOINT
app.post("/api/media/upload", upload.array("images", 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      })
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/${file.path.replace(/\\/g, '/')}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString()
    }))

    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles
    })
  } catch (error) {
    console.error("Error uploading files:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error.message
    })
  }
})

// STATISTICS ENDPOINT
app.get("/api/stats", (req, res) => {
  try {
    const stats = {
      projects: {
        total: projects.length,
        featured: projects.filter(p => p.featured).length,
        byStatus: projects.reduce((acc, project) => {
          const status = project.status || 'Unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {}),
        byCategory: projects.reduce((acc, project) => {
          const category = project.category || 'Unknown'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})
      },
      blogs: {
        total: blogPosts.length,
        published: blogPosts.filter(b => b.published).length,
        byCategory: blogPosts.reduce((acc, blog) => {
          const category = blog.category || 'Unknown'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})
      },
      contacts: {
        total: contacts.length,
        byStatus: contacts.reduce((acc, contact) => {
          const status = contact.status || 'Unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
      },
      clients: {
        total: clients.length
      },
      teamMembers: {
        total: teamMembers.length
      }
    }

    res.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error generating statistics:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate statistics",
      error: error.message
    })
  }
})

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
    method: req.method
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB."
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 25 files."
      })
    }
  }
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
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
  
  // Start automatic backup system
  startAutoBackup()
})
/workspace/server/cors-fix.js (Complete File)
// CORS configuration options for the Namas Bhutan API
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://www.namasbhutan.com',
      'https://namasbhutan.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173',
      'http://localhost:4173' // Vite preview
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // In production, be more permissive during initial testing
      // You can uncomment the line below to temporarily allow all origins
      // callback(null, true);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false
};

module.exports = corsOptions;