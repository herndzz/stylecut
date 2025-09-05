class InputMasks {
  static setupAll() {
    this.setupPhoneMask();
    this.setupCurrencyMask();
    this.setupDateMask();
    this.setupTimeMask();
    this.setupGeneralValidations();
  }

  // Máscara para telefone
  static setupPhoneMask() {
    const phoneInputs = document.querySelectorAll('#telefone, #telefone-colaborador');
    
    phoneInputs.forEach(input => {
      if (!input) return;
      
      // Adicionar placeholder
      input.placeholder = '(11) 99999-9999';
      input.maxLength = 15;
      
      // Configurar máscara
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limitar a 11 dígitos
        if (value.length > 11) {
          value = value.slice(0, 11);
        }
        
        // Aplicar formatação
        if (value.length === 0) {
          e.target.value = '';
        } else if (value.length <= 2) {
          e.target.value = `(${value}`;
        } else if (value.length <= 6) {
          e.target.value = value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
        } else if (value.length <= 10) {
          e.target.value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
          e.target.value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
      });

      // Validação em tempo real
      input.addEventListener('blur', (e) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        
        if (e.target.value.trim() === '') {
          // Campo vazio - remover validação
          this.clearValidation(e.target);
        } else if (cleaned.length < 10 || cleaned.length > 11) {
          this.showError(e.target, 'Telefone deve ter 10 ou 11 dígitos');
        } else {
          this.showSuccess(e.target);
        }
      });

      // Limpar validação ao focar
      input.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    });
  }

  // Máscara para valores monetários
  static setupCurrencyMask() {
    const currencyInputs = document.querySelectorAll('#valor-servico, #valor-agendamento');
    
    currencyInputs.forEach(input => {
      if (!input) return;
      
      input.placeholder = '0,00';
      
      // Se for readonly (como valor-agendamento), não aplicar máscara
      if (input.readOnly) return;
      
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value === '') {
          e.target.value = '';
          return;
        }
        
        // Converter para centavos e depois para reais
        const numberValue = parseInt(value) / 100;
        
        // Limitar a 9999.99
        if (numberValue > 9999.99) {
          e.target.value = '9999,99';
          return;
        }
        
        // Formatar como moeda brasileira
        e.target.value = numberValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      });

      input.addEventListener('blur', (e) => {
        const value = this.parseCurrency(e.target.value);
        
        if (e.target.value.trim() === '') {
          this.clearValidation(e.target);
        } else if (isNaN(value) || value <= 0) {
          this.showError(e.target, 'Valor deve ser maior que zero');
        } else if (value > 9999.99) {
          this.showError(e.target, 'Valor não pode ser maior que R$ 9.999,99');
        } else {
          this.showSuccess(e.target);
        }
      });

      input.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    });
  }

  // Configuração para campos de data
  static setupDateMask() {
    const dateInputs = document.querySelectorAll('#data, input[type="date"]');
    
    dateInputs.forEach(input => {
      if (!input) return;
      
      // Definir data mínima como hoje
      const today = new Date().toISOString().split('T')[0];
      input.min = today;
      
      // Definir data máxima como 1 ano no futuro
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      input.max = maxDate.toISOString().split('T')[0];
      
      input.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (e.target.value === '') {
          this.clearValidation(e.target);
        } else if (selectedDate < today) {
          this.showError(e.target, 'Data não pode ser no passado');
          e.target.value = '';
        } else if (selectedDate > maxDate) {
          this.showError(e.target, 'Data muito distante');
          e.target.value = '';
        } else {
          this.showSuccess(e.target);
        }
      });

      input.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    });
  }

  // Configuração para campos de hora
  static setupTimeMask() {
    const timeInputs = document.querySelectorAll('#hora, input[type="time"]');
    
    timeInputs.forEach(input => {
      if (!input) return;
      
      // Definir horário de funcionamento
      input.min = '08:00';
      input.max = '18:00';
      input.step = '900'; // 15 minutos
      
      input.addEventListener('change', (e) => {
        if (e.target.value === '') {
          this.clearValidation(e.target);
          return;
        }
        
        const [hours, minutes] = e.target.value.split(':').map(Number);
        
        if (hours < 8) {
          this.showError(e.target, 'Horário de funcionamento: 8h às 18h');
          e.target.value = '08:00';
        } else if (hours >= 18) {
          this.showError(e.target, 'Horário de funcionamento: 8h às 18h');
          e.target.value = '17:00';
        } else if (minutes % 15 !== 0) {
          // Arredondar para o próximo múltiplo de 15
          const roundedMinutes = Math.round(minutes / 15) * 15;
          const formattedMinutes = roundedMinutes.toString().padStart(2, '0');
          e.target.value = `${hours.toString().padStart(2, '0')}:${formattedMinutes}`;
          this.showWarning(e.target, 'Horário ajustado para intervalo de 15 minutos');
        } else {
          this.showSuccess(e.target);
        }
      });

      input.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    });
  }

  // Validações gerais para outros campos
  static setupGeneralValidations() {
    // Validação para nomes
    const nameInputs = document.querySelectorAll('#nome, #nome-colaborador, #nome-servico');
    nameInputs.forEach(input => {
      if (!input) return;
      
      input.addEventListener('blur', (e) => {
        const value = e.target.value.trim();
        
        if (value === '') {
          this.clearValidation(e.target);
        } else if (value.length < 2) {
          this.showError(e.target, 'Nome deve ter pelo menos 2 caracteres');
        } else if (value.length > 100) {
          this.showError(e.target, 'Nome muito longo (máximo 100 caracteres)');
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          this.showError(e.target, 'Nome deve conter apenas letras e espaços');
        } else {
          this.showSuccess(e.target);
        }
      });

      input.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    });

    // Validação para especialidade
    const especialidadeInput = document.getElementById('especialidade');
    if (especialidadeInput) {
      especialidadeInput.addEventListener('blur', (e) => {
        const value = e.target.value.trim();
        
        if (value === '') {
          this.clearValidation(e.target);
        } else if (value.length < 3) {
          this.showError(e.target, 'Especialidade deve ter pelo menos 3 caracteres');
        } else {
          this.showSuccess(e.target);
        }
      });

      especialidadeInput.addEventListener('focus', (e) => {
        this.clearValidation(e.target);
      });
    }
  }

  // Métodos auxiliares para validação visual
  static showError(input, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    
    this.removeExistingFeedback(input);
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    
    input.parentNode.appendChild(feedback);
  }

  static showSuccess(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    this.removeExistingFeedback(input);
    
    const feedback = document.createElement('div');
    feedback.className = 'valid-feedback';
    feedback.textContent = 'Válido';
    
    input.parentNode.appendChild(feedback);
  }

  static showWarning(input, message) {
    input.classList.remove('is-invalid', 'is-valid');
    
    this.removeExistingFeedback(input);
    
    const feedback = document.createElement('div');
    feedback.className = 'text-warning small mt-1';
    feedback.textContent = message;
    
    input.parentNode.appendChild(feedback);
    
    // Remover warning após 3 segundos
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }

  static clearValidation(input) {
    input.classList.remove('is-valid', 'is-invalid');
    this.removeExistingFeedback(input);
  }

  static removeExistingFeedback(input) {
    const existingFeedback = input.parentNode.querySelectorAll('.invalid-feedback, .valid-feedback, .text-warning');
    existingFeedback.forEach(feedback => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    });
  }

  // Método utilitário para converter string de moeda para número
  static parseCurrency(value) {
    if (typeof value !== 'string') return 0;
    
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para conversão
    const normalized = cleaned.replace(',', '.');
    
    return parseFloat(normalized) || 0;
  }

  // Método para formatar número como moeda
  static formatCurrency(value) {
    const number = parseFloat(value) || 0;
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Método para obter valor limpo do telefone
  static getCleanPhone(value) {
    return value.replace(/\D/g, '');
  }

  // Método para validar se telefone está completo
  static isValidPhone(value) {
    const cleaned = this.getCleanPhone(value);
    return cleaned.length >= 10 && cleaned.length <= 11;
  }

  // Método para validar se valor monetário é válido
  static isValidCurrency(value) {
    const parsed = this.parseCurrency(value);
    return !isNaN(parsed) && parsed > 0 && parsed <= 9999.99;
  }

  // Método público para limpar todas as validações
  static clearAllValidations() {
    const inputs = document.querySelectorAll('input.is-valid, input.is-invalid');
    inputs.forEach(input => this.clearValidation(input));
  }

  // Método para validar formulário inteiro
  static validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.type === 'tel') {
        if (!this.isValidPhone(input.value)) {
          this.showError(input, 'Telefone inválido');
          isValid = false;
        }
      } else if (input.type === 'number' || input.id.includes('valor')) {
        if (!this.isValidCurrency(input.value)) {
          this.showError(input, 'Valor inválido');
          isValid = false;
        }
      } else if (input.value.trim() === '') {
        this.showError(input, 'Campo obrigatório');
        isValid = false;
      }
    });
    
    return isValid;
  }
}

// Auto-inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  InputMasks.setupAll();
});

export { InputMasks };