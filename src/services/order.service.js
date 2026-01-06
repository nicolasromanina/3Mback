/**
 * Service des commandes
 */

const Order = require('../models/Order');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const { AppError } = require('../middlewares/error.middleware');
const { emitToAdmins, emitToUser } = require('../config/socket');

class OrderService {
  /**
   * Obtenir toutes les commandes (admin)
   */
  async getAllOrders(query = {}) {
    const { status, page = 1, limit = 20, sort = '-createdAt', search } = query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('client', 'name email phone')
        .populate('items.service', 'name category basePrice')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    return {
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir les commandes d'un client
   */
  async getClientOrders(clientId, query = {}) {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = query;

    const filter = { client: clientId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.service', 'name category basePrice')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    return {
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir une commande par ID
   */
  async getOrderById(orderId, userId = null, userRole = null) {
    const order = await Order.findById(orderId)
      .populate('client', 'name email phone address')
      .populate('items.service', 'name category basePrice unit description');

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Vérifier l'accès
    if (userRole !== 'admin' && userId && order.client._id.toString() !== userId.toString()) {
      throw new AppError('Accès non autorisé à cette commande', 403);
    }

    return order;
  }

  /**
   * Créer une nouvelle commande
   */
  async createOrder(clientId, orderData) {
    const { items, dueDate, notes, priority } = orderData;

    // Calculer les prix pour chaque item
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const service = await Service.findById(item.service);
        
        if (!service) {
          throw new AppError(`Service non trouvé: ${item.service}`, 404);
        }

        if (!service.isActive) {
          throw new AppError(`Service non disponible: ${service.name}`, 400);
        }

        if (item.quantity < service.minQuantity) {
          throw new AppError(
            `Quantité minimale pour ${service.name}: ${service.minQuantity}`,
            400
          );
        }

        if (item.quantity > service.maxQuantity) {
          throw new AppError(
            `Quantité maximale pour ${service.name}: ${service.maxQuantity}`,
            400
          );
        }

        const unitPrice = service.basePrice;
        const totalPrice = service.calculatePrice(item.quantity, item.options);

        return {
          service: service._id,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          options: item.options || {},
          files: item.files || [],
          notes: item.notes
        };
      })
    );

    // Calculer le total
    const totalPrice = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Créer la commande
    const order = await Order.create({
      client: clientId,
      items: processedItems,
      totalPrice,
      dueDate,
      notes,
      priority,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedBy: clientId,
        notes: 'Commande créée'
      }]
    });

    // Populate les données
    await order.populate([
      { path: 'client', select: 'name email' },
      { path: 'items.service', select: 'name category' }
    ]);

    // Créer une notification pour les admins
    try {
      await Notification.createNotification({
        userId: clientId,
        title: 'Nouvelle commande',
        message: `Commande #${order.orderNumber} créée avec succès`,
        type: 'success',
        orderId: order._id
      });

      // Notifier les admins via socket
      emitToAdmins('newOrder', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        clientName: order.client.name,
        totalPrice: order.totalPrice
      });
    } catch (error) {
      console.error('Erreur notification:', error);
    }

    return order;
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(orderId, status, userId, notes = '') {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    const oldStatus = order.status;
    order.status = status;
    order.addStatusHistory(status, userId, notes);

    await order.save();
    await order.populate('client', 'name email');

    // Créer une notification pour le client
    const statusLabels = {
      draft: 'Devis',
      pending: 'En attente',
      processing: 'En cours de traitement',
      completed: 'Terminée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };

    try {
      await Notification.createNotification({
        userId: order.client._id,
        title: 'Mise à jour de commande',
        message: `Votre commande #${order.orderNumber} est maintenant: ${statusLabels[status]}`,
        type: status === 'cancelled' ? 'warning' : 'info',
        orderId: order._id
      });

      // Notifier le client via socket
      emitToUser(order.client._id.toString(), 'orderUpdated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus: status
      });
    } catch (error) {
      console.error('Erreur notification:', error);
    }

    return order;
  }

  /**
   * Supprimer une commande
   */
  async deleteOrder(orderId, userId, userRole) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Seul l'admin peut supprimer ou le client si la commande est en draft
    if (userRole !== 'admin') {
      if (order.client.toString() !== userId.toString() || order.status !== 'draft') {
        throw new AppError('Non autorisé à supprimer cette commande', 403);
      }
    }

    await Order.findByIdAndDelete(orderId);

    return true;
  }

  /**
   * Ajouter des fichiers à un item de commande
   */
  async addFilesToOrderItem(orderId, itemIndex, fileUrls) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    if (!order.items[itemIndex]) {
      throw new AppError('Item non trouvé', 404);
    }

    order.items[itemIndex].files = [
      ...(order.items[itemIndex].files || []),
      ...fileUrls
    ];

    await order.save();

    return order;
  }

  /**
   * Obtenir les statistiques des commandes
   */
  async getOrderStats(clientId = null) {
    const matchStage = clientId ? { client: clientId } : {};

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const formattedStats = {
      draft: { count: 0, revenue: 0 },
      pending: { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      completed: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 }
    };

    stats.forEach(stat => {
      if (formattedStats[stat._id]) {
        formattedStats[stat._id] = {
          count: stat.count,
          revenue: stat.totalRevenue
        };
      }
    });

    return formattedStats;
  }
}

module.exports = new OrderService();
