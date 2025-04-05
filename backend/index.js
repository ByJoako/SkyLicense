const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

dotenv.config();

const passport = require('./middlewares/auth'); // Ajusta la ruta según tu proyecto
const routes = require('./routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Cambia esto por una clave más segura
    resave: false, // No guarda la sesión si no se ha modificado
    saveUninitialized: false, // No guarda sesiones vacías
    cookie: {
      secure: true, // Asegúrate de usar HTTPS en producción
      
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session()); // Manejo de sesiones de passport

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api', routes);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
