// POST /api/auth/register.js
// Registra un nuevo usuario

import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '../../../lib/auth.js';

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido, telefono, dni } = body;

    // Validaciones
    if (!email || !password || !nombre) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, contraseña y nombre son requeridos',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de email inválido',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El email ya está registrado',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar DNI si se proporciona
    if (dni) {
      const existingDni = await prisma.usuario.findUnique({
        where: { dni },
      });

      if (existingDni) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'El DNI ya está registrado',
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido: apellido || null,
        telefono: telefono || null,
        dni: dni || null,
        rol: 'usuario',
        activo: true,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        dni: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    // Generar token
    const token = generateToken(usuario);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario,
          token,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al registrar usuario',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
