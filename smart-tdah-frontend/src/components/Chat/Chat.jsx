// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState, useRef } from 'react';
import { marked } from 'marked';
import { useParams} from 'react-router-dom';
import axios from 'axios';
import { Box, IconButton, TextField, Typography, Paper, useTheme, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SendIcon from '@mui/icons-material/Send';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';


// Ancho inicial y mínimo/máximo del chat
const CHAT_INITIAL_WIDTH = 400;
const CHAT_MIN_WIDTH = 280;
const CHAT_MAX_WIDTH = 1200; 
const CHAT_COLLAPSED_WIDTH = 12; // Más estrecho cuando está replegado
const BANNER_HEIGHT_DESKTOP = 64; // px, igual que el Banner en desktop
const BANNER_HEIGHT_MOBILE = 54; // px, igual que el Banner en móvil


/**
 * Chat lateral derecho con ancho ajustable y colapsable.
 * Desplaza el contenido principal usando padding/margin en el layout.
 * El usuario puede arrastrar el borde izquierdo para cambiar el ancho.
 * overlay=true: el chat se superpone y no desplaza el contenido.
 * overlay=false: el chat desplaza el contenido principal.
 */
const Chat = ({ width, setWidth, collapsed, onCollapse, overlay = false, alumnoNombre = '' }) => {
  const [messagesList, setMessagesList] = useState([]); // Lista de mensajes
  const [input, setInput] = useState(''); // Estado para el mensaje de entrada
  // Modelos realmente disponibles en Groq para este usuario: Llama 3 y Mixtral
  // Puedes cambiar el valor por defecto a uno de estos si lo prefieres
  const [IaModel, setIaModel] = useState('mixtral'); // Estado para el motor de ia
  const iaModels = [
    { value: 'gemini', label: 'Gemini' },
    { value: 'groq-llama', label: 'Llama' },
    { value: 'mixtral', label: 'Mixtral' },
  ];
  // Estado para el menú desplegable de modelos
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleModelSelect = (model) => {
    // Si el modelo cambia, añade un separador al historial de mensajes
    if (model !== IaModel) {
      const modelLabel = iaModels.find(m => m.value === model)?.label || model;
      setMessagesList(prev => [
        ...prev,
        { text: `----------  ${modelLabel}  ----------`, sender: 'separator', model },
      ]);
    }
    setIaModel(model);
    handleMenuClose();
  };
  const [loading, setLoading] = useState(false); // Estado de carga para la respuesta
  const [error, setError] = useState(null); // Estado de error para la respuesta
  const { language } = useLanguage();
  const theme = useTheme();
  const resizing = useRef(false); // Flag de resize
  const startX = useRef(0); // X inicial del mouse
  const startWidth = useRef(CHAT_INITIAL_WIDTH); // Ancho inicial al empezar a arrastrar
  const { id_alumno } = useParams();
  /**
   * Envía la pregunta al backend LLMS y muestra la respuesta.
   * No guarda historial, solo muestra la respuesta actual.
   */
  /**
   * Envía la pregunta al backend LLMS y muestra la respuesta.
   * Además, envía los últimos 6 mensajes previos como contexto (memoria temporal).
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);
    const userMessage = { text: input, sender: 'user' };
    // Añade el mensaje del usuario al historial local
    setMessagesList((prev) => [...prev, userMessage]);
    setInput('');
    try {
      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token provided');
      const studentId = id_alumno;
      // Prepara el historial de los últimos 6 mensajes previos (sin incluir la pregunta actual)
      // Se envía solo el texto y el remitente para contexto IA
      const N = 6;
      const msgHistory = messagesList.slice(-N).map(m => ({ text: m.text, sender: m.sender }));
      // Llamada al endpoint de modelos de IA
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/ask`,
        { question: userMessage.text, studentId, IaModel, alumnoNombre, msgHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // El backend devuelve la respuesta bajo la clave 'answer', no 'text'
      const answer = res.data?.answer || res.data?.text || '';
      setMessagesList((prev) => [...prev, { text: answer, sender: 'LLMS' }]);
    } catch (err) {
      setError(messages[language]?.fetchError || 'Error al consultar LLMS');
    } finally {
      setLoading(false);
    }
  };

  // Inicia el resize
  const handleResizeStart = (e) => {
    resizing.current = true;
    startX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchmove', handleResizeMove);
    window.addEventListener('touchend', handleResizeEnd);
  };

  // Cambia el ancho durante el resize
  const handleResizeMove = (e) => {
    if (!resizing.current) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const newWidth = Math.min(
      CHAT_MAX_WIDTH,
      Math.max(CHAT_MIN_WIDTH, startWidth.current + (startX.current - clientX))
    );
    setWidth(newWidth);
  };

  // Finaliza el resize
  const handleResizeEnd = () => {
    resizing.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    window.removeEventListener('touchmove', handleResizeMove);
    window.removeEventListener('touchend', handleResizeEnd);
  };

  // Notifica colapso al padre
  const handleCollapse = () => {
    if (typeof onCollapse === 'function') onCollapse();
  };

  // =====================
  // Estilos centralizados y documentados para el chat
  // =====================
  // El chat solo debe bloquear eventos dentro de su área visible, nunca sobre toda la pantalla.
  // El scroll de la página debe funcionar siempre.
  // Dejar espacio para la scrollbar del navegador (usualmente 16px en la mayoría de sistemas)
  const SCROLLBAR_WIDTH = 15;
  const chatSx = {
    position: 'fixed',
    top: { xs: BANNER_HEIGHT_MOBILE, sm: BANNER_HEIGHT_DESKTOP },
    // Dejamos espacio a la derecha para la scrollbar
    right: SCROLLBAR_WIDTH,
    height: {
      xs: `calc(100vh - ${BANNER_HEIGHT_MOBILE}px)`,
      sm: `calc(100vh - ${BANNER_HEIGHT_DESKTOP}px)`
    },
    width: collapsed ? CHAT_COLLAPSED_WIDTH : width,
    zIndex: overlay ? 2000 : 1202,
    boxShadow: overlay ? 12 : 6,
    display: 'flex',
    flexDirection: 'row',
    background: collapsed ? 'transparent' : theme.palette.background.paper,
    borderLeft: `2px solid ${theme.palette.divider}`,
    transition: 'background 0.3s, color 0.3s, border-color 0.3s, border-radius 0.2s',
    borderRight: 'none',
    overflow: 'visible',
    pointerEvents: 'auto',
    touchAction: 'auto',
  };

  return (
    <Box sx={chatSx}>
      {/* Handler de resize (borde izquierdo) */}
      {!collapsed && (
        <Box
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: '100%',
            cursor: 'ew-resize',
            background: 'transparent',
            userSelect: 'none', // Solo el handler de resize es no seleccionable
            '&:hover': { background: theme.palette.action.hover },
          }}
          aria-label="Ajustar ancho del chat"
        />
      )}

      {/* Flecha para replegar/desplegar el chat */}
      <IconButton
        onClick={handleCollapse}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'background.paper',
          border: `1.5px solid ${theme.palette.divider}`,
          boxShadow: 2,
          zIndex: 1203,
          width: 36,
          height: 36,
          borderRadius: '50%',
          p: 0,
          transition: 'background 0.2s',
          '&:hover': { bgcolor: 'primary.light' },
        }}
        aria-label={collapsed ? messages[language]?.expandChat : messages[language]?.collapseChat}
      >
        {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* Layout vertical: Banner arriba, resto abajo */}
      {!collapsed && (
        <Box sx={{
          width: width,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          background: 'inherit',
          overflow: 'hidden',
          transition: 'background 0.3s, color 0.3s',
        }}>
          {/* Banner superior del chat */}
          <Box sx={{
            width: '100%',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.main,
            color: theme.palette.getContrastText(theme.palette.warning.main),
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 1,
            m: 0,
            px: 2,
            boxShadow: 1,
            borderBottom: `1.5px solid ${theme.palette.divider}`,
            transition: 'background 0.3s, color 0.3s, border-radius 0.2s, border-color 0.3s',
            position: 'relative',
            gap: 1,
          }}>
            {/* Título interactivo con selector */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                px: 0.5,
                borderRadius: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  background: theme.palette.mode === 'dark' ? theme.palette.warning.main : theme.palette.warning.light,
                },
              }}
              onClick={handleMenuOpen}
              aria-controls={Boolean(anchorEl) ? 'ia-model-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 1,
                  color: 'inherit',
                  textShadow: theme.palette.mode === 'dark' ? '0 1px 2px #0008' : 'none',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pr: 0.5,
                }}
              >
                {iaModels.find(m => m.value === IaModel)?.label}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'inherit', fontSize: 26, ml: 0.5 }} />
            </Box>
            <Menu
              id="ia-model-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              disablePortal={overlay}
              MenuListProps={{
                'aria-labelledby': 'ia-model-menu',
                sx: {
                  bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.main,
                  color: theme.palette.getContrastText(theme.palette.warning.main),
                  boxShadow: 3,
                  borderRadius: 1,
                  mt: 1,
                  minWidth: 140,
                  p: 0,
                },
              }}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.main,
                  color: theme.palette.getContrastText(theme.palette.warning.main),
                  boxShadow: 3,
                  borderRadius: 1,
                  mt: 1,
                  minWidth: 140,
                  p: 0,
                  transition: 'background 0.3s, color 0.3s',
                  zIndex: overlay ? 3002 : 3000,
                },
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {iaModels.map(model => (
                <MenuItem
                  key={model.value}
                  selected={model.value === IaModel}
                  onClick={() => handleModelSelect(model.value)}
                  sx={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: 'inherit',
                    bgcolor: model.value === IaModel ? (theme.palette.mode === 'dark' ? theme.palette.warning.main : theme.palette.warning.light) : 'inherit',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? theme.palette.warning.main : theme.palette.warning.light,
                    },
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {model.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* Área de mensajes y campo de entrada */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              height: 'calc(100% - 44px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0, // Área de mensajes sin bordes redondeados
              boxShadow: 'none',
              background: 'inherit',
              overflow: 'hidden',
              mt: 0,
              transition: 'background 0.3s, color 0.3s, border-radius 0.2s',
            }}
          >
            {/* Área de mensajes */}
            <Box sx={{
              p: 2,
              flex: 1,
              overflowY: 'auto',
              bgcolor: 'background.paper',
              transition: 'background 0.3s, color 0.3s',
              // Permitir selección de texto y evitar scroll horizontal
              overflowX: 'hidden',
              wordBreak: 'break-word',
              WebkitUserSelect: 'text',
              userSelect: 'text',
            }}>
              {messagesList.map((msg, index) => {
                if (msg.sender === 'separator') {
                  return (
                    <Box key={index} sx={{ textAlign: 'center', my: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: 2 }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <Box
                    key={index}
                    sx={{
                      textAlign: msg.sender === 'user' ? 'right' : 'left',
                      mb: 1,
                      ml: msg.sender === 'user' ? 4 : 0,
                      mr: msg.sender === 'LLMS' ? 4 : 0,
                      // Permitir selección de texto
                      WebkitUserSelect: 'text',
                      userSelect: 'text',
                    }}
                  >
                    {msg.sender === 'LLMS' ? (
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'secondary.light',
                          color: '#111',
                          boxShadow: 0,
                          whiteSpace: 'normal',
                          maxWidth: '100%',
                          overflowWrap: 'break-word',
                        }}
                        component="span"
                        // Ajustar el renderizado de bloques de código para que hagan wrap
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          color: '#111',
                          boxShadow: 1,
                          whiteSpace: 'pre-line',
                          maxWidth: '100%',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {msg.text}
                      </Typography>
                    )}
                  </Box>
                );
              })}
              {loading && (
                <Box sx={{ textAlign: 'left', mb: 1 }}>
                  <Typography variant="body2" sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'secondary.light', color: 'text.primary', maxWidth: '100%', overflowWrap: 'break-word' }}>
                    {messages[language]?.loading || 'Cargando...'}
                  </Typography>
                </Box>
              )}
              {error && (
                <Box sx={{ textAlign: 'left', mb: 1 }}>
                  <Typography variant="body2" color="error" sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, color: 'text.primary', bgcolor: 'error.light', maxWidth: '100%', overflowWrap: 'break-word' }}>
                    {error}
                  </Typography>
                </Box>
              )}
            </Box>
            {/* Ajuste global para bloques de código en markdown: forzar wrap */}
            <style>{`
              .MuiBox-root pre, .MuiBox-root code {
                white-space: pre-wrap !important;
                word-break: break-word !important;
                overflow-x: auto;
                font-family: 'Fira Mono', 'Menlo', 'Consolas', 'Monaco', 'Liberation Mono', 'Courier New', monospace;
                font-size: 0.97em;
                background: #f5f5f5;
                border-radius: 6px;
                padding: 0.3em 0.6em;
                box-sizing: border-box;
                max-width: 100%;
              }
            `}</style>

            {/* Campo de entrada de mensaje */}
            <Box sx={{
              display: 'flex',
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 0, // Sin bordes redondeados internos
              transition: 'background 0.3s, color 0.3s, border-radius 0.2s',
            }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={messages[language]?.chatAskPlaceholder || 'Hazme una pregunta...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  borderRadius: 8, // Sutil para input
                  background: theme.palette.background.paper,
                  mr: 1,
                  transition: 'background 0.3s, color 0.3s, border-radius 0.2s',
                  '& fieldset': {
                    borderRadius: 8,
                    transition: 'background 0.3s, color 0.3s, border-radius 0.2s',
                  },
                }}
              />
              <IconButton onClick={handleSendMessage} color="primary" sx={{ borderRadius: 8, transition: 'background 0.3s, color 0.3s, border-radius 0.2s' }}>
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Chat;
