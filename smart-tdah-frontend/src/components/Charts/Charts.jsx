// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { memo, useEffect, useState, useRef, useCallback } from "react";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, Typography, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB, es, ptBR } from "date-fns/locale";
import gal from '../../utils/date-fns-locale-gl';
import Chart from "./Chart";
import TableStats from "../Table/TableStats";
import messages from "../../utils/translations.json";
import { useLanguage } from "../../hooks/LanguageContext";

// =====================
// Estilos centralizados y documentados
// =====================
const styles = (theme) => ({
  // --- Contenedor de filtros ---
  filtersContainer: {
    display: 'flex', // Layout horizontal
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5), // Espacio entre filtros
    marginBlock: theme.spacing(2.5), // Margen vertical
    marginInline: theme.spacing(1.25), // Margen horizontal
    flexWrap: 'wrap', // Permite salto de línea en móvil
    backgroundColor: theme.palette.background.default, // Fondo según tema
    borderRadius: 4, // Bordes redondeados
    boxShadow: theme.shadows[2], // Sombra sutil
    border: `1.5px solid ${theme.palette.divider}`,
    p: theme.spacing(1.5), // Padding principal
    m: theme.spacing(1), // Margen exterior
    transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
      marginBlock: theme.spacing(1.5),
      marginInline: theme.spacing(0.5),
      p: theme.spacing(1),
      m: theme.spacing(0.5),
    },
  },
  // --- Contenedor principal de la gráfica ---
  chartMainContainer: {
    width: '100%',
    height: 500, // Altura estándar
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: 0,
    border: 'none',
    p: 0,
    m: 0,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      height: 320, // Menor altura en móvil
    },
  },
  // --- Overlay para mensaje de no datos ---
  noDataOverlay: {
    position: 'absolute',
    left: '50%',
    top: '45%',
    transform: 'translate(-50%, -50%)',
  },
  // --- Título de la tabla de estadísticas ---
  tableStatsTitle: {
    fontWeight: 900, // Negrita
    fontSize: 20, // Tamaño grande
    color: theme.palette.primary.main, // Color principal
    mb: 2, // Margen inferior
    mt: 2, // Margen superior
    textAlign: 'center', // Centrado
    letterSpacing: 0.5, // Espaciado entre letras
    textShadow: theme.palette.mode === 'dark'
      ? '0 2px 8px rgba(0,0,0,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    textTransform: 'uppercase', // Mayúsculas
    background: 'none',
    border: 'none',
    p: 0,
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      mb: 1,
      mt: 1,
    },
  },
  // --- FormControl de filtro ---
  filterFormControl: {
    minWidth: 150, // Ancho mínimo
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      minWidth: 110,
    },
  },
  // --- Campo de fecha ---
  datePickerField: {
    minWidth: 120, // Ancho mínimo
    mx: 0.5, // Margen horizontal
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      minWidth: 80,
    },
  },
  // --- Wrapper de los campos de fecha ---
  datePickerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
    },
  },
  // --- Checkbox de filtro por fecha ---
  filterByDateCheckbox: {
    mx: 1, // Margen horizontal
  },
});

// =============================
// Componente principal Charts
// =============================
const Charts = memo(({ filteredStats, getJuego, getDificultad }) => {
  const { language } = useLanguage();
  const theme = useTheme();
  const sx = styles(theme); // Estilos centralizados
  const printRef = useRef();
  const [filters, setFilters] = useState({
    minDate: null,
    maxDate: null,
    dificultad: "None",
    juego: "None",
  });
  const [filterByDates, setFilterByDates] = useState(false);
  const [filteredData, setFilteredData] = useState(filteredStats);

  // --- Mapea el idioma seleccionado al locale correspondiente de date-fns ---
  // Devuelve el locale adecuado para el selector de fechas según el idioma
  const getLocale = () => {
    switch (language) {
      case "en":
        return enGB;
      case "es":
        return es;
      case "gal":
        return gal;
      case "pt":
        return ptBR;
      default:
        return ptBR;
    }
  };

  // --- Actualiza los datos filtrados según los filtros aplicados ---
  const updateFilters = useCallback(() => {
    let aux = filteredStats;
    if (filterByDates) {
      if (filters.minDate !== null) {
        aux = aux.filter((item) => item.x >= filters.minDate);
      }
      if (filters.maxDate !== null) {
        aux = aux.filter((item) => item.x <= filters.maxDate);
      }
    }
    if (filters.dificultad !== "None") {
      aux = aux.filter((item) => item.dificultad === filters.dificultad);
    }
    if (filters.juego !== "None") {
      aux = aux.filter((item) => item.juego === filters.juego);
    }
    setFilteredData(aux);
  }, [filteredStats, filters, filterByDates]);

  // --- Actualiza los datos filtrados cada vez que cambian los filtros o los datos originales ---
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  // =============================
  // Renderizado visual del componente
  // =============================
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={getLocale()}>
      <Container>
        <Box sx={sx.filtersContainer}>
          {/* Filtro por dificultad */}
          <FormControl size="small" sx={sx.filterFormControl}>
            <InputLabel size="small">{messages[language]?.difficulty}</InputLabel>
            <Select
              size="small"
              value={filters.dificultad}
              label={messages[language]?.difficulty}
              onChange={(e) => setFilters({ ...filters, dificultad: e.target.value })}
            >
              <MenuItem value={"None"}>{messages[language]?.all}</MenuItem>
              <MenuItem value={"Fácil"}>{messages[language]?.easy}</MenuItem>
              <MenuItem value={"Normal"}>{messages[language]?.normal}</MenuItem>
              <MenuItem value={"Difícil"}>{messages[language]?.hard}</MenuItem>
            </Select>
          </FormControl>

          {/* Filtro por juego */}
          <FormControl size="small" sx={sx.filterFormControl}>
            <InputLabel size="small">{messages[language]?.game}</InputLabel>
            <Select
              size="small"
              value={filters.juego}
              label={messages[language]?.game}
              onChange={(e) => setFilters({ ...filters, juego: e.target.value })}
            >
              <MenuItem value={"None"}>{messages[language]?.all}</MenuItem>
              <MenuItem value={"ejercicioLetras"}>{messages[language]?.letterExercise}</MenuItem>
              <MenuItem value={"ejercicioDesplazamiento"}>{messages[language]?.displacementExercise}</MenuItem>
              <MenuItem value={"operacionesMatematicas"}>{messages[language]?.mathOperations}</MenuItem>
              <MenuItem value={"memoriseNumber"}>{messages[language]?.memorizeNumbers}</MenuItem>
              <MenuItem value={"matchFigures"}>{messages[language]?.matchFigures}</MenuItem>
              <MenuItem value={"ejercicioNumerosIguales"}>{messages[language]?.equalNumbersExercise}</MenuItem>
            </Select>
          </FormControl>

          {/* Checkbox para activar el filtro de fechas */}
          <FormGroup sx={sx.filterByDateCheckbox}>
            <FormControlLabel
              control={<Checkbox checked={filterByDates} onChange={(e) => setFilterByDates(e.target.checked)} />}
              label={messages[language]?.filterByDate}
            />
          </FormGroup>

          {/* Campos de selección de fecha (Desde y Hasta) */}
          {filterByDates && (
            <Box sx={sx.datePickerWrapper}>
              <DatePicker
                label={messages[language]?.from}
                value={filters.minDate}
                onChange={(newValue) => setFilters({ ...filters, minDate: newValue })}
                maxDate={new Date()}
                slotProps={{
                  textField: { size: 'small', sx: sx.datePickerField },
                }}
              />
              <DatePicker
                label={messages[language]?.to}
                value={filters.maxDate}
                onChange={(newValue) => setFilters({ ...filters, maxDate: newValue })}
                minDate={filters.minDate}
                maxDate={new Date()}
                slotProps={{
                  textField: { size: 'small', sx: sx.datePickerField },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Contenedor para la gráfica */}
        <Box sx={sx.chartMainContainer} ref={printRef}>
          {filteredData.length === 0 && (
            <Box sx={sx.noDataOverlay}>
              <Button disabled>
                <Typography variant={"h4"}>{messages[language]?.noData}</Typography>
              </Button>
            </Box>
          )}
          <Chart filteredStats={filteredData} getJuego={getJuego} getDificultad={getDificultad} />
        </Box>

        {/* Contenedor para la tabla */}
        <Typography sx={sx.tableStatsTitle}>
          {messages[language]?.statsTable}
        </Typography>
        <TableStats stats={filteredData} getJuego={getJuego} getDificultad={getDificultad} />
      </Container>
    </LocalizationProvider>
  );
});

export default Charts;