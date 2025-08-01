#!/bin/bash

# Railway Deployment Script for Namas Architecture API
echo "🚀 Starting Railway deployment for Namas Architecture API..."

# Check if we're in the server directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway authentication..."
if ! railway status &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway deploy

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Your API should be available at:"
    railway status | grep "Domain:" || echo "Check Railway dashboard for your app URL"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env.production with your Railway URL"
    echo "2. Set environment variables in Railway dashboard:"
    echo "   - NODE_ENV=production"
    echo "   - ALLOWED_ORIGINS=https://www.namasbhutan.com,https://namasbhutan.com"
    echo "3. Test your API endpoints"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed troubleshooting guide"
else
    echo "❌ Deployment failed. Check the error messages above."
    echo "💡 Common issues:"
    echo "   - Not logged in to Railway"
    echo "   - No Railway project configured"
    echo "   - Missing dependencies"
    echo ""
    echo "📖 See DEPLOYMENT.md for troubleshooting help"
    exit 1
fi