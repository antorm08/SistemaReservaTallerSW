// Sistema de iconos SVG centralizado
// Reemplaza los emojis por iconos consistentes en toda la interfaz

(function () {
  const ICONS = {
    warning:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    error:
      '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    success:
      '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    question:
      '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    lock:
      '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    calendar:
      '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    clock:
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    key:
      '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    shirt:
      '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    wrench:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
    wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    layers:
      '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.48 1.59a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.49-1.59"/>',
    award:
      '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>'
  };

  // Mapeo de emojis anteriores a nombres de icono, para compatibilidad
  const LEGACY = {
    '⚠️': 'warning',
    '⚠': 'warning',
    '❗': 'warning',
    '❌': 'error',
    '✖': 'error',
    '✅': 'success',
    '✔': 'success',
    'ℹ️': 'info',
    '❓': 'question',
    '🔒': 'lock',
    '📅': 'calendar',
    '⏰': 'clock',
    '⏱️': 'clock',
    '⏱': 'clock',
    '🔑': 'key',
    '💡': 'lightbulb',
    '🚿': 'shirt',
    '🔍': 'search',
    '⚡': 'zap',
    '🚫': 'ban',
    '⊗': 'ban',
    '✓': 'check',
    '🗓️': 'calendar'
  };

  function resolveIconName(icon) {
    if (!icon) return 'info';
    if (ICONS[icon]) return icon;
    if (LEGACY[icon]) return LEGACY[icon];
    return 'info';
  }

  function appIcon(name, size, extraClass) {
    const key = resolveIconName(name);
    const px = Number(size) > 0 ? Number(size) : 24;
    return (
      '<svg class="app-icon' +
      (extraClass ? ' ' + extraClass : '') +
      '" width="' +
      px +
      '" height="' +
      px +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
      'focusable="false">' +
      ICONS[key] +
      '</svg>'
    );
  }

  function renderAppIcon(element, name, size) {
    if (element) element.innerHTML = appIcon(name, size);
  }

  window.APP_ICONS = ICONS;
  window.appIcon = appIcon;
  window.renderAppIcon = renderAppIcon;
})();
