# Backend - Sistema de Gestión de Laboratorio

API REST para el sistema de gestión de laboratorio construida con Node.js, Express y TiDB Cloud.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### 1. Instalar Dependencias
```bash
npm install

# ----------------------------

# Desarrollo con nodemon (recarga automática)
npm run dev

# Producción
npm start

# -------------------

🗄️ Base de Datos - TiDB Cloud
La aplicación utiliza TiDB Cloud como base de datos, lo que ofrece:

✅ Base de datos siempre activa - No requiere instalación local

✅ Alta disponibilidad - 99.99% uptime garantizado

✅ Escalabilidad automática - Crece con la demanda

✅ Respaldos automáticos - Datos siempre seguros

✅ Compatible con MySQL - Usa drivers estándar

No es necesario:

❌ Instalar MySQL localmente

❌ Crear manualmente la base de datos

❌ Ejecutar scripts de inicialización

❌ Gestionar respaldos manuales

🛠️ Tecnologías
Runtime: Node.js

Framework: Express.js

Base de datos: TiDB Cloud (MySQL compatible)

Autenticación: JWT

Desarrollo: Nodemon para recarga automática

Variables de entorno: dotenv

🔐 Seguridad
Autenticación JWT

Validación de roles (Superadmin, Administrador, Auxiliar)

CORS configurado

Sanitización de datos

