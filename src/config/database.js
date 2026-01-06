// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log('🔗 Connexion à MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📁 Base de données: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;