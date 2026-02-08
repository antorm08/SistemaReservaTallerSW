// GET /api/auth/me.js
// Obtiene el usuario autenticado actual

import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../../lib/auth.js';

const prisma = new PrismaClient();

export async function GET({ request }) {
  try {
    const authUser = requireAuth(request);
    
    // Si requireAuth retorna una Response (error), la retornamos
    if (authUser instanceof Response) {
      return authUser;
    }

    // Obtener datos completos del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        dni: true,
        direccion: true,
        fechaNacimiento: true,
        rol: true,
        activo: true,
        emailVerificado: true,
        createdAt: true,
        updatedAt: true,
      },
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

    return new Response(
      JSON.stringify({
        success: true,
        data: usuario,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener información del usuario',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
