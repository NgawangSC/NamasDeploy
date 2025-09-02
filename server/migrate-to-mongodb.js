require('dotenv').config(); // Load environment variables
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');
const { Project, TeamMember, Blog, Client, Contact } = require('./models');

// Data directory paths
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, "team-members.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return [];
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

async function migrateData() {
  try {
    console.log('🔄 Starting data migration to MongoDB...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Migrate Projects
    const projects = loadData(PROJECTS_FILE);
    if (projects.length > 0) {
      console.log(`📦 Migrating ${projects.length} projects...`);
      for (const project of projects) {
        // Remove _id if it exists (MongoDB will generate new ones)
        const { _id, ...projectData } = project;
        await Project.findOneAndUpdate(
          { title: project.title, location: project.location },
          projectData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Projects migrated successfully');
    }
    
    // Migrate Team Members
    const teamMembers = loadData(TEAM_MEMBERS_FILE);
    if (teamMembers.length > 0) {
      console.log(`�� Migrating ${teamMembers.length} team members...`);
      for (const member of teamMembers) {
        const { _id, ...memberData } = member;
        await TeamMember.findOneAndUpdate(
          { name: member.name, position: member.position },
          memberData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Team members migrated successfully');
    }
    
    // Migrate Blogs
    const blogs = loadData(BLOGS_FILE);
    if (blogs.length > 0) {
      console.log(`📝 Migrating ${blogs.length} blog posts...`);
      for (const blog of blogs) {
        const { _id, ...blogData } = blog;
        await Blog.findOneAndUpdate(
          { title: blog.title, slug: blog.slug },
          blogData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Blog posts migrated successfully');
    }
    
    // Migrate Clients
    const clients = loadData(CLIENTS_FILE);
    if (clients.length > 0) {
      console.log(`🏢 Migrating ${clients.length} clients...`);
      for (const client of clients) {
        const { _id, ...clientData } = client;
        await Client.findOneAndUpdate(
          { name: client.name },
          clientData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Clients migrated successfully');
    }
    
    // Migrate Contacts
    const contacts = loadData(CONTACTS_FILE);
    if (contacts.length > 0) {
      console.log(`📧 Migrating ${contacts.length} contacts...`);
      for (const contact of contacts) {
        const { _id, ...contactData } = contact;
        await Contact.findOneAndUpdate(
          { email: contact.email, createdAt: contact.createdAt },
          contactData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Contacts migrated successfully');
    }
    
    console.log('🎉 Data migration completed successfully!');
    console.log('💡 You can now safely delete the JSON files if desired.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateData();
