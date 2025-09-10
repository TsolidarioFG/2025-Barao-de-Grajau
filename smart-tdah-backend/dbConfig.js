// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const { Pool } = require('pg');
require('dotenv').config({path: __dirname + '/.env'}); // Cargar variables de entorno desde .env 

// Imprimir variables de entorno para depuración
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : 'NO PASSWORD');
console.log('DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

module.exports = pool;