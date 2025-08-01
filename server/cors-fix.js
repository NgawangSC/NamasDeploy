// CORS configuration options for the Namas Bhutan API
const corsOptions = {
  origin: function (origin, callback) {
    // Get allowed origins from environment variable or use defaults
    const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
    
    const allowedOrigins = [
      'https://www.namasbhutan.com',
      'https://namasbhutan.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173',
      'http://localhost:4173', // Vite preview
      ...envOrigins
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      
      // In production, be more permissive to avoid blocking legitimate requests
      if (process.env.NODE_ENV === 'production') {
        console.log('Production mode: allowing origin due to potential Railway proxy issues');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
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