// Melhorias de UI/UX para o Style Cut
export class UIEnhancements {
  constructor() {
    this.currentSection = 'agendamento';
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupToastNotifications();
    this.setupFormValidation();
    this.setupAnimations();
    this.setupThemeToggle();
    this.setupDateRestrictions();
  }

  // Sistema de navegação entre seções
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Remove active class from all links and sections
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => {
          s.classList.add('d-none');
          s.classList.remove('active-section');
        });

        // Add active class to clicked link and target section
        link.classList.add('active');
        const target = document.getElementById(targetSection);
        if (target) {
          target.classList.remove('d-none');
          target.classList.add('active-section');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        this.currentSection = targetSection;
      });
    });
  }

  // Sistema de notificações toast
  setupToastNotifications() {
    this.toastElement = document.getElementById('notification-toast');
    this.toast = new bootstrap.Toast(this.toastElement);
  }

  showNotification(message, type = 'success') {
    const toastHeader = this.toastElement.querySelector('.toast-header');
    const toastBody = this.toastElement.querySelector('.toast-body');
    const icon = toastHeader.querySelector('i');

    // Limpar classes anteriores
    icon.className = 'me-2';
    toastHeader.className = 'toast-header';

    // Definir ícone e cor baseado no tipo
    switch (type) {
      case 'success':
        icon.classList.add('bi', 'bi-check-circle-fill', 'text-success');
        break;
      case 'error':
        icon.classList.add('bi', 'bi-exclamation-triangle-fill', 'text-danger');
        break;
      case 'warning':
        icon.classList.add('bi', 'bi-exclamation-circle-fill', 'text-warning');
        break;
      case 'info':
        icon.classList.add('bi', 'bi-info-circle-fill', 'text-info');
        break;
    }

    toastBody.textContent = message;
    this.toast.show();
  }

  // Validação visual de formulários
  setupFormValidation() {
    const forms = document.querySelectorAll('form, .form-group');
    
    // Adicionar validação em tempo real
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[required], select[required]')) {
        this.validateField(e.target);
      }
    });

    // Adicionar máscaras de input
    this.setupInputMasks();
  }

  validateField(field) {
    const isValid = field.checkValidity() && field.value.trim() !== '';
    
    field.classList.remove('is-valid', 'is-invalid');
    
    if (field.value.trim() !== '') {
      field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    }

    return isValid;
  }

  setupInputMasks() {
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
      telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 11) {
          value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 7) {
          value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
          value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        e.target.value = value;
      });
    }

    // Máscara para valor monetário
    const valorInputs = document.querySelectorAll('#valor-servico');
    valorInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value;
        if (value && !isNaN(value)) {
          // Formatar como moeda brasileira
          e.target.setAttribute('data-original-value', value);
        }
      });
    });
  }

  // Animações e transições
  setupAnimations() {
    // Animação de entrada para elementos
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    });

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    // Animação para botões de ação
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn')) {
        this.addRippleEffect(e.target, e);
      }
    });
  }

  addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Melhorar o toggle de tema
  setupThemeToggle() {
    const toggleButton = document.getElementById('toggle-theme');
    const icon = toggleButton.querySelector('i');
    const text = toggleButton.querySelector('span');

    toggleButton.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      
      if (isDark) {
        icon.className = 'bi bi-moon-fill me-2';
        text.textContent = 'Tema Escuro';
      } else {
        icon.className = 'bi bi-sun-fill me-2';
        text.textContent = 'Tema Claro';
      }
    });
  }

  // Restrições de data
  setupDateRestrictions() {
    const dateInput = document.getElementById('data');
    if (dateInput) {
      // Definir data mínima como hoje
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;

      // Definir data máxima como 6 meses no futuro
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      dateInput.max = maxDate.toISOString().split('T')[0];
    }
  }

  // Loader para operações assíncronas
  showLoader(element) {
    element.classList.add('loading');
    element.disabled = true;
  }

  hideLoader(element) {
    element.classList.remove('loading');
    element.disabled = false;
  }

  // Confirmação de ações destrutivas
  async confirmAction(message = 'Tem certeza que deseja continuar?') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-question-circle me-2"></i>Confirmação
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="confirm-action">Confirmar</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      const bootstrapModal = new bootstrap.Modal(modal);
      
      modal.querySelector('#confirm-action').addEventListener('click', () => {
        resolve(true);
        bootstrapModal.hide();
      });

      modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
        resolve(false);
      });

      bootstrapModal.show();
    });
  }

  // Formatação de valores monetários
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Formatação de telefone
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  // Scroll suave para elementos
  scrollToElement(element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Adicionar estilos CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  .section-transition {
    transition: all 0.3s ease;
  }

  .active-section {
    animation: slideInUp 0.5s ease forwards;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .nav-link.active {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea !important;
    border-radius: 10px;
  }

  body.dark .nav-link.active {
    background: rgba(77, 171, 247, 0.1);
    color: #4dabf7 !important;
  }
`;
document.head.appendChild(style);
