/**
 * Service utilisateur
 */

const User = require('../models/User');
const { AppError } = require('../middlewares/error.middleware');

class UserService {
  /**
   * Obtenir le profil utilisateur
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user.toPublic();
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId, updateData) {
    // Champs autorisés à mettre à jour
    const allowedFields = ['name', 'phone', 'address', 'avatar', 'preferences'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user.toPublic();
  }

  /**
   * Supprimer le compte utilisateur
   */
  async deleteAccount(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Soft delete - désactiver le compte au lieu de le supprimer
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    return true;
  }

  /**
   * Obtenir tous les utilisateurs (admin)
   */
  async getAllUsers(query = {}) {
    const { page = 1, limit = 10, role, search, sort = '-createdAt' } = query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    return {
      users: users.map(u => u.toPublic()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir un utilisateur par ID (admin)
   */
  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user.toPublic();
  }

  /**
   * Mettre à jour un utilisateur (admin)
   */
  async updateUser(userId, updateData) {
    const allowedFields = ['name', 'email', 'phone', 'address', 'role', 'isActive'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user.toPublic();
  }

  /**
   * Obtenir les statistiques utilisateur
   */
  async getUserStats(userId) {
    const Order = require('../models/Order');
    
    const [user, orderStats] = await Promise.all([
      User.findById(userId),
      Order.aggregate([
        { $match: { client: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' },
            completedOrders: {
              $sum: { $cond: [{ $in: ['$status', ['completed', 'delivered']] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    return {
      user: user.toPublic(),
      stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, completedOrders: 0 }
    };
  }
}

module.exports = new UserService();
