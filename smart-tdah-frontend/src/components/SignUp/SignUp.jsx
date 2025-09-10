// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {TextField, Button, Typography, Paper, Box } from '@mui/material';
import axios from 'axios';
import { backendUrl } from '../../utils/constants';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';
import { useTheme } from '@mui/material/styles';

// =====================
// Estilos centralizados y documentados (responsive, SRP, comentarios visuales)
// =====================
const styles = (theme) => ({
  // --- Contenedor externo principal (centrado y scroll gestionado) ---
  mainBox: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center', // Centra verticalmente
    justifyContent: 'center', // Centra horizontalmente
    overflowY: 'auto', // Solo scroll vertical si el contenido no cabe
    overflowX: 'hidden', // Nunca scroll horizontal
    paddingTop: { xs: '70px', sm: '70px' }, // Altura del Banner fijo (responsive)
    boxSizing: 'border-box',
    background: 'none',
  },
  // --- Paper principal del registro ---
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: { xs: 2, sm: 4 }, // Padding responsive
    maxWidth: 500,
    width: '100%',
    margin: '0 auto', // Centrado horizontal
    borderRadius: 3,
    boxSizing: 'border-box',
    overflow: 'visible', // El scroll lo gestiona el contenedor externo
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1.5px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[8],
    backdropFilter: 'blur(2px)',
    transition: 'background-color 0.3s, color 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: 340,
      borderRadius: 2,
      padding: 1.2,
    },
  },
  // --- Título del registro ---
  titleSignUp: {
    fontWeight: 'bold',
    mt: 1,
    mb: 2,
    color: theme.palette.text.primary,
    letterSpacing: 1,
    textAlign: 'center',
    fontSize: 26,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
      mb: 1,
    },
  },
  // --- Formulario ---
  form: {
    width: '100%',
    marginTop: 1,
  },
  // --- Botón de envío ---
  submitButton: {
    mt: 1,
    mb: 2,
    fontWeight: 'bold',
    letterSpacing: 1,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    boxShadow: theme.shadows[2],
    borderRadius: 2,
    transition: 'background-color 0.3s, color 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      borderRadius: 1,
    },
  },
  // --- Campos de texto ---
  textField: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 1,
    mb: 1,
    input: { color: theme.palette.text.primary },
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
      borderRadius: 1,
      mb: 0.5,
    },
  },
  // --- Mensaje de error ---
  error: {
    color: theme.palette.error.main,
    fontSize: 15,
    mt: 1,
    textAlign: 'center',
  },
});

const SignUp = () => {
  // --- Estados de los campos y errores individuales ---
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Error general
  const [fieldErrors, setFieldErrors] = useState({}); // Errores por campo
  const navigate = useNavigate();
  const { language } = useLanguage(); // Obtiene el idioma actual
  const theme = useTheme();
  const sx = styles(theme); // Estilos centralizados y responsivos

  // --- Validación de campos ---
  const validateFields = () => {
    const errors = {};
    // Nombre obligatorio
    if (!nombre.trim()) errors.nombre = messages[language]?.requiredField || 'Campo obligatorio';
    // Apellidos obligatorio
    if (!apellidos.trim()) errors.apellidos = messages[language]?.requiredField || 'Campo obligatorio';
    // Email obligatorio y formato válido
    if (!email.trim()) {
      errors.email = messages[language]?.requiredField || 'Campo obligatorio';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.email = messages[language]?.invalidEmail || 'Email no válido';
    }
    // Contraseña: mínimo 8 caracteres, una mayúscula, una minúscula, un número
    if (!password) {
      errors.password = messages[language]?.requiredField || 'Campo obligatorio';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      errors.password = messages[language]?.weakPassword || 'Mínimo 8 caracteres, mayúscula, minúscula y número';
    }
    return errors;
  };

  // --- Lógica de registro --- 
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await axios.post(`${backendUrl}/signup`, { email, nombre, apellidos, password });
      navigate('/login');
    } catch (err) {
      // Manejo robusto de error de email duplicado
      if (
        err.response &&
        err.response.status === 409 &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.toLowerCase().includes('email')
      ) {
        setFieldErrors((prev) => ({ ...prev, email: messages[language]?.emailExists || 'El email ya está registrado' }));
      } else {
        setError(messages[language]?.signUpError);
      }
    }
  };

  // =============================
  // Renderizado visual del registro
  // =============================
  return (
    <Box sx={sx.mainBox}>
      <Paper elevation={0} sx={sx.paper}>
        <Typography component="h1" variant="h5" sx={sx.titleSignUp}>
          {messages[language]?.signUpTitle}
        </Typography>
        <Box component="form" onSubmit={handleSignUp} noValidate sx={sx.form}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="Nombre"
            label={messages[language]?.name}
            name="Nombre"
            autoComplete="Nombre"
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={sx.textField}
            error={!!fieldErrors.nombre}
            helperText={fieldErrors.nombre}
            InputLabelProps={{
              style: { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="Apellidos"
            label={messages[language]?.lastName}
            name="Apellidos"
            autoComplete="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            sx={sx.textField}
            error={!!fieldErrors.apellidos}
            helperText={fieldErrors.apellidos}
            InputLabelProps={{
              style: { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={messages[language]?.email}
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={sx.textField}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            InputLabelProps={{
              style: { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={messages[language]?.password}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={sx.textField}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            InputLabelProps={{
              style: { color: theme.palette.text.secondary },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={sx.submitButton}
          >
            {messages[language]?.signUpButton}
          </Button>
          {error && <Typography sx={sx.error}>{error}</Typography>}
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;