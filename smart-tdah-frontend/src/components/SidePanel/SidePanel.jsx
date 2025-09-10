// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, Divider, Toolbar, useTheme, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';
import { getUserRole } from '../../utils/auth';

// =====================
// Estilos centralizados y documentados
// =====================
// Todos los estilos visuales del componente están aquí agrupados y documentados.
const sidePanelSx = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 60,
  height: 'calc(100% - 64px)',
  position: 'fixed',
  top: 64,
  left: 0,
  zIndex: 999,
  pt: '10px', // padding-top
  pb: '10px', // padding-bottom
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1.5px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[8],
  backdropFilter: 'blur(2px)',
  transition: 'background-color 0.3s, color 0.3s',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 54px)',
    top: 54,
    width: 48,
    pt: '6px',
    pb: '6px',
  },
});

const buttonSx = (theme) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  width: 40,
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: 12,
  color: theme.palette.text.primary,
  '& span': {
    marginTop: 2,
    fontSize: 10,
    color: theme.palette.text.secondary,
  },
  '&:hover': {
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    width: 32,
    fontSize: 10,
    '& span': {
      fontSize: 8,
    },
  },
});

/**
 * Estilo especial para el icono de chat:
 * - Por defecto: color de hover de los otros botones (primary.main)
 * - En hover: color base de los otros botones (text.primary)
 * - Siempre es más pequeño que el resto
 * - Transición suave
 */
const chatIconSx = (theme) => ({
  fontSize: 22, // más pequeño que el resto
  color: theme.palette.primary.main, // color de hover por defecto
  opacity: 1,
  transition: 'font-size 0.2s, color 0.2s, opacity 0.2s',
  [theme.breakpoints.down('sm')]: {
    fontSize: 18,
  },
  // En hover: color base de los otros botones
  '.MuiIconButton-root:hover &': {
    color: theme.palette.text.primary,
    opacity: 1,
  },
});

const dividerSx = (theme) => ({
  width: 40,
  height: 2,
  my: 2.5, // marginY: 20px aprox
  alignSelf: 'center',
  backgroundColor: theme.palette.divider,
  [theme.breakpoints.down('sm')]: {
    width: 32,
  },
});

const settingsContainerSx = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  marginTop: 'auto',
};

/**
 * SidePanel: barra lateral de navegación.
 * Si se recibe onChatClick y estamos en AlumnoData, muestra el botón de chat.
 */
const SidePanel = ({ onChatClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const theme = useTheme();

  // Detecta si estamos en la ruta de AlumnoData (ej: /alumnos/123)
  const isAlumnoData = /^\/alumnos\/[0-9]+$/.test(location.pathname);

  return (
    <Toolbar sx={sidePanelSx(theme)}>
      {/* Botón de inicio en la parte superior */}
      <IconButton onClick={() => navigate('/')}> 
        <HomeIcon sx={buttonSx(theme)} />
        <span style={{ fontSize: 10 }}>{messages[language]?.home}</span>
      </IconButton>

      {/* separación */}
      <Divider sx={dividerSx(theme)} />

      {/* Botón para la lista de alumnos o profesores según rol */}
      <IconButton
        onClick={() => {
          const rol = getUserRole();
          if (rol === 'admin') {
            navigate('/profesores');
          } else {
            navigate('/alumnos');
          }
        }}
      >
        <ListAltIcon sx={buttonSx(theme)} />
        <span style={{ fontSize: 10 }}>{messages[language]?.students}</span>
      </IconButton>

      {/* Botón de chat solo visible en AlumnoData */}
      {isAlumnoData && typeof onChatClick === 'function' && (
        <Tooltip title={messages[language]?.chatTitle || 'Chat'} placement="right">
          <IconButton onClick={onChatClick} sx={{ mt: 2 }}>
            {/* Icono de chat especial: más pequeño y destacado */}
            <ChatIcon sx={chatIconSx(theme)} />
          </IconButton>
        </Tooltip>
      )}

      {/* separación y ajustes en la parte inferior */}
      <div style={settingsContainerSx}>
        <Divider sx={dividerSx(theme)} />
        <IconButton onClick={() => navigate('/settings')}>
          <SettingsIcon sx={buttonSx(theme)} />
          <span style={{ fontSize: 10 }}>{messages[language]?.settings}</span>
        </IconButton>
      </div>
    </Toolbar>
  );
};

export default SidePanel;
