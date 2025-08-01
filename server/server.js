const express = require("express")
const cors = require("cors")
const corsOptions = require("./cors-fix")
const app = express()
const PORT = process.env.PORT || 5000

console.log("🚀 Starting Namas Architecture API server...")
console.log("📍 Port:", PORT)
console.log("🌐 Host: 0.0.0.0")
console.log("🔒 NODE_ENV:", process.env.NODE_ENV || 'development')

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'unknown origin'}`)
  next()
})

// Health check route (for Railway)
app.get("/", (req, res) => {
  console.log("✅ Health check hit!")
  res.json({
    message: "Namas Architecture API is running!",
    status: "healthy",
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Test route
app.get("/test", (req, res) => {
  console.log("✅ Test route hit!")
  res.json({
    status: "success",
    message: "Test endpoint working!",
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.get("/api/projects", (req, res) => {
  console.log("✅ Projects API hit!")
  res.json({
    status: "success",
    data: [],
    message: "Projects endpoint working - implement data logic here"
  })
})

app.get("/api/projects/featured", (req, res) => {
  console.log("✅ Featured projects API hit!")
  res.json({
    status: "success",
    data: [],
    message: "Featured projects endpoint working - implement data logic here"
  })
})

app.get("/api/projects/:id", (req, res) => {
  console.log("✅ Single project API hit for ID:", req.params.id)
  res.json({
    status: "success",
    data: null,
    message: `Project ${req.params.id} endpoint working - implement data logic here`
  })
})

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log("❌ Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /",
      "GET /test", 
      "GET /api/projects",
      "GET /api/projects/featured",
      "GET /api/projects/:id"
    ]
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message)
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Namas Architecture API server running on 0.0.0.0:${PORT}`)
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/`)
  console.log(`🔗 API base: http://0.0.0.0:${PORT}/api`)
})
