# 🏥 CLINIC PRO

Sistema moderno de gestión clínica y administrativa desarrollado con:

* React + Vite + TailwindCSS
* Node.js + Express + TypeScript
* Supabase PostgreSQL
* JWT Authentication
* Docker + Docker Compose

---

# ✨ Características

## 🔐 Seguridad

* Autenticación JWT
* Access Token + Refresh Token
* Refresh Token Rotation
* Middleware de autenticación
* RBAC (Role-Based Access Control)
* Contraseñas cifradas con bcrypt
* Validaciones backend con Zod
* Protección OWASP básica

---

## 👨‍⚕️ Gestión Clínica

* Gestión de usuarios
* Gestión de pacientes
* Gestión de médicos
* Gestión de citas
* Historial clínico
* Roles:

  * Administrador
  * Médico
  * Recepcionista

---

## 🎨 Frontend

* Dashboard moderno
* Diseño premium estilo SaaS médico
* Dark mode
* Responsive UI
* TailwindCSS
* React Router
* React Query
* Radix UI

---

# 🧱 Arquitectura

```txt
Frontend:
React + Vite + TailwindCSS

Backend:
Node.js + Express + TypeScript

Database:
Supabase PostgreSQL

Infrastructure:
Docker + Docker Compose
```

---

# 📂 Estructura del Proyecto

```txt
ClinicPRO/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── utils/
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

# ⚙️ Instalación Local

## 1. Clonar repositorio

```bash
git clone https://github.com/YumiNina/ClinicPRO.git
```

---

## 2. Entrar al proyecto

```bash
cd ClinicPRO
```

---

# 🐳 Docker

## Levantar el proyecto

```bash
docker compose up --build
```

---

## Detener contenedores

```bash
docker compose down
```

---

# 🔑 Variables de Entorno

## Backend `.env`

```env
PORT=3001
NODE_ENV=development

FRONTEND_URL=http://localhost:5174

JWT_ACCESS_SECRET=clinicpro_access_secret_2026
JWT_REFRESH_SECRET=clinicpro_refresh_secret_2026

ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

---

# 🗄️ Base de Datos

La aplicación utiliza Supabase PostgreSQL.

## Tablas principales

* usuarios
* sesiones
* pacientes
* citas
* clinicas
* especialidades
* consultas_medicas
* expedientes_clinicos

---

# 🔐 Endpoints Auth

## Register

```http
POST /api/auth/register
```

---

## Login

```http
POST /api/auth/login
```

---

## Refresh Token

```http
POST /api/auth/refresh
```

---

## Logout

```http
POST /api/auth/logout
```

---

## Perfil Usuario

```http
GET /api/auth/me
```

---

# 🔒 Seguridad Implementada

## Contraseñas

* bcrypt
* Cost factor 10
* No se almacenan contraseñas en texto plano

---

## JWT

* Access Token corto
* Refresh Token largo
* Rotación de refresh token
* Sesiones revocables

---

## Validaciones

* Validación backend con Zod
* Validación SQL con CHECK constraints
* Emails válidos
* Contraseñas seguras
* Roles controlados

---

# 🎨 UI/UX

CLINIC PRO utiliza:

* TailwindCSS
* Dark Medical Theme
* Glassmorphism
* Responsive Layout
* Dashboard Premium

---

# 🚀 Tecnologías

## Frontend

* React 18
* Vite
* TailwindCSS
* React Router
* React Query
* Axios
* Radix UI
* Lucide Icons

---

## Backend

* Node.js
* Express
* TypeScript
* JWT
* bcrypt
* Zod

---

## Database

* Supabase
* PostgreSQL

---

## DevOps

* Docker
* Docker Compose

---

# 📌 Estado del Proyecto

## Implementado

* Auth JWT
* Refresh Tokens
* Docker
* Supabase
* Roles
* Middleware
* Diseño premium
* Seguridad base

---

## En Desarrollo

* Google OAuth
* Dashboard avanzado
* Gestión completa de citas
* Notificaciones
* Reportes clínicos
* Calendario médico

---

# 👩‍💻 Autor

Desarrollado por:

**Mayumi Nina**

Proyecto académico y profesional de gestión clínica moderna.
