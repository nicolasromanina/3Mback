/**
 * Export de tous les contrôleurs
 */

const authController = require('./auth.controller');
const userController = require('./user.controller');
const serviceController = require('./service.controller');
const orderController = require('./order.controller');
const notificationController = require('./notification.controller');
const fileController = require('./file.controller');
const dashboardController = require('./dashboard.controller');

module.exports = {
  authController,
  userController,
  serviceController,
  orderController,
  notificationController,
  fileController,
  dashboardController
};
