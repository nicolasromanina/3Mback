/**
 * Modèle Service
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const serviceOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: [true, 'Le nom de l\'option est requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['select', 'checkbox', 'number'],
    required: true
  },
  options: [{
    type: String,
    trim: true
  }],
  priceModifier: {
    type: Number,
    default: 0
  },
  required: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['flyers', 'cartes', 'affiches', 'brochures', 'autres'],
    default: 'autres'
  },
  basePrice: {
    type: Number,
    required: [true, 'Le prix de base est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  unit: {
    type: String,
    required: [true, 'L\'unité est requise'],
    default: 'unité'
  },
  minQuantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité minimale doit être au moins 1'],
    default: 1
  },
  maxQuantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité maximale doit être au moins 1'],
    default: 10000
  },
  options: [serviceOptionSchema],
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  }
});

// Index
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Méthode pour calculer le prix
serviceSchema.methods.calculatePrice = function(quantity, options = {}) {
  let price = this.basePrice * quantity;

  // Appliquer les modificateurs de prix des options
  this.options.forEach(option => {
    if (options[option.id] && option.priceModifier) {
      if (option.type === 'checkbox' && options[option.id] === true) {
        price += option.priceModifier * quantity;
      } else if (option.type === 'select' || option.type === 'number') {
        price += option.priceModifier * quantity;
      }
    }
  });

  return Math.round(price * 100) / 100;
};

module.exports = mongoose.model('Service', serviceSchema);
