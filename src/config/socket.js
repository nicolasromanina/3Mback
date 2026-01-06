/**
 * Configuration Socket.io
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware d'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      // Permettre les connexions non authentifiées pour certaines fonctionnalités
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connecté: ${socket.id}`);

    // Rejoindre les rooms basées sur l'utilisateur
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      
      if (socket.user.role === 'admin') {
        socket.join('admins');
      }
    }

    // Événement de nouvelle commande
    socket.on('newOrder', (orderData) => {
      // Notifier les admins
      io.to('admins').emit('orderCreated', orderData);
    });

    // Événement de mise à jour de commande
    socket.on('orderUpdate', (orderData) => {
      // Notifier le client concerné
      if (orderData.clientId) {
        io.to(`user:${orderData.clientId}`).emit('orderUpdated', orderData);
      }
      // Notifier les admins
      io.to('admins').emit('orderUpdated', orderData);
    });

    // Événement de message chat
    socket.on('sendMessage', (messageData) => {
      const { receiverId, ...message } = messageData;
      
      // Envoyer au destinataire
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('newMessage', message);
      }
      
      // Envoyer aux admins si le message vient d'un client
      if (socket.user?.role === 'client') {
        io.to('admins').emit('newMessage', message);
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`Socket déconnecté: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io non initialisé');
  }
  return io;
};

// Fonctions utilitaires pour émettre des événements
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admins').emit(event, data);
  }
};

const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification', notification);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitNotification
};
