#!/bin/bash

# NAMAS Architecture - cPanel Deployment Script
echo "🚀 Starting cPanel deployment process..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your Railway backend URL"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project for production
echo "🔨 Building project for production..."
npm run build:production

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! Check for errors above."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📁 Files ready for cPanel upload in the 'build' directory"
echo ""
echo "Next steps:"
echo "1. Open your cPanel File Manager"
echo "2. Navigate to public_html directory"
echo "3. Upload all contents from the 'build' folder"
echo "   (This includes .htaccess and proxy-uploads.php for Railway backend proxy)"
echo "4. Verify proxy-uploads.php is in public_html directory"
echo "5. Test your website and check that images load correctly!"
echo ""
echo "🌟 Deployment preparation complete!"