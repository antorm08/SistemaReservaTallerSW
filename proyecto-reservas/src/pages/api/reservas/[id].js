// GET, DELETE, PATCH /api/reservas/[id].js
// Obtiene detalle, cancela o actualiza una reserva

export const prerender = false;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - Actualizar estado de reserva
export async function PATCH({ params, request }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { estado } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de reserva requerido',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!estado) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Estado es requerido',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar estado válido
    const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'];
    if (!estadosValidos.includes(estado)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Estado inválido',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar y actualizar reserva
    const reserva = await prisma.reserva.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: {
        espacio: { select: { id: true, nombre: true, tipo: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
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
        message: 'Estado actualizado exitosamente',
        data: reservaFormateada,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al actualizar estado de reserva',
        message: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE - Cancelar reserva
export async function DELETE({ params, request }) {
  try {
    const { id } = params;
    
    // Leer datos desde el body o desde query params
    let motivoCancelacion = null;
    let canceladoPor = null;
    
    try {
      const body = await request.json();
      motivoCancelacion = body.motivoCancelacion || null;
      canceladoPor = body.canceladoPor || null;
    } catch (e) {
      // Si no hay body, intentar query params (retrocompatibilidad)
      const url = new URL(request.url);
      motivoCancelacion = url.searchParams.get('motivo') || null;
      canceladoPor = url.searchParams.get('canceladoPor') || null;
    }

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de reserva requerido',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar la reserva
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
      include: {
        espacio: true,
        usuario: true,
      },
    });

    if (!reserva) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Reserva no encontrada',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar que la reserva no esté ya cancelada
    if (reserva.estado === 'cancelada') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La reserva ya está cancelada',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar que la reserva no esté completada
    if (reserva.estado === 'completada') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se puede cancelar una reserva completada',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar que el usuario es dueño de la reserva o es admin
    // Obtener usuario del token si existe
    let usuarioAutenticado = null;
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        const { verifyToken } = await import('../../../lib/auth.js');
        usuarioAutenticado = verifyToken(token);
      }
    } catch (e) {
      // Si no hay token válido, continuamos sin usuario autenticado
    }

    // Si hay canceladoPor especificado en el body, validar permisos
    const esAdmin = usuarioAutenticado && usuarioAutenticado.rol === 'admin';
    const esDueno = usuarioAutenticado && usuarioAutenticado.id === reserva.usuarioId;
    
    if (!esAdmin && !esDueno) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No tienes permisos para cancelar esta reserva',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Actualizar la reserva a cancelada
    const reservaActualizada = await prisma.reserva.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'cancelada',
        motivoCancelacion: motivoCancelacion || 'Sin motivo especificado',
        canceladoPor,
        canceladaAt: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
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
      ...reservaActualizada,
      fecha: reservaActualizada.fecha instanceof Date 
        ? reservaActualizada.fecha.toISOString().split('T')[0] 
        : reservaActualizada.fecha
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reserva cancelada exitosamente',
        data: reservaFormateada,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al cancelar la reserva',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// GET /api/reservas/[id].js
// Obtiene el detalle de una reserva específica
export async function GET({ params }) {
  try {
    const { id } = params;

    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        espacio: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            tipo: true,
            capacidad: true,
            precioHora: true,
            precioMedia: true,
          },
        },
      },
    });

    if (!reserva) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Reserva no encontrada',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
        data: reservaFormateada,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener la reserva',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
