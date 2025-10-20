require('dotenv').config();
const connectDB = require('./config/database');
const { Project, TeamMember, Blog, Client, Contact, Partner } = require('./models');
const fs = require('fs');
const path = require('path');

// Data directory paths
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`📁 Loaded ${data.length} items from ${path.basename(filePath)}`);
      return data;
    }
    return [];
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

async function testAndMigrateData() {
  try {
    console.log('🔄 Testing MongoDB connection and migrating data...');
    
    // Test MongoDB connection
    await connectDB();
    console.log('✅ MongoDB connection successful!');
    
    // Load existing file data
    const projects = loadData(PROJECTS_FILE);
    
    if (projects.length > 0) {
      console.log(`📊 Found ${projects.length} projects in file storage`);
      
      // Check if projects already exist in MongoDB
      const existingProjects = await Project.find({});
      console.log(`📊 Found ${existingProjects.length} projects in MongoDB`);
      
      // Migrate projects if they don't exist in MongoDB
      if (existingProjects.length === 0 && projects.length > 0) {
        console.log('🔄 Migrating projects to MongoDB...');
        
        for (const projectData of projects) {
          try {
            // Remove file-specific ID and add MongoDB-compatible data
            const { id, ...mongoProjectData } = projectData;
            
            const project = new Project({
              ...mongoProjectData,
              // Ensure required fields exist
              title: mongoProjectData.title || 'Untitled Project',
              description: mongoProjectData.description || 'No description',
              category: mongoProjectData.category || 'Other',
              location: mongoProjectData.location || 'Unknown',
              year: mongoProjectData.year || new Date().getFullYear().toString(),
            });
            
            const savedProject = await project.save();
            console.log(`✅ Migrated project: ${savedProject.title}`);
          } catch (error) {
            console.error(`❌ Failed to migrate project:`, error.message);
          }
        }
        
        console.log('✅ Migration completed!');
      } else {
        console.log('ℹ️ Projects already exist in MongoDB, skipping migration');
      }
    }
    
    // Test creating a new project
    console.log('🧪 Testing project creation...');
    const testProject = new Project({
      title: 'MongoDB Connection Test',
      description: 'This project was created to test MongoDB connectivity',
      category: 'Test',
      location: 'Test Environment',
      year: '2024',
      featured: false,
      status: 'Completed'
    });
    
    const savedTestProject = await testProject.save();
    console.log('✅ Test project created:', savedTestProject.title);
    
    // Clean up test project
    await Project.findByIdAndDelete(savedTestProject._id);
    console.log('🧹 Test project cleaned up');
    
    console.log('🎉 MongoDB connection and data migration successful!');
    
  } catch (error) {
    console.error('❌ MongoDB connection or migration failed:', error.message);
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check your MongoDB Atlas IP whitelist');
    console.log('2. Verify your MongoDB credentials');
    console.log('3. Check network connectivity');
    console.log('4. Ensure your cluster is running');
    console.log('');
    console.log('📋 Current connection string (sanitized):');
    console.log(process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  } finally {
    process.exit(0);
  }
}

testAndMigrateData();