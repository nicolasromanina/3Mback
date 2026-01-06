/**
 * Contrôleur du dashboard
 */

const dashboardService = require('../services/dashboard.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtenir les statistiques globales
 * @access  Private/Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @route   GET /api/dashboard/monthly
 * @desc    Obtenir les statistiques mensuelles
 * @access  Private/Admin
 */
const getMonthlyStats = asyncHandler(async (req, res) => {
  const { months = 6 } = req.query;
  const stats = await dashboardService.getMonthlyStats(parseInt(months));

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @route   GET /api/dashboard/top-services
 * @desc    Obtenir les services les plus populaires
 * @access  Private/Admin
 */
const getTopServices = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const services = await dashboardService.getTopServices(parseInt(limit));

  res.status(200).json({
    success: true,
    data: services
  });
});

/**
 * @route   GET /api/dashboard/recent-orders
 * @desc    Obtenir les commandes récentes
 * @access  Private/Admin
 */
const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const orders = await dashboardService.getRecentOrders(parseInt(limit));

  res.status(200).json({
    success: true,
    data: orders
  });
});

/**
 * @route   GET /api/dashboard/recent-clients
 * @desc    Obtenir les nouveaux clients
 * @access  Private/Admin
 */
const getRecentClients = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const clients = await dashboardService.getRecentClients(parseInt(limit));

  res.status(200).json({
    success: true,
    data: clients
  });
});

/**
 * @route   GET /api/dashboard/urgent-orders
 * @desc    Obtenir les commandes urgentes
 * @access  Private/Admin
 */
const getUrgentOrders = asyncHandler(async (req, res) => {
  const orders = await dashboardService.getUrgentOrders();

  res.status(200).json({
    success: true,
    data: orders
  });
});

/**
 * @route   GET /api/dashboard/revenue
 * @desc    Obtenir les revenus par période
 * @access  Private/Admin
 */
const getRevenue = asyncHandler(async (req, res) => {
  const { period = '7days' } = req.query;
  const revenue = await dashboardService.getRevenueByPeriod(period);

  res.status(200).json({
    success: true,
    data: revenue
  });
});

module.exports = {
  getStats,
  getMonthlyStats,
  getTopServices,
  getRecentOrders,
  getRecentClients,
  getUrgentOrders,
  getRevenue
};
