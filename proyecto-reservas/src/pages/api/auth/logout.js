// POST /api/auth/logout.js
// Cierra sesión del usuario

export async function POST() {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Sesión cerrada exitosamente',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
      },
    }
  );
}
