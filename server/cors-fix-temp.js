// Temporary CORS configuration - ALLOWS ALL ORIGINS
// Use this only for testing - replace with cors-fix.js for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins temporarily for testing
    console.log('CORS allowing all origins - origin:', origin);
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false
};

module.exports = corsOptions;