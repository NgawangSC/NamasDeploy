const connectDB = require('./config/database');
const { Project } = require('./models');

async function testMongoDB() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    // Try to connect to MongoDB
    await connectDB();
    
    console.log('✅ MongoDB connection successful!');
    
    // Test creating a sample project
    const sampleProject = new Project({
      title: 'Test Project',
      description: 'This is a test project to verify MongoDB integration',
      category: 'Residential',
      location: 'Test Location',
      year: '2024',
      images: [],
      coverImage: null,
      featured: false,
      status: 'completed'
    });
    
    const savedProject = await sampleProject.save();
    console.log('✅ Sample project created:', savedProject.title);
    
    // Test retrieving the project
    const retrievedProject = await Project.findById(savedProject._id);
    console.log('✅ Project retrieved:', retrievedProject.title);
    
    // Clean up - delete the test project
    await Project.findByIdAndDelete(savedProject._id);
    console.log('✅ Test project deleted');
    
    console.log('🎉 MongoDB integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.log('⚠️ This is expected if MongoDB is not configured yet');
  } finally {
    process.exit(0);
  }
}

testMongoDB();
