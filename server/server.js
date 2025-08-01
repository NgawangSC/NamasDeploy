const express = require("express")
const app = express()
const PORT = process.env.PORT || 5000

console.log("🚀 Starting minimal server...")
console.log("📍 Port:", PORT)
console.log("🌐 Host: 0.0.0.0")

app.get("/", (req, res) => {
  console.log("✅ Root route hit!")
  res.json({
    message: "Minimal server working!",
    port: PORT,
    timestamp: new Date().toISOString(),
  })
})

app.get("/test", (req, res) => {
  console.log("✅ Test route hit!")
  res.json({
    status: "success",
    message: "Test endpoint working!",
  })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Minimal server running on 0.0.0.0:${PORT}`)
})
