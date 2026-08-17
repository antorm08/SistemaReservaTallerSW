# Schema del Sistema de Reservas

## 📊 Modelo de Datos

### 1. USUARIO
Gestiona los usuarios del sistema (clientes y administradores).

**Campos principales:**
- `email` (único) - Correo electrónico de autenticación
- `password` - Hash bcrypt de la contraseña
- `nombre`, `apellido` - Datos personales
- `telefono`, `dni` (único) - Datos de contacto
- `rol` - "usuario" | "admin"
- `activo` - Estado de la cuenta
- `emailVerificado` - Confirmación de email

**Relaciones:**
- 1 Usuario → N Reservas

---

### 2. ESPACIO
Representa los espacios deportivos disponibles para reservar.

**Tipos disponibles:**
- `futbol5` - Cancha de fútbol 5
- `futbol7` - Cancha de fútbol 7
- `futbol11` - Cancha de fútbol 11
- `basquet` - Cancha de básquetbol
- `voley` - Cancha de vóley
- `piscina` - Piscina
- `gimnasio` - Gimnasio

**Campos principales:**
- `nombre` (único) - Identificador del espacio
- `descripcion` - Descripción detallada
- `capacidad` - Capacidad máxima de personas
- `precioHora` - Precio por hora completa
- `precioMedia` - Precio por media hora (opcional)

**Características:**
- `techado` - Si el espacio está techado
- `iluminacion` - Si tiene iluminación nocturna
- `vestuarios` - Si cuenta con vestuarios
- `estacionamiento` - Si tiene estacionamiento

**Relaciones:**
- 1 Espacio → N Horarios (horarios de operación)
- 1 Espacio → N Reservas
- 1 Espacio → N HorariosBloquados

---

### 3. HORARIO
Define los horarios de operación de cada espacio por día de la semana.

**Campos principales:**
- `diaSemana` - 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
- `horaApertura` - Hora de apertura (formato "HH:MM")
- `horaCierre` - Hora de cierre (formato "HH:MM")
- `intervalo` - Duración de cada turno en minutos (ej: 60)
- `activo` - Si el horario está activo

**Ejemplo:**
```javascript
// Lunes a Viernes: 6:00 AM - 11:00 PM con turnos de 1 hora
{
  espacioId: 1,
  diaSemana: 1, // Lunes
  horaApertura: "06:00",
  horaCierre: "23:00",
  intervalo: 60,
  activo: true
}
```

**Constraint único:** `[espacioId, diaSemana]` - Un solo horario por día para cada espacio

---

### 4. RESERVA
Registra las reservas realizadas por los usuarios.

**Estados posibles:**
- `pendiente` - Reserva creada pero no confirmada
- `confirmada` - Reserva confirmada (estado por defecto)
- `cancelada` - Reserva cancelada
- `completada` - Reserva finalizada exitosamente
- `no_asistio` - Usuario no se presentó

**Campos principales:**
- `fecha` - Fecha de la reserva
- `horaInicio` - Hora de inicio (formato "HH:MM")
- `horaFin` - Hora de finalización (formato "HH:MM")
- `estado` - Estado actual de la reserva
- `pagado` - Si el pago fue realizado
- `montoPagado` - Monto abonado
- `metodoPago` - "efectivo" | "tarjeta" | "transferencia"
- `observaciones` - Notas adicionales
- `motivoCancelacion` - Razón de cancelación
- `canceladoPor` - "usuario" | "admin" | "sistema"

**Relaciones:**
- N Reservas → 1 Usuario
- N Reservas → 1 Espacio

**Constraint único:** `[espacioId, fecha, horaInicio]` - No se permiten reservas duplicadas

---

### 5. HORARIO_BLOQUEADO
Gestiona bloqueos de horarios por mantenimiento, eventos especiales, etc.

**Tipos de bloqueo:**
- `mantenimiento` - Mantenimiento programado
- `evento_especial` - Evento privado
- `feriado` - Día feriado
- `clima` - Condiciones climáticas adversas
- `otro` - Otros motivos

**Campos principales:**
- `fechaInicio` - Fecha de inicio del bloqueo
- `fechaFin` - Fecha de fin del bloqueo
- `horaInicio` - Hora de inicio (formato "HH:MM")
- `horaFin` - Hora de fin (formato "HH:MM")
- `tipo` - Tipo de bloqueo
- `motivo` - Descripción detallada
- `todoElDia` - Si el bloqueo aplica todo el día
- `createdBy` - Email del admin que creó el bloqueo

**Relaciones:**
- N HorariosBloqueados → 1 Espacio

---

## 🔗 Diagrama de Relaciones

```
Usuario (1) ────────< (N) Reserva (N) >──────── (1) Espacio
                                                       │
                                                       ├─< (N) Horario
                                                       │
                                                       └─< (N) HorarioBloqueado
```

---

## 🎯 Reglas de Negocio Implementadas

### Prevención de Duplicados
- **Constraint único en Reserva**: No se permite crear dos reservas para el mismo espacio, fecha y hora de inicio
- **Índices únicos**: Usuario.email, Usuario.dni, Espacio.nombre

### Cascada de Eliminación
- Al eliminar un Usuario, se eliminan todas sus Reservas
- Al eliminar un Espacio, se eliminan todos sus Horarios, Reservas y HorariosBloquados

### Validación de Horarios
- Los horarios se definen por día de semana
- Cada espacio puede tener diferentes horarios para cada día
- Los intervalos determinan la duración mínima de cada turno

### Estados de Reserva
1. **Flujo normal**: pendiente → confirmada → completada
2. **Cancelación**: cualquier estado → cancelada
3. **No asistencia**: confirmada → no_asistio

---

## 📝 Datos de Seed

### Usuario Admin
- **Email**: admin@deportivo.com
- **Password**: definida mediante `SEED_ADMIN_PASSWORD` y almacenada como hash bcrypt
- **Rol**: admin

### Espacios Creados (8)
1. Cancha Fútbol 5 - A (techada)
2. Cancha Fútbol 5 - B (al aire libre)
3. Cancha Fútbol 7
4. Cancha Fútbol 11 (con tribunas)
5. Cancha Básquet (techada)
6. Cancha Vóley (arena)
7. Piscina Olímpica (temperada)
8. Gimnasio Principal

### Horarios de Operación
- **Lunes a Viernes**: 6:00 AM - 11:00 PM
- **Sábado**: 7:00 AM - 10:00 PM  
- **Domingo**: 8:00 AM - 8:00 PM
- **Turnos**: 1 hora (60 minutos)

---

## 🚀 Próximos Pasos

### Semana 1: API Endpoints
- Autenticación (register, login, logout)
- Gestión de espacios (listar, detalle, disponibilidad)
- Gestión de reservas (crear, listar, cancelar)

### Consideraciones de Seguridad
- Implementar hash de contraseñas con bcrypt
- Validar JWT en endpoints protegidos
- Validar permisos de admin
- Sanitizar inputs para prevenir SQL injection
