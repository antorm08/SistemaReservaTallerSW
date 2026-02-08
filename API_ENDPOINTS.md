# API Endpoints - Sistema de Reservas

## 📡 Endpoints Disponibles

### 1. Listar Espacios
**GET** `/api/espacios`

Lista todos los espacios deportivos con sus características y horarios de operación.

**Query Parameters:**
- `tipo` (opcional) - Filtrar por tipo de espacio: futbol5, futbol7, futbol11, basquet, voley, piscina, gimnasio
- `activo` (opcional) - Filtrar por estado: true, false (default: true)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Cancha Fútbol 5 - A",
      "descripcion": "Cancha de fútbol 5 con césped sintético...",
      "tipo": "futbol5",
      "capacidad": 10,
      "precioHora": 50,
      "precioMedia": 30,
      "techado": true,
      "iluminacion": true,
      "vestuarios": true,
      "estacionamiento": false,
      "activo": true,
      "orden": 1,
      "horarios": [
        {
          "id": 1,
          "diaSemana": 1,
          "horaApertura": "06:00",
          "horaCierre": "23:00",
          "intervalo": 60,
          "activo": true
        }
      ]
    }
  ],
  "count": 8
}
```

**Ejemplo de uso:**
```javascript
// Listar todos los espacios activos
fetch('/api/espacios')

// Listar solo canchas de fútbol 5
fetch('/api/espacios?tipo=futbol5')
```

---

### 2. Consultar Disponibilidad
**GET** `/api/espacios/[id]/disponibilidad?fecha=YYYY-MM-DD`

Consulta los horarios disponibles para un espacio en una fecha específica.

**Path Parameters:**
- `id` - ID del espacio

**Query Parameters:**
- `fecha` (requerido) - Fecha en formato YYYY-MM-DD

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "espacio": {
      "id": 1,
      "nombre": "Cancha Fútbol 5 - A",
      "tipo": "futbol5",
      "precioHora": 50
    },
    "fecha": "2026-02-10",
    "diaSemana": 1,
    "horarioOperacion": {
      "apertura": "06:00",
      "cierre": "23:00",
      "intervalo": 60
    },
    "slots": [
      {
        "horaInicio": "06:00",
        "horaFin": "07:00",
        "disponible": true,
        "motivo": null
      },
      {
        "horaInicio": "07:00",
        "horaFin": "08:00",
        "disponible": false,
        "motivo": "Reservado"
      },
      {
        "horaInicio": "08:00",
        "horaFin": "09:00",
        "disponible": false,
        "motivo": "Mantenimiento programado"
      }
    ],
    "disponibles": 15,
    "total": 17
  }
}
```

**Errores comunes:**
- **400**: Fecha no proporcionada o formato inválido
- **404**: Espacio no encontrado

**Ejemplo de uso:**
```javascript
// Consultar disponibilidad para hoy
const hoy = new Date().toISOString().split('T')[0];
fetch(`/api/espacios/1/disponibilidad?fecha=${hoy}`)
  .then(res => res.json())
  .then(data => {
    const slotsDisponibles = data.data.slots.filter(s => s.disponible);
    console.log(`Hay ${slotsDisponibles.length} horarios disponibles`);
  });
```

---

### 3. Crear Reserva
**POST** `/api/reservas`

Crea una nueva reserva validando disponibilidad, horarios de operación y bloqueos.

**Body (JSON):**
```json
{
  "usuarioId": 1,
  "espacioId": 1,
  "fecha": "2026-02-10",
  "horaInicio": "14:00",
  "horaFin": "15:00",
  "observaciones": "Reserva para partido amistoso"
}
```

**Validaciones automáticas:**
- ✅ Usuario y espacio existen y están activos
- ✅ Fecha no es pasada
- ✅ Hora fin es posterior a hora inicio
- ✅ Horario está dentro de operación del espacio
- ✅ No existe otra reserva en ese horario
- ✅ No hay bloqueos en ese horario
- ✅ Calcula automáticamente el monto a pagar

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id": 15,
    "fecha": "2026-02-10T00:00:00.000Z",
    "horaInicio": "14:00",
    "horaFin": "15:00",
    "estado": "confirmada",
    "pagado": false,
    "montoPagado": 50,
    "metodoPago": null,
    "observaciones": "Reserva para partido amistoso",
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "email": "admin@deportivo.com"
    },
    "espacio": {
      "id": 1,
      "nombre": "Cancha Fútbol 5 - A",
      "tipo": "futbol5"
    }
  }
}
```

**Errores comunes:**
- **400**: Campos requeridos faltantes, fecha inválida, horario fuera de operación
- **403**: Usuario inactivo
- **404**: Usuario o espacio no encontrado
- **409**: Horario no disponible (reservado o bloqueado)

**Ejemplo de uso:**
```javascript
// Crear una reserva
fetch('/api/reservas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    usuarioId: 1,
    espacioId: 1,
    fecha: '2026-02-10',
    horaInicio: '14:00',
    horaFin: '15:00',
    observaciones: 'Cumpleaños de Juan'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Reserva creada:', data.data.id);
    console.log('Monto a pagar:', data.data.montoPagado);
  }
});
```

---

### 4. Listar Reservas
**GET** `/api/reservas`

Lista reservas con filtros opcionales.

**Query Parameters:**
- `usuarioId` (opcional) - Filtrar por usuario
- `espacioId` (opcional) - Filtrar por espacio
- `estado` (opcional) - Filtrar por estado: pendiente, confirmada, cancelada, completada, no_asistio
- `fecha` (opcional) - Filtrar por fecha (formato: YYYY-MM-DD)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2026-02-10T00:00:00.000Z",
      "horaInicio": "14:00",
      "horaFin": "15:00",
      "estado": "confirmada",
      "montoPagado": 50,
      "usuario": {
        "id": 1,
        "nombre": "Administrador",
        "email": "admin@deportivo.com"
      },
      "espacio": {
        "id": 1,
        "nombre": "Cancha Fútbol 5 - A",
        "tipo": "futbol5"
      }
    }
  ],
  "count": 1
}
```

**Ejemplo de uso:**
```javascript
// Mis reservas
fetch('/api/reservas?usuarioId=1')

// Reservas de hoy
const hoy = new Date().toISOString().split('T')[0];
fetch(`/api/reservas?fecha=${hoy}`)

// Reservas confirmadas de un espacio
fetch('/api/reservas?espacioId=1&estado=confirmada')
```

---

### 5. Detalle de Reserva
**GET** `/api/reservas/[id]`

Obtiene el detalle completo de una reserva específica.

**Path Parameters:**
- `id` - ID de la reserva

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fecha": "2026-02-10T00:00:00.000Z",
    "horaInicio": "14:00",
    "horaFin": "15:00",
    "estado": "confirmada",
    "pagado": false,
    "montoPagado": 50,
    "metodoPago": null,
    "observaciones": "Partido amistoso",
    "motivoCancelacion": null,
    "canceladoPor": null,
    "createdAt": "2026-02-05T15:30:00.000Z",
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "apellido": null,
      "email": "admin@deportivo.com",
      "telefono": "555-0001"
    },
    "espacio": {
      "id": 1,
      "nombre": "Cancha Fútbol 5 - A",
      "descripcion": "Cancha de fútbol 5...",
      "tipo": "futbol5",
      "capacidad": 10,
      "precioHora": 50,
      "precioMedia": 30
    }
  }
}
```

---

### 6. Cancelar Reserva
**DELETE** `/api/reservas/[id]?usuarioId=1&motivo=texto&canceladoPor=usuario`

Cancela una reserva existente.

**Path Parameters:**
- `id` - ID de la reserva

**Query Parameters:**
- `usuarioId` (opcional) - ID del usuario que cancela (validación de permisos)
- `motivo` (opcional) - Motivo de la cancelación
- `canceladoPor` (opcional) - Quién cancela: usuario, admin, sistema (default: usuario)

**Validaciones:**
- ✅ Reserva existe
- ✅ Usuario es dueño de la reserva (si no es admin)
- ✅ Reserva no está ya cancelada
- ✅ Reserva no está completada

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente",
  "data": {
    "id": 1,
    "estado": "cancelada",
    "motivoCancelacion": "Cambio de planes",
    "canceladoPor": "usuario",
    "canceladaAt": "2026-02-05T16:00:00.000Z",
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "email": "admin@deportivo.com"
    },
    "espacio": {
      "id": 1,
      "nombre": "Cancha Fútbol 5 - A",
      "tipo": "futbol5"
    }
  }
}
```

**Errores comunes:**
- **400**: Reserva ya cancelada o completada
- **403**: Sin permisos para cancelar
- **404**: Reserva no encontrada

**Ejemplo de uso:**
```javascript
// Cancelar mi reserva
fetch('/api/reservas/1?usuarioId=1&motivo=Emergencia', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Reserva cancelada exitosamente');
  }
});

// Admin cancela una reserva
fetch('/api/reservas/1?canceladoPor=admin&motivo=Mantenimiento', {
  method: 'DELETE'
})
```

---

## 🔒 Estados de Reserva

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Reserva creada pero no confirmada |
| `confirmada` | Reserva confirmada (estado por defecto) |
| `cancelada` | Reserva cancelada por usuario o admin |
| `completada` | Reserva finalizada exitosamente |
| `no_asistio` | Usuario no se presentó |

---

## 🛡️ Validaciones Implementadas

### Crear Reserva
1. ✅ Todos los campos requeridos presentes
2. ✅ Formato de fecha y horas válido
3. ✅ Fecha no es pasada
4. ✅ Hora fin > hora inicio
5. ✅ Usuario existe y está activo
6. ✅ Espacio existe y está activo
7. ✅ Horario dentro de operación del espacio
8. ✅ No existe reserva duplicada
9. ✅ No hay bloqueos en ese horario
10. ✅ Cálculo automático de monto

### Cancelar Reserva
1. ✅ Reserva existe
2. ✅ Permisos del usuario validados
3. ✅ Estado permite cancelación
4. ✅ Tracking de quién y cuándo canceló

---

## 💡 Ejemplos de Flujos Completos

### Flujo: Usuario hace una reserva

```javascript
// 1. Listar espacios disponibles
const espacios = await fetch('/api/espacios?tipo=futbol5')
  .then(r => r.json());

// 2. Seleccionar un espacio y consultar disponibilidad
const disponibilidad = await fetch(
  `/api/espacios/${espacios.data[0].id}/disponibilidad?fecha=2026-02-10`
).then(r => r.json());

// 3. Encontrar un slot disponible
const slotDisponible = disponibilidad.data.slots.find(s => s.disponible);

// 4. Crear la reserva
const reserva = await fetch('/api/reservas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuarioId: 1,
    espacioId: espacios.data[0].id,
    fecha: '2026-02-10',
    horaInicio: slotDisponible.horaInicio,
    horaFin: slotDisponible.horaFin,
  })
}).then(r => r.json());

console.log('Reserva creada:', reserva.data.id);
console.log('Monto a pagar:', reserva.data.montoPagado);
```

### Flujo: Ver mis reservas y cancelar una

```javascript
// 1. Obtener mis reservas
const misReservas = await fetch('/api/reservas?usuarioId=1')
  .then(r => r.json());

// 2. Filtrar solo las activas
const activas = misReservas.data.filter(
  r => r.estado === 'confirmada' || r.estado === 'pendiente'
);

// 3. Cancelar una reserva
if (activas.length > 0) {
  const resultado = await fetch(
    `/api/reservas/${activas[0].id}?usuarioId=1&motivo=Cambio de planes`,
    { method: 'DELETE' }
  ).then(r => r.json());
  
  console.log('Cancelación:', resultado.message);
}
```

---

## 🚀 Próximos Pasos

1. **Autenticación**: Agregar JWT para proteger endpoints
2. **Permisos**: Validar roles de usuario (usuario/admin)
3. **Notificaciones**: Enviar emails de confirmación y recordatorios
4. **Pagos**: Integrar pasarela de pagos
5. **WebSockets**: Actualización en tiempo real de disponibilidad
