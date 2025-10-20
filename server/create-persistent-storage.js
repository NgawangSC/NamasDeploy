require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create a persistent data structure that survives deployments
const createPersistentStorage = () => {
  console.log('🔧 Setting up persistent data storage...');
  
  // Create persistent data directory structure
  const persistentDir = path.join(__dirname, 'persistent-data');
  const dataDir = path.join(persistentDir, 'data');
  const uploadsDir = path.join(persistentDir, 'uploads');
  
  // Create directories
  [persistentDir, dataDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Create initial data files with sample data
  const dataFiles = {
    'projects.json': [
      {
        "id": 1,
        "title": "Sample Residential Project",
        "description": "A beautiful residential project showcasing modern architecture",
        "category": "Residential",
        "location": "Thimphu, Bhutan",
        "year": "2024",
        "featured": true,
        "status": "Completed",
        "images": [],
        "coverImage": null,
        "client": "Private Client",
        "designTeam": "NAMAS Architecture Team",
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString()
      }
    ],
    'blogs.json': [],
    'clients.json': [],
    'contacts.json': [],
    'team-members.json': [],
    'partners.json': []
  };
  
  // Create data files
  Object.entries(dataFiles).forEach(([filename, data]) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`📄 Created data file: ${filename} with ${data.length} items`);
    } else {
      console.log(`📄 Data file already exists: ${filename}`);
    }
  });
  
  // Create .gitkeep files to ensure directories are tracked
  [dataDir, uploadsDir].forEach(dir => {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
      console.log(`📌 Created .gitkeep in ${path.basename(dir)}`);
    }
  });
  
  // Create environment configuration
  const envConfig = `
# Persistent Data Configuration
# Use these paths for persistent storage across deployments
PERSISTENT_DATA_DIR=${dataDir}
PERSISTENT_UPLOADS_DIR=${uploadsDir}

# MongoDB fallback - use persistent file storage if MongoDB fails
USE_PERSISTENT_FALLBACK=true
`;
  
  const envPersistentPath = path.join(__dirname, '.env.persistent');
  fs.writeFileSync(envPersistentPath, envConfig.trim());
  console.log('⚙️ Created .env.persistent configuration file');
  
  // Create a backup script
  const backupScript = `#!/bin/bash
# Backup script for NAMAS Architecture data
echo "🔄 Creating data backup..."
BACKUP_DIR="./backups/\$(date +%Y%m%d_%H%M%S)"
mkdir -p "\$BACKUP_DIR"
cp -r ./persistent-data/* "\$BACKUP_DIR/"
echo "✅ Backup created in \$BACKUP_DIR"
`;
  
  const backupScriptPath = path.join(__dirname, 'backup-data.sh');
  fs.writeFileSync(backupScriptPath, backupScript);
  fs.chmodSync(backupScriptPath, '755');
  console.log('💾 Created backup script: backup-data.sh');
  
  console.log('');
  console.log('✅ Persistent storage setup complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update your server.js to use persistent-data directory');
  console.log('2. Commit these files to git to persist across deployments');
  console.log('3. Set DATA_DIR=./persistent-data/data in your environment');
  console.log('4. Test the setup with: node server.js');
  console.log('');
  console.log('📁 Created structure:');
  console.log(`   ${persistentDir}/`);
  console.log(`   ├── data/`);
  console.log(`   │   ├── projects.json (with sample data)`);
  console.log(`   │   ├── blogs.json`);
  console.log(`   │   └── ... (other data files)`);
  console.log(`   └── uploads/`);
  console.log('');
};

createPersistentStorage();