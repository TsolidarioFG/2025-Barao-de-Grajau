// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const pool = require('../dbConfig');
const { checkToken } = require('../middleware/auth');
const router = express.Router();

// POST /profesor-alumno (asociar alumno a profesor)
router.post('/', checkToken, async (req, res) => {
	const idProfesor = req.userId;
	const { id_alumno } = req.body;
	if (!idProfesor || !id_alumno) {
		return res.status(400).json({ error: 'Faltan parámetros: id_alumno o token' });
	}
	try {
		const client = await pool.connect();
		const alumnoRes = await client.query('SELECT 1 FROM alumnos WHERE id_alumno = $1', [id_alumno]);
		if (alumnoRes.rowCount === 0) {
			client.release();
			return res.status(404).json({ error: 'Alumno no encontrado' });
		}
		const relRes = await client.query('SELECT 1 FROM profesor_alumno WHERE id_profesor = $1 AND id_alumno = $2', [idProfesor, id_alumno]);
		if (relRes.rowCount > 0) {
			client.release();
			return res.status(409).json({ error: 'El alumno ya está asociado a este profesor' });
		}
		await client.query('INSERT INTO profesor_alumno (id_profesor, id_alumno) VALUES ($1, $2)', [idProfesor, id_alumno]);
		client.release();
		return res.status(201).json({ message: 'Alumno asociado correctamente' });
	} catch (err) {
		console.error('Error añadiendo alumno a profesor:', err.message);
		return res.status(500).json({ error: 'Error añadiendo alumno a profesor' });
	}
});

// DELETE /profesor-alumno (eliminar relación)
router.delete('/', checkToken, async (req, res) => {
	const idProfesor = req.userId;
	const { id_alumno } = req.body;
	if (!idProfesor || !id_alumno) {
		return res.status(400).send('Faltan parámetros');
	}
	try {
		const client = await pool.connect();
		const result = await client.query(
			'DELETE FROM profesor_alumno WHERE id_profesor = $1 AND id_alumno = $2 RETURNING *',
			[idProfesor, id_alumno]
		);
		client.release();
		if (result.rowCount === 0) {
			return res.status(404).send('Relación no encontrada');
		}
		return res.status(200).json({ message: 'Alumno eliminado de la lista del profesor' });
	} catch (err) {
		console.error('Error al eliminar alumno de la lista:', err.message);
		res.status(500).send('Error al eliminar alumno de la lista');
	}
});

module.exports = router;
