# PrintPro Backend - Node.js/Express/MongoDB

Backend complet pour l'application de gestion de services d'impression.

## 🚀 Installation

```bash
# Cloner le projet backend
cd backend-nodejs

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos configurations
nano .env

# Lancer en développement
npm run dev

# Lancer en production
npm start
```

## 📁 Structure du Projet

```
backend-nodejs/
├── src/
│   ├── config/           # Configuration (DB, JWT, etc.)
│   ├── controllers/      # Contrôleurs API
│   ├── middlewares/      # Middlewares (auth, validation, errors)
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Routes Express
│   ├── services/         # Logique métier
│   ├── utils/            # Utilitaires
│   ├── validators/       # Schémas de validation Zod
│   └── app.js            # Configuration Express
├── uploads/              # Fichiers uploadés
├── .env.example          # Variables d'environnement exemple
├── package.json
└── server.js             # Point d'entrée
```

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/printpro

# JWT
JWT_SECRET=votre_secret_jwt_ultra_securise_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_refresh_secret_jwt_ultra_securise
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh-token` | Rafraîchir le token |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |
| POST | `/api/auth/reset-password` | Réinitialiser mot de passe |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Profil utilisateur |
| PATCH | `/api/users/me` | Modifier profil |
| PATCH | `/api/users/me/password` | Changer mot de passe |
| DELETE | `/api/users/me` | Supprimer compte |
| GET | `/api/users` | Liste utilisateurs (admin) |
| GET | `/api/users/:id` | Détails utilisateur (admin) |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Liste des services |
| GET | `/api/services/:id` | Détails service |
| POST | `/api/services` | Créer service (admin) |
| PATCH | `/api/services/:id` | Modifier service (admin) |
| DELETE | `/api/services/:id` | Supprimer service (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Liste commandes (admin) |
| GET | `/api/orders/client` | Commandes du client |
| GET | `/api/orders/:id` | Détails commande |
| POST | `/api/orders` | Créer commande |
| PATCH | `/api/orders/:id/status` | Modifier statut |
| DELETE | `/api/orders/:id` | Supprimer commande |
| POST | `/api/orders/temp-upload` | Upload fichiers temporaires |
| POST | `/api/orders/:id/items/:index/files` | Upload fichiers commande |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/user/:userId` | Notifications utilisateur |
| PATCH | `/api/notifications/:id/read` | Marquer comme lue |
| PATCH | `/api/notifications/mark-all-read` | Tout marquer comme lu |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload fichiers |
| DELETE | `/api/files/:filename` | Supprimer fichier |
| GET | `/api/files/:filename` | Télécharger fichier |

### Dashboard & Stats (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Statistiques globales |
| GET | `/api/dashboard/revenue` | Revenus |
| GET | `/api/dashboard/top-services` | Services populaires |

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Headers requis
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Réponse de login
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "role": "client"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}
```

## 🔌 Intégration Frontend

### Configuration Axios (Frontend)
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemple d'appels API

```typescript
// Login
const response = await api.post('/auth/login', { email, password });
const { user, tokens } = response.data.data;

// Fetch services
const services = await api.get('/services');

// Create order
const order = await api.post('/orders', {
  items: [{ service: 'serviceId', quantity: 100, options: {} }]
});

// Upload files
const formData = new FormData();
files.forEach(file => formData.append('files', file));
const response = await api.post('/orders/temp-upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests e2e
npm run test:e2e
```

## 📦 Déploiement

### Production
```bash
# Build
npm run build

# Start
NODE_ENV=production npm start
```

### Docker
```bash
docker build -t printpro-backend .
docker run -p 5000:5000 printpro-backend
```

## 📄 License

MIT
