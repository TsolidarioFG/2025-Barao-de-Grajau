// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../../utils/constants';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';

// =====================
// Estilos centralizados y documentados (responsive, SRP, comentarios visuales)
// =====================
const styles = (theme) => ({
  // --- Paper principal del perfil ---
  profileContainer: {
    width: '100%',
    maxWidth: 420, // Máximo ancho en desktop/tablet
    minWidth: 260, // Mínimo ancho en móvil
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: (theme) => theme.palette.background.default,
    borderRadius: 4,
    boxShadow: (theme) => theme.shadows[8],
    border: (theme) => `1.5px solid ${theme.palette.divider}`,
    p: { xs: 2, sm: 3 }, // Padding responsive
    m: 0,
    transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
    gap: 2,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
      p: 1.2,
      borderRadius: 3,
    },
  },
  // --- Título del perfil ---
  name: {
    fontWeight: 'bold',
    fontSize: { xs: '1.2rem', sm: '1.5rem' },
    color: (theme) => theme.palette.secondary.main,
    letterSpacing: 0.5,
    mb: 1,
    textAlign: 'center',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.1rem',
      mb: 0.5,
    },
  },
  // --- Avatar del usuario ---
  avatar: {
    bgcolor: (theme, backgroundColor) => backgroundColor || theme.palette.secondary.main,
    width: 100,
    height: 100,
    fontSize: '2.5rem',
    mb: 2,
    boxShadow: (theme) => theme.shadows[4],
    transition: 'box-shadow 0.3s, border 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      width: 70,
      height: 70,
      fontSize: '1.5rem',
      mb: 1,
    },
  },
  // --- Mensaje de error ---
  error: {
    color: 'red',
    fontSize: '1rem',
    textAlign: 'center',
    mt: 2,
  },
  // --- Mensaje de carga ---
  loading: {
    fontSize: '1rem',
    color: (theme) => theme.palette.text.secondary,
    textAlign: 'center',
    mt: 2,
  },
  // --- Fila de detalle (nombre, apellidos, email) ---
  detailRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.2,
    textAlign: 'left',
    mb: 0.5,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      gap: 0.7,
      mb: 0.2,
    },
  },
  // --- Etiqueta de detalle (con icono) ---
  detailLabel: {
    fontWeight: 600,
    color: (theme) => theme.palette.secondary.main,
    fontSize: '1rem',
    mr: 1,
    minWidth: 80,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.95rem',
      minWidth: 60,
    },
  },
  // --- Valor de detalle ---
  detailValue: {
    fontSize: '1rem',
    color: (theme) => theme.palette.text.primary,
    wordBreak: 'break-word',
    flex: 1,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.95rem',
    },
  },
  // --- Contenedor de detalles ---
  detailsBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      gap: 0.5,
    },
  },
  // --- Iconos de detalle ---
  icon: {
    color: (theme) => theme.palette.text.primary,
    fontSize: 20,
    verticalAlign: 'middle',
    mr: 0.5,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      mr: 0.3,
    },
  },
});

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const storedColor = localStorage.getItem('profileColor');
    return storedColor || null;
  });
  const { language } = useLanguage();
  const theme = useTheme();
  const sx = styles(theme); // Estilos centralizados y responsivos

  // Genera las iniciales del nombre y apellidos
  const getInitials = (nombre, apellidos) => {
    const firstName = nombre?.split(' ')[0] || '';
    const lastName = apellidos ? apellidos.split(' ')[0] : '';
    return `${firstName[0] || ''}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  // Genera un color aleatorio para la foto de perfil
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(messages[language]?.noTokenProvided);
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
        if (!backgroundColor) {
          const newColor = generateRandomColor();
          setBackgroundColor(newColor);
          localStorage.setItem('profileColor', newColor);
        }
      } catch (err) {
        setError(messages[language]?.fetchError);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [backgroundColor, language]);

  if (error) {
    return <Typography sx={sx.error}>{error}</Typography>;
  }
  if (!profileData) {
    return <Typography sx={sx.loading}>{messages[language]?.loading}</Typography>;
  }
  const initials = getInitials(profileData.nombre, profileData.apellidos);

  // =============================
  // Renderizado visual del perfil
  // =============================
  return (
      <Paper elevation={0} sx={sx.profileContainer}>
        {/* Título "Perfil" */}
        <Typography sx={sx.name}>
          {messages[language]?.profileTitle}
        </Typography>
        {/* Foto de perfil */}
        <Avatar sx={sx.avatar}>
          {initials}
        </Avatar>
        {/* Detalles del perfil */}
        <Box sx={sx.detailsBox}>
          <Box sx={sx.detailRow}>
            <Typography sx={sx.detailLabel}>
              <PersonIcon sx={sx.icon} />
              {messages[language]?.name}:
            </Typography>
            <Typography sx={sx.detailValue}>{profileData.nombre}</Typography>
          </Box>
          <Box sx={sx.detailRow}>
            <Typography sx={sx.detailLabel}>
              <BadgeIcon sx={sx.icon} />
              {messages[language]?.lastName}:
            </Typography>
            <Typography sx={sx.detailValue}>{profileData.apellidos}</Typography>
          </Box>
          <Box sx={sx.detailRow}>
            <Typography sx={sx.detailLabel}>
              <EmailIcon sx={sx.icon} />
              {messages[language]?.email}:
            </Typography>
            <Typography sx={sx.detailValue}>{profileData.email}</Typography>
          </Box>
        </Box>
      </Paper>
  );
};

export default Profile;