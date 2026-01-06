/**
 * Schémas de validation Zod pour l'authentification
 */

const { z } = require('zod');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .optional(),
  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),
  role: z.enum(['client', 'admin', 'employee']).optional().default('client')
});

const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Le refresh token est requis')
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .trim()
    .toLowerCase()
});

const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Le token est requis'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
});

const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
};
