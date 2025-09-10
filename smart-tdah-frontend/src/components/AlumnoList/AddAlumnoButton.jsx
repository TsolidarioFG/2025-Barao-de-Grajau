// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, CircularProgress, Alert, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { backendUrl } from '../../utils/constants';
import { useLanguage } from '../../hooks/LanguageContext';
import useDebounce from '../../hooks/useDebounce';
import messages from '../../utils/translations.json';

/**
 * Componente para que un profesor con permiso pueda añadir alumnos a su lista.
 * Solo debe mostrarse si el profesor tiene permiso.
 */
const AddAlumnoButton = ({ visible, onAlumnoAdded }) => {
  const [open, setOpen] = useState(false);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const debouncedEmail = useDebounce(searchEmail, 500);
  const [alumnosIdsProfesor, setAlumnosIdsProfesor] = useState([]);
  const { language } = useLanguage();

  // Abre el diálogo (no carga alumnos hasta buscar)
  const handleOpen = async () => {
    setOpen(true);
    setAlumnosDisponibles([]);
    setSearchEmail('');
    setError('');
    setSuccess('');
    // Obtener todos los IDs de alumnos del profesor (sin paginación)
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/alumnos/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, page_size: 10000 }, // asume menos de 10k alumnos por profesor
      });
      setAlumnosIdsProfesor(res.data.alumnos.map(a => a.id_alumno));
    } catch {
      setAlumnosIdsProfesor([]);
    }
  };

  // Cierra el diálogo
  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
    setSearchEmail('');
    setAlumnosDisponibles([]);
  };

  // Añade un alumno a la lista del profesor
  const handleAddAlumno = async (id_alumno) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/profesor-alumno`, { id_alumno }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(messages[language]?.addAlumnoSuccess || 'Alumno añadido correctamente');
      if (onAlumnoAdded) onAlumnoAdded();
      // Elimina el alumno de la lista local
      setAlumnosDisponibles((prev) => prev.filter(a => a.id_alumno !== id_alumno));
      // Añade el id_alumno al array de alumnosIdsProfesor para que la UI muestre el estado "Añadido"
      setAlumnosIdsProfesor((prev) => [...prev, id_alumno]);
    } catch (err) {
      setError(messages[language]?.addAlumnoError || 'Error al añadir alumno');
    } finally {
      setLoading(false);
    }
  };


  // Buscar alumnos por email (solo cuando hay texto)
  React.useEffect(() => {
    // console.log('Buscando alumnos:', debouncedEmail, 'open:', open);
    if (!open || !debouncedEmail) {
      setAlumnosDisponibles([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
  axios.get(`${backendUrl}/alumnos/add-alumnos/buscar`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { email: debouncedEmail },
    })
      .then(res => {
        setAlumnosDisponibles(res.data.alumnos || []);
      })
      .catch(() => {
        setError(messages[language]?.studentfetchError || 'Error');
      })
      .finally(() => setLoading(false));
  }, [debouncedEmail, open, language]);

  if (!visible) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1202 }}>
      <Fab color="primary" aria-label="add" onClick={handleOpen}>
        <AddIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{messages[language]?.addAlumnoTitle || 'Añadir alumno'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={messages[language]?.searchByEmail || 'Buscar por email'}
            type="email"
            fullWidth
            variant="outlined"
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            placeholder={messages[language]?.search || 'Buscar'}
          />
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {!loading && !error && debouncedEmail && alumnosDisponibles.length === 0 && (
            <Alert severity="info">{messages[language]?.noData || 'No hay datos'}</Alert>
          )}
          <List>
            {alumnosDisponibles.map((alumno) => {
              const yaAnadido = alumnosIdsProfesor.includes(alumno.id_alumno);
              return (
                <ListItem
                  key={alumno.id_alumno}
                  alignItems="flex-start"
                  secondaryAction={
                    yaAnadido ? (
                      <Button variant="outlined" color="success" disabled>
                        {messages[language]?.added || 'Añadido'}
                      </Button>
                    ) : (
                      <Button variant="contained" color="primary" onClick={() => handleAddAlumno(alumno.id_alumno)}>
                        {messages[language]?.add || 'Añadir'}
                      </Button>
                    )
                  }
                  sx={{ pr: 12 }} // padding right para dejar espacio al botón
                >
                  <ListItemText
                    primary={
                      <span
                        style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}
                        title={`${alumno.nombre} ${alumno.apellidos}`}
                      >
                        {`${alumno.nombre} ${alumno.apellidos}`}
                      </span>
                    }
                    secondary={
                      <span
                        style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}
                        title={alumno.email}
                      >
                        {alumno.email}
                      </span>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{messages[language]?.close || 'Cerrar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddAlumnoButton;
