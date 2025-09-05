import { Validator } from './validator.js';

class ErrorHandler {
  static instance = null;

  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  constructor() {
    if (ErrorHandler.instance) {
      return ErrorHandler.instance;
    }

    this.errorLog = [];
    this.setupGlobalHandlers();
    this.loadStoredErrors();
    
    ErrorHandler.instance = this;
  }

  setupGlobalHandlers() {
    // Capturar erros JavaScript globais
    window.addEventListener('error', (event) => {
      this.handle(event.error, 'JavaScript Global Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Capturar promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, 'Unhandled Promise Rejection');
      
      // Prevenir que o erro apareça no console (opcional)
      // event.preventDefault();
    });

    // Capturar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logResourceError(event);
      }
    }, true);
  }

  handle(error, context = '', metadata = {}) {
    const errorInfo = this.createErrorInfo(error, context, metadata);
    
    // Log do erro
    console.error(`[${context}] Erro:`, error);
    
    // Armazenar para análise
    this.logError(errorInfo);
    
    // Mostrar mensagem amigável ao usuário
    const userMessage = this.getUserMessage(error, context);
    this.showErrorToUser(userMessage, context);
    
    // Tentar recuperação automática
    this.attemptRecovery(error, context);
    
    return errorInfo;
  }

  createErrorInfo(error, context, metadata) {
    return {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      context,
      message: error?.message || String(error),
      stack: error?.stack || new Error().stack,
      type: error?.constructor?.name || typeof error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        ...metadata,
        localStorage_available: this.isLocalStorageAvailable(),
        storage_quota: this.getStorageQuota(),
        memory_info: this.getMemoryInfo()
      }
    };
  }

  getUserMessage(error, context) {
    const errorString = String(error?.message || error).toLowerCase();
    
    // Erros de armazenamento
    if (errorString.includes('localstorage') || errorString.includes('quota')) {
      return 'Espaço de armazenamento insuficiente. Tente fazer backup e limpar dados antigos.';
    }
    
    // Erros de rede
    if (errorString.includes('network') || errorString.includes('fetch')) {
      return 'Problema de conexão com a internet. Verifique sua conexão.';
    }
    
    // Erros de validação
    if (errorString.includes('validation') || context.includes('validation')) {
      return error?.message || 'Dados inválidos. Verifique as informações inseridas.';
    }
    
    // Erros de formulário
    if (context.includes('form') || context.includes('input')) {
      return 'Erro ao processar formulário. Verifique os campos e tente novamente.';
    }
    
    // Erros de dados
    if (context.includes('data') || context.includes('storage')) {
      return 'Erro ao salvar/carregar dados. Tente recarregar a página.';
    }
    
    // Erro genérico
    return 'Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.';
  }

  showErrorToUser(message, context) {
    // Determinar tipo de notificação baseado no contexto
    let type = 'danger';
    
    if (context.includes('validation')) {
      type = 'warning';
    } else if (context.includes('info') || context.includes('debug')) {
      type = 'info';
    }
    
    // Usar sistema de notificações
    if (typeof Validator !== 'undefined' && Validator.showNotification) {
      Validator.showNotification(message, type);
    } else {
      // Fallback para alert
      console.warn('Sistema de notificações não disponível, usando alert');
      alert(message);
    }
  }

  attemptRecovery(error, context) {
    const errorString = String(error?.message || error).toLowerCase();
    
    // Recuperação de problemas de storage
    if (errorString.includes('localstorage') || errorString.includes('quota')) {
      try {
        this.clearOldData();
        Validator.showNotification('Dados antigos removidos automaticamente.', 'info');
      } catch (recoveryError) {
        console.error('Falha na recuperação automática:', recoveryError);
      }
    }
    
    // Recuperação de dados corrompidos
    if (errorString.includes('json') || errorString.includes('parse')) {
      try {
        this.repairCorruptedData();
      } catch (recoveryError) {
        console.error('Falha ao reparar dados:', recoveryError);
      }
    }
    
    // Recuperação de formulários
    if (context.includes('form')) {
      try {
        this.recoverFormData(context);
      } catch (recoveryError) {
        console.error('Falha ao recuperar dados do formulário:', recoveryError);
      }
    }
  }

  logError(errorInfo) {
    // Adicionar ao log local
    this.errorLog.push(errorInfo);
    
    // Manter apenas os últimos 100 erros
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    
    // Salvar no localStorage
    try {
      localStorage.setItem('stylecut_error_log', JSON.stringify(this.errorLog));
    } catch (storageError) {
      console.warn('Não foi possível salvar log de erros:', storageError);
      // Se não conseguir salvar, remover erros mais antigos
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  logResourceError(event) {
    const resourceError = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'Resource Load Error',
      element: event.target.tagName,
      source: event.target.src || event.target.href,
      message: `Falha ao carregar ${event.target.tagName}: ${event.target.src || event.target.href}`
    };
    
    console.warn('Erro de recurso:', resourceError);
    this.logError(resourceError);
  }

  // Métodos de recuperação
  clearOldData() {
    const keysToCheck = [];
    
    // Encontrar chaves antigas
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('backup') || key.includes('cache') || key.includes('temp'))) {
        keysToCheck.push(key);
      }
    }
    
    // Remover dados antigos
    keysToCheck.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Não foi possível remover ${key}:`, error);
      }
    });
    
    console.log(`Removidos ${keysToCheck.length} itens antigos do localStorage`);
  }

  repairCorruptedData() {
    const keys = ['clientes', 'colaboradores', 'servicos', 'agendamentos'];
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(`stylecut_data`);
        if (data) {
          JSON.parse(data); // Testa se é JSON válido
        }
      } catch (error) {
        console.warn(`Dados corrompidos encontrados para ${key}, resetando...`);
        // Reset para array vazio
        const emptyData = {};
        emptyData[key] = [];
        localStorage.setItem('stylecut_data', JSON.stringify(emptyData));
      }
    });
  }

  recoverFormData(context) {
    // Tentar recuperar dados de formulário dos inputs
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formData = new FormData(form);
      const data = {};
      
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      if (Object.keys(data).length > 0) {
        const recoveryKey = `recovery_${form.id || 'form'}_${Date.now()}`;
        try {
          localStorage.setItem(recoveryKey, JSON.stringify(data));
          console.log(`Dados do formulário salvos para recuperação: ${recoveryKey}`);
        } catch (error) {
          console.warn('Não foi possível salvar dados de recuperação:', error);
        }
      }
    });
  }

  // Métodos utilitários
  generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadStoredErrors() {
    try {
      const stored = localStorage.getItem('stylecut_error_log');
      if (stored) {
        this.errorLog = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Não foi possível carregar log de erros armazenado:', error);
      this.errorLog = [];
    }
  }

  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => ({
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage
      }));
    }
    return null;
  }

  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Métodos públicos para relatórios
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byContext: {},
      recent: this.errorLog.slice(-10),
      oldest: this.errorLog[0]?.timestamp,
      newest: this.errorLog[this.errorLog.length - 1]?.timestamp
    };
    
    this.errorLog.forEach(error => {
      // Por tipo
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Por contexto
      stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
    });
    
    return stats;
  }

  exportErrorLog() {
    const exportData = {
      generated: new Date().toISOString(),
      stats: this.getErrorStats(),
      errors: this.errorLog,
      system_info: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: this.isLocalStorageAvailable(),
        timestamp: Date.now()
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stylecut_error_log_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearErrorLog() {
    this.errorLog = [];
    try {
      localStorage.removeItem('stylecut_error_log');
    } catch (error) {
      console.warn('Não foi possível limpar log de erros:', error);
    }
  }

  // Método para debug
  debug() {
    console.group('ErrorHandler Debug Info');
    console.log('Error Log Length:', this.errorLog.length);
    console.log('Recent Errors:', this.errorLog.slice(-5));
    console.log('Stats:', this.getErrorStats());
    console.log('LocalStorage Available:', this.isLocalStorageAvailable());
    console.groupEnd();
  }
}

// Função utilitária para uso rápido
export function handleError(error, context = '', metadata = {}) {
  return ErrorHandler.getInstance().handle(error, context, metadata);
}

export { ErrorHandler };