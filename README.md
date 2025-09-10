
# SMART-TDAH

<div align="center">

🌐 **Idiomas dispoñíbeis:** [Galego](#galego) | [Castellano](#castellano) | [English](#english) | [Português](#português)

</div>

---

<a name="galego"></a>

## Galego

> SMART-TDAH: Software para Análise Intelixente de Datos e Apoio ao Seguimento de Estudantes con TDAH. Desenvolto como Traballo de Fin de Grao (TFG Solidario / Aprendizaxe-Servizo) por Ángel Álvarez Rey, na mención de Computación do Grao en Enxeñaría Informática da Universidade da Coruña, dentro do programa TFGs Solidarios da Cátedra NTTData Diversidade. O proxecto contou coa avaliación de resultados por parte de profesores expertos en TDAH en colaboración cos Concellos de Barão de Grajaú (Brasil) e Floriano (Brasil). 
> 
> Todo o código fonte está dispoñíbel baixo licenza libre **GNU General Public License v3.0 (GPLv3)**.

### Índice

1. [Descrición xeral](#descrición-xeral)
2. [Arquitectura do proxecto](#arquitectura-do-proxecto)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Execución en local](#execución-en-local)
6. [Estrutura dos directorios](#estrutura-dos-directorios)
7. [Despregue](#despregue)
8. [Tecnoloxías empregadas](#tecnoloxías-empregadas)
9. [Código fonte](#código-fonte)

### Descrición xeral

SMART-TDAH é unha **plataforma web educativa** que permite a docentes xestionar, visualizar e analizar o progreso de alumnos con TDAH mediante a visualización de resultados de exercicios e estatísticas.

Inclúe:

* Autenticación e xestión de usuarios.
* Visualización de gráficas e táboas de progreso.
* Chatbot con modelos de linguaxe (Gemini, LLaMA e Mixtral) para consultas avanzadas.
* Internacionalización en **galego, castelán, inglés e portugués do Brasil**.

O proxecto segue o patrón **MVC (Modelo-Vista-Controlador)** e conecta frontend e backend mediante unha base de datos PostgreSQL migrada desde Firebase.

### Arquitectura do proxecto

**Modelo MVC cliente-servidor:**

| Compoñente    | Tecnoloxía             | Descrición                                                     |
| ------------- | ---------------------- | -------------------------------------------------------------- |
| Frontend      | React + Material UI    | Interface de usuario, páxinas e compoñentes reutilizables      |
| Backend       | Node.js + Express      | API REST, autenticación, xestión de datos e integración con IA |
| Base de datos | PostgreSQL             | Almacenamento de usuarios, alumnos, exercicios e resultados    |
| APIs externas | Gemini, LLaMA, Mixtral | Respostas do chatbot, consultas avanzadas de datos             |

### Requisitos previos

* Node.js >= 18.x
* npm >= 9.x
* PostgreSQL >= 14.x
* Git
* (Opcional) Docker para despregue

### Instalación

```bash
# Clona o repositorio oficial da Cátedra
git clone https://github.com/TsolidarioFG/2025-Barao-de-Grajau.git
# Alternativamente, podes clonar o meu repositorio persoal (ambos teñen o mesmo proxecto)
# git clone https://github.com/Lorudarku/SMART-TDAH.git

cd 2025-Barao-de-Grajau

# Backend
cd smart-tdah-backend
npm install

# Frontend
cd ../smart-tdah-frontend
npm install
```

### Execución en local

1. **Configura a base de datos PostgreSQL**

   * Crea unha base e define as credenciais no arquivo `.env` do backend.

2. **Inicia o backend**

```bash
cd smart-tdah-backend/
npm start
```

* URL por defecto: `http://localhost:3001`

3. **Inicia o frontend**

```bash
cd smart-tdah-frontend/
npm start
```

* URL por defecto: `http://localhost:3000`

### Estrutura dos directorios

```
SMART-TDAH/
├── smart-tdah-backend/      # Backend (API, DB)
├── smart-tdah-frontend/     # Frontend (React)
└── README.md                # Esta guía
```

**Backend**

* `server.js`: punto de entrada do servidor.
* `dbConfig.js`: configuración PostgreSQL.
* `routes/`: rutas da API e integración con IA.
* `users/`: lóxica de xestión de usuarios.

**Frontend**

* `src/`: código fonte React.
* `components/`: compoñentes reutilizables.
* `pages/`: páxinas principais da aplicación.
* `utils/` e `hooks/`: utilidades e hooks personalizados.

### Tecnoloxías empregadas

* **Frontend:** React, Material UI, Axios, Recharts, date-fns, pdfmake.
* **Backend:** Node.js, Express, PostgreSQL, bcrypt, dotenv.
* **APIs externas:** Gemini, LLaMA, Mixtral (requiren clave).
* **Control de versións:** Git, GitHub


### Código fonte

Todo o código fonte está dispoñíbel de forma gratuíta nos repositorios do proxecto (ver sección de instalación) e baixo licenza libre **GPL v3.0**, promovendo transparencia, reproducibilidade científica e posible reutilización educativa.

---

<a name="castellano"></a>

## Castellano

> SMART-TDAH: Software para Análisis Inteligente de Datos y Apoyo al Seguimiento de Estudiantes con TDAH. Desarrollado como Trabajo de Fin de Grado (TFG Solidario / Aprendizaje-Servicio) por Ángel Álvarez Rey, en la mención de Computación del Grado en Ingeniería Informática de la Universidad de La Coruña, dentro del programa TFGs Solidarios de la Cátedra NTTData Diversidad. El proyecto contó con la evaluación de resultados por parte de profesores expertos en TDAH en colaboración con los Ayuntamientos de Barão de Grajaú (Brasil) y Floriano (Brasil).
> 
> Todo el código fuente está disponible bajo licencia libre **GNU General Public License v3.0 (GPLv3)**.

### Índice

1. [Descripción general](#descripción-general)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Ejecución en local](#ejecución-en-local)
6. [Estructura de directorios](#estructura-de-directorios)
7. [Despliegue](#despliegue)
8. [Tecnologías utilizadas](#tecnologías-utilizadas)
9. [Código fuente](#código-fuente)

### Descripción general

SMART-TDAH es una **plataforma web educativa** que permite a los docentes gestionar, visualizar y analizar el progreso de alumnos con TDAH mediante la visualización de resultados de ejercicios y estadísticas.

Incluye:

* Autenticación y gestión de usuarios.
* Visualización de gráficas y tablas de progreso.
* Chatbot con modelos de lenguaje (Gemini, LLaMA y Mixtral) para consultas avanzadas.
* Internacionalización en **gallego, castellano, inglés y portugués de Brasil**.

El proyecto sigue el patrón **MVC (Modelo-Vista-Controlador)** y conecta frontend y backend mediante una base de datos PostgreSQL migrada desde Firebase.

### Arquitectura del proyecto

**Modelo MVC cliente-servidor:**

| Componente     | Tecnología             | Descripción                                                    |
| -------------- | --------------------- | -------------------------------------------------------------- |
| Frontend       | React + Material UI   | Interfaz de usuario, páginas y componentes reutilizables       |
| Backend        | Node.js + Express     | API REST, autenticación, gestión de datos e integración con IA |
| Base de datos  | PostgreSQL            | Almacenamiento de usuarios, alumnos, ejercicios y resultados   |
| APIs externas  | Gemini, LLaMA, Mixtral| Respuestas del chatbot, consultas avanzadas de datos           |

### Requisitos previos

* Node.js >= 18.x
* npm >= 9.x
* PostgreSQL >= 14.x
* Git
* (Opcional) Docker para despliegue

### Instalación

```bash
# Clona el repositorio oficial de la Cátedra
git clone https://github.com/TsolidarioFG/2025-Barao-de-Grajau.git
# Alternativamente, puedes clonar mi repositorio personal (ambos tienen el mismo proyecto)
# git clone https://github.com/Lorudarku/SMART-TDAH.git

cd 2025-Barao-de-Grajau

# Backend
cd smart-tdah-backend
npm install

# Frontend
cd ../smart-tdah-frontend
npm install
```

### Ejecución en local

1. **Configura la base de datos PostgreSQL**

   * Crea una base y define las credenciales en el archivo `.env` del backend.

2. **Inicia el backend**

```bash
cd smart-tdah-backend/
npm start
```

* URL por defecto: `http://localhost:3001`

3. **Inicia el frontend**

```bash
cd smart-tdah-frontend/
npm start
```

* URL por defecto: `http://localhost:3000`

### Estructura de directorios

```
SMART-TDAH/
├── smart-tdah-backend/      # Backend (API, BD)
├── smart-tdah-frontend/     # Frontend (React)
└── README.md                # Esta guía
```

**Backend**

* `server.js`: punto de entrada del servidor.
* `dbConfig.js`: configuración de PostgreSQL.
* `routes/`: rutas de la API e integración con IA.
* `users/`: lógica de gestión de usuarios.

**Frontend**

* `src/`: código fuente React.
* `components/`: componentes reutilizables.
* `pages/`: páginas principales de la aplicación.
* `utils/` y `hooks/`: utilidades y hooks personalizados.

### Tecnologías utilizadas

* **Frontend:** React, Material UI, Axios, Recharts, date-fns, pdfmake.
* **Backend:** Node.js, Express, PostgreSQL, bcrypt, dotenv.
* **APIs externas:** Gemini, LLaMA, Mixtral (requieren clave).
* **Control de versiones:** Git, GitHub

### Código fuente

Todo el código fuente del proyecto está **disponible de forma gratuita** en los repositorios del proyecto (ver sección de instalación) y bajo licencia libre **GPL v3.0**, promoviendo la transparencia, la reproducibilidad científica y su posible reutilización educativa.

---

<a name="english"></a>

## English

> SMART-TDAH: Software for Intelligent Data Analysis and Support for Monitoring Students with ADHD. Developed as a Final Degree Project (Solidarity FYP / Service-Learning) by Ángel Álvarez Rey, in the Computer Science specialization of the Degree in Computer Engineering at the University of A Coruña, within the Solidarity FYP program of the NTTData Diversity Chair. The project included evaluation of results by expert teachers in ADHD in collaboration with the municipalities of Barão de Grajaú (Brazil) and Floriano (Brazil).
> 
> All source code is available under the free license **GNU General Public License v3.0 (GPLv3)**.

### Index

1. [General description](#general-description)
2. [Project architecture](#project-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Local execution](#local-execution)
6. [Directory structure](#directory-structure)
7. [Deployment](#deployment)
8. [Technologies used](#technologies-used)
9. [Source code](#source-code)

### General description

SMART-TDAH is an **educational web platform** that allows teachers to manage, visualize, and analyze the progress of students with ADHD through the visualization of exercise results and statistics.

Includes:

* User authentication and management.
* Visualization of progress charts and tables.
* Chatbot with language models (Gemini, LLaMA, and Mixtral) for advanced queries.
* Internationalization in **Galician, Spanish, English, and Brazilian Portuguese**.

The project follows the **MVC (Model-View-Controller)** pattern and connects frontend and backend through a PostgreSQL database migrated from Firebase.

### Project architecture

**Client-server MVC model:**

| Component     | Technology             | Description                                                    |
| ------------- | --------------------- | -------------------------------------------------------------- |
| Frontend      | React + Material UI   | User interface, pages, and reusable components                 |
| Backend       | Node.js + Express     | REST API, authentication, data management, and AI integration  |
| Database      | PostgreSQL            | Storage of users, students, exercises, and results             |
| External APIs | Gemini, LLaMA, Mixtral| Chatbot responses, advanced data queries                       |

### Prerequisites

* Node.js >= 18.x
* npm >= 9.x
* PostgreSQL >= 14.x
* Git
* (Optional) Docker for deployment

### Installation

```bash
# Clone the official repository from the Chair
git clone https://github.com/TsolidarioFG/2025-Barao-de-Grajau.git
# Alternatively, you can clone my personal repository  (both have the same project)
# git clone https://github.com/Lorudarku/SMART-TDAH.git

cd 2025-Barao-de-Grajau

# Backend
cd smart-tdah-backend
npm install

# Frontend
cd ../smart-tdah-frontend
npm install
```

### Local execution

1. **Configure the PostgreSQL database**

   * Create a database and define the credentials in the backend `.env` file.

2. **Start the backend**

```bash
cd smart-tdah-backend/
npm start
```

* Default URL: `http://localhost:3001`

3. **Start the frontend**

```bash
cd smart-tdah-frontend/
npm start
```

* Default URL: `http://localhost:3000`

### Directory structure

```
SMART-TDAH/
├── smart-tdah-backend/      # Backend (API, DB)
├── smart-tdah-frontend/     # Frontend (React)
└── README.md                # This guide
```

**Backend**

* `server.js`: server entry point.
* `dbConfig.js`: PostgreSQL configuration.
* `routes/`: API routes and AI integration.
* `users/`: user management logic.

**Frontend**

* `src/`: React source code.
* `components/`: reusable components.
* `pages/`: main application pages.
* `utils/` and `hooks/`: utilities and custom hooks.

### Technologies used

* **Frontend:** React, Material UI, Axios, Recharts, date-fns, pdfmake.
* **Backend:** Node.js, Express, PostgreSQL, bcrypt, dotenv.
* **External APIs:** Gemini, LLaMA, Mixtral (require key).
* **Version control:** Git, GitHub

### Source Code

All the source code of the project is **freely available** in the project repositories (see installation section) under the free license **GPL v3.0**, fostering transparency, scientific reproducibility, and potential educational reuse.

---

<a name="português"></a>

## Português

> SMART-TDAH: Software para Análise Inteligente de Dados e Apoio ao Acompanhamento de Estudantes com TDAH. Desenvolvido como Trabalho de Conclusão de Curso (TCC Solidário / Aprendizagem-Serviço) por Ángel Álvarez Rey, na especialização em Computação do Curso de Engenharia da Computação da Universidade da Corunha, dentro do programa TCCs Solidários da Cátedra NTTData Diversidade. O projeto contou com a avaliação dos resultados por parte de professores especialistas em TDAH em colaboração com os Municípios de Barão de Grajaú (Brasil) e Floriano (Brasil).
> 
> Todo o código-fonte está disponível sob licença livre **GNU General Public License v3.0 (GPLv3)**.

### Índice

1. [Descrição geral](#descrição-geral)
2. [Arquitetura do projeto](#arquitetura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Execução local](#execução-local)
6. [Estrutura de diretórios](#estrutura-de-diretórios)
7. [Deploy](#deploy)
8. [Tecnologias utilizadas](#tecnologias-utilizadas)
9. [Código-fonte](#código-fonte)

### Descrição geral

SMART-TDAH é uma **plataforma web educacional** que permite aos professores gerir, visualizar e analisar o progresso de alunos com TDAH através da visualização de resultados de exercícios e estatísticas.

Inclui:

* Autenticação e gestão de utilizadores.
* Visualização de gráficos e tabelas de progresso.
* Chatbot com modelos de linguagem (Gemini, LLaMA e Mixtral) para consultas avançadas.
* Internacionalização em **galego, castelhano, inglês e português do Brasil**.

O projeto segue o padrão **MVC (Modelo-Visão-Controlador)** e conecta frontend e backend através de uma base de dados PostgreSQL migrada do Firebase.

### Arquitetura do projeto

**Modelo MVC cliente-servidor:**

| Componente    | Tecnologia             | Descrição                                                      |
| ------------- | ---------------------- | -------------------------------------------------------------- |
| Frontend      | React + Material UI    | Interface do utilizador, páginas e componentes reutilizáveis   |
| Backend       | Node.js + Express      | API REST, autenticação, gestão de dados e integração com IA    |
| Base de dados | PostgreSQL             | Armazenamento de utilizadores, alunos, exercícios e resultados |
| APIs externas | Gemini, LLaMA, Mixtral | Respostas do chatbot, consultas avançadas de dados             |

### Pré-requisitos

* Node.js >= 18.x
* npm >= 9.x
* PostgreSQL >= 14.x
* Git
* (Opcional) Docker para deploy

### Instalação

```bash
# Clone o repositório oficial da Cátedra
git clone https://github.com/TsolidarioFG/2025-Barao-de-Grajau.git
# Alternativamente, você pode clonar o meu repositório pessoal (ambos têm o mesmo projeto)
# git clone https://github.com/Lorudarku/SMART-TDAH.git

cd 2025-Barao-de-Grajau

# Backend
cd smart-tdah-backend
npm install

# Frontend
cd ../smart-tdah-frontend
npm install
```

### Execução local

1. **Configura a base de dados PostgreSQL**

   * Cria uma base e define as credenciais no arquivo `.env` do backend.

2. **Inicia o backend**

```bash
cd smart-tdah-backend/
npm start
```

* URL padrão: `http://localhost:3001`

3. **Inicia o frontend**

```bash
cd smart-tdah-frontend/
npm start
```

* URL padrão: `http://localhost:3000`

### Estrutura de diretórios

```
SMART-TDAH/
├── smart-tdah-backend/      # Backend (API, BD)
├── smart-tdah-frontend/     # Frontend (React)
└── README.md                # Este guia
```

**Backend**

* `server.js`: ponto de entrada do servidor.
* `dbConfig.js`: configuração do PostgreSQL.
* `routes/`: rotas da API e integração com IA.
* `users/`: lógica de gestão de utilizadores.

**Frontend**

* `src/`: código-fonte React.
* `components/`: componentes reutilizáveis.
* `pages/`: páginas principais da aplicação.
* `utils/` e `hooks/`: utilitários e hooks personalizados.

### Tecnologias utilizadas

* **Frontend:** React, Material UI, Axios, Recharts, date-fns, pdfmake.
* **Backend:** Node.js, Express, PostgreSQL, bcrypt, dotenv.
* **APIs externas:** Gemini, LLaMA, Mixtral (requerem chave).
* **Controle de versão:** Git, GitHub

### Código-fonte

Todo o código-fonte do projeto está **disponível gratuitamente** nos repositórios do projeto (ver seção de instalação) e sob licença livre **GPL v3.0**, promovendo transparência, reprodutibilidade científica e possível reutilização educacional.
