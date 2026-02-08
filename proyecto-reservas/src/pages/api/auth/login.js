// POST /api/auth/login.js
// Inicia sesión de usuario

import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken } from '../../../lib/auth.js';

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validaciones
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email y contraseña son requeridos',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario inactivo. Contacte al administrador.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar contraseña
    const passwordMatch = await comparePassword(password, usuario.password);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generar token
    const token = generateToken(usuario);

    // Retornar usuario sin la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          usuario: usuarioSinPassword,
          token,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error('Error en login:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al iniciar sesión',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
