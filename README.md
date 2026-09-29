# Sistema de Reservas Deportivas

Sistema web de reservas para espacios deportivos desarrollado con Astro, Prisma y PostgreSQL, con autenticación JWT, roles, disponibilidad en tiempo real y panel administrativo.

**Astro 7 · Prisma ORM · PostgreSQL (Neon) · JWT · bcrypt · REST API**

## Funcionalidades

- Consulta de espacios y disponibilidad por fecha y horario.
- Creación, seguimiento y cancelación de reservas.
- Registro e inicio de sesión con contraseñas cifradas mediante bcrypt.
- Autenticación JWT y autorización por roles de usuario y administrador.
- Panel administrativo para gestionar reservas, espacios y bloqueos.
- Validación de horarios pasados, solapamientos y franjas no disponibles.
- API REST para autenticación, espacios, reservas y bloqueos.

## Arquitectura

La aplicación utiliza Astro en modo servidor con el adaptador Node. Las páginas y los endpoints REST se encuentran en `proyecto-reservas/src/pages`, mientras que Prisma gestiona PostgreSQL, sus migraciones y los datos iniciales. La configuración incluida permite desplegar el servidor en Render y usar una base de datos de Neon.

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

Requisitos: Node.js 22.12 o superior, npm y una base de datos PostgreSQL.

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

Reemplaza todos los valores ficticios de `.env`. En `DATABASE_URL` usa la cadena de conexión pooled de Neon y conserva `sslmode=require`. `JWT_SECRET` y `SEED_ADMIN_PASSWORD` son obligatorias; esta última define la contraseña del administrador creado por el seed.

Prepara la base de datos e inicia el entorno de desarrollo:

```bash
npm run db:deploy
npm run db:seed
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
| `npm run db:deploy` | Aplica en PostgreSQL las migraciones pendientes |
| `npm run db:seed` | Crea el administrador, espacios y horarios iniciales |
| `npx prisma studio` | Abre el explorador visual de la base de datos |

## Despliegue en Neon y Render

1. Crea un proyecto en [Neon](https://neon.tech/) y copia su connection string pooled. Debe comenzar con `postgresql://` y terminar con `sslmode=require`.
2. En tu `.env` local configura esa URL como `DATABASE_URL`, define `SEED_ADMIN_PASSWORD` y ejecuta una vez `npm run db:deploy` y `npm run db:seed` desde `proyecto-reservas/`.
3. Sube el repositorio a GitHub o GitLab. No subas el archivo `.env`.
4. En Render selecciona **New > Blueprint**, conecta el repositorio y confirma el servicio definido en `render.yaml`.
5. Cuando Render solicite `DATABASE_URL`, pega la misma URL pooled de Neon. `JWT_SECRET` se genera automáticamente mediante el Blueprint.
6. Inicia el despliegue. Render instalará dependencias, aplicará las migraciones, compilará Astro y ejecutará el servidor Node.

No configures `PORT` manualmente en Render; la plataforma lo proporciona al proceso. Si no quieres cargar los datos iniciales, omite el paso local `npm run db:seed`, pero la aplicación no tendrá espacios ni usuario administrador.

## Documentación Técnica

- [Endpoints de la API](API_ENDPOINTS.md)
- [Esquema y modelo de datos](SCHEMA_DOCUMENTACION.md)

## Seguridad

Los secretos y las bases de datos locales no se versionan. La aplicación exige `JWT_SECRET` para firmar y verificar tokens, y el seed exige `SEED_ADMIN_PASSWORD` para crear el usuario administrador sin incluir contraseñas en el código fuente.
