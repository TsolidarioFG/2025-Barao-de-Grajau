// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import SidePanel from "../components/SidePanel/SidePanel";
import { useTheme } from "@mui/material/styles";

// =====================
// Estilos centralizados y documentados para SidePanelLayout
// =====================
// Todos los estilos visuales se agrupan en una constante styles.
// Cada línea lleva un comentario claro y contextual.
const styles = (theme) => ({
  // Contenedor flex principal: ocupa toda la pantalla y oculta overflow
  root: {
    display: 'flex', // Layout en fila
    width: '100vw', // Ocupa todo el ancho de la ventana
    height: '100vh', // Ocupa toda la altura de la ventana
    overflow: 'hidden', // Oculta cualquier desbordamiento
  },
  // SidePanel: ancho fijo, altura completa, altura mínima
  sidePanel: {
    width: 60, // Ancho fijo del SidePanel
    height: '100%', // Ocupa toda la altura del contenedor
    minHeight: 400, // Altura mínima para mantener proporción
    // Breakpoint: en móvil, ancho y altura mínima menores
    [theme.breakpoints.down('sm')]: {
      width: 48,
      minHeight: 300,
    },
  },
  // Contenedor principal: ocupa el espacio restante, margen superior para Banner, scroll vertical si es necesario
  main: {
    flex: 1, // Ocupa el espacio restante
    height: 'calc(100% - 64px)', // Resta el alto del Banner
    marginTop: 64, // Deja espacio para el Banner
    overflowY: 'auto', // Permite scroll vertical si el contenido es más alto
    // Breakpoint: en móvil, margen superior y altura ajustados
    [theme.breakpoints.down('sm')]: {
      marginTop: 48,
      height: 'calc(100% - 48px)',
    },
  },
});

// =====================
// SidePanelLayout: layout principal con panel lateral y contenedor de contenido
// =====================
function SidePanelLayout({ render }) {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <div style={sx.root}>
      {/* SidePanel ocupa un ancho fijo */}
      <div style={sx.sidePanel}>
        <SidePanel />
      </div>

      {/* Contenedor principal ajustado al espacio restante */}
      <div style={sx.main}>{render}</div>
    </div>
  );
}

export default SidePanelLayout;