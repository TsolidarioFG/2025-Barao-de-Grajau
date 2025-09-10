// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const pool = require('../dbConfig');
const router = express.Router();

// Ruta de prueba para verificar la conexión a la base de datos
router.get('/test-db', async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query('SELECT NOW()');
		client.release();
		return res.send(result.rows);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Error connecting to the database');
	}
});

module.exports = router;
