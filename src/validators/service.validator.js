/**
 * Schémas de validation Zod pour les services
 */

const { z } = require('zod');

const serviceOptionSchema = z.object({
  name: z.string()
    .min(1, 'Le nom de l\'option est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  type: z.enum(['select', 'checkbox', 'number']),
  options: z.array(z.string()).optional(),
  priceModifier: z.number().optional().default(0),
  required: z.boolean().optional().default(false)
});

const createServiceSchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  description: z.string()
    .min(1, 'La description est requise')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim(),
  category: z.enum(['flyers', 'cartes', 'affiches', 'brochures', 'autres']),
  basePrice: z.number()
    .positive('Le prix doit être positif'),
  unit: z.string()
    .min(1, 'L\'unité est requise')
    .max(50, 'L\'unité ne peut pas dépasser 50 caractères')
    .default('unité'),
  minQuantity: z.number()
    .int()
    .positive('La quantité minimale doit être positive')
    .default(1),
  maxQuantity: z.number()
    .int()
    .positive('La quantité maximale doit être positive')
    .default(10000),
  options: z.array(serviceOptionSchema).optional().default([]),
  isActive: z.boolean().optional().default(true)
});

const updateServiceSchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),
  description: z.string()
    .min(1, 'La description est requise')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional(),
  category: z.enum(['flyers', 'cartes', 'affiches', 'brochures', 'autres']).optional(),
  basePrice: z.number()
    .positive('Le prix doit être positif')
    .optional(),
  unit: z.string()
    .max(50, 'L\'unité ne peut pas dépasser 50 caractères')
    .optional(),
  minQuantity: z.number()
    .int()
    .positive('La quantité minimale doit être positive')
    .optional(),
  maxQuantity: z.number()
    .int()
    .positive('La quantité maximale doit être positive')
    .optional(),
  options: z.array(serviceOptionSchema).optional(),
  isActive: z.boolean().optional()
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  serviceOptionSchema
};
