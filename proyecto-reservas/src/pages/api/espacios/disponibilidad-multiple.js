// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ url }) {
  try {
    const fecha = url.searchParams.get('fecha') || new Date().toISOString().split('T')[0];
    
    // Obtener todos los espacios
    const espacios = await prisma.espacio.findMany({
      where: { activo: true }
    });

    // Obtener fecha y día de la semana
    const fechaObj = new Date(fecha + 'T12:00:00');
    const diaSemana = fechaObj.getDay();

    // Calcular disponibilidad para todos los espacios en paralelo
    const resultados = await Promise.all(espacios.map(async (espacio) => {
      // Obtener horario de operación
      const horario = await prisma.horario.findFirst({
        where: {
          espacioId: espacio.id,
          diaSemana: diaSemana
        }
      });

      if (!horario) {
        return {
          espacioId: espacio.id,
          disponibles: 0
        };
      }

      // Generar slots
      const slots = [];
      const [horaApertura, minApertura] = horario.horaApertura.split(':').map(Number);
      const [horaCierre, minCierre] = horario.horaCierre.split(':').map(Number);
      const minutosApertura = horaApertura * 60 + minApertura;
      const minutosCierre = horaCierre * 60 + minCierre;

      for (let minutos = minutosApertura; minutos < minutosCierre; minutos += horario.intervalo) {
        const horaInicio = Math.floor(minutos / 60);
        const minInicio = minutos % 60;
        const minutosFin = minutos + horario.intervalo;
        const horaFin = Math.floor(minutosFin / 60);
        const minFin = minutosFin % 60;

        const horaInicioStr = `${String(horaInicio).padStart(2, '0')}:${String(minInicio).padStart(2, '0')}`;
        const horaFinStr = `${String(horaFin).padStart(2, '0')}:${String(minFin).padStart(2, '0')}`;

        slots.push({
          horaInicio: horaInicioStr,
          horaFin: horaFinStr
        });
      }

      // Verificar reservas existentes
      const reservas = await prisma.reserva.findMany({
        where: {
          espacioId: espacio.id,
          fecha: new Date(fecha + 'T12:00:00'),
          estado: { in: ['confirmada', 'pendiente'] }
        }
      });

      // Contar slots disponibles
      let disponibles = 0;
      for (const slot of slots) {
        const tieneReserva = reservas.some(r => {
          const reservaInicio = r.horaInicio;
          const reservaFin = r.horaFin;
          return (slot.horaInicio >= reservaInicio && slot.horaInicio < reservaFin) ||
                 (slot.horaFin > reservaInicio && slot.horaFin <= reservaFin);
        });
        if (!tieneReserva) disponibles++;
      }

      return {
        espacioId: espacio.id,
        disponibles
      };
    }));

    // Convertir a objeto para búsqueda rápida
    const disponibilidadMap = {};
    resultados.forEach(r => {
      disponibilidadMap[r.espacioId] = r.disponibles;
    });

    return new Response(JSON.stringify({
      success: true,
      data: disponibilidadMap
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener disponibilidad múltiple:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener disponibilidad'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
