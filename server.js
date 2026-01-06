/**
 * PrintPro Backend Server
 * Point d'entrée principal de l'application
 */

require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');
const { seedAdmin } = require('./src/utils/seeders');

const PORT = process.env.PORT || 5000;

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.io
initializeSocket(server);

// Connexion à la base de données et démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();
    console.log('✅ MongoDB connecté avec succès');

    // Créer l'admin par défaut si nécessaire
    await seedAdmin();

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`
🚀 Serveur démarré avec succès!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API: http://localhost:${PORT}/api
📖 Health: http://localhost:${PORT}/api/health
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error.message);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu. Arrêt gracieux...');
  server.close(() => {
    console.log('✅ Processus terminé');
    process.exit(0);
  });
});

startServer();
