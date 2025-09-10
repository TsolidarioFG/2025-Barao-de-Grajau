// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
/********************************************************************
 *  Endpoint seguro para consultas a APIs de modelos de IA
 *  No almacena historial, solo reenvía la consulta y devuelve la
 *  respuesta. Cumple SRP y modularidad.
 ********************************************************************/

const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../dbConfig');
const Groq = require('groq-sdk'); // Importar el SDK de Groq
const fs = require('fs'); // Importar el módulo fs para escribir en archivos

// ==================== CONFIGURACIÓN ====================
// Cargar clave secreta y API key de Gemini desde .env
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Configurar el cliente de Groq
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// ==================== AUTENTICACIÓN ====================
/**
 * Middleware de autenticación JWT
 * Verifica el token JWT en la cabecera Authorization
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ==================== FUNCIONES DE LOG ====================
/**
 * Función para escribir logs en un archivo
 * @param {string} message - Mensaje a escribir en el archivo
 */
function writeLog(message) {
  const logFilePath = './routes/llms-data.log';
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// ==================== ENDPOINT PRINCIPAL ====================
/**
 * POST /ask
 * Endpoint principal para consultas a la IA y a la base de datos
 * Body: { question, studentId, IaModel, alumnoNombre, msgHistory }
 */
router.post('/', authenticateToken, async (req, res) => {
  // Recoge todos los parámetros del body
  const { question, studentId, IaModel, alumnoNombre, msgHistory } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid question' });
  }

  // --- Lógica principal encapsulada para manejo de errores y await ---
  const handleRequest = async () => {

    // ------------------------------------------------------------
    // Selección de modelo IA
    // ------------------------------------------------------------
    /**
     * Selecciona el modelo de IA a usar según IaModel recibido del frontend
     * Loguea el modelo seleccionado para depuración
     */
    const askAI = (prompt) => {
      console.log('--- askAI: modelo seleccionado:', IaModel);
      writeLog(`--- askAI: modelo seleccionado: ${IaModel}`);
      if (IaModel === 'gemini') return askGeminiAI(prompt);
      if (IaModel === 'groq-llama') return askGroqAI(prompt, 'llama-3.3-70b-versatile');
      if (IaModel === 'mixtral') return askMistralAI(prompt);
      // Fallback seguro
      return askGeminiAI(prompt);
    }

    /**
     * Consulta a la API de Mistral para el modelo Mixtral
     * @param {string} prompt
     */
    const askMistralAI = async (prompt) => {
      try {
        const mistralRes = await axios.post(
          'https://api.mistral.ai/v1/chat/completions',
          {
            model: 'mistral-medium',
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            },
          }
        );
        const answer = mistralRes.data?.choices?.[0]?.message?.content || '';
        return answer;
      } catch (err) {
        console.error('Error Mistral:', err?.response?.data || err.message);
        throw new Error('Error al consultar Mistral');
      }
    }

    /**
     * Consulta a la API de Groq para modelo Llama 3
     * @param {string} prompt
     * @param {string} model - 'llama-3.3-70b-versatile'
     * Usa la URL específica según el modelo solicitado
     */
    const askGroqAI = async (prompt, model) => {
      // console.log('--- askGroqAI: modelo seleccionado:', model);
      if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not defined in .env');
      }
      
      try {
        const res = await groq.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        });
        return res.choices[0].message.content;
      } catch (err) {
        console.error('Error Groq:', err?.response?.data || err.message);
        throw new Error('Error al consultar Groq');
      }
    }

    /**
     * Consulta a la API de Gemini usando el modelo principal
     */
    const askGeminiAI = async (prompt) => {
      // console.log('--- askGeminiAI: modelo seleccionado: gemini-2.0-flash');
      try {
        const geminiRes = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': GEMINI_API_KEY,
            },
          }
        );
        const answer = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return answer;
      } catch (err) {
        // Log y error seguro
        console.error('Error Gemini:', err?.response?.data || err.message);
        throw new Error('Error al consultar Gemini (gemini)');
      }
    }

    // ------------------------------------------------------------
    // Preformateo de historial de mensajes
    // ------------------------------------------------------------
    function formatMessageHistory(messages, maxMessages = 10) {
      return messages
        .slice(-maxMessages)
        .filter(m => m.sender !== 'separator')
        .map(m => {
          if (m.sender === 'user') return `Teacher: ${m.text}`;
          if (m.sender === 'LLMS') return `AI Assistant: ${m.text}`;
          return '';
        })
        .join('\n');
    }

    const messages = formatMessageHistory(msgHistory);

    // ------------------------------------------------------------
    // Generación de consulta SQL a partir de la pregunta
    // ------------------------------------------------------------
    /**
     * Genera la consulta SQL necesaria según la pregunta del usuario y el historial de mensajes.
     * Si no se requiere consulta, devuelve 'unnecessary'.
     * El historial de mensajes (msgHistory) se incluye como contexto para la IA.
     */
    const getQuery = async (question) => {
      try {
        console.log('\n')
        writeLog('\n');
        console.log('######################################################### INICIO ##################################################################')
        writeLog('######################################################### INICIO ##################################################################');
        console.log('------------- Pregunta del usuario -------------')
        writeLog('------------- Pregunta del usuario -------------');
        console.log(question)
        writeLog(question);
        console.log('----------------------------------------------------\n')
        writeLog('----------------------------------------------------\n');

        const prompt = `
          You are an expert in SQL (PostgreSQL). Your task is to help a teacher retrieve exactly the data they need about the performance of students with ADHD,
          using read-only SQL queries. You must always respond with a valid SQL SELECT query or just the word "unnecessary" — nothing else.

          The extracted query will be executed and its results passed to another AI instance with a separate prompt for generating a final answer for the teacher.

          Database schema:

          alumnos (
            id_alumno SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            nombre VARCHAR(50) NOT NULL,
            apellidos VARCHAR(100) NOT NULL,
            genero VARCHAR(10),
            curso VARCHAR(20)
          );

          "curso" can be one of: "3 ano", "1º", "2º ESO", "1", "Fundamental", or "".

          ejercicios (
            id_ejercicio SERIAL PRIMARY KEY,
            id_alumno INTEGER REFERENCES alumnos(id_alumno),
            aciertos INTEGER NOT NULL,
            fallos INTEGER NOT NULL,
            letras_correctas INTEGER NOT NULL,
            date_inicio TIMESTAMP NOT NULL,
            date_fin TIMESTAMP NOT NULL,
            dificultad VARCHAR(50) NOT NULL,
            tipo_ejercicio VARCHAR(50) NOT NULL
          );

          "dificultad" values: "Fácil", "Difícil", "Normal".
          "tipo_ejercicio" values: "ejercicioDesplazamiento", "memoriseNumber", "matchFigures", "ejercicioLetras", 
          "operacionesMatematicas", "ejercicioNumerosIguales".

          Instructions:
          - Only generate SELECT queries (never modify data).
          - If the question doesn’t require data, respond only with "unnecessary".
          - Use both the current teacher message and message history to understand the question.
          - If the question refers to a specific student (even if the teacher does not say the student name and says something like "this student"),
           use: WHERE id_alumno = ${studentId} (this is the id of ${alumnoNombre}).
          - If you have the id_alumno, NEVER search by name in the SQL query.
          - If the teacher uses a student name that matches ${alumnoNombre} (even with typos), use the corresponding id_alumno for searching in the SQL query.
            If it doesn't match, return only "unnecessary".
          - If the teacher asks for recommendations, strategies, or evaluations about a student's performance — even indirectly — you must retrieve
           all the relevant performance data available from the database (e.g., exercise types, success rates, progression over time), so the next AI
           instance has enough information to answer accurately.
          - If you create aliases when extracting data from the database, they MUST be in the language of the TEACHER QUESTION.

          ‼️ IMPORTANT: Execution safety
          Your SQL queries must be safe and must never cause execution-time errors. 
          For example, if you perform any division, you MUST ensure that division by zero is prevented, using 'CASE' statements when needed. 
          In addition, your queries should be as efficient and accurate as possible.

          CONVERSATION HISTORY (for context): ${messages}

          TEACHER QUESTION: ${question}
          `;

        const response = await askAI(prompt)

        console.log('------------- Preprompting 1 + pregunta usuario + historial mensajes --------------')
        writeLog('------------- Preprompting 1 + pregunta usuario + historial mensajes --------------');
        console.log(prompt)
        // writeLog(prompt);
        console.log('-----------------------------------------------------------------------------------\n')
        writeLog('-----------------------------------------------------------------------------------\n');

        if (IaModel === 'gemini' && !response.includes("unnecessary")) {
          return response.slice(6, -4);
        }
        if (IaModel === 'groq-llama' && !response.includes("unnecessary")) {
          return response.slice(6, -4);
        }
        if (IaModel === 'mixtral' && !response.includes("unnecessary")) {
          return response.slice(6, -4);
        }
        return response

      } catch (err) {
        console.error('Error generando consulta SQL:', err.message);
        writeLog(`Error generando consulta SQL: ${err.message}`);
        throw new Error('Error generando consulta SQL');
      }
    };

    // ------------------------------------------------------------
    // Ejecución de la consulta SQL en la base de datos
    // ------------------------------------------------------------
    /**
     * Ejecuta la consulta SQL generada y devuelve los datos
     */
    const getDataByQuery = async (query) => {
      let client;
      try {
        client = await pool.connect();
        const res = await client.query(query);
        return res.rows;
      } catch (err) {
        console.error('Error de conexión o consulta a la base de datos:', err.message);
        writeLog(`Error de conexión o consulta a la base de datos: ${err.message}`);
        throw new Error('Error de conexión o consulta a la base de datos');
      } finally {
        if (client) client.release();
      }
    }

    // ------------------------------------------------------------
    // Procesamiento de los datos y generación de respuesta IA
    // ------------------------------------------------------------
    /**
     * Procesa los datos obtenidos y genera la respuesta final de la IA.
     * Incluye el historial de mensajes (msgHistory) en el prompt para dar contexto conversacional.
     */
    const proccessData = async (data, isNecessary) => {
      try {
        const prompt = `
          You are an AI specialized in educational data analysis for teachers working with students with ADHD. Your goal is to help the teacher interpret
          exercise data to support better pedagogical decisions.

          You will always receive message history and database AI-extracted data as context. The data is extracted by a previous AI instance using a SQL query.

          Instructions:
          - Structure your answers clearly, visually, assertively, briefly, and focused on actionable educational insights.
          - Always reply in the same language used in the TEACHER QUESTION field. If needed, translate database content accordingly (e.g., the type of exercise).
          - Do NOT use original database field values in your response. Always translate them to the language of the question.
          - Use inclusive and respectful language at all times.
          - If the available data is insufficient to provide a meaningful answer, say so politely.
          - If the question includes a student name that matches ${alumnoNombre} (even with typos), use the correct spelling in your answer. If not,
             inform the teacher that the name was incorrect or not found.
          - If the previous AI instance considers unnecesary to extract data and the teacher question is general, try to answer the question without data (indicating
           at the beginning of the answer that you could not use database data to support your response).

          RECENT CONVERSATION HISTORY (for context): ${messages}

          TEACHER QUESTION: ${question}

          DATABASE AI-EXTRACTED DATA (false if the previous AI instance determined that no data extraction was necessary): ${isNecessary &&  JSON.stringify(data)}
          `;

        console.log('------------- Preprompting 2 + pregunta usuario + datos recuperados de BBDD -------------')
        writeLog('------------- Preprompting 2 + pregunta usuario + datos recuperados de BBDD -------------');
        console.log(prompt)
        // writeLog(prompt);
        writeLog(JSON.stringify(data));
        console.log('----------------------------------------------------------------------------------------\n')
        writeLog('----------------------------------------------------------------------------------------\n');

        const response = await askAI(prompt)
        console.log('--------- Respuesta final de la IA:')
        writeLog('--------- Respuesta final de la IA:');
        console.log(response)
        writeLog(response);
        console.log('-----------------------------------')
        writeLog('-----------------------------------');
        console.log('#########################################################  FIN  ##################################################################\n')
        writeLog('#########################################################  FIN  ##################################################################\n');

        return response
      } catch (err) {
        console.error('Error procesando datos IA:', err.message);
        writeLog(`Error procesando datos IA: ${err.message}`);
        throw new Error('Error procesando datos IA');
      }
    };

    // ------------------------------------------------------------
    // Lógica principal de la ruta: orquestación de pasos
    // ------------------------------------------------------------
    const query = await getQuery(question)
    console.log('||||||||||||||||||||||||||||||||||| Consulta SQL generada |||||||||||||||||||||||||||||||')
    writeLog('||||||||||||||||||||||||||||||||||| Consulta SQL generada |||||||||||||||||||||||||||||||');
    console.log(query)
    writeLog(query);
    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n')
    writeLog('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n');

    let data;
    if (!query.includes("unnecessary")) {
      // --- Validación de seguridad: solo permitir consultas de lectura (SELECT) ---
      // Solo bloquear comandos que modifican la base de datos
      const forbidden = /\b(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|REPLACE|GRANT|REVOKE)\b/i;
      if (!/^\s*(SELECT|WITH)\b/i.test(query) || forbidden.test(query)) {
        writeLog('Bloqueada consulta SQL potencialmente peligrosa: ' + query);
        return res.status(400).json({ error: 'Consulta SQL bloqueada por motivos de seguridad.' });
      }
      data = await getDataByQuery(query)
    }
    const answer = await proccessData(data, !query.includes("unnecessary"))

    return res.json({ answer });
  };

  // --- Manejo robusto de errores para toda la ruta ---
  handleRequest().catch((err) => {
    console.error('Error en endpoint /ask:', err.message);
    writeLog(`Error en endpoint /ask: ${err.message}`);
    if (err.message.includes('conexión')) {
      return res.status(503).json({ error: 'No se pudo conectar con la base de datos. Inténtalo de nuevo más tarde.' });
    }
    if (err.message.includes('Gemini')) {
      return res.status(502).json({ error: 'No se pudo conectar con el modelo de IA. Inténtalo de nuevo más tarde.' });
    }
    return res.status(500).json({ error: 'Error interno en el servidor de IA.' });
  });
});

// ==================== EXPORTS ====================
module.exports = router;
