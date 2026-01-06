/**
 * Schémas de validation Zod pour les commandes
 */

const { z } = require('zod');

const orderItemSchema = z.object({
  service: z.string()
    .min(1, 'Le service est requis'),
  quantity: z.number()
    .int()
    .positive('La quantité doit être positive'),
  options: z.record(z.any()).optional().default({}),
  files: z.array(z.string()).optional().default([]),
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, 'Au moins un article est requis'),
  dueDate: z.string().datetime().optional(),
  notes: z.string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal')
});

const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'processing', 'completed', 'delivered', 'cancelled']),
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  orderItemSchema
};
