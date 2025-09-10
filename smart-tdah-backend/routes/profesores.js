// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const pool = require('../dbConfig');
const { checkAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /profesores (solo admin)
router.get('/', checkAdmin, async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query('SELECT id_profesor, nombre, apellidos, email, puede_gestionar_alumnos FROM profesores ORDER BY id_profesor');
		client.release();
		return res.status(200).json(result.rows);
	} catch (err) {
		console.error('Error fetching profesores:', err.message);
		return res.status(500).send('Error fetching profesores');
	}
});

// PATCH /profesores/:id/permiso (solo admin)
router.patch('/:id/permiso', checkAdmin, async (req, res) => {
	const idProfesor = parseInt(req.params.id, 10);
	const { puede_gestionar_alumnos } = req.body;
	if (typeof puede_gestionar_alumnos !== 'boolean') {
		return res.status(400).send('El campo puede_gestionar_alumnos debe ser booleano');
	}
	try {
		const client = await pool.connect();
		const result = await client.query(
			'UPDATE profesores SET puede_gestionar_alumnos = $1 WHERE id_profesor = $2 RETURNING id_profesor, nombre, apellidos, email, puede_gestionar_alumnos',
			[puede_gestionar_alumnos, idProfesor]
		);
		client.release();
		if (result.rows.length === 0) {
			return res.status(404).send('Profesor no encontrado');
		}
		return res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error('Error actualizando permiso:', err.message);
		return res.status(500).send('Error actualizando permiso');
	}
});

// DELETE /profesores/:id (solo admin)
router.delete('/:id', checkAdmin, async (req, res) => {
	const idProfesor = parseInt(req.params.id, 10);
	if (isNaN(idProfesor)) {
		return res.status(400).send('ID de profesor inválido');
	}
	try {
		const client = await pool.connect();
		// Eliminar relaciones en profesor_alumno primero (si existen)
		await client.query('DELETE FROM profesor_alumno WHERE id_profesor = $1', [idProfesor]);
		// Eliminar el profesor
		const result = await client.query('DELETE FROM profesores WHERE id_profesor = $1 RETURNING id_profesor', [idProfesor]);
		client.release();
		if (result.rows.length === 0) {
			return res.status(404).send('Profesor no encontrado');
		}
		return res.status(200).json({ message: 'Profesor eliminado correctamente' });
	} catch (err) {
		console.error('Error eliminando profesor:', err.message);
		return res.status(500).send('Error eliminando profesor');
	}
});

module.exports = router;
