// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Box, Link, Paper, useTheme } from '@mui/material';
import { backendUrl } from '../../utils/constants';
import logo from '../../assets/logo1.png';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';

// =====================
// Estilos centralizados y documentados
// =====================
const styles = (theme) => ({
  // --- Contenedor externo principal (centrado y scroll gestionado) ---
  boxPrincipal: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto', // Solo scroll vertical si el contenido no cabe
    overflowX: 'hidden', // Nunca scroll horizontal
    paddingTop: { xs: '70px', sm: '70px' }, // Altura del Banner fijo (responsive)
    boxSizing: 'border-box',
    background: 'none',
  },
  // --- Logo de la app ---
  logo: {
    width: 300, // Ancho fijo
    height: 'auto', // Altura automática
    marginBottom: theme.spacing(2), // Espaciado inferior
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      width: 180, // Más pequeño en móvil
      marginBottom: theme.spacing(1),
    },
  },
  // --- Paper principal ---
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4), // Padding generoso en desktop
    maxWidth: 500,
    width: '100%',
    margin: '0 auto', // Centrado horizontal
    borderRadius: 12,
    boxSizing: 'border-box',
    overflow: 'visible', // El scroll lo gestiona el contenedor externo
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1.5px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[8],
    transition: 'background-color 0.3s, color 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      maxWidth: 340,
      borderRadius: 6,
    },
  },
  // --- Título de login ---
  titleLogin: {
    marginTop: theme.spacing(0.5),
    fontWeight: 'bold',
    letterSpacing: 1,
    color: theme.palette.text.primary,
    transition: 'background-color 0.3s, color 0.3s',
    fontSize: 28,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 20,
    },
  },
  // --- Botón de envío ---
  submitButton: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1.25),
    fontWeight: 'bold',
    letterSpacing: 1,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    boxShadow: theme.shadows[2],
    borderRadius: 8,
    transition: 'background-color 0.3s, color 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      borderRadius: 4,
    },
  },
  // --- Campos de texto ---
  textField: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 4, // Bordes redondeados para el fondo
    marginBottom: theme.spacing(1),
    input: { color: theme.palette.text.primary },
    // --- Fuerza el mismo border-radius en el borde del input ---
    '& .MuiOutlinedInput-root': {
      borderRadius: 4, // Bordes redondeados para el borde
    },
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
      borderRadius: 2,
      marginBottom: theme.spacing(0.5),
      '& .MuiOutlinedInput-root': {
        borderRadius: 2, // Bordes redondeados para el borde en móvil
      },
    },
  },
  // --- Mensaje de error ---
  error: {
    color: theme.palette.error.main,
    fontSize: 15,
    marginTop: theme.spacing(1),
    textAlign: 'center',
  },
  // --- Mensaje de registro ---
  signupText: {
    marginTop: theme.spacing(1),
    fontSize: 15,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 13,
    },
  },
});

const Login = ({ setIsLoggedIn }) => {
  // --- Estados del formulario ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const theme = useTheme();
  const sx = styles(theme); // Estilos centralizados

  // --- Lógica de login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      setError(messages[language]?.invalidCredentials);
    }
  };

  // =============================
  // Renderizado visual del login
  // =============================
// --- Contenedor externo que gestiona el centrado y el scroll ---
return (
  <Box sx={sx.boxPrincipal}>
    <Paper elevation={0} sx={sx.paper}>
      {/* Logo de la aplicación */}
      <img src={logo} alt="Logo" style={sx.logo} />
      <Typography component="h1" variant="h5" sx={sx.titleLogin}>
        {messages[language]?.loginTitle}
      </Typography>
      <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={messages[language]?.email}
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={sx.textField}
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
          {messages[language]?.loginButton}
        </Button>
        {error && <Typography sx={sx.error}>{error}</Typography>}
        <Typography variant="body2" sx={sx.signupText}>
          {messages[language]?.noAccount}{' '}
          {/* Al hacer click en "Registrarse", limpia los campos y errores antes de navegar */}
          <Link
            component="button"
            underline="always"
            onClick={() => {
              setEmail('');
              setPassword('');
              setError('');
              navigate('/signup');
            }}
          >
            {messages[language]?.signUp}
          </Link>
        </Typography>
      </Box>
    </Paper>
  </Box>
);
};

export default Login;