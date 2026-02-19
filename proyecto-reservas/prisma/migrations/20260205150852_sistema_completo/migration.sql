-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "telefono" TEXT,
    "dni" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" DATETIME,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Espacio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precioHora" REAL NOT NULL,
    "precioMedia" REAL,
    "techado" BOOLEAN NOT NULL DEFAULT false,
    "iluminacion" BOOLEAN NOT NULL DEFAULT true,
    "vestuarios" BOOLEAN NOT NULL DEFAULT true,
    "estacionamiento" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "espacioId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaApertura" TEXT NOT NULL,
    "horaCierre" TEXT NOT NULL,
    "intervalo" INTEGER NOT NULL DEFAULT 60,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Horario_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'confirmada',
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "montoPagado" REAL NOT NULL DEFAULT 0,
    "metodoPago" TEXT,
    "observaciones" TEXT,
    "motivoCancelacion" TEXT,
    "canceladoPor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "canceladaAt" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "espacioId" INTEGER NOT NULL,
    CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reserva_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HorarioBloqueado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'mantenimiento',
    "motivo" TEXT NOT NULL,
    "todoElDia" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "espacioId" INTEGER NOT NULL,
    CONSTRAINT "HorarioBloqueado_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_dni_key" ON "Usuario"("dni");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_dni_idx" ON "Usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Espacio_nombre_key" ON "Espacio"("nombre");

-- CreateIndex
CREATE INDEX "Espacio_tipo_idx" ON "Espacio"("tipo");

-- CreateIndex
CREATE INDEX "Espacio_activo_idx" ON "Espacio"("activo");

-- CreateIndex
CREATE INDEX "Horario_espacioId_idx" ON "Horario"("espacioId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_espacioId_diaSemana_key" ON "Horario"("espacioId", "diaSemana");

-- CreateIndex
CREATE INDEX "Reserva_usuarioId_idx" ON "Reserva"("usuarioId");

-- CreateIndex
CREATE INDEX "Reserva_espacioId_idx" ON "Reserva"("espacioId");

-- CreateIndex
CREATE INDEX "Reserva_fecha_idx" ON "Reserva"("fecha");

-- CreateIndex
CREATE INDEX "Reserva_estado_idx" ON "Reserva"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_espacioId_fecha_horaInicio_key" ON "Reserva"("espacioId", "fecha", "horaInicio");

-- CreateIndex
CREATE INDEX "HorarioBloqueado_espacioId_idx" ON "HorarioBloqueado"("espacioId");

-- CreateIndex
CREATE INDEX "HorarioBloqueado_fechaInicio_fechaFin_idx" ON "HorarioBloqueado"("fechaInicio", "fechaFin");
