// Sistema de Modales Personalizados
// Este script se incluye globalmente para reemplazar alert() y confirm()

// Crear el contenedor del modal si no existe
function createModalContainer() {
  if (document.getElementById('globalModal')) return;
  
  const modalHTML = `
    <div id="globalModal" class="custom-modal">
      <div class="custom-modal-content">
        <div class="custom-modal-icon" id="modalIcon"></div>
        <h3 class="custom-modal-title" id="modalTitle"></h3>
        <div class="custom-modal-message" id="modalMessage"></div>
        <div class="custom-modal-buttons" id="modalButtons"></div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById('globalModal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Cerrar modal
function closeModal() {
  const modal = document.getElementById('globalModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Mostrar alerta personalizada
window.showAlert = function(message, title = 'Aviso', icon = '⚠️') {
  createModalContainer();
  
  const modal = document.getElementById('globalModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalButtons = document.getElementById('modalButtons');
  
  modalIcon.textContent = icon;
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;
  modalButtons.innerHTML = '<button class="btn btn-primary" onclick="closeModal()">Entendido</button>';
  
  modal.classList.add('active');
};

// Mostrar confirmación personalizada
window.showConfirm = function(message, title = 'Confirmar', icon = '❓') {
  return new Promise((resolve) => {
    createModalContainer();
    
    const modal = document.getElementById('globalModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalButtons = document.getElementById('modalButtons');
    const modalContent = modal.querySelector('.custom-modal-content');
    
    // Si el mensaje contiene HTML (tiene tags), ampliar el modal
    if (message.includes('<div') || message.includes('<p')) {
      modalContent.style.maxWidth = '600px';
    } else {
      modalContent.style.maxWidth = '450px';
    }
    
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalButtons.innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal(); window.confirmResult(false);">Cancelar</button>
      <button class="btn btn-primary" onclick="closeModal(); window.confirmResult(true);">Confirmar</button>
    `;
    
    window.confirmResult = resolve;
    modal.classList.add('active');
  });
};

// Mostrar modal de éxito
window.showSuccess = function(message, title = '¡Éxito!', icon = '✅') {
  showAlert(message, title, icon);
};

// Mostrar modal de error
window.showError = function(message, title = 'Error', icon = '❌') {
  showAlert(message, title, icon);
};

// Mostrar modal de información
window.showInfo = function(message, title = 'Información', icon = 'ℹ️') {
  showAlert(message, title, icon);
};

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Exponer closeModal globalmente
window.closeModal = closeModal;
