// POST /api/reservas.js
// Crea una nueva reserva validando disponibilidad

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Valida que no existan conflictos de horario
 */
async function validarDisponibilidad(espacioId, fecha, horaInicio, horaFin) {
  // Convertir fecha string a DateTime para consultas
  const fechaInicio = new Date(fecha + 'T00:00:00');
  const fechaFin = new Date(fecha + 'T23:59:59.999');
  
  // Verificar reservas existentes
  const reservaExistente = await prisma.reserva.findFirst({
    where: {
      espacioId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      horaInicio,
      estado: {
        in: ['pendiente', 'confirmada'],
      },
    },
  });

  if (reservaExistente) {
    return {
      disponible: false,
      motivo: 'Ya existe una reserva para este horario',
    };
  }

  // Verificar horarios bloqueados

  const bloqueos = await prisma.horarioBloqueado.findMany({
    where: {
      espacioId,
      activo: true,
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
  });

  for (const bloqueo of bloqueos) {
    if (bloqueo.todoElDia) {
      return {
        disponible: false,
        motivo: `Espacio bloqueado: ${bloqueo.motivo}`,
      };
    }

    // Verificar conflicto de horarios
    const conflicto =
      (horaInicio >= bloqueo.horaInicio && horaInicio < bloqueo.horaFin) ||
      (horaFin > bloqueo.horaInicio && horaFin <= bloqueo.horaFin) ||
      (horaInicio <= bloqueo.horaInicio && horaFin >= bloqueo.horaFin);

    if (conflicto) {
      return {
        disponible: false,
        motivo: `Horario bloqueado: ${bloqueo.motivo}`,
      };
    }
  }

  return { disponible: true };
}

/**
 * Valida que el horario esté dentro del horario de operación
 */
async function validarHorarioOperacion(espacioId, fecha, horaInicio, horaFin) {
  const fechaObj = new Date(fecha + 'T00:00:00.000Z');
  const diaSemana = fechaObj.getUTCDay();

  const horario = await prisma.horario.findFirst({
    where: {
      espacioId,
      diaSemana,
      activo: true,
    },
  });

  if (!horario) {
    return {
      valido: false,
      motivo: 'El espacio no opera en este día',
    };
  }

  if (horaInicio < horario.horaApertura || horaFin > horario.horaCierre) {
    return {
      valido: false,
      motivo: `Horario fuera de operación. El espacio opera de ${horario.horaApertura} a ${horario.horaCierre}`,
    };
  }

  return { valido: true, horario };
}

/**
 * Calcula el monto a pagar basado en la duración
 */
function calcularMonto(espacio, horaInicio, horaFin) {
  const [inicioH, inicioM] = horaInicio.split(':').map(Number);
  const [finH, finM] = horaFin.split(':').map(Number);

  const minutosInicio = inicioH * 60 + inicioM;
  const minutosFin = finH * 60 + finM;
  const duracionMinutos = minutosFin - minutosInicio;

  const horas = Math.floor(duracionMinutos / 60);
  const minutosRestantes = duracionMinutos % 60;

  let monto = horas * espacio.precioHora;

  if (minutosRestantes > 0 && espacio.precioMedia) {
    monto += espacio.precioMedia;
  } else if (minutosRestantes > 0) {
    // Si no tiene precio media hora, cobrar hora completa
    monto += espacio.precioHora;
  }

  return monto;
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { usuarioId, espacioId, fecha, horaInicio, horaFin, observaciones } = body;

    // Validaciones de campos requeridos
    if (!usuarioId || !espacioId || !fecha || !horaInicio || !horaFin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos',
          campos: {
            usuarioId: 'requerido',
            espacioId: 'requerido',
            fecha: 'requerido (formato: YYYY-MM-DD)',
            horaInicio: 'requerido (formato: HH:MM)',
            horaFin: 'requerido (formato: HH:MM)',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar formato de fecha
    const fechaObj = new Date(fecha + 'T00:00:00');
    if (isNaN(fechaObj.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de fecha inválido. Use YYYY-MM-DD',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar que no sea una fecha pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(fechaObj);
    fechaReserva.setHours(0, 0, 0, 0);
    if (fechaReserva < hoy) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se pueden crear reservas en fechas pasadas',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar que horaFin sea mayor que horaInicio
    if (horaFin <= horaInicio) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La hora de fin debe ser posterior a la hora de inicio',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) },
    });

    if (!usuario) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!usuario.activo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario inactivo',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que el espacio existe y está activo
    const espacio = await prisma.espacio.findUnique({
      where: { id: parseInt(espacioId) },
    });

    if (!espacio) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Espacio no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!espacio.activo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El espacio no está disponible',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar horario de operación
    const validacionHorario = await validarHorarioOperacion(
      parseInt(espacioId),
      fecha,
      horaInicio,
      horaFin
    );

    if (!validacionHorario.valido) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validacionHorario.motivo,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar disponibilidad
    const validacion = await validarDisponibilidad(
      parseInt(espacioId),
      fecha,
      horaInicio,
      horaFin
    );

    if (!validacion.disponible) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validacion.motivo,
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Calcular monto
    const montoPagado = calcularMonto(espacio, horaInicio, horaFin);

    // Crear la reserva en estado pendiente (requiere aprobación del admin)
    const reserva = await prisma.reserva.create({
      data: {
        usuarioId: parseInt(usuarioId),
        espacioId: parseInt(espacioId),
        fecha: fechaObj,
        horaInicio,
        horaFin,
        estado: 'pendiente',
        montoPagado,
        observaciones: observaciones || null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
      },
    });

    // Formatear fecha para evitar problemas de zona horaria
    const reservaFormateada = {
      ...reserva,
      fecha: reserva.fecha instanceof Date 
        ? reserva.fecha.toISOString().split('T')[0] 
        : reserva.fecha
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reserva creada exitosamente',
        data: reservaFormateada,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al crear reserva:', error);

    // Manejar error de constraint único (reserva duplicada)
    if (error.code === 'P2002') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ya existe una reserva para este espacio, fecha y hora',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al crear la reserva',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// GET /api/reservas.js
// Lista reservas (filtrado por usuario o todas para admin)
export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get('usuarioId');
    const estado = url.searchParams.get('estado');
    const espacioId = url.searchParams.get('espacioId');
    const fecha = url.searchParams.get('fecha');

    const where = {};

    if (usuarioId) {
      where.usuarioId = parseInt(usuarioId);
    }

    if (estado) {
      where.estado = estado;
    }

    if (espacioId) {
      where.espacioId = parseInt(espacioId);
    }

    if (fecha) {
      const fechaObj = new Date(fecha + 'T00:00:00.000Z');
      where.fecha = fechaObj;
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precioHora: true,
          },
        },
      },
      orderBy: [
        { fecha: 'asc' },
        { horaInicio: 'asc' },
      ],
    });

    // Formatear fechas para evitar problemas de zona horaria
    const reservasFormateadas = reservas.map(reserva => ({
      ...reserva,
      fecha: reserva.fecha instanceof Date 
        ? reserva.fecha.toISOString().split('T')[0] 
        : reserva.fecha
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: reservasFormateadas,
        count: reservasFormateadas.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al listar reservas:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener las reservas',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
