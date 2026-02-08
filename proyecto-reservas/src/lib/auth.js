// Utilidades para autenticación
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-temporal-cambiar-en-produccion';
const JWT_EXPIRES_IN = '7d';

/**
 * Genera un token JWT para un usuario
 */
export function generateToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash de contraseña
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Verifica una contraseña
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Extrae el token del header Authorization
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // También intentar obtener de cookies
  const cookies = request.headers.get('Cookie');
  if (cookies) {
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  
  return null;
}

/**
 * Valida y retorna el usuario autenticado
 */
export function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

/**
 * Middleware para validar autenticación
 */
export function requireAuth(request) {
  const user = getAuthUser(request);
  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No autorizado. Token inválido o expirado.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return user;
}

/**
 * Middleware para validar rol de admin
 */
export function requireAdmin(request) {
  const user = requireAuth(request);
  if (user instanceof Response) {
    return user; // Error de autenticación
  }
  
  if (user.rol !== 'admin') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return user;
}
