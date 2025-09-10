// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import React, { createContext, useContext, useState } from 'react';

// =====================
// Contexto de idioma global para la app
// =====================
// No hay estilos visuales aquí, pero se sigue la convención de comentarios y SRP.

// 1. Creación del contexto de idioma
const LanguageContext = createContext();

// 2. Proveedor de idioma global
//    - Mantiene el estado del idioma y expone la función para cambiarlo
//    - Modular y SRP: solo gestiona idioma
export const LanguageProvider = ({ children }) => {
  // Estado: idioma actual de la app ('pt' por defecto)
  const [language, setLanguage] = useState('pt');

  // Cambia el idioma global
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Renderiza el proveedor de contexto con el idioma y la función de cambio
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 3. Hook personalizado para consumir el contexto de idioma
//    - Permite acceder a { language, changeLanguage } desde cualquier componente
export const useLanguage = () => useContext(LanguageContext);

