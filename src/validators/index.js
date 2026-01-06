/**
 * Export de tous les validateurs
 */

const authValidators = require('./auth.validator');
const serviceValidators = require('./service.validator');
const orderValidators = require('./order.validator');

module.exports = {
  ...authValidators,
  ...serviceValidators,
  ...orderValidators
};
