// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar token JWT
function checkToken(req, res, next) {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).send('Unauthorized: No Authorization header');
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized: No token');
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId || payload.userID || payload.id || payload.id_profesor || payload.id_admin;
    req.userRole = payload.rol || payload.role || payload.rol_usuario;
    if (!req.userId || !req.userRole) return res.status(401).send('Unauthorized: Token missing userId or rol');
    next();
  } catch (err) {
    return res.status(403).send('Invalid or expired token');
  }
}

// Middleware para comprobar se o usuario é admin
function checkAdmin(req, res, next) {
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
}

module.exports = { checkToken, checkAdmin };
