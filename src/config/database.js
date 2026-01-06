/**
 * Configuration de la connexion MongoDB pour Atlas
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Utilisez votre URI Atlas directement ou via variable d'environnement
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://nicolasromanina_db_user:Xq0HTX6JBBWRRAKz@3mprinting.xx4vxyr.mongodb.net/printpro?retryWrites=true&w=majority';
    
    const options = {
      // Options recommandées pour Atlas
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Options spécifiques à MongoDB Atlas
      retryWrites: true,
      w: 'majority',
      // Nouveaux paramètres recommandés
      ssl: true,
      sslValidate: true,
      // Gestion du timeout de connexion
      connectTimeoutMS: 10000,
      // Meilleure gestion des répliques
      replicaSet: 'atlas-xxxxxx-shard-0', // Optionnel - Atlas le gère automatiquement
      // Pour éviter les avertissements de dépréciation
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📁 Base de données: ${conn.connection.name}`);

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    // Événement utile pour le débogage
    mongoose.connection.on('connecting', () => {
      console.log('🔗 Connexion à MongoDB Atlas...');
    });

    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // Détails supplémentaires pour le débogage
    console.error('Code erreur:', error.code);
    console.error('Nom erreur:', error.name);
    throw error;
  }
};

module.exports = connectDB;