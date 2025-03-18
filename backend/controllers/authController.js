const { ActivityLog, createEmbed } = require('../models/Logger');
const jwt = require('jsonwebtoken');
const JWT_EXPIRES_IN = '7d'; // Tiempo de expiración del token

async function getCallback(req, res) {
      try {
      // Extraer datos del usuario autenticado
      const user = {
        id: req.user.discordId,
        avatar: req.user.avatar,
        username: req.user.username,
        role: req.user.role
      };

      // Generar el token JWT
      const token = jwt.sign(user,  process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const activityLog = await ActivityLog.create({
          user: {
              id: req.user.discordId,
              username: req.user.username,
              avatar: req.user.avatar
            },
            action: 'login',
        });
        createEmbed(activityLog);
      // Redirigir con el token como parámetro en la URL
      res.redirect(`/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error al generar el token:', error);
      res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
  getCallback
};