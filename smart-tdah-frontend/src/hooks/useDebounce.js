// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import { useState, useEffect } from 'react';

// =====================
// Hook personalizado: useDebounce
// =====================

/**
 * useDebounce
 * Retorna un valor debounced tras un retardo especificado.
 * @param {any} value - Valor a debouncear.
 * @param {number} delay - Tiempo de espera en ms antes de actualizar el valor.
 * @returns {any} Valor debounced.
 */
function useDebounce(value, delay) {
  // Estado local: almacena el valor debounced
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Inicia un timeout para actualizar el valor debounced tras el delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el timeout si value o delay cambian antes de que termine
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  // Devuelve el valor debounced
  return debouncedValue;
}

export default useDebounce;
