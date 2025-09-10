// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const pool = require('../dbConfig');
const jwt = require('jsonwebtoken');
const { checkToken } = require('../middleware/auth');
const router = express.Router();

// Devuelve la lista de alumnos asociados a un profesor logeado con filtros opcionales
router.get('/', checkToken, async (req, res) => {
	const idProfesor = req.userId;
	const page = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.page_size) || 16;
	const filterBy = req.query.filter_by || null;
	const query = req.query.query || '';
	const offset = (page - 1) * pageSize;

	if (!idProfesor) {
		return res.status(401).send('Unauthorized');
	}

	try {
		const client = await pool.connect();
		let filterCondition = '';
		const filterParams = [idProfesor];
		if (filterBy && query) {
			if (!['nombre', 'apellidos', 'curso'].includes(filterBy)) {
				client.release();
				return res.status(400).send('Invalid filter field');
			}
			filterCondition = `AND LOWER(alumnos.${filterBy}) LIKE $2`;
			filterParams.push(`%${query.toLowerCase()}%`);
		}
		const result = await client.query(
			`SELECT alumnos.* 
			 FROM alumnos 
			 JOIN profesor_alumno ON alumnos.id_alumno = profesor_alumno.id_alumno 
			 WHERE profesor_alumno.id_profesor = $1
			 ${filterCondition}
			 LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`,
			[...filterParams, pageSize, offset]
		);
		const totalResult = await client.query(
			`SELECT COUNT(*) AS total 
			 FROM alumnos 
			 JOIN profesor_alumno ON alumnos.id_alumno = profesor_alumno.id_alumno 
			 WHERE profesor_alumno.id_profesor = $1
			 ${filterCondition}`,
			filterParams
		);
		client.release();
		const totalAlumnos = parseInt(totalResult.rows[0].total);
		const totalPages = Math.ceil(totalAlumnos / pageSize);
		return res.status(200).json({ alumnos: result.rows, totalPages });
	} catch (err) {
		console.error('Error fetching alumnos:', err.message);
		res.status(500).send('Error fetching alumnos');
	}
});

// Devuelve las estadísticas de un alumno
router.get('/:id_alumno', checkToken, async (req, res) => {
	const idAlumno = parseInt(req.params.id_alumno, 10);
	const idProfesor = req.userId;
	if (!idProfesor) {
		return res.status(401).send('Unauthorized');
	}
	if (isNaN(idAlumno)) {
		return res.status(400).send('Invalid student ID');
	}
	try {
		const client = await pool.connect();
		const result = await client.query(
			'SELECT alumnos.*, ejercicios.* FROM alumnos LEFT JOIN ejercicios ON alumnos.id_alumno = ejercicios.id_alumno WHERE alumnos.id_alumno = $1',
			[idAlumno]
		);
		client.release();
		if (result.rows.length === 0) {
			return res.status(404).send('No se encontraron estadísticas');
		}
		return res.status(200).json(result.rows);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Error fetching stats');
	}
});

// Buscar alumnos globalmente por email (para añadir a la lista de un profesor)
router.get('/add-alumnos/buscar', checkToken, async (req, res) => {
	const email = req.query.email || '';
	if (!email) return res.status(200).json({ alumnos: [] });
	try {
		const client = await pool.connect();
		const result = await client.query(
			'SELECT * FROM alumnos WHERE LOWER(email) LIKE $1 ORDER BY email LIMIT 50',
			[`%${email.toLowerCase()}%`]
		);
		client.release();
		return res.status(200).json({ alumnos: result.rows });
	} catch (err) {
		console.error('Error buscando alumnos globalmente:', err.message);
		res.status(500).send('Error buscando alumnos');
	}
});

module.exports = router;
