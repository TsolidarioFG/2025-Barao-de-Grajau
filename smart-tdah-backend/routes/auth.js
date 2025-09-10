// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
const express = require('express');
const pool = require('../dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkToken } = require('../middleware/auth');
const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
	const { email, nombre, apellidos, password } = req.body;
	try {
		const client = await pool.connect();
		const exists = await client.query('SELECT 1 FROM profesores WHERE email = $1', [email]);
		if (exists.rows.length > 0) {
			client.release();
			return res.status(409).json({ error: 'Email already exists' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await client.query(
			'INSERT INTO profesores (email, nombre, apellidos, password) VALUES ($1, $2, $3, $4) RETURNING id_profesor',
			[email, nombre, apellidos, hashedPassword]
		);
		client.release();
		return res.status(201).json({ userId: result.rows[0].id_profesor });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'Error registering new user' });
	}
});

// POST /login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	let client;
	try {
		client = await pool.connect();
		let result = await client.query('SELECT * FROM profesores WHERE email = $1', [email]);
		if (result.rows.length > 0) {
			const profesor = result.rows[0];
			if (await bcrypt.compare(password, profesor.password)) {
				const token = jwt.sign({ userId: profesor.id_profesor, rol: 'profesor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
				client.release();
				return res.status(200).json({ token, rol: 'profesor', nombre: profesor.nombre, apellidos: profesor.apellidos, id: profesor.id_profesor });
			} else {
				client.release();
				return res.status(401).send('Invalid credentials');
			}
		}
		result = await client.query('SELECT * FROM admins WHERE email = $1', [email]);
		if (result.rows.length > 0) {
			const admin = result.rows[0];
			if (await bcrypt.compare(password, admin.password)) {
				const token = jwt.sign({ userId: admin.id_admin, rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
				client.release();
				return res.status(200).json({ token, rol: 'admin', nombre: admin.nombre, apellidos: admin.apellidos, id: admin.id_admin });
			} else {
				client.release();
				return res.status(401).send('Invalid credentials');
			}
		}
		client.release();
		return res.status(401).send('Invalid credentials');
	} catch (err) {
		if (client) client.release();
		console.error(err);
		return res.status(500).send('Error logging in');
	}
});

// POST /change-password
router.post('/change-password', checkToken, async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	const userId = req.userId;
	let userRole = null;
	try {
		const authHeader = req.get('Authorization');
		const token = authHeader && authHeader.split(' ')[1];
		if (token) {
			const payload = jwt.decode(token);
			userRole = payload.rol;
		}
	} catch (err) {
		return res.status(401).send('Invalid token');
	}
	if (!currentPassword || !newPassword) {
		return res.status(400).send('Current and new passwords are required');
	}
	try {
		const client = await pool.connect();
		let result;
		if (userRole === 'admin') {
			result = await client.query('SELECT password FROM admins WHERE id_admin = $1', [userId]);
		} else {
			result = await client.query('SELECT password FROM profesores WHERE id_profesor = $1', [userId]);
		}
		if (result.rows.length === 0) {
			client.release();
			return res.status(404).send('User not found');
		}
		const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
		if (!isMatch) {
			client.release();
			return res.status(401).send('Current password is incorrect');
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		if (userRole === 'admin') {
			await client.query('UPDATE admins SET password = $1 WHERE id_admin = $2', [hashedPassword, userId]);
		} else {
			await client.query('UPDATE profesores SET password = $1 WHERE id_profesor = $2', [hashedPassword, userId]);
		}
		client.release();
		return res.status(200).send('Password changed successfully');
	} catch (err) {
		console.error('Error changing password:', err.message);
		return res.status(500).send('Error changing password');
	}
});

// GET /profile
router.get('/profile', checkToken, async (req, res) => {
	const userId = req.userId;
	let userRole = null;
	try {
		const authHeader = req.get('Authorization');
		const token = authHeader && authHeader.split(' ')[1];
		if (token) {
			const payload = jwt.decode(token);
			userRole = payload.rol;
		}
	} catch (err) {
		return res.status(401).send('Invalid token');
	}
	if (!userId || !userRole) {
		return res.status(401).send('Unauthorized');
	}
	try {
		const client = await pool.connect();
		let result;
		if (userRole === 'admin') {
			result = await client.query('SELECT nombre, apellidos, email FROM admins WHERE id_admin = $1', [userId]);
		} else if (userRole === 'profesor') {
			result = await client.query('SELECT nombre, apellidos, email, puede_gestionar_alumnos FROM profesores WHERE id_profesor = $1', [userId]);
		} else {
			return res.status(403).send('Invalid role');
		}
		client.release();
		if (result.rows.length === 0) {
			return res.status(404).send('Profile not found');
		}
		res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error fetching profile');
	}
});

module.exports = router;
