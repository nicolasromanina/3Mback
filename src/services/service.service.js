/**
 * Service des services d'impression
 */

const Service = require('../models/Service');
const { AppError } = require('../middlewares/error.middleware');

class ServiceService {
  /**
   * Obtenir tous les services
   */
  async getAllServices(query = {}) {
    const { category, isActive, search, page = 1, limit = 50 } = query;

    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(filter)
    ]);

    return {
      data: services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtenir un service par ID
   */
  async getServiceById(serviceId) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new AppError('Service non trouvé', 404);
    }

    return service;
  }

  /**
   * Créer un nouveau service
   */
  async createService(serviceData) {
    const service = await Service.create(serviceData);
    return service;
  }

  /**
   * Mettre à jour un service
   */
  async updateService(serviceId, updateData) {
    const service = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      throw new AppError('Service non trouvé', 404);
    }

    return service;
  }

  /**
   * Supprimer un service
   */
  async deleteService(serviceId) {
    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      throw new AppError('Service non trouvé', 404);
    }

    return true;
  }

  /**
   * Activer/désactiver un service
   */
  async toggleServiceStatus(serviceId) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new AppError('Service non trouvé', 404);
    }

    service.isActive = !service.isActive;
    await service.save();

    return service;
  }

  /**
   * Obtenir les catégories disponibles
   */
  async getCategories() {
    const categories = await Service.distinct('category');
    return categories;
  }

  /**
   * Calculer le prix d'un service
   */
  async calculatePrice(serviceId, quantity, options = {}) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new AppError('Service non trouvé', 404);
    }

    if (quantity < service.minQuantity) {
      throw new AppError(`Quantité minimale: ${service.minQuantity}`, 400);
    }

    if (quantity > service.maxQuantity) {
      throw new AppError(`Quantité maximale: ${service.maxQuantity}`, 400);
    }

    const price = service.calculatePrice(quantity, options);

    return {
      service: service.name,
      quantity,
      unitPrice: service.basePrice,
      totalPrice: price,
      options
    };
  }
}

module.exports = new ServiceService();
