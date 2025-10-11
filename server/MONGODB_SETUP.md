# MongoDB Setup Guide

This guide will help you set up MongoDB for your NAMAS Architecture backend to ensure your project data persists across deployments.

## Option 1: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier is sufficient)

2. **Configure Database Access**
   - Go to Database Access
   - Create a new database user with read/write permissions
   - Note down username and password

3. **Configure Network Access**
   - Go to Network Access
   - Add your IP address or use 0.0.0.0/0 for all IPs (less secure)

4. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

5. **Update Environment Variables**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/namas_architecture
   ```

## Option 2: Local MongoDB Installation

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mongodb

   # macOS (using Homebrew)
   brew install mongodb-community

   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   sudo systemctl enable mongodb

   # macOS
   brew services start mongodb-community
   ```

3. **Set Environment Variable**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/namas_architecture
   ```

## Migration Process

1. **Run Migration Script**
   ```bash
   node migrate-to-mongodb.js
   ```
   This will move your existing data from JSON files to MongoDB.

2. **Verify Migration**
   - Check the console output for success messages
   - Your data is now stored in MongoDB and will persist across deployments

## Enabling MongoDB in the running server

1. Create a `.env` file in `server/` with a valid `MONGODB_URI`.
2. Restart your server deployment so it picks up the env var.
3. The API will automatically use MongoDB if the connection succeeds. If it fails, it will fall back to JSON files in `DATA_DIR`.

### Notes
- The API normalizes MongoDB documents to include `id` and `image` fields for backward compatibility with the dashboard/frontend.
- Image management endpoints (`POST /api/projects/:id/images`, `DELETE /api/projects/:id/images`, `PUT /api/projects/:id/cover`) now work with MongoDB when connected.

## Environment Configuration

Create a `.env` file in the server directory with:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=8080
NODE_ENV=production

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS Configuration
ALLOWED_ORIGINS=https://www.namasbhutan.com,https://namasbhutan.com

# Data Storage (fallback when MongoDB is not available)
DATA_DIR=/data
UPLOADS_DIR=/uploads
```

## Features

- **Automatic Fallback**: If MongoDB is not available, the system falls back to file-based storage
- **Data Persistence**: Your projects, team members, blogs, clients, and contacts will persist across deployments
- **Backward Compatibility**: Existing data structure is maintained
- **Real-time Updates**: Changes are immediately saved to MongoDB

## Troubleshooting

1. **Connection Issues**
   - Check your MongoDB URI format
   - Ensure network access is configured correctly
   - Verify username/password are correct

2. **Migration Issues**
   - Check console logs for specific error messages
   - Ensure MongoDB is running and accessible
   - Verify file permissions for data directory

3. **Performance Issues**
   - Consider using MongoDB Atlas for better performance
   - Monitor database connection pool settings
   - Use indexes for frequently queried fields

## Backup Strategy

Even with MongoDB, it's recommended to:
1. Enable MongoDB Atlas backups (automatic)
2. Export data periodically using MongoDB Compass
3. Keep your JSON files as additional backup

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify MongoDB connection status
3. Test with a simple MongoDB connection script
