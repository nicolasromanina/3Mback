const express = require('express');
const router = express.Router();
const { getAllServices, getCategories, getServiceById, createService, updateService, deleteService, toggleServiceStatus, calculatePrice } = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createServiceSchema, updateServiceSchema } = require('../validators/service.validator');

router.get('/', getAllServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);
router.post('/', protect, authorize('admin'), validateBody(createServiceSchema), createService);
router.patch('/:id', protect, authorize('admin'), validateBody(updateServiceSchema), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.patch('/:id/toggle', protect, authorize('admin'), toggleServiceStatus);
router.post('/:id/calculate-price', calculatePrice);

module.exports = router;
