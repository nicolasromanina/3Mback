const express = require('express');
const router = express.Router();
const { getStats, getMonthlyStats, getTopServices, getRecentOrders, getRecentClients, getUrgentOrders, getRevenue } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/monthly', getMonthlyStats);
router.get('/top-services', getTopServices);
router.get('/recent-orders', getRecentOrders);
router.get('/recent-clients', getRecentClients);
router.get('/urgent-orders', getUrgentOrders);
router.get('/revenue', getRevenue);

module.exports = router;
