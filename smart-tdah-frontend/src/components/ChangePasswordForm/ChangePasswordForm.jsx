// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { backendUrl } from '../../utils/constants';

/**
 * Formulario de cambio de contraseña para el usuario logueado.
 * Modularizado para cumplir SRP y facilitar testeo y reutilización.
 * @param {object} props
 * @param {object} props.messages - Diccionario de mensajes traducidos.
 * @param {string} props.language - Idioma actual.
 */

// =====================
// Estilos centralizados y documentados
// =====================
const styles = (theme) => ({
  // --- Contenedor principal del formulario ---
  form: {
    flex: 1.2, // Flex para layout adaptable
    width: '100%', // Ocupa todo el ancho disponible
    maxWidth: 340, // Máximo ancho en desktop/tablet
    alignSelf: { xs: 'center', md: 'flex-start' }, // Centrado en móvil, alineado a la izq en desktop
    display: 'flex', // Layout vertical
    flexDirection: 'column',
    alignItems: 'center', // Centra los elementos
    backgroundColor: 'transparent', // Fondo transparente
    boxShadow: 'none', // Sin sombra
    border: 'none', // Sin borde
    p: 0, // Sin padding extra
    boxSizing: 'border-box', // Incluye padding en el ancho
    overflow: 'hidden', // Oculta desbordes
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%', // Ocupa todo el ancho en móvil
      p: 0.5, // Padding más compacto
    },
  },
  // --- Título del formulario ---
  title: {
    fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Tamaño adaptable
    fontWeight: 'bold', // Negrita
    mb: 2, // Margen inferior
    color: theme.palette.text.primary, // Color según tema
    textAlign: 'center', // Centrado
  },
  // --- Botón de envío ---
  submitButton: {
    mt: 3, // Margen superior
    alignSelf: 'center', // Centrado
    width: '100%', // Ocupa todo el ancho
    maxWidth: 200, // Máximo ancho
    borderRadius: 2, // Bordes redondeados
    py: 1.5, // Padding vertical
    transition: 'background-color 0.3s, transform 0.3s', // Transiciones suaves
    '&:hover': {
      backgroundColor: theme.palette.primary.dark, // Color en hover
      transform: 'scale(1.05)', // Efecto visual
    },
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%', // Botón ocupa todo el ancho en móvil
      py: 1, // Menos padding
    },
  },
  // --- Campos de texto ---
  textField: {
    backgroundColor: theme.palette.background.default, // Fondo según tema
    borderRadius: 1, // Bordes redondeados
    mb: 1, // Margen inferior
    input: { color: theme.palette.text.primary }, // Color de texto
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 13, // Fuente más pequeña
      mb: 0.5, // Menos margen
    },
  },
  // --- Mensaje de error ---
  error: {
    color: theme.palette.error.main, // Color de error
    fontSize: 14, // Tamaño estándar
    mt: 1, // Margen superior
    textAlign: 'center',
  },
  // --- Mensaje de éxito ---
  success: {
    color: theme.palette.primary.main, // Color de éxito
    fontSize: 14, // Tamaño estándar
    mt: 1, // Margen superior
    textAlign: 'center',
  },
});


const ChangePasswordForm = ({ messages, language }) => {
  // --- Estados del formulario ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({}); // Errores individuales por campo
  const theme = useTheme();
  const sx = styles(theme); // Obtenemos los estilos centralizados

  // --- Validación de campos (igual que en registro) ---
  const validateFields = () => {
    const errors = {};
    // Contraseña actual obligatoria
    if (!currentPassword) {
      errors.currentPassword = messages[language]?.requiredCurrentPassword || messages[language]?.requiredField || 'Campo obligatorio';
    }
    // Nueva contraseña: mínimo 8 caracteres, una mayúscula, una minúscula, un número
    if (!newPassword) {
      errors.newPassword = messages[language]?.requiredNewPassword || messages[language]?.requiredField || 'Campo obligatorio';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      errors.newPassword = messages[language]?.weakPassword || 'Mínimo 8 caracteres, mayúscula, minúscula y número';
    }
    // Confirmación obligatoria y debe coincidir
    if (!confirmNewPassword) {
      errors.confirmNewPassword = messages[language]?.requiredConfirmPassword || messages[language]?.requiredField || 'Campo obligatorio';
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = messages[language]?.passwordMismatch || 'Las contraseñas no coinciden';
    }
    return errors;
  };

  // --- Lógica de cambio de contraseña ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(messages[language]?.passwordChangeSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setFieldErrors({});
    } catch (err) {
      setError(messages[language]?.passwordChangeError);
    }
  };

  // =============================
  // Renderizado visual del formulario
  // =============================
  return (
    <Box sx={sx.form} component="form" onSubmit={handleChangePassword}>
      <Typography sx={sx.title} component="h2">
        {messages[language]?.changePasswordTitle}
      </Typography>
      <TextField
        label={messages[language]?.currentPassword}
        type="password"
        fullWidth
        margin="normal"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        sx={sx.textField}
        error={!!fieldErrors.currentPassword}
        helperText={fieldErrors.currentPassword}
      />
      <TextField
        label={messages[language]?.newPassword}
        type="password"
        fullWidth
        margin="normal"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={sx.textField}
        error={!!fieldErrors.newPassword}
        helperText={fieldErrors.newPassword}
      />
      <TextField
        label={messages[language]?.confirmNewPassword}
        type="password"
        fullWidth
        margin="normal"
        required
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        sx={sx.textField}
        error={!!fieldErrors.confirmNewPassword}
        helperText={fieldErrors.confirmNewPassword}
      />
      {error && <Typography sx={sx.error}>{error}</Typography>}
      {success && <Typography sx={sx.success}>{success}</Typography>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={sx.submitButton}
      >
        {messages[language]?.changePasswordButton}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;
