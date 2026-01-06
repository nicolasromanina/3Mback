/**
 * Contrôleur des services
 */

const serviceService = require('../services/service.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /api/services
 * @desc    Obtenir tous les services
 * @access  Public
 */
const getAllServices = asyncHandler(async (req, res) => {
  const result = await serviceService.getAllServices(req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/services/categories
 * @desc    Obtenir les catégories disponibles
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await serviceService.getCategories();

  res.status(200).json({
    success: true,
    data: categories
  });
});

/**
 * @route   GET /api/services/:id
 * @desc    Obtenir un service par ID
 * @access  Public
 */
const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);

  res.status(200).json({
    success: true,
    data: service
  });
});

/**
 * @route   POST /api/services
 * @desc    Créer un nouveau service
 * @access  Private/Admin
 */
const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body);

  res.status(201).json({
    success: true,
    message: 'Service créé avec succès',
    data: service
  });
});

/**
 * @route   PATCH /api/services/:id
 * @desc    Mettre à jour un service
 * @access  Private/Admin
 */
const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Service mis à jour avec succès',
    data: service
  });
});

/**
 * @route   DELETE /api/services/:id
 * @desc    Supprimer un service
 * @access  Private/Admin
 */
const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Service supprimé avec succès'
  });
});

/**
 * @route   PATCH /api/services/:id/toggle
 * @desc    Activer/désactiver un service
 * @access  Private/Admin
 */
const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await serviceService.toggleServiceStatus(req.params.id);

  res.status(200).json({
    success: true,
    message: `Service ${service.isActive ? 'activé' : 'désactivé'}`,
    data: service
  });
});

/**
 * @route   POST /api/services/:id/calculate-price
 * @desc    Calculer le prix d'un service
 * @access  Public
 */
const calculatePrice = asyncHandler(async (req, res) => {
  const { quantity, options } = req.body;
  const result = await serviceService.calculatePrice(req.params.id, quantity, options);

  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  getAllServices,
  getCategories,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  calculatePrice
};
