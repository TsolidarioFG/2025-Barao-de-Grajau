// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
// =============================
// Componente AlumnoLink.jsx
// =============================
// Muestra un resumen visual de un alumno en la lista, con nombre, curso y email, y permite navegar a su ficha.
// Estilos y lógica centralizados y explicados paso a paso.

import React from 'react';
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Typography, Paper, useTheme, IconButton, Dialog, DialogTitle, DialogActions, Button, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';

// =====================
// Estilos centralizados
// =====================
// Todos los estilos visuales del componente están aquí agrupados y documentados.
const styles = {
  // --- Paper principal del alumno ---
  alumno: (theme) => ({
    display: 'flex', // Layout horizontal
    alignItems: 'center', // Centra verticalmente
    width: '100%', // Ocupa todo el ancho del contenedor
    minWidth: 0, // Permite reducirse en pantallas pequeñas
    maxWidth: 800, // Máximo ancho en desktop/tablet
    minHeight: 48, // Altura mínima para consistencia visual
    flexWrap: 'wrap', // Permite que el contenido baje si es necesario
    wordBreak: 'break-word', // Rompe palabras largas
    margin: '4px 0', // Espaciado vertical entre alumnos
    borderRadius: 2, // Bordes redondeados
    padding: '6px 16px', // Espaciado interno principal
    cursor: 'pointer', // Cursor de mano al pasar por encima
    transition: 'box-shadow 0.2s, background-color 0.2s', // Transiciones suaves
    backgroundColor: theme.palette.background.paper, // Fondo según tema
    color: theme.palette.text.primary, // Texto según tema
    border: `1px solid ${theme.palette.divider}`, // Borde según tema
    boxShadow: theme.shadows[2], // Sombra sutil
    '&:hover': {
      backgroundColor: theme.palette.action.hover, // Fondo en hover
      boxShadow: theme.shadows[4], // Sombra más marcada en hover
    },
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%', // Ocupa todo el ancho en móvil
      padding: '6px 4px', // Padding más compacto
      fontSize: 14, // Fuente más pequeña
    },
  }),
  // --- Avatar del alumno (iniciales) ---
  profileImage: (theme, backgroundColor) => ({
    width: 44, // Tamaño del avatar en desktop/tablet
    height: 44,
    fontSize: 20, // Tamaño de letra de las iniciales
    marginRight: 8, // Separación a la derecha
    bgcolor: backgroundColor || theme.palette.primary.main, // Color de fondo dinámico
    color: theme.palette.getContrastText(backgroundColor || theme.palette.primary.main), // Contraste de texto
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      width: 36, // Avatar más pequeño
      height: 36,
      fontSize: 16, // Letra más pequeña
      marginRight: 6, // Menos margen
    },
  }),
  // --- Nombre y apellidos ---
  alumnoName: (theme) => ({
    display: 'flex', // Layout horizontal
    alignItems: 'center', // Centra verticalmente
    gap: 1, // Espacio entre icono y texto
    fontWeight: 'bold', // Negrita
    fontSize: 18, // Tamaño grande en desktop/tablet
    mb: 0.5, // Margen inferior
    color: theme.palette.text.primary, // Color según tema
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 15, // Fuente más pequeña
    },
  }),
  // --- Curso y email ---
  alumnoCursoEmail: (theme) => ({
    display: 'flex', // Layout horizontal
    alignItems: 'center', // Centra verticalmente
    gap: 1, // Espacio entre iconos y texto
    fontSize: 14, // Tamaño estándar en desktop/tablet
    color: theme.palette.text.secondary, // Color secundario
    flexWrap: 'wrap', // Permite salto de línea si es necesario
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 12, // Fuente más pequeña
    },
  }),
};

// =============================
// Componente principal AlumnoLink
// =============================
function AlumnoLink({ alumnoData, backgroundColor, isLoggedIn, puedeGestionarAlumnos, onAlumnoDeleted }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const { language } = useLanguage();
  const handleDelete = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };
  const handleCloseDialog = (e) => {
    if (e) e.stopPropagation();
    setOpenDialog(false);
    setError('');
    setSuccess('');
  };
  const confirmDelete = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/profesor-alumno`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_alumno: alumnoData.idAlumno })
      });
      if (res.ok) {
        setSuccess(messages[language]?.deleteAlumnoSuccess || 'Alumno eliminado correctamente');
        setTimeout(() => {
          setOpenDialog(false);
          if (onAlumnoDeleted) onAlumnoDeleted();
        }, 1000);
      } else {
        setError(messages[language]?.deleteAlumnoError || 'Error al eliminar alumno');
      }
    } catch (err) {
      setError(messages[language]?.deleteAlumnoError || 'Error al eliminar alumno');
      setOpenDialog(false);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();
  const theme = useTheme();

  // --- Función para manejar el click sobre el alumno ---
  // Navega a la ficha del alumno usando su id
  const handleClick = () => {
    if (alumnoData?.idAlumno) {
      navigate(`/alumnos/${alumnoData.idAlumno}`, { state: { isLoggedIn } });
    } else {
      // Si no hay id, muestra un error en consola
      console.error("idAlumno is undefined for alumnoData:", alumnoData);
    }
  };

  // --- Desestructuración de los datos del alumno ---
  const { nombre, apellidos, email, curso } = alumnoData;

  // --- Función para obtener las iniciales del alumno ---
  // Toma la primera letra del nombre y del primer apellido
  const getInitials = (nombre, apellidos) => {
    const firstName = nombre.split(' ')[0];
    const lastName = apellidos ? apellidos.split(' ')[0] : '';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  // Iniciales calculadas para el avatar
  const initials = getInitials(nombre, apellidos);

  // =============================
  // Renderizado visual del alumno
  // =============================
  return (
    // Contenedor centrado para el Paper
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {/* Paper principal con todos los datos del alumno */}
      <Paper elevation={2} sx={styles.alumno(theme)} onClick={handleClick}>
        {/* Avatar con iniciales y color dinámico */}
        <Avatar sx={styles.profileImage(theme, backgroundColor)}>
          {initials}
        </Avatar>
        {/* Datos del alumno: nombre, curso y email */}
        <Box>
          {/* Nombre y apellidos con icono */}
          <Typography sx={styles.alumnoName(theme)}>
            <PersonIcon fontSize="small" color="primary" />
            {nombre} {apellidos}
          </Typography>
          {/* Curso y email con iconos */}
          <Typography sx={styles.alumnoCursoEmail(theme)}>
            <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />{curso}
            <EmailIcon fontSize="small" sx={{ ml: 1, mr: 0.5 }} />{email}
          </Typography>
        </Box>
        {isLoggedIn && puedeGestionarAlumnos && (
          <IconButton edge="end" color="error" sx={{ ml: 'auto' }} onClick={handleDelete} title={messages[language]?.deleteAlumnoTooltip || 'Eliminar alumno'}>
            <DeleteIcon />
          </IconButton>
        )}
        <Dialog open={openDialog} onClose={handleCloseDialog} onClick={e => e.stopPropagation()}>
          <DialogTitle>{messages[language]?.deleteAlumnoConfirm || '¿Seguro que quieres eliminar este alumno de tu lista?'}</DialogTitle>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>{messages[language]?.cancel || 'Cancelar'}</Button>
            <Button onClick={confirmDelete} color="error" disabled={loading}>
              {messages[language]?.delete || 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}

export default AlumnoLink;