# 🏟️ Sistema de Reservas - API Astro

Sistema completo de gestión de reservas para centros deportivos con Astro, Prisma y SQLite.

## ✅ Endpoints Implementados

### 📋 Espacios
- ✅ **GET** `/api/espacios` - Listar todos los espacios
- ✅ **GET** `/api/espacios/[id]/disponibilidad?fecha=YYYY-MM-DD` - Consultar disponibilidad

### 📅 Reservas
- ✅ **POST** `/api/reservas` - Crear nueva reserva
- ✅ **GET** `/api/reservas` - Listar reservas (con filtros)
- ✅ **GET** `/api/reservas/[id]` - Detalle de reserva
- ✅ **DELETE** `/api/reservas/[id]` - Cancelar reserva

## 🚀 Inicio Rápido

### 1. Configurar Base de Datos

Desde la raíz del proyecto (D:\RESERVA):

```bash
# Crear base de datos y tablas
npx prisma migrate dev

# Poblar con datos iniciales
npx prisma db seed
```

### 2. Iniciar Servidor de Desarrollo

```bash
cd proyecto-reservas
npm run dev
```

El servidor estará disponible en: `http://localhost:4321`

### 3. Probar los Endpoints

```bash
npm run test-api
```

## 📊 Datos de Prueba

### Usuario Admin
- **ID**: 1
- **Email**: admin@deportivo.com
- **Password**: admin123

### Espacios: 8 espacios deportivos
### Horarios: Lunes-Viernes 6:00-23:00, Sábado 7:00-22:00, Domingo 8:00-20:00

## 📚 Documentación Completa

Ver [API_ENDPOINTS.md](../API_ENDPOINTS.md) para documentación detallada de todos los endpoints.

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run test-api`        | Test all API endpoints                           |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
