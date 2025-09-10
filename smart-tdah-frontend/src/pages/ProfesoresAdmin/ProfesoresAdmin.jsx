// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../../utils/constants';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Snackbar, Alert, IconButton, useTheme, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';



const ProfesoresAdmin = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchProfesores = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backendUrl}/profesores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfesores(res.data);
        setLoading(false);
      } catch (err) {
        setError(messages[language]?.profesoresFetchError || 'Error');
        setLoading(false);
      }
    };
    fetchProfesores();
  }, [language]);

  const handlePermisoChange = async (id_profesor, checked) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${backendUrl}/profesores/${id_profesor}/permiso`,
        { puede_gestionar_alumnos: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(messages[language]?.profesoresPermisoSuccess || 'Success');
      setProfesores((prev) =>
        prev.map((p) =>
          p.id_profesor === id_profesor ? { ...p, puede_gestionar_alumnos: checked } : p
        )
      );
    } catch (err) {
      setError(messages[language]?.profesoresPermisoError || 'Error');
    }
  };

  const handleDelete = async (id_profesor) => {
    if (!window.confirm(messages[language]?.profesoresDeleteConfirm || '¿Seguro?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/profesores/${id_profesor}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfesores((prev) => prev.filter((p) => p.id_profesor !== id_profesor));
      setSuccess(messages[language]?.profesoresDeleteSuccess || 'Success');
    } catch (err) {
      setError(messages[language]?.profesoresDeleteError || 'Error');
    }
  };

  // Estilos visuales coherentes con la app
  const paperSx = {
    p: { xs: 1.5, sm: 3 },
    mt: 2,
    borderRadius: 5,
    boxShadow: theme.shadows[8],
    background: theme.palette.background.paper,
    border: `1.5px solid ${theme.palette.divider}`,
    maxWidth: 900,
    width: '100%',
    mx: 'auto',
    transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
    overflow: 'visible',
  };
  const tableHeadSx = {
    background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
    transition: 'background-color 0.3s',
  };
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Paper sx={paperSx}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 2, letterSpacing: 0.5, textAlign: 'center', transition: 'color 0.3s' }}>
          {messages[language]?.profesoresTitle || 'Gestión de profesores'}
        </Typography>
        {loading ? (
          <Typography>{messages[language]?.loading || 'Cargando...'}</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={tableHeadSx}>
                  <TableCell>{messages[language]?.name || 'Nombre'}</TableCell>
                  <TableCell>{messages[language]?.lastName || 'Apellidos'}</TableCell>
                  <TableCell>{messages[language]?.email || 'Email'}</TableCell>
                  <TableCell>{messages[language]?.profesoresPermisoCol || '¿Puede gestionar alumnos?'}</TableCell>
                  <TableCell align="center">{messages[language]?.delete || 'Eliminar'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profesores.map((prof) => (
                  <TableRow key={prof.id_profesor} hover sx={{ transition: 'background-color 0.3s' }}>
                    <TableCell>{prof.nombre}</TableCell>
                    <TableCell>{prof.apellidos}</TableCell>
                    <TableCell>{prof.email}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={!!prof.puede_gestionar_alumnos}
                        onChange={(e) => handlePermisoChange(prof.id_profesor, e.target.checked)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton aria-label={messages[language]?.delete || 'eliminar'} color="error" onClick={() => handleDelete(prof.id_profesor)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
          <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ProfesoresAdmin;
