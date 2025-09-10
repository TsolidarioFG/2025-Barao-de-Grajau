// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0

// utils/auth.js
// Funciones para obtener y decodificar el rol del usuario desde el token JWT

export function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // JWT: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol || null;
  } catch {
    return null;
  }
}
