// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const prerender = false;

/**
 * GET /api/bloqueos/[id]
 * Obtener detalle de un bloqueo
 */
async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop());

    const bloqueo = await prisma.horarioBloqueado.findUnique({
      where: { id },
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

    if (!bloqueo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bloqueo no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: bloqueo,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al obtener bloqueo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener bloqueo',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE /api/bloqueos/[id]
 * Eliminar o desactivar un bloqueo
 */
async function DELETE(request) {
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

    const { verifyToken } = await import('../../../lib/auth.js');
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
          error: 'No tienes permisos para eliminar bloqueos',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop());

    // Verificar que el bloqueo existe
    const bloqueo = await prisma.horarioBloqueado.findUnique({
      where: { id },
    });

    if (!bloqueo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bloqueo no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Desactivar el bloqueo en lugar de eliminarlo
    const bloqueoActualizado = await prisma.horarioBloqueado.update({
      where: { id },
      data: { activo: false },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: bloqueoActualizado,
        message: 'Bloqueo desactivado correctamente',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al eliminar bloqueo',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * PATCH /api/bloqueos/[id]
 * Actualizar un bloqueo
 */
async function PATCH(request) {
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

    const { verifyToken } = await import('../../../lib/auth.js');
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
          error: 'No tienes permisos para actualizar bloqueos',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop());

    const body = await request.json();
    const {
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      todoElDia,
      motivo,
      descripcion,
      activo,
    } = body;

    // Verificar que el bloqueo existe
    const bloqueoExistente = await prisma.horarioBloqueado.findUnique({
      where: { id },
    });

    if (!bloqueoExistente) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bloqueo no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Preparar datos de actualización
    const dataActualizacion = {};

    if (fechaInicio) dataActualizacion.fechaInicio = new Date(fechaInicio);
    if (fechaFin) dataActualizacion.fechaFin = new Date(fechaFin);
    if (horaInicio) dataActualizacion.horaInicio = horaInicio;
    if (horaFin) dataActualizacion.horaFin = horaFin;
    if (todoElDia !== undefined) dataActualizacion.todoElDia = todoElDia;
    if (motivo) dataActualizacion.motivo = motivo;
    if (descripcion !== undefined) dataActualizacion.descripcion = descripcion;
    if (activo !== undefined) dataActualizacion.activo = activo;

    // Actualizar bloqueo
    const bloqueo = await prisma.horarioBloqueado.update({
      where: { id },
      data: dataActualizacion,
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
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al actualizar bloqueo:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al actualizar bloqueo',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export { GET, DELETE, PATCH };
