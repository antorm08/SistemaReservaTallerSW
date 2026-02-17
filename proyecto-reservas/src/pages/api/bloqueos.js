// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const prerender = false;

/**
 * GET /api/bloqueos
 * Lista todos los bloqueos de horarios
 * Query params:
 * - espacioId: filtrar por espacio
 * - activo: filtrar por estado activo
 * - fecha: filtrar bloqueos que afecten esta fecha
 */
export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const espacioId = url.searchParams.get('espacioId');
    const activo = url.searchParams.get('activo');
    const fecha = url.searchParams.get('fecha');

    const where = {};

    if (espacioId) {
      where.espacioId = parseInt(espacioId);
    }

    if (activo !== null && activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Filtrar por fecha si se proporciona
    if (fecha) {
      const fechaObj = new Date(fecha);
      fechaObj.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.fechaInicio = { lte: fechaFin };
      where.fechaFin = { gte: fechaObj };
    }

    const bloqueos = await prisma.horarioBloqueado.findMany({
      where,
      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
      },
      orderBy: [
        { fechaInicio: 'desc' },
        { horaInicio: 'asc' },
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: bloqueos,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al obtener bloqueos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener bloqueos',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/bloqueos
 * Crear un nuevo bloqueo de horario
 * Body:
 * - espacioId: ID del espacio
 * - fechaInicio: fecha de inicio del bloqueo
 * - fechaFin: fecha de fin del bloqueo
 * - horaInicio: hora de inicio (si no es todo el día)
 * - horaFin: hora de fin (si no es todo el día)
 * - todoElDia: boolean, si el bloqueo es todo el día
 * - motivo: razón del bloqueo
 */
export async function POST({ request }) {
  try {
    // Verificar autenticación y rol de admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { verifyToken } = await import('../../lib/auth.js');
    let usuario;
    try {
      usuario = verifyToken(token);
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que sea admin
    if (usuario.rol !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No tienes permisos para crear bloqueos',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const {
      espacioId,
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      todoElDia,
      motivo,
    } = body;
    
    console.log('📥 Datos recibidos:', { espacioId, fechaInicio, fechaFin, horaInicio, horaFin, todoElDia, motivo });

    // Validaciones
    if (!espacioId || !fechaInicio || !fechaFin || !motivo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: espacioId, fechaInicio, fechaFin, motivo',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar que el espacio existe
    const espacio = await prisma.espacio.findUnique({
      where: { id: parseInt(espacioId) },
    });

    if (!espacio) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El espacio no existe',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar fechas
    const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
    const fechaFinObj = new Date(fechaFin + 'T23:59:59');

    if (fechaFinObj < fechaInicioObj) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La fecha de fin no puede ser anterior a la fecha de inicio',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Si no es todo el día, validar horarios
    if (!todoElDia) {
      if (!horaInicio || !horaFin) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Se requieren horaInicio y horaFin si no es todo el día',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

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
    }

    // Crear bloqueo
    const bloqueo = await prisma.horarioBloqueado.create({
      data: {
        espacioId: parseInt(espacioId),
        fechaInicio: fechaInicioObj,
        fechaFin: fechaFinObj,
        horaInicio: todoElDia ? '00:00' : (horaInicio || '00:00'),
        horaFin: todoElDia ? '23:59' : (horaFin || '23:59'),
        todoElDia: Boolean(todoElDia),
        tipo: 'mantenimiento',
        motivo,
      },
      include: {
        espacio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: bloqueo,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al crear bloqueo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al crear bloqueo',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
