# Sistema de Reservas - Centro Deportivo

Sistema de gestión de reservas para espacios deportivos desarrollado con Astro.js y Prisma.

## 🚀 Características

- **Gestión de Espacios**: Múltiples tipos de espacios deportivos (fútbol 5/7/11, tenis, pádel, etc.)
- **Sistema de Reservas**: Interfaz intuitiva para reservar espacios por fecha y horario
- **Panel de Administración**: Gestión completa de reservas, espacios y bloqueos
- **Autenticación**: Sistema de usuarios con roles (usuario/administrador)
- **Estados de Reserva**: Flujo completo (pendiente → confirmada → completada → cancelada)
- **Horarios Inteligentes**: Validación de horarios pasados y disponibilidad en tiempo real
- **Bloqueos**: Sistema de bloqueo de horarios para mantenimiento u eventos

## 📋 Requisitos Previos

- Node.js 18 o 20
- npm o pnpm

## 🛠️ Instalación

### 1️⃣ Clona el repositorio:
```bash
git clone <tu-repositorio>
cd SistemaReservaTallerSW
cd proyecto-reservas
```

### 2️⃣ Instala las dependencias de la raíz:
```bash
npm install
```

### 3️⃣ Configura las variables de entorno:
```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Linux/Mac (o Git Bash)
cp .env.example .env

Alternativamente usar :

cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="tu-secreto-super-seguro"
PORT=4321
NODE_ENV="development"
EOF
```

**Importante:** Puedes editar el archivo `.env` manualmente y cambiar el `JWT_SECRET` a algo seguro en producción.

### 4️⃣ Configura la base de datos:
```bash
# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones (crea las tablas)
npx prisma migrate dev

```

**Nota:** El seed creará:
- ✅ Usuario administrador
- ✅ 8 espacios deportivos con horarios
- ❌ NO incluye reservas (la BD estará limpia)


### 6️⃣ Inicia el servidor de desarrollo (en la carpeta de proyecto-reservas):
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4321`

### ✅ Verificar la Instalación

1. **Verifica que el servidor esté corriendo:**
   - Abre http://localhost:4321 en tu navegador

2. **Prueba el login:**
   - Usa: `admin@deportivo.com` / `admin123`

3. **Verifica los datos iniciales:**
   ```bash
   # Ver la base de datos con Prisma Studio
   npx prisma studio
   ```
   Deberías ver 8 espacios deportivos y 1 usuario admin.

### ❗ Solución de Problemas Comunes

**Error: "Can't reach database server"**
```bash
# Regenera la base de datos
npx prisma migrate reset
npx prisma db seed
```

**Error: "Module not found"**
```bash
# Reinstala dependencias
rm -rf node_modules
npm install
cd proyecto-reservas
rm -rf node_modules
npm install
```

**Error: "JWT_SECRET is not defined"**
- Asegúrate de haber creado el archivo `.env` en la raíz del proyecto
- Verifica que contenga `JWT_SECRET="tu-secreto-aqui"`

## 🚀 Uso

### Desarrollo

```bash
# Desde la carpeta proyecto-reservas
cd proyecto-reservas
npm run dev
```

El servidor estará disponible en `http://localhost:4321`

### Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
RESERVA/
├── prisma/                 # Esquema y migraciones de base de datos
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── proyecto-reservas/      # Aplicación Astro.js
│   ├── src/
│   │   ├── pages/         # Páginas y API endpoints
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Layouts de página
│   │   ├── lib/          # Utilidades (auth, etc.)
│   │   └── styles/       # Estilos globales
│   └── public/           # Archivos estáticos
└── API_ENDPOINTS.md       # Documentación de API
```

## 🔑 Usuarios por Defecto

Después de ejecutar `npx prisma db seed`:

- **👤 Administrador**: 
  - Email: `admin@deportivo.com`
  - Password: `admin123`
  - Rol: admin

**Importante:** La base de datos se crea vacía (sin reservas). Solo incluye el usuario administrador y los espacios deportivos disponibles. Los usuarios regulares deben registrarse desde la aplicación en `/registro`.

## 💾 Gestión de Datos

### ¿Qué se sincroniza con Git?
- ✅ Código fuente
- ✅ Esquema de base de datos (`schema.prisma`)
- ✅ Migraciones (`migrations/`)
- ✅ Script de inicialización (`seed.js`)

### ¿Qué NO se sincroniza?
- ❌ Base de datos local (`dev.db`)
- ❌ Variables de entorno (`.env`)
- ❌ Archivos de dependencias (`node_modules/`)
- ❌ Reservas o datos de prueba personales

**Resultado:** Cada persona que clone el repositorio tendrá una base de datos limpia con solo los datos iniciales del seed (admin + espacios).

## 🛣️ Rutas Principales

- `/` - Página de inicio con reserva rápida
- `/espacios` - Explorar espacios disponibles
- `/reservar` - Realizar reserva
- `/mis-reservas` - Ver y gestionar mis reservas
- `/admin` - Panel de administración
- `/login` - Iniciar sesión
- `/registro` - Crear cuenta

## 📡 API Endpoints

Ver [API_ENDPOINTS.md](API_ENDPOINTS.md) para documentación completa de la API.

## 🗄️ Base de Datos

El proyecto utiliza SQLite con Prisma ORM. El esquema incluye:

- **Usuario**: Gestión de usuarios y autenticación
- **Espacio**: Espacios deportivos disponibles
- **Reserva**: Sistema de reservas
- **Horario**: Horarios disponibles por espacio
- **HorarioBloqueado**: Bloqueos de horarios

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

Grupo 7

## 🐛 Problemas Conocidos

- El proyecto actualmente usa el modo desarrollo de Astro. Para producción, se necesita configurar un adapter.

## 📞 Soporte

Para reportar problemas o solicitar características, abre un issue en GitHub.
