/**
 * Export de tous les services
 */

const authService = require('./auth.service');
const userService = require('./user.service');
const serviceService = require('./service.service');
const orderService = require('./order.service');
const notificationService = require('./notification.service');
const dashboardService = require('./dashboard.service');

module.exports = {
  authService,
  userService,
  serviceService,
  orderService,
  notificationService,
  dashboardService
};
