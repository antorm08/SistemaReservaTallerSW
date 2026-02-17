// GET /api/espacios.js
// Lista todos los espacios deportivos activos con sus características

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const prerender = false;

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const tipo = url.searchParams.get('tipo');
    const activo = url.searchParams.get('activo');

    // Construir filtros dinámicos
    const where = {};
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    // Filtro de activo: 'all' = todos, 'true' = solo activos, 'false' = solo inactivos
    if (activo === 'all') {
      // No agregar filtro, mostrar todos
    } else if (activo !== null && activo !== undefined) {
      where.activo = activo === 'true';
    } else {
      // Por defecto, solo espacios activos
      where.activo = true;
    }

    // Obtener espacios con sus horarios
    const espacios = await prisma.espacio.findMany({
      where,
      include: {
        horarios: {
          where: { activo: true },
          orderBy: { diaSemana: 'asc' },
        },
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: espacios,
        count: espacios.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al listar espacios:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener los espacios',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * POST /api/espacios
 * Crear un nuevo espacio deportivo (solo admin)
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
          error: 'No tienes permisos para crear espacios',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      tipo,
      capacidad,
      precioHora,
      precioMedia,
      techado,
      iluminacion,
      vestuarios,
      estacionamiento,
      orden,
    } = body;

    // Validaciones
    if (!nombre || !tipo || !capacidad || !precioHora) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan campos requeridos: nombre, tipo, capacidad, precioHora',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar tipo de espacio
    const tiposValidos = ['futbol5', 'futbol7', 'futbol11', 'basquet', 'voley', 'piscina', 'gimnasio'];
    if (!tiposValidos.includes(tipo)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Crear espacio
    const espacio = await prisma.espacio.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        tipo,
        capacidad: parseInt(capacidad),
        precioHora: parseFloat(precioHora),
        precioMedia: precioMedia ? parseFloat(precioMedia) : null,
        techado: Boolean(techado),
        iluminacion: Boolean(iluminacion),
        vestuarios: Boolean(vestuarios),
        estacionamiento: Boolean(estacionamiento),
        orden: orden ? parseInt(orden) : 0,
        activo: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Espacio creado exitosamente',
        data: espacio,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al crear espacio:', error);
    
    // Manejar error de nombre duplicado
    if (error.code === 'P2002') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ya existe un espacio con ese nombre',
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
        error: 'Error al crear el espacio',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
