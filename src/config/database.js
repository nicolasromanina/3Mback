/**
 * Configuration de la connexion MongoDB pour Atlas
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // URI MongoDB Atlas (cacher les credentials en prod)
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://nicolasromanina_db_user:Xq0HTX6JBBWRRAKz@3mprinting.xx4vxyr.mongodb.net/printpro?retryWrites=true&w=majority';
    
    // Options minimales et fonctionnelles
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log('🔗 Tentative de connexion à MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📁 Base de données: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;