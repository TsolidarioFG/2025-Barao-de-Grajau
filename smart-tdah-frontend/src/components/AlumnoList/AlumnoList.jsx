// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
// =============================
// Componente AlumnoList.jsx
// =============================
// Lista de alumnos con filtros, paginación y colores personalizados.
// Todos los estilos están centralizados en la constante styles.

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import axios from 'axios';
import AlumnoLink from '../AlumnoLink/AlumnoLink';
import { backendUrl } from '../../utils/constants';
import { useLanguage } from '../../hooks/LanguageContext';
import messages from '../../utils/translations.json';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Paper, Typography, Button,
  useTheme } from '@mui/material';
import AddAlumnoButton from './AddAlumnoButton';
import useDebounce from '../../hooks/useDebounce';

// =====================
// Estilos centralizados
// =====================
// Todos los estilos visuales del componente están aquí agrupados y documentados.
const styles = {
  // --- Paper principal de la lista ---
  mainPaper: (theme) => ({
    m: { xs: 1.5, sm: 3, md: 4 }, // Margen exterior adaptable
    borderRadius: 5, // Bordes redondeados
    boxShadow: theme.shadows[8], // Sombra principal
    background: theme.palette.background.paper, // Fondo según tema
    border: `1.5px solid ${theme.palette.divider}`,
    p: { xs: 2, sm: 3 }, // Padding adaptable
    display: 'flex', // Layout vertical
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s', // Transiciones suaves
    width: '100%', // Ocupa todo el ancho disponible
    maxWidth: 1200, // Máximo ancho en desktop
    overflow: 'visible',
    minHeight: 0,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%', // Ocupa todo el ancho en móvil
      p: 1, // Padding más compacto
    },
  }),
  // --- Título de la lista ---
  title: (theme) => ({
    textAlign: 'center', // Centrado
    fontWeight: 'bold', // Negrita
    fontSize: '2rem', // Tamaño grande
    mb: 2, // Margen inferior
    color: theme.palette.text.primary, // Color según tema
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem', // Fuente más pequeña
      mb: 1, // Margen inferior más pequeño
    },
  }),
  // --- Contenedor de filtros ---
  filtersContainer: (theme) => ({
    display: 'flex', // Layout horizontal
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5, // Espacio entre filtros
    padding: 2.5, // Padding principal
    mb: 3, // Margen inferior
    width: '100%',
    boxSizing: 'border-box',
    flexWrap: 'wrap', // Permite salto de línea en móvil
    backgroundColor: theme.palette.background.default, // Fondo según tema
    borderRadius: 4, // Bordes redondeados
    boxShadow: theme.shadows[2], // Sombra sutil
    border: `1.5px solid ${theme.palette.divider}`,
    transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      gap: 1.2,
      padding: 1.2,
      mb: 1.5,
    },
  }),
  // --- FormControl de filtro ---
  filterFormControl: {
    minWidth: 120, // Ancho mínimo
    flex: '1 1 120px', // Flexible
    maxWidth: 220, // Máximo ancho
  },
  // --- Input de búsqueda ---
  filterQueryInput: (theme) => ({
    flex: '2 1 160px', // Flexible
    minWidth: 100, // Ancho mínimo
    backgroundColor: theme.palette.background.default, // Fondo según tema
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      minWidth: 60,
      fontSize: 13,
    },
  }),
  // --- Selector de tamaño de página ---
  pageSizeSelector: {
    minWidth: 120, // Ancho mínimo
    flex: '1 1 120px', // Flexible
    maxWidth: 180, // Máximo ancho
  },
  // --- Contenedor principal de la lista de alumnos ---
  alumnoList: (theme) => ({
    padding: 2.5, // Padding principal
    width: '100%', // Ocupa todo el ancho
    backgroundColor: 'transparent', // Fondo transparente
    boxShadow: 'none', // Sin sombra
    borderRadius: 0, // Sin bordes redondeados
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      padding: 1.2,
    },
  }),
};

// =====================
// Componente reutilizable para el paginador
// =====================
// Muestra los botones de página anterior/siguiente y el número de página actual.
const Paginator = ({ currentPage, totalPages, onPrevious, onNext, language }) => (
  <Box display="flex" justifyContent="center" alignItems="center">
    <Button
      variant="contained"
      onClick={onPrevious}
      disabled={currentPage <= 1} // Deshabilitar si estamos en la primera página
      sx={{ marginRight: 2 }}
    >
      {messages[language]?.previous}
    </Button>
    <Typography variant="body1">
      {messages[language]?.page} {currentPage} {messages[language]?.of} {totalPages}
    </Typography>
    <Button
      variant="contained"
      onClick={onNext}
      disabled={currentPage >= totalPages} // Deshabilitar si estamos en la última página
      sx={{ marginLeft: 2 }}
    >
      {messages[language]?.next}
    </Button>
  </Box>
);

// =============================
// Componente principal AlumnoList
// =============================

function AlumnoList() {
  // --- Estado para saber si el profesor puede gestionar alumnos ---
  const [puedeGestionarAlumnos, setPuedeGestionarAlumnos] = useState(false);
  useEffect(() => {
    const fetchPermiso = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${backendUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.puede_gestionar_alumnos === true) {
          setPuedeGestionarAlumnos(true);
        } else {
          setPuedeGestionarAlumnos(false);
        }
      } catch {
        setPuedeGestionarAlumnos(false);
      }
    };
    fetchPermiso();
  }, []);
  // --- Estado de la lista de alumnos ---
  const [alumnos, setAlumnos] = useState([]);
  // --- Estado de los colores asignados a cada alumno (persistente en localStorage) ---
  const [alumnoColors, setAlumnoColors] = useState(() => {
    // Recupera los colores guardados en localStorage (si existen)
    const storedColors = localStorage.getItem('alumnoColors');
    return storedColors ? JSON.parse(storedColors) : {};
  });
  // --- Estado de carga y error ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- Contexto de idioma y tema visual ---
  const { language } = useLanguage();
  const theme = useTheme();

  // --- Estado de filtros y paginación ---
  const [filterBy, setFilterBy] = useState('nombre'); // Filtro activo (nombre, apellidos, curso)
  const [query, setQuery] = useState(''); // Texto de búsqueda
  const debouncedQuery = useDebounce(query, 500); // Búsqueda con retardo para evitar peticiones excesivas
  const [pageSize, setPageSize] = useState(16); // Tamaño de página
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas

  // --- Paleta de colores fija para los alumnos ---
  // Se usa para asignar colores de forma consistente y visualmente agradable
  const colors = useMemo(() => ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'], []);

  // --- Función para asignar un color a cada alumno según su id ---
  // Garantiza que cada alumno tenga siempre el mismo color
  const assignRandomColor = useCallback(
    (idAlumno) => colors[idAlumno % colors.length],
    [colors]
  );

  // --- Función principal para obtener y actualizar la lista de alumnos ---
  // Realiza la petición al backend, aplica filtros y gestiona colores
  const fetchAlumnos = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(messages[language]?.noTokenProvided); // Si no hay token, muestra error
      setLoading(false);
      return;
    }
    try {
      // Petición al backend con filtros y paginación
      const response = await axios.get(`${backendUrl}/alumnos/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          page_size: pageSize,
          filter_by: debouncedQuery ? filterBy : null,
          query: debouncedQuery || null,
        },
      });
      // Mapea los datos recibidos a un formato más manejable
      const fetchedAlumnos = response.data.alumnos.map((alumno) => ({
        idAlumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        email: alumno.email,
        curso: alumno.curso,
      }));
      // Solo asigna color si no existe ya (optimización)
      setAlumnoColors((prevColors) => {
        let updated = false;
        const newColors = { ...prevColors };
        for (const alumno of fetchedAlumnos) {
          if (!newColors[alumno.idAlumno]) {
            newColors[alumno.idAlumno] = assignRandomColor(alumno.idAlumno);
            updated = true;
          }
        }
        if (updated) localStorage.setItem('alumnoColors', JSON.stringify(newColors));
        return newColors;
      });
      setAlumnos(fetchedAlumnos); // Actualiza la lista de alumnos
      setTotalPages(response.data.totalPages); // Actualiza el total de páginas
      setLoading(false);
    } catch {
      setError(messages[language]?.fetchError); // Error de red o backend
      setLoading(false);
    }
  }, [language, currentPage, pageSize, debouncedQuery, filterBy, assignRandomColor]);

  // --- useEffect para cargar los alumnos al montar el componente o cambiar filtros/paginación ---
  useEffect(() => { fetchAlumnos(); }, [fetchAlumnos]);

  // --- Función para ir a la página anterior ---
  // Solo cambia si no estamos en la primera página
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // --- Función para ir a la página siguiente ---
  // Solo cambia si no estamos en la última página
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // --- Renderizado condicional de carga y error ---
  if (loading) return <div>{messages[language]?.loading}</div>;
  if (error) return <div>{error}</div>;

  // =============================
  // Renderizado principal del componente
  // =============================
  return (
    // Contenedor principal centrado para la lista
    <Box display="flex" justifyContent="center" width="100%">
      {/* Paper principal con todos los elementos */}
      <Paper elevation={5} sx={styles.mainPaper(theme)}>
        {/* Título de la lista de alumnos */}
        <Typography sx={styles.title(theme)} gutterBottom>
          {messages[language]?.studentList}
        </Typography>
        {/* Contenedor para los filtros de búsqueda y paginación */}
        <Box sx={styles.filtersContainer(theme)}>
          {/* Selector de campo a filtrar (nombre, apellidos, curso) */}
          <FormControl size="small" sx={styles.filterFormControl}>
            <InputLabel>{messages[language]?.filterBy}</InputLabel>
            <Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              label={messages[language]?.filterBy}
            >
              <MenuItem value="nombre">{messages[language]?.name}</MenuItem>
              <MenuItem value="apellidos">{messages[language]?.lastName}</MenuItem>
              <MenuItem value="curso">{messages[language]?.course}</MenuItem>
            </Select>
          </FormControl>
          {/* Input de búsqueda de texto libre */}
          <TextField
            size="small"
            sx={styles.filterQueryInput(theme)}
            placeholder={messages[language]?.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* Selector de tamaño de página para la paginación */}
          <FormControl size="small" sx={styles.pageSizeSelector}>
            <InputLabel>{messages[language]?.pageSize}</InputLabel>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reinicia a la primera página al cambiar tamaño
              }}
              label={messages[language]?.pageSize}
            >
              <MenuItem value={8}>8</MenuItem>
              <MenuItem value={16}>16</MenuItem>
              <MenuItem value={32}>32</MenuItem>
              <MenuItem value={64}>64</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Paginador al inicio de la lista */}
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
          language={language}
        />
        {/* Lista visual de alumnos (cada uno es un AlumnoLink) */}
        <Box sx={styles.alumnoList(theme)}>
          {alumnos.map((alumno) => (
            <AlumnoLink
              key={alumno.idAlumno}
              alumnoData={alumno}
              backgroundColor={alumnoColors[alumno.idAlumno]}
              isLoggedIn={true}
              puedeGestionarAlumnos={puedeGestionarAlumnos}
              onAlumnoDeleted={fetchAlumnos}
            />
          ))}
        </Box>
        {/* Paginador al final de la lista */}
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
          language={language}
        />
      </Paper>
      {/* Botón para añadir alumnos solo si el profesor tiene permiso */}
      <AddAlumnoButton 
        visible={puedeGestionarAlumnos} 
        onAlumnoAdded={fetchAlumnos}
      />
    </Box>
  );
}

export default AlumnoList;