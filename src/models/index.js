/**
 * Export de tous les modèles
 */

const User = require('./User');
const Service = require('./Service');
const Order = require('./Order');
const Notification = require('./Notification');
const Conversation = require('./Conversation');
const Message = require('./Message');

module.exports = {
  User,
  Service,
  Order,
  Notification,
  Conversation,
  Message
};
