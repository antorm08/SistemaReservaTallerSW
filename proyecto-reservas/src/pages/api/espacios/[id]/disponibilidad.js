// GET /api/espacios/[id]/disponibilidad.js
// Consulta horarios disponibles para un espacio en una fecha específica

export const prerender = false;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera slots de horarios disponibles basados en horarios de operación
 */
function generarSlots(horario, fecha) {
  const slots = [];
  const [horaAperturaH, horaAperturaM] = horario.horaApertura.split(':').map(Number);
  const [horaCierreH, horaCierreM] = horario.horaCierre.split(':').map(Number);
  
  let horaActual = horaAperturaH * 60 + horaAperturaM; // Minutos desde medianoche
  const horaCierreMinutos = horaCierreH * 60 + horaCierreM;
  
  while (horaActual + horario.intervalo <= horaCierreMinutos) {
    const horaInicioH = Math.floor(horaActual / 60);
    const horaInicioM = horaActual % 60;
    const horaFinTotal = horaActual + horario.intervalo;
    const horaFinH = Math.floor(horaFinTotal / 60);
    const horaFinM = horaFinTotal % 60;
    
    const horaInicio = `${String(horaInicioH).padStart(2, '0')}:${String(horaInicioM).padStart(2, '0')}`;
    const horaFin = `${String(horaFinH).padStart(2, '0')}:${String(horaFinM).padStart(2, '0')}`;
    
    slots.push({
      horaInicio,
      horaFin,
      disponible: true,
    });
    
    horaActual += horario.intervalo;
  }
  
  return slots;
}

/**
 * Verifica si una hora está dentro de un rango bloqueado
 */
function estaHoraBloqueada(horaInicio, horaFin, bloqueos) {
  return bloqueos.some(bloqueo => {
    if (bloqueo.todoElDia) return true;
    
    // Comparar strings de hora directamente (formato HH:MM)
    return (
      (horaInicio >= bloqueo.horaInicio && horaInicio < bloqueo.horaFin) ||
      (horaFin > bloqueo.horaInicio && horaFin <= bloqueo.horaFin) ||
      (horaInicio <= bloqueo.horaInicio && horaFin >= bloqueo.horaFin)
    );
  });
}

export async function GET({ params, request }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const fechaStr = url.searchParams.get('fecha');

    if (!fechaStr) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El parámetro "fecha" es requerido (formato: YYYY-MM-DD)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar formato de fecha
    const fecha = new Date(fechaStr + 'T00:00:00.000Z');
    if (isNaN(fecha.getTime())) {
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

    // Verificar que el espacio existe y está activo
    const espacio = await prisma.espacio.findUnique({
      where: { id: parseInt(id) },
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
          error: 'El espacio no está disponible actualmente',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener día de la semana (0 = Domingo, 6 = Sábado)
    const diaSemana = fecha.getUTCDay();

    // Buscar horario de operación para ese día
    const horario = await prisma.horario.findFirst({
      where: {
        espacioId: parseInt(id),
        diaSemana,
        activo: true,
      },
    });

    if (!horario) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            espacio,
            fecha: fechaStr,
            diaSemana,
            slots: [],
            mensaje: 'El espacio no opera en este día',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generar slots de horarios
    let slots = generarSlots(horario, fecha);

    // Obtener reservas existentes para esa fecha
    const reservasExistentes = await prisma.reserva.findMany({
      where: {
        espacioId: parseInt(id),
        fecha,
        estado: {
          in: ['pendiente', 'confirmada'],
        },
      },
      select: {
        horaInicio: true,
        horaFin: true,
      },
    });

    // Obtener horarios bloqueados
    const fechaInicio = new Date(fechaStr + 'T00:00:00.000Z');
    const fechaFin = new Date(fechaStr + 'T23:59:59.999Z');

    const bloqueos = await prisma.horarioBloqueado.findMany({
      where: {
        espacioId: parseInt(id),
        activo: true,
        fechaInicio: { lte: fechaFin },
        fechaFin: { gte: fechaInicio },
      },
      select: {
        horaInicio: true,
        horaFin: true,
        todoElDia: true,
        motivo: true,
        tipo: true,
      },
    });

    // Marcar slots como no disponibles
    const ahora = new Date();
    const esHoy = fechaStr === ahora.toISOString().split('T')[0];
    
    slots = slots.map(slot => {
      // Verificar si el horario ya pasó (solo si es hoy)
      let yaPaso = false;
      if (esHoy) {
        const [horaSlot, minutoSlot] = slot.horaInicio.split(':').map(Number);
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();
        const minutosTotalesSlot = horaSlot * 60 + minutoSlot;
        const minutosTotalesActuales = horaActual * 60 + minutoActual;
        yaPaso = minutosTotalesSlot < minutosTotalesActuales;
      }
      
      // Verificar si está reservado
      const estaReservado = reservasExistentes.some(
        reserva => reserva.horaInicio === slot.horaInicio
      );

      // Verificar si está bloqueado
      const estaBloqueado = estaHoraBloqueada(
        slot.horaInicio,
        slot.horaFin,
        bloqueos
      );

      let motivo = null;
      let disponible = true;
      
      if (yaPaso) {
        disponible = false;
        motivo = 'Horario pasado';
      } else if (estaReservado) {
        disponible = false;
        motivo = 'Reservado';
      } else if (estaBloqueado) {
        disponible = false;
        const bloqueo = bloqueos.find(b =>
          b.todoElDia || estaHoraBloqueada(slot.horaInicio, slot.horaFin, [b])
        );
        motivo = bloqueo?.motivo || 'Bloqueado';
      }

      return {
        ...slot,
        disponible,
        motivo,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          espacio,
          fecha: fechaStr,
          diaSemana,
          horarioOperacion: {
            apertura: horario.horaApertura,
            cierre: horario.horaCierre,
            intervalo: horario.intervalo,
          },
          slots,
          disponibles: slots.filter(s => s.disponible).length,
          total: slots.length,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al consultar disponibilidad',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
