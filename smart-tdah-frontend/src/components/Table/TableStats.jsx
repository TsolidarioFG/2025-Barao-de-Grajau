// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { memo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { format } from "date-fns";
import { useLanguage } from "../../hooks/LanguageContext";
import messages from "../../utils/translations.json";
import { useTheme } from "@mui/material/styles";

// =====================
// Estilos centralizados y documentados para la tabla de estadísticas
// =====================
const styles = {
  // Contenedor principal de la tabla: fondo, bordes, sombra y scroll horizontal solo si es necesario
  container: (theme) => ({
    background: theme.palette.background.default, // Fondo coherente con el tema
    borderRadius: 4, // Bordes redondeados para suavidad visual
    boxShadow: theme.shadows[1], // Sombra sutil para resaltar la tabla
    border: `1.5px solid ${theme.palette.divider}`,
    overflowX: 'auto', // Scroll horizontal solo si es necesario
    overflowY: 'hidden', // Nunca scroll vertical
    mt: 2, // Margen superior
    [theme.breakpoints.down('sm')]: {
      mt: 1,
    },
  }),
  // Celda de cabecera: fondo, color, peso y tamaño de fuente, con breakpoints
  headCell: (theme) => ({
    background: theme.palette.background.default, // Fondo igual al contenedor
    color: theme.palette.text.primary, // Texto principal
    fontWeight: 700, // Negrita para destacar
    fontSize: 15, // Tamaño base
    borderBottom: `2px solid ${theme.palette.divider}`,
    letterSpacing: 0.2,
    py: 1.2, // Padding vertical
    [theme.breakpoints.down('sm')]: {
      fontSize: 13, // Más pequeño en móvil
      py: 0.7,
    },
  }),
  // Celda de cuerpo: fondo, tamaño de fuente, padding y borde inferior
  bodyCell: (theme) => ({
    background: theme.palette.background.paper, // Fondo papel para contraste
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.divider}`,
    py: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12,
      py: 0.5,
    },
  }),
  // Fila par: fondo y color de texto
  rowEven: (theme) => ({
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
  }),
  // Fila impar: fondo alternativo y color de texto
  rowOdd: (theme) => ({
    background: theme.palette.action.selected,
    color: theme.palette.text.primary,
  }),
};

// =====================
// Componente principal TableStats
// =====================
// Uso de memo para evitar renderizados innecesarios si las props no cambian
const TableStats = memo(({ stats, getJuego, getDificultad }) => {
  const { language } = useLanguage();
  const theme = useTheme();


  // Traduce el identificador del juego a su nombre traducido
  const translateJuego = (juego) => {
    switch (juego) {
      case "ejercicioLetras":
        return messages[language]?.letterExercise;
      case "ejercicioDesplazamiento":
        return messages[language]?.displacementExercise;
      case "operacionesMatematicas":
        return messages[language]?.mathOperations;
      case "memoriseNumber":
        return messages[language]?.memorizeNumbers;
      case "matchFigures":
        return messages[language]?.matchFigures;
      case "ejercicioNumerosIguales":
        return messages[language]?.equalNumbersExercise;
      default:
        return juego || "-";
    }
  };

  // Traduce la dificultad a su nombre traducido
  const translateDificultad = (dificultad) => {
    switch (dificultad) {
      case "Fácil":
        return messages[language]?.easy;
      case "Normal":
        return messages[language]?.normal;
      case "Difícil":
        return messages[language]?.hard;
      default:
        return dificultad || "-";
    }
  };

  // =====================
  // Render principal: tabla responsiva y accesible
  // =====================
  return (
    <TableContainer sx={styles.container(theme)}>
      <Table id="table">
        <TableHead>
          <TableRow>
            {/* Cabeceras de columna, traducidas y con estilos centralizados */}
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.startDate}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.endDate}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.duration}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.corrects}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.errors}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.accuracyRatio}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.game}</Typography>
            </TableCell>
            <TableCell sx={styles.headCell(theme)}>
              <Typography fontWeight={700} fontSize={{ xs: 13, sm: 15 }}>{messages[language]?.difficulty}</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Renderizado de filas de datos, alternando estilos par/impar y celdas responsivas */}
          {stats.map((row, idx) => (
            <TableRow
              key={`${row.x}-${row.x1}`}
              sx={idx % 2 === 0 ? styles.rowEven(theme) : styles.rowOdd(theme)}
            >
              {/* Fecha y hora de inicio */}
              <TableCell sx={styles.bodyCell(theme)} component="th" scope="row">
                <Typography fontSize={{ xs: 12, sm: 14 }} fontWeight={500}>
                  {row.x instanceof Date && !isNaN(row.x) ? format(row.x, "dd/MM/yyyy") : messages[language]?.invalidDate}
                </Typography>
                <Typography fontSize={{ xs: 11, sm: 13 }} color="text.secondary">
                  {row.x instanceof Date && !isNaN(row.x) ? format(row.x, "HH:mm:ss") : messages[language]?.invalidTime}
                </Typography>
              </TableCell>
              {/* Fecha y hora de fin */}
              <TableCell sx={styles.bodyCell(theme)} component="th" scope="row">
                <Typography fontSize={{ xs: 12, sm: 14 }} fontWeight={500}>
                  {row.x1 instanceof Date && !isNaN(row.x1) ? format(row.x1, "dd/MM/yyyy") : messages[language]?.invalidDate}
                </Typography>
                <Typography fontSize={{ xs: 11, sm: 13 }} color="text.secondary">
                  {row.x1 instanceof Date && !isNaN(row.x1) ? format(row.x1, "HH:mm:ss") : messages[language]?.invalidTime}
                </Typography>
              </TableCell>
              {/* Duración en segundos */}
              <TableCell sx={styles.bodyCell(theme)}>
                <Typography fontSize={{ xs: 12, sm: 14 }}>
                  {row.x instanceof Date && row.x1 instanceof Date
                    ? Math.round(Math.abs(row.x1.getTime() - row.x.getTime()) / 1000)
                    : messages[language]?.invalidDuration}
                </Typography>
              </TableCell>
              {/* Aciertos */}
              <TableCell sx={styles.bodyCell(theme)}>{row.y}</TableCell>
              {/* Errores */}
              <TableCell sx={styles.bodyCell(theme)}>{row.z}</TableCell>
              {/* Ratio de acierto */}
              <TableCell sx={styles.bodyCell(theme)}>{row.r}%</TableCell>
              {/* Nombre del juego traducido */}
              <TableCell sx={styles.bodyCell(theme)}>{translateJuego(getJuego(row.x))}</TableCell>
              {/* Dificultad traducida */}
              <TableCell sx={styles.bodyCell(theme)}>{translateDificultad(getDificultad(row.x))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default TableStats;