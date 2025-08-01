// Enhanced CORS Configuration for Railway + cPanel Deployment
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      // Development
      'http://localhost:3000',
      'http://localhost:3001',
      // Production - Your cPanel domain (all variations)
      'https://www.namasbhutan.com',
      'https://namasbhutan.com', 
      'http://www.namasbhutan.com',
      'http://namasbhutan.com',
      // Environment variables
      process.env.FRONTEND_URL,
      process.env.CPANEL_DOMAIN,
      // Fallback for any HTTPS version
      ...['namasbhutan.com', 'www.namasbhutan.com'].map(domain => `https://${domain}`),
      ...['namasbhutan.com', 'www.namasbhutan.com'].map(domain => `http://${domain}`)
    ].filter(Boolean);
    
    console.log('🌐 CORS request from origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === origin) return true;
      // Also check for pattern matching
      if (origin.includes('namasbhutan.com')) return true;
      return false;
    });
    
    if (isAllowed) {
      console.log('✅ CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.warn('❌ CORS: Origin not allowed:', origin);
      // For production debugging, allow all for now
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false // Pass control to next handler
};

module.exports = corsOptions;