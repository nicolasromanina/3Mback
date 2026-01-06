/**
 * Configuration Express - Corrigé pour CORS
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const notificationRoutes = require('./routes/notification.routes');
const fileRoutes = require('./routes/file.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Import des middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// =================================
// Middlewares de sécurité
// =================================

// Helmet - Protection des headers HTTP
app.use(helmet());

// =================================
// Configuration CORS COMPLÈTE
// =================================

// Parse CORS_ORIGIN depuis les variables d'environnement
const parseCorsOrigins = () => {
  if (!process.env.CORS_ORIGIN) {
    return ['http://localhost:5173'];
  }
  
  if (process.env.CORS_ORIGIN.includes(',')) {
    return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  
  return [process.env.CORS_ORIGIN];
};

const allowedOrigins = parseCorsOrigins();

console.log('🌍 Origines CORS autorisées:', allowedOrigins);

// Configuration CORS détaillée
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme Postman, curl)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 Origine bloquée par CORS: ${origin}`);
      console.warn(`✅ Origines autorisées: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Auth-Token'
  ],
  maxAge: 86400, // 24 heures
  optionsSuccessStatus: 204
};

// Appliquer CORS
app.use(cors(corsOptions));

// Middleware personnalisé pour les headers CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Si l'origine est autorisée, l'ajouter au header
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Version'
  );
  res.header(
    'Access-Control-Expose-Headers',
    'Content-Range, X-Content-Range, X-Total-Count, X-Auth-Token'
  );
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.status(200).json({});
  }
  
  next();
});

// =================================
// Rate limiting
// =================================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ne pas limiter les requêtes OPTIONS (CORS preflight)
    return req.method === 'OPTIONS';
  }
});

app.use('/api', limiter);

// =================================
// Middlewares de parsing
// =================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =================================
// Logger
// =================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// =================================
// Fichiers statiques
// =================================
// Ne servir les fichiers statiques qu'en local
if (!process.env.VERCEL) {
  const uploadsPath = path.join(__dirname, '../uploads');
  console.log('📁 Dossier uploads:', uploadsPath);
  app.use('/uploads', express.static(uploadsPath));
} else {
  console.log('⚠️ Mode Vercel: Les fichiers statiques locaux sont désactivés');
  
  // Route pour indiquer que les uploads ne sont pas disponibles
  app.get('/uploads/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Service de fichiers non disponible sur Vercel. Utilisez Cloud Storage.',
      documentation: 'https://vercel.com/docs/storage'
    });
  });
}

// =================================
// Routes API
// =================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// =================================
// Routes de test et santé
// =================================

// Health check étendu
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API PrintPro opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins
    },
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route de test CORS
app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin;
  const isAllowed = origin ? allowedOrigins.includes(origin) : false;
  
  res.json({
    success: true,
    message: 'Test CORS réussi',
    cors: {
      origin: origin,
      allowed: isAllowed,
      allowedOrigins: allowedOrigins,
      timestamp: new Date().toISOString()
    }
  });
});

// Route de test d'authentification (sans auth)
app.post('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'POST CORS test réussi',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// =================================
// Gestion des erreurs
// =================================
app.use(notFoundHandler);
app.use(errorHandler);

// =================================
// Export
// =================================
module.exports = app;