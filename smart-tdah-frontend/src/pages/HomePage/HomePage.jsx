// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React from "react";
import { Paper, Box, Typography, useTheme } from "@mui/material";
import messages from "../../utils/translations.json";
import { useLanguage } from "../../hooks/LanguageContext";
import { Navigate } from "react-router-dom";
import logo from "../../assets/logo1.png";

// =====================
// Estilos centralizados y documentados para HomePage
// =====================
// Todos los estilos visuales se agrupan en una constante styles.
// Cada línea lleva un comentario claro y contextual.
const styles = (theme) => ({
  // Contenedor principal de la página
  root: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  // Paper principal: márgenes, padding, sombra, fondo, bordes
  mainPaper: {
    m: { xs: 1.5, sm: 3, md: 4 },
    p: { xs: 2, md: 4 },
    maxWidth: 1600,
    width: "95%",
    borderRadius: 5,
    boxShadow: theme.shadows[8],
    background: theme.palette.background.paper,
    border: `1.5px solid ${theme.palette.divider}`,
    transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  // Contenedor de contenido principal (texto + logo)
  content: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    alignItems: "center",
    justifyContent: "center",
    minHeight: { xs: 400, md: 420 },
    width: "100%",
    gap: { xs: 3, md: 6 },
    p: { xs: 0, md: 2 },
  },
  // Contenedor del texto
  textContainer: {
    flex: 1,
    textAlign: { xs: "center", md: "left" },
    maxWidth: { xs: "100%", md: "50%" },
    color: theme.palette.text.primary,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: { xs: "center", md: "flex-start" },
    gap: 2,
    mb: { xs: 2, md: 0 },
  },
  // Logo: margen igual en todos los lados, responsivo y consistente
  logo: {
    width: { xs: "80vw", sm: "60vw", md: "90%", lg: "95%" },
    maxWidth: 600,
    minWidth: 180,
    height: "auto",
    display: "block",
    background: "none",
    boxShadow: "none",
    borderRadius: 4,
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0 2px 16px rgba(0,0,0,0.10))"
        : "drop-shadow(0 2px 8px rgba(0,0,0,0.06))",
    transition: "width 0.3s, filter 0.3s, margin 0.3s",
    m: { xs: 2, sm: 3, md: 4 },
    mx: "auto",
  },
  // Título principal
  title: {
    mb: 2,
    color: theme.palette.primary.main,
    textShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0,0,0,0.18)"
        : "0 2px 8px rgba(0,0,0,0.08)",
    fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
    letterSpacing: 1,
    fontWeight: 700,
    transition: "color 0.3s, text-shadow 0.3s",
  },
  // Descripción
  description: {
    color: theme.palette.text.secondary,
    fontWeight: 400,
    fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
    lineHeight: 1.5,
    maxWidth: 600,
    transition: "color 0.3s",
  },
});

function HomePage({ isLoggedIn, setIsLoggedIn }) {
  const { language } = useLanguage();
  const theme = useTheme();
  const sx = styles(theme);

  return isLoggedIn ? (
    <Box sx={sx.root}>
      <Paper elevation={5} sx={sx.mainPaper}>
        <Box sx={sx.content}>
          <Box sx={sx.textContainer}>
            <Typography variant="h2" component="h1" sx={sx.title}>
              {messages[language]?.welcome}
            </Typography>
            <Typography variant="h5" component="p" sx={sx.description}>
              {messages[language]?.description}
            </Typography>
          </Box>
          <Box component="img" src={logo} alt="Logo" sx={sx.logo} />
        </Box>
      </Paper>
    </Box>
  ) : (
    <main>
      <Navigate to={{ pathname: "/login" }} />
    </main>
  );
}

export default HomePage;