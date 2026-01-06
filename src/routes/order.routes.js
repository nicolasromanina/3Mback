const express = require('express');
const router = express.Router();
const { getAllOrders, getClientOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, tempUpload, addFilesToItem, getOrderStats } = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadMultiple } = require('../middlewares/upload.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');

router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/client', protect, getClientOrders);
router.get('/stats', protect, getOrderStats);
router.get('/:id', protect, getOrderById);
router.post('/', protect, validateBody(createOrderSchema), createOrder);
router.patch('/:id/status', protect, authorize('admin'), validateBody(updateOrderStatusSchema), updateOrderStatus);
router.delete('/:id', protect, deleteOrder);
router.post('/temp-upload', protect, uploadMultiple('files', 10), tempUpload);
router.post('/:id/items/:index/files', protect, uploadMultiple('files', 10), addFilesToItem);

module.exports = router;
