/**
 * PrintPro Backend Server - Compatible Vercel
 */

require('dotenv').config();

const server = require('./src/app');
const connectDB = require('./src/config/database');
const { seedAdmin } = require('./src/utils/seeders');

const isVercel = process.env.VERCEL || false;

if (isVercel) {
  console.log('🚀 Mode Vercel détecté');
  
  // Pour Vercel, exporter l'application directement
  module.exports = server;
} else {
  // Mode local
  const http = require('http');
  const { initializeSocket } = require('./src/config/socket');
  
  const PORT = process.env.PORT || 5000;
  
  // Créer le serveur HTTP
  const appServer = http.createServer(server);
  
  // Initialiser Socket.io (uniquement en local)
  initializeSocket(appServer);
  
  // Connexion à la base de données et démarrage du serveur
  const startServer = async () => {
    try {
      // Connexion à MongoDB
      await connectDB();
      console.log('✅ MongoDB connecté avec succès');

      // Créer l'admin par défaut si nécessaire
      await seedAdmin();

      // Démarrer le serveur
      appServer.listen(PORT, () => {
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

  // Gestion des erreurs
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    appServer.close(() => {
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
  });

  startServer();
}