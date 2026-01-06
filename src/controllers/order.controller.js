/**
 * Contrôleur des commandes
 */

const orderService = require('../services/order.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { getFileUrl } = require('../middlewares/upload.middleware');

/**
 * @route   GET /api/orders
 * @desc    Obtenir toutes les commandes (admin)
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/orders/client
 * @desc    Obtenir les commandes du client connecté
 * @access  Private
 */
const getClientOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getClientOrders(req.user.id, req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Obtenir une commande par ID
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @route   POST /api/orders
 * @desc    Créer une nouvelle commande
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Commande créée avec succès',
    data: order
  });
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Mettre à jour le statut d'une commande
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    req.user.id,
    notes
  );

  res.status(200).json({
    success: true,
    message: 'Statut mis à jour avec succès',
    data: order
  });
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Supprimer une commande
 * @access  Private
 */
const deleteOrder = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Commande supprimée avec succès'
  });
});

/**
 * @route   POST /api/orders/temp-upload
 * @desc    Upload temporaire de fichiers
 * @access  Private
 */
const tempUpload = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier uploadé'
    });
  }

  const urls = req.files.map(file => {
    const subfolder = file.destination.includes('images') ? 'images' : 
                      file.destination.includes('documents') ? 'documents' : 'misc';
    return getFileUrl(file.filename, subfolder);
  });

  res.status(200).json({
    success: true,
    data: { urls }
  });
});

/**
 * @route   POST /api/orders/:id/items/:index/files
 * @desc    Ajouter des fichiers à un item de commande
 * @access  Private
 */
const addFilesToItem = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier uploadé'
    });
  }

  const fileUrls = req.files.map(file => {
    const subfolder = file.destination.includes('images') ? 'images' : 
                      file.destination.includes('documents') ? 'documents' : 'misc';
    return getFileUrl(file.filename, subfolder);
  });

  const order = await orderService.addFilesToOrderItem(
    req.params.id,
    parseInt(req.params.index),
    fileUrls
  );

  res.status(200).json({
    success: true,
    message: 'Fichiers ajoutés avec succès',
    data: { fileUrls }
  });
});

/**
 * @route   GET /api/orders/stats
 * @desc    Obtenir les statistiques des commandes
 * @access  Private
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const clientId = req.user.role === 'admin' ? null : req.user.id;
  const stats = await orderService.getOrderStats(clientId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getAllOrders,
  getClientOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  tempUpload,
  addFilesToItem,
  getOrderStats
};
