// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { useState, createContext, useMemo, useEffect } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LanguageProvider } from './hooks/LanguageContext'; 
import Banner from "./components/Banner/Banner";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import HomePage from "./pages/HomePage/HomePage";
import ProfesoresAdmin from "./pages/ProfesoresAdmin/ProfesoresAdmin";
import { getUserRole } from './utils/auth';
import AlumnoData from "./pages/AlumnoData/AlumnoData";
import AlumnoList from "./components/AlumnoList/AlumnoList";
import SidePanelLayout from "./layouts/SidePanelLayout";
import Settings from "./pages/Settings/Settings";
import backgroundLight from "./assets/smart_tdah_background_light.png"; // Importa la imagen de fondo para el modo claro
import backgroundDark from "./assets/smart_tdah_background_dark.png"; // Importa la imagen de fondo para el modo oscuro
import Box from '@mui/material/Box'; // Asegura que Box esté importado

// Creamos el contexto para compartir el modo oscuro/claro entre componentes
export const ColorModeContext = createContext({ toggleColorMode: () => {} });


function App() {
  const [mode, setMode] = useState(() => {
    // Carga el tema desde localStorage o usa "light" como predeterminado
    return localStorage.getItem("themeMode") || "light";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación

  // Borra credenciales y fuerza login en cualquier recarga (F5 o Ctrl+F5)
  useEffect(() => {
    // Si hay token, lo eliminamos y forzamos logout en el próximo mount
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      // Redirige a /login tras el reload (se hace en el siguiente mount)
    }
  }, []);

  useEffect(() => {
    // Siempre fuerza logout y redirige a login tras cualquier recarga
    setIsLoggedIn(false);
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode); // Guarda el tema en localStorage
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          background: {
            default: mode === "dark" ? "#32405a" : "#e5e7eb", // Modo oscuro: gris oscuro, modo claro: gris claro
            paper: mode === "dark" ? "#232a3a" : "#f7f8f3", // Modo oscuro: gris más oscuro, modo claro: blanco
          },
          text: {
            primary: mode === "dark" ? "#f5f5f5" : "#232323", // Contraste óptimo
            secondary: mode === "dark" ? "#b0bec5" : "#616161", // Gris claro en oscuro, gris medio en claro
          },
          primary: {
            main: mode === "dark" ? "#4fc3f7" : "#1976d2", // Azul claro en oscuro, azul clásico en claro
          },
          secondary: {
            main: mode === "dark" ? "#ffb74d" : "#ff9800", // Naranja suave
          },
        },
      }),
    [mode]
  );

  // Selecciona la imagen de fondo según el modo
  const backgroundImage =
    mode === "dark"
      ? `url(${backgroundDark})`
      : `url(${backgroundLight})`;

  // Fondo global con patrón según modo claro/oscuro
  return (
    <ColorModeContext.Provider value={colorMode}>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Fondo global: solo cambia la imagen, el resto de la app sigue usando el tema */}
          <Box
            sx={{
              minHeight: "100vh",
              width: "100vw",
              backgroundImage,
              backgroundRepeat: "repeat",
              backgroundAttachment: "fixed",
              backgroundSize: "200px",
              backgroundColor: theme.palette.background.default,
              position: 'fixed',
              zIndex: -1,
              top: 0,
              left: 0,
              transition: 'background-color 0.3s, color 0.3s, background-image 0.6s cubic-bezier(0.4,0,0.2,1)', // Transición suave para fondo
            }}
          />
          {/* El contenido de la app va encima del fondo */}
          <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw' }}>
            <Router>
              <Banner setIsLoggedIn={setIsLoggedIn} />
              <Routes>
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      <SidePanelLayout
                        render={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/alumnos"
                  element={
                    isLoggedIn && getUserRole() === 'profesor' ? (
                      <SidePanelLayout render={<AlumnoList />} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/profesores"
                  element={
                    isLoggedIn && getUserRole() === 'admin' ? (
                      <SidePanelLayout render={<ProfesoresAdmin />} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/alumnos/:id_alumno"
                  element={
                    isLoggedIn ? (
                      <SidePanelLayout render={<AlumnoData isLoggedIn={isLoggedIn} />} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isLoggedIn ? (
                      <SidePanelLayout render={<Settings />} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
              </Routes>
            </Router>
          </Box>
        </ThemeProvider>
      </LanguageProvider>
    </ColorModeContext.Provider>
  );
}

export default App;