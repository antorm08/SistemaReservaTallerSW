// GET /api/espacios.js
// Lista todos los espacios deportivos activos con sus características

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    if (activo !== null && activo !== undefined) {
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
