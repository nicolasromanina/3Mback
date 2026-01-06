/**
 * Seeder pour créer l'admin par défaut
 */
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Administrateur',
        email: process.env.ADMIN_EMAIL || 'admin@printpro.com',
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log('✅ Admin par défaut créé');
    }
  } catch (error) {
    console.error('Erreur création admin:', error.message);
  }
};

module.exports = { seedAdmin };
