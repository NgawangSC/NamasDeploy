const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')
const BACKUP_DIR = path.join(__dirname, 'backups')

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Create backup with timestamp
const createBackup = () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupSubDir = path.join(BACKUP_DIR, timestamp)
    
    if (!fs.existsSync(backupSubDir)) {
      fs.mkdirSync(backupSubDir, { recursive: true })
    }
    
    // Copy all data files to backup directory
    const dataFiles = ['projects.json', 'blogs.json', 'clients.json', 'contacts.json']
    
    dataFiles.forEach(file => {
      const sourcePath = path.join(DATA_DIR, file)
      const backupPath = path.join(backupSubDir, file)
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath)
      }
    })
    
    console.log(`✅ Backup created: ${timestamp}`)
    return true
  } catch (error) {
    console.error('❌ Backup failed:', error)
    return false
  }
}

// Clean old backups (keep only last 10)
const cleanOldBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(name => fs.statSync(path.join(BACKUP_DIR, name)).isDirectory())
      .sort()
      .reverse()
    
    if (backups.length > 10) {
      const toDelete = backups.slice(10)
      toDelete.forEach(backup => {
        const backupPath = path.join(BACKUP_DIR, backup)
        fs.rmSync(backupPath, { recursive: true, force: true })
        console.log(`🗑️ Deleted old backup: ${backup}`)
      })
    }
  } catch (error) {
    console.error('❌ Failed to clean old backups:', error)
  }
}

// Auto backup every 24 hours (or 10 minutes in development)
const startAutoBackup = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const backupInterval = isDevelopment ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000 // 10 min dev, 24 hours prod
  
  // Create initial backup
  createBackup()
  
  // Schedule backups
  setInterval(() => {
    createBackup()
    cleanOldBackups()
  }, backupInterval)
  
  const intervalText = isDevelopment ? '10 minutes' : 'daily'
  console.log(`🔄 Auto-backup system started (${intervalText})`)
}

module.exports = {
  createBackup,
  cleanOldBackups,
  startAutoBackup
}