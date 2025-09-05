class Validator {
  static validateCliente(cliente) {
    const errors = [];
    
    // Validação do nome
    if (!cliente.nome || typeof cliente.nome !== 'string') {
      errors.push('Nome é obrigatório');
    } else {
      const nome = cliente.nome.trim();
      if (nome.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      } else if (nome.length > 255) {
        errors.push('Nome deve ter no máximo 255 caracteres');
      } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
        errors.push('Nome deve conter apenas letras e espaços');
      }
    }
    
    // Validação do telefone
    if (!cliente.telefone || typeof cliente.telefone !== 'string') {
      errors.push('Telefone é obrigatório');
    } else {
      const telefone = cliente.telefone.replace(/\D/g, '');
      if (telefone.length < 10 || telefone.length > 11) {
        errors.push('Telefone deve ter 10 ou 11 dígitos');
      } else if (!/^[1-9][0-9]/.test(telefone)) {
        errors.push('Telefone deve começar com DDD válido');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateColaborador(colaborador) {
    const errors = [];
    
    // Validação do nome
    if (!colaborador.nome || typeof colaborador.nome !== 'string') {
      errors.push('Nome é obrigatório');
    } else {
      const nome = colaborador.nome.trim();
      if (nome.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      } else if (nome.length > 255) {
        errors.push('Nome deve ter no máximo 255 caracteres');
      } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
        errors.push('Nome deve conter apenas letras e espaços');
      }
    }
    
    // Validação da especialidade
    if (!colaborador.especialidade || typeof colaborador.especialidade !== 'string') {
      errors.push('Especialidade é obrigatória');
    } else {
      const especialidade = colaborador.especialidade.trim();
      if (especialidade.length < 2) {
        errors.push('Especialidade deve ter pelo menos 2 caracteres');
      } else if (especialidade.length > 100) {
        errors.push('Especialidade deve ter no máximo 100 caracteres');
      }
    }
    
    // Validação do telefone (opcional)
    if (colaborador.telefone && colaborador.telefone.trim()) {
      const telefone = colaborador.telefone.replace(/\D/g, '');
      if (telefone.length < 10 || telefone.length > 11) {
        errors.push('Telefone deve ter 10 ou 11 dígitos');
      }
    }
    
    // Validação dos serviços
    if (colaborador.servicos && !Array.isArray(colaborador.servicos)) {
      errors.push('Serviços devem ser uma lista');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateServico(servico) {
    const errors = [];
    
    // Validação do nome
    if (!servico.nome || typeof servico.nome !== 'string') {
      errors.push('Nome do serviço é obrigatório');
    } else {
      const nome = servico.nome.trim();
      if (nome.length < 2) {
        errors.push('Nome do serviço deve ter pelo menos 2 caracteres');
      } else if (nome.length > 255) {
        errors.push('Nome do serviço deve ter no máximo 255 caracteres');
      }
    }
    
    // Validação do valor
    if (servico.valor === null || servico.valor === undefined || servico.valor === '') {
      errors.push('Valor é obrigatório');
    } else {
      const valor = parseFloat(servico.valor);
      if (isNaN(valor)) {
        errors.push('Valor deve ser um número válido');
      } else if (valor <= 0) {
        errors.push('Valor deve ser maior que zero');
      } else if (valor > 9999.99) {
        errors.push('Valor deve ser menor que R$ 10.000,00');
      }
    }
    
    // Validação da duração (opcional)
    if (servico.duracao !== undefined && servico.duracao !== null && servico.duracao !== '') {
      const duracao = parseInt(servico.duracao);
      if (isNaN(duracao)) {
        errors.push('Duração deve ser um número válido');
      } else if (duracao < 15) {
        errors.push('Duração mínima é 15 minutos');
      } else if (duracao > 480) {
        errors.push('Duração máxima é 8 horas (480 minutos)');
      } else if (duracao % 15 !== 0) {
        errors.push('Duração deve ser múltipla de 15 minutos');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateAgendamento(agendamento, clientes = [], colaboradores = [], servicos = []) {
    const errors = [];
    
    // Validação do cliente
    if (!agendamento.cliente) {
      errors.push('Selecione um cliente');
    } else if (!clientes.find(c => c.id === agendamento.cliente)) {
      errors.push('Cliente selecionado não existe');
    }
    
    // Validação do colaborador
    if (!agendamento.colaborador) {
      errors.push('Selecione um colaborador');
    } else if (!colaboradores.find(c => c.id === agendamento.colaborador)) {
      errors.push('Colaborador selecionado não existe');
    }
    
    // Validação do serviço
    if (!agendamento.servico) {
      errors.push('Selecione um serviço');
    } else if (!servicos.find(s => s.id === agendamento.servico)) {
      errors.push('Serviço selecionado não existe');
    }
    
    // Validação da data
    if (!agendamento.data) {
      errors.push('Data é obrigatória');
    } else {
      const data = new Date(agendamento.data + 'T00:00:00');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (isNaN(data.getTime())) {
        errors.push('Data inválida');
      } else if (data < hoje) {
        errors.push('Data deve ser hoje ou no futuro');
      } else if (data.getFullYear() > hoje.getFullYear() + 2) {
        errors.push('Data não pode ser mais de 2 anos no futuro');
      }
      
      // Verificar se não é domingo (opcional)
      if (data.getDay() === 0) {
        errors.push('Não é possível agendar aos domingos');
      }
    }
    
    // Validação da hora
    if (!agendamento.hora) {
      errors.push('Hora é obrigatória');
    } else {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(agendamento.hora)) {
        errors.push('Hora inválida');
      } else {
        const [horas, minutos] = agendamento.hora.split(':').map(Number);
        
        // Verificar horário comercial (8h às 18h)
        if (horas < 8 || horas >= 18) {
          errors.push('Agendamentos só podem ser feitos entre 8h e 18h');
        }
        
        // Verificar se os minutos são múltiplos de 30
        if (minutos !== 0 && minutos !== 30) {
          errors.push('Agendamentos só podem ser feitos de 30 em 30 minutos');
        }
        
        // Verificar se não é muito próximo da hora atual
        if (agendamento.data) {
          const dataHora = new Date(`${agendamento.data}T${agendamento.hora}`);
          const agora = new Date();
          const diferenca = dataHora.getTime() - agora.getTime();
          const umaHora = 60 * 60 * 1000;
          
          if (diferenca < umaHora && diferenca > 0) {
            errors.push('Agendamento deve ser feito com pelo menos 1 hora de antecedência');
          }
        }
      }
    }
    
    // Validação cruzada: verificar se o colaborador oferece o serviço
    if (agendamento.colaborador && agendamento.servico && colaboradores.length > 0 && servicos.length > 0) {
      const colaborador = colaboradores.find(c => c.id === agendamento.colaborador);
      if (colaborador && colaborador.servicos && Array.isArray(colaborador.servicos)) {
        const oferece = colaborador.servicos.some(s => s.id === agendamento.servico);
        if (!oferece) {
          errors.push('O colaborador selecionado não oferece este serviço');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  static formatPhone(phone) {
    if (typeof phone !== 'string') return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  static formatCurrency(value) {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    
    if (isNaN(value)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static showValidationErrors(errors, containerId = 'notification-container') {
    if (!errors || errors.length === 0) return;
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container de notificações não encontrado');
      alert('Erros encontrados:\n' + errors.join('\n'));
      return;
    }
    
    errors.forEach(error => {
      this.showNotification(error, 'danger', container);
    });
  }

  static showNotification(message, type = 'info', container = null) {
    if (!container) {
      container = document.getElementById('notification-container');
    }
    
    if (!container) {
      console.error('Container de notificações não encontrado');
      return;
    }
    
    const id = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.minWidth = '300px';
    notification.innerHTML = `
      <i class="bi bi-${this.getIconForType(type)} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    }, 5000);
  }

  static getIconForType(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'danger': return 'exclamation-triangle';
      case 'warning': return 'exclamation-circle';
      case 'info': return 'info-circle';
      default: return 'info-circle';
    }
  }
}

export { Validator };