// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0

// Locale gallego para date-fns (adaptado de https://github.com/date-fns/date-fns/blob/main/src/locale/gl/index.js)
// Solo se importa lo necesario para el selector de fechas.
import esLocale from 'date-fns/locale/es';

// Traducción básica de meses, días y formatos para gallego

// Creamos un nuevo locale gallego extendiendo el español y sobreescribiendo solo los nombres de meses y días
const locale = {
  ...esLocale,
  code: 'gal',
  localize: {
    ...esLocale.localize,
    month: n => [
      'xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño',
      'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro'
    ][n],
    day: n => [
      'domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado'
    ][n],
  },
};

export default locale;
