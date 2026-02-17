/**
 * Interceptor de Autenticación
 * Maneja automáticamente tokens expirados y errores 401
 */

(function() {
  // Guardar el fetch original
  const originalFetch = window.fetch;

  // Sobrescribir fetch para interceptar respuestas
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);

      // Interceptar errores 401 (No autorizado)
      if (response.status === 401) {
        const url = args[0];
        
        // Solo aplicar a endpoints de API (no a login/registro)
        if (typeof url === 'string' && url.includes('/api/') && 
            !url.includes('/api/auth/login') && 
            !url.includes('/api/auth/register')) {
          
          console.warn('🔒 Sesión expirada o no autorizada. Redirigiendo al login...');
          
          // Limpiar datos de sesión
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Guardar la página actual para redirigir después del login
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/registro') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          // Mostrar modal de sesión expirada si está disponible
          if (typeof window.showError === 'function') {
            window.showError(
              'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
              'Sesión Expirada',
              '🔒'
            );
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            // Redirigir inmediatamente si no hay modal
            window.location.href = '/login?sessionExpired=true';
          }
        }
      }

      return response;
    } catch (error) {
      // Manejar errores de red
      console.error('Error en la petición:', error);
      throw error;
    }
  };

  // Verificar token al cargar la página
  function verificarTokenValido() {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Decodificar el token JWT (sin verificar firma, solo para ver expiración)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiracion = payload.exp * 1000; // Convertir a milisegundos
        const ahora = Date.now();
        
        // Si el token ya expiró
        if (expiracion < ahora) {
          console.warn('🔒 Token expirado detectado al cargar la página');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirigir al login si no estamos ya allí
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/registro' && currentPath !== '/') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/login?sessionExpired=true';
          }
        } else {
          // Calcular tiempo restante
          const tiempoRestante = expiracion - ahora;
          const diasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
          const horasRestantes = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          console.log(`✅ Token válido. Expira en ${diasRestantes}d ${horasRestantes}h`);
          
          // Advertir si queda menos de 1 día
          if (tiempoRestante < (24 * 60 * 60 * 1000) && typeof window.showInfo === 'function') {
            setTimeout(() => {
              window.showInfo(
                'Tu sesión expirará pronto. Te recomendamos cerrar sesión y volver a iniciarla.',
                'Sesión por Expirar',
                '⏰'
              );
            }, 1000);
          }
        }
      } catch (e) {
        console.error('Error al verificar token:', e);
      }
    }
  }

  // Verificar token cuando se carga la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarTokenValido);
  } else {
    verificarTokenValido();
  }

  console.log('🔐 Interceptor de autenticación activado');
})();
