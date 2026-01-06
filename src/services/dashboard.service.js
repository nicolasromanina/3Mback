/**
 * Service du dashboard
 */

const Order = require('../models/Order');
const User = require('../models/User');
const Service = require('../models/Service');

class DashboardService {
  /**
   * Obtenir les statistiques globales
   */
  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalClients,
      totalRevenue,
      todayOrders,
      todayRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: { $in: ['completed', 'delivered'] } }),
      User.countDocuments({ role: 'client' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: { $ne: 'cancelled' }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalClients,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0
    };
  }

  /**
   * Obtenir les statistiques mensuelles
   */
  async getMonthlyStats(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Formater les données
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return monthlyData.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count,
      revenue: item.revenue
    }));
  }

  /**
   * Obtenir les services les plus populaires
   */
  async getTopServices(limit = 5) {
    const topServices = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.service',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $project: {
          _id: 0,
          service: '$service.name',
          category: '$service.category',
          count: 1,
          revenue: 1
        }
      }
    ]);

    return topServices;
  }

  /**
   * Obtenir les commandes récentes
   */
  async getRecentOrders(limit = 10) {
    const orders = await Order.find()
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return orders;
  }

  /**
   * Obtenir les nouveaux clients
   */
  async getRecentClients(limit = 5) {
    const clients = await User.find({ role: 'client' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt');

    return clients;
  }

  /**
   * Obtenir les commandes urgentes
   */
  async getUrgentOrders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgentOrders = await Order.find({
      status: { $in: ['pending', 'processing'] },
      dueDate: { $lte: tomorrow }
    })
      .populate('client', 'name')
      .sort({ dueDate: 1 });

    return urgentOrders;
  }

  /**
   * Obtenir les revenus par période
   */
  async getRevenueByPeriod(period = '7days') {
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return revenue;
  }
}

module.exports = new DashboardService();
