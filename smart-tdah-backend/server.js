// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./dbConfig');
require('dotenv').config(); // Cargar variables de entorno desde .env 

const app = express();

// Middleware global de log para depuración de rutas y cabeceras
app.use((req, res, next) => {
  //console.log(`[${req.method}] ${req.url} headers:`, req.headers);
  next();
});

// ===============================
// Cargar la clave secreta JWT desde variables de entorno
// ===============================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el entorno. Añádelo a tu archivo .env');
}

// ===============================
// Configuración del host y puerto de escucha
// Lee siempre de variables de entorno para alternar entre localhost y red local
// ===============================
const HOST = process.env.HOST || "localhost"; // Cambia HOST en .env para alternar
const PORT = process.env.SERVER_PORT || 5000;

// Lee el origen permitido desde variable de entorno
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Configura CORS para permitir solo el origen del frontend y aceptar preflight y headers comunes
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());



//Funcion para verificar el token (más robusta y con logs)
const checkToken = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      console.error('No Authorization header');
      return res.status(401).send('Unauthorized: No Authorization header');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('No token in Authorization header');
      return res.status(401).send('Unauthorized: No token');
    }
    const payload = jwt.verify(token, JWT_SECRET);
    // Log completo del payload para depuración
    //console.log('Token payload:', payload);
    // Permitir tanto userId/rol como userId/rol (compatibilidad)
    req.userId = payload.userId || payload.userID || payload.id || payload.id_profesor || payload.id_admin;
    req.userRole = payload.rol || payload.role || payload.rol_usuario;
    if (!req.userId || !req.userRole) {
      console.error('Token válido pero faltan campos: userId o rol', payload);
      return res.status(401).send('Unauthorized: Token missing userId or rol');
    }
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    return res.status(403).send('Invalid or expired token');
  }
};

// Middleware para comprobar si el usuario es admin
const checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.rol !== 'admin') return res.status(403).send('Forbidden: Admins only');
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(403).send('Invalid or expired token');
  }
};


// ############################################################################################################################

// Iniciar el servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
});
// LLMS API endpoint
const llmsRouter = require('./routes/LLMS');
app.use('/ask', llmsRouter);

// Rutas de alumnos
const alumnosRouter = require('./routes/alumnos');
app.use('/alumnos', alumnosRouter);

// Rutas de profesores
const profesoresRouter = require('./routes/profesores');
app.use('/profesores', profesoresRouter);

// Rutas de autenticación
const authRouter = require('./routes/auth');
app.use('/', authRouter);

// Rutas de profesor-alumno
const profesorAlumnoRouter = require('./routes/profesorAlumno');
app.use('/profesor-alumno', profesorAlumnoRouter);

// Rutas de pruebas
const testRouter = require('./routes/test');
app.use('/', testRouter);
