// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import { Paper, Typography, useTheme } from "@mui/material";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, LabelList } from "recharts";
import { format } from "date-fns";
import messages from '../../utils/translations.json';
import { useLanguage } from '../../hooks/LanguageContext';

// =====================
// Estilos centralizados y documentados
// =====================
const styles = (theme) => ({
  // --- Tooltip personalizado ---
  tooltipPaper: {
    padding: '20px', // Espaciado interno
    opacity: 0.8, // Transparencia
    backgroundColor: theme.palette.background.paper, // Fondo según tema
    color: theme.palette.text.primary, // Texto según tema
    borderRadius: 2, // Bordes redondeados
    boxShadow: theme.shadows[3], // Sombra sutil
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      padding: '10px', // Menos padding en móvil
      fontSize: 13, // Fuente más pequeña
    },
  },
  // --- Etiquetas del eje X ---
  xTick: {
    fill: '#666', // Color de texto
    fontSize: 13, // Tamaño estándar
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 11, // Más pequeño en móvil
    },
  },
  // --- Etiquetas personalizadas ---
  customLabel: {
    fill: 'black', // Color de texto
    textAnchor: 'end', // Alineación
    dominantBaseline: 'central', // Centrado vertical
    fontSize: 13, // Tamaño estándar
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      fontSize: 11,
    },
  },
  // --- Leyenda ---
  legend: {
    paddingBottom: '20px', // Espacio inferior
    // --- Responsive para móvil ---
    [theme.breakpoints.down('sm')]: {
      paddingBottom: '10px',
    },
  },
});

const Chart = ({ filteredStats }) => {
  const { language } = useLanguage(); // Obtiene el idioma actual
  const theme = useTheme();
  const sx = styles(theme); // Estilos centralizados

  // --- Obtiene el dominio mínimo y máximo de las fechas ---
  const getDomain = () => {
    const arrayDates = filteredStats.map((item) => item.x);
    return {
      min: Math.min.apply(null, arrayDates),
      max: Math.max.apply(null, arrayDates),
    };
  };

  // --- Tooltip personalizado con estilos centralizados ---
  // Traducción de dificultad y juego para el tooltip
  const translateDificultad = (dif) => {
    if (!dif) return "-";
    switch (dif) {
      case "Fácil": return messages[language]?.easy;
      case "Normal": return messages[language]?.normal;
      case "Difícil": return messages[language]?.hard;
      case "Easy": return messages[language]?.easy;
      case "Hard": return messages[language]?.hard;
      default: return messages[language]?.[dif] || dif;
    }
  };

  const translateJuego = (juego) => {
    if (!juego) return "-";
    switch (juego) {
      case "ejercicioLetras": return messages[language]?.letterExercise;
      case "ejercicioDesplazamiento": return messages[language]?.displacementExercise;
      case "operacionesMatematicas": return messages[language]?.mathOperations;
      case "memoriseNumber": return messages[language]?.memorizeNumbers;
      case "matchFigures": return messages[language]?.matchFigures;
      case "ejercicioNumerosIguales": return messages[language]?.equalNumbersExercise;
      default: return juego;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={sx.tooltipPaper}>
          <Typography gutterBottom>
            {messages[language]?.startDate}: {format(label, "HH:mm dd/MM/yyyy")}
          </Typography>
          <Typography gutterBottom>
            {messages[language]?.difficulty}: {translateDificultad(payload[0]?.payload?.dificultad)}
          </Typography>
          <Typography gutterBottom>
            {messages[language]?.game}: {translateJuego(payload[0]?.payload?.juego)}
          </Typography>
          <Typography gutterBottom>
            {messages[language]?.corrects}: {payload[0]?.value}
          </Typography>
          <Typography gutterBottom>
            {messages[language]?.errors}: {payload[1]?.value}
          </Typography>
          <Typography>
            {messages[language]?.accuracyRatio}: {payload[1]?.value === 0
              ? 100
              : Math.round((payload[0]?.value / (payload[0]?.value + payload[1]?.value)) * 10000) / 100} %
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // --- Etiqueta personalizada del eje X ---
  const CustomizedXTick = (props) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} style={sx.xTick}>
          <tspan textAnchor="middle" x="0" fontSize={sx.xTick.fontSize}>
            {payload.value instanceof Date && format(payload.value, "dd/MM/yy")}
          </tspan>
          <tspan textAnchor="middle" x="0" dy="15" fontSize={sx.xTick.fontSize - 1}>
            {payload.value instanceof Date && format(payload.value, "HH:mm")}
          </tspan>
        </text>
      </g>
    );
  };

  // --- Etiqueta personalizada para los puntos ---
  const renderCustomizedLabel = ({ x, y, name }) => {
    return (
      <text
        x={x}
        y={y}
        style={sx.customLabel}
      >
        {name}
      </text>
    );
  };

  // =============================
  // Renderizado visual del gráfico
  // =============================
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        label={renderCustomizedLabel}
        data={filteredStats}
        margin={{
          top: 20,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1A5E20" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#1A5E20" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF0000" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          interval={0}
          tick={<CustomizedXTick />}
          domain={[getDomain().min, getDomain().max]}
        />
        <YAxis yAxisId="left" />
        <YAxis
          tickFormatter={(tick) => tick + "%"}
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          interval={0}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          align="center"
          wrapperStyle={sx.legend}
        />
        <Area
          fillOpacity={1}
          fill="url(#colorB)"
          yAxisId="left"
          name={messages[language]?.corrects}
          type="monotone"
          dataKey="y"
          stroke="#82ca9d"
          activeDot={{ r: 8 }}
        >
          <LabelList stroke="#82ca9d" dataKey="y" position="top" />
        </Area>
        <Area
          fillOpacity={1}
          fill="url(#colorE)"
          yAxisId="left"
          name={messages[language]?.errors}
          type="monotone"
          dataKey="z"
          stroke="#FF0000"
          activeDot={{ r: 8 }}
        >
          <LabelList stroke="#FF0000" dataKey="z" position="top" />
        </Area>
        <Line
          yAxisId="right"
          name={messages[language]?.accuracyRatio}
          type="monotone"
          dataKey="r"
          stroke="#00C1FF"
          activeDot={{ r: 8 }}
        >
          <LabelList
            stroke="#00C1FF"
            dataKey="r"
            position="top"
            formatter={(label) => label + "%"}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Chart;