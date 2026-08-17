# Sistema de Reservas Deportivas

Sistema web de reservas para espacios deportivos desarrollado con Astro, Prisma y SQLite, con autenticación JWT, roles, disponibilidad en tiempo real y panel administrativo.

**Astro 5 · Prisma ORM · SQLite · JWT · bcrypt · REST API**

## Funcionalidades

- Consulta de espacios y disponibilidad por fecha y horario.
- Creación, seguimiento y cancelación de reservas.
- Registro e inicio de sesión con contraseñas cifradas mediante bcrypt.
- Autenticación JWT y autorización por roles de usuario y administrador.
- Panel administrativo para gestionar reservas, espacios y bloqueos.
- Validación de horarios pasados, solapamientos y franjas no disponibles.
- API REST para autenticación, espacios, reservas y bloqueos.

## Arquitectura

La aplicación utiliza Astro en modo servidor con un adaptador para Vercel. Las páginas y los endpoints REST se encuentran en `proyecto-reservas/src/pages`, mientras que Prisma gestiona el modelo relacional, las migraciones y el seed sobre SQLite.

```text
proyecto-reservas/
|-- prisma/            # Esquema, migraciones y datos iniciales
|-- public/            # Recursos estáticos
|-- src/
|   |-- components/    # Componentes de interfaz
|   |-- layouts/       # Layouts compartidos
|   |-- lib/           # Autenticación y utilidades
|   `-- pages/         # Vistas y endpoints REST
`-- astro.config.mjs
```

## Instalación

Requisitos: Node.js 18.17.1 o superior y npm.

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>/proyecto-reservas
npm install
```

Crea el archivo de entorno a partir del ejemplo ubicado en la raíz:

```bash
# macOS y Linux
cp ../.env.example .env

# Windows PowerShell
Copy-Item ../.env.example .env
```

Reemplaza todos los valores ficticios de `.env`. `JWT_SECRET` y `SEED_ADMIN_PASSWORD` son obligatorias; esta última define la contraseña del administrador creado por el seed.

Prepara la base de datos e inicia el entorno de desarrollo:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la compilación de producción |
| `npm run preview` | Previsualiza la compilación |
| `npm run test-api` | Ejecuta las comprobaciones de la API |
| `npx prisma studio` | Abre el explorador visual de la base de datos |

## Documentación Técnica

- [Endpoints de la API](API_ENDPOINTS.md)
- [Esquema y modelo de datos](SCHEMA_DOCUMENTACION.md)

## Seguridad

Los secretos y las bases de datos locales no se versionan. La aplicación exige `JWT_SECRET` para firmar y verificar tokens, y el seed exige `SEED_ADMIN_PASSWORD` para crear el usuario administrador sin incluir contraseñas en el código fuente.
