import { StorageService } from './storage.js';

class StorageManager {
  static instance = null;

  static getInstance() {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  constructor() {
    if (StorageManager.instance) {
      return StorageManager.instance;
    }

    this.storage = new StorageService('stylecut_data');
    this.listeners = new Map();
    this.cache = new Map();
    this.lastSync = new Map();
    
    // Configurar backup automático
    this.setupAutoBackup();
    
    StorageManager.instance = this;
  }

  // Métodos principais de storage
  save(key, data) {
    try {
      const allData = this.storage.load() || {};
      allData[key] = {
        data: data,
        timestamp: Date.now(),
        version: this.getDataVersion()
      };
      
      this.storage.save(allData);
      this.updateCache(key, data);
      this.notifyListeners(key, data);
      this.lastSync.set(key, Date.now());
      
      return true;
    } catch (error) {
      console.error(`Erro ao salvar dados para ${key}:`, error);
      this.handleStorageError(error);
      return false;
    }
  }

  load(key) {
    try {
      // Verificar cache primeiro
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        // Cache válido por 5 minutos
        if (age < 5 * 60 * 1000) {
          return cached.data;
        }
      }

      const allData = this.storage.load() || {};
      const entry = allData[key];
      
      if (!entry) {
        return [];
      }

      // Verificar versão dos dados
      if (this.isDataOutdated(entry)) {
        console.warn(`Dados para ${key} podem estar desatualizados`);
      }

      const data = entry.data || entry; // Compatibilidade com dados antigos
      this.updateCache(key, data);
      
      return data;
    } catch (error) {
      console.error(`Erro ao carregar dados para ${key}:`, error);
      this.handleStorageError(error);
      return [];
    }
  }

  // Gerenciamento de cache
  updateCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Sistema de listeners para mudanças
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
  }

  removeListener(key, callback) {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro ao executar listener para ${key}:`, error);
        }
      });
    }
  }

  // Backup e restauração
  async backup() {
    try {
      const allData = this.storage.load() || {};
      const backup = {
        ...allData,
        backup_metadata: {
          date: new Date().toISOString(),
          version: this.getDataVersion(),
          user_agent: navigator.userAgent,
          timestamp: Date.now()
        }
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const filename = `stylecut_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      // Usar a API de download moderna se disponível
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'JSON files',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          return { success: true, method: 'modern' };
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Falha no método moderno, usando fallback:', err);
          } else {
            return { success: false, reason: 'cancelled' };
          }
        }
      }
      
      // Fallback para método tradicional
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, method: 'traditional' };
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      return { success: false, error: error.message };
    }
  }

  async restore(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validar estrutura do backup
          if (!this.isValidBackup(data)) {
            reject(new Error('Arquivo de backup inválido ou corrompido'));
            return;
          }
          
          // Fazer backup dos dados atuais antes da restauração
          const currentData = this.storage.load();
          const emergencyBackup = {
            ...currentData,
            emergency_backup: true,
            timestamp: Date.now()
          };
          
          localStorage.setItem('stylecut_emergency_backup', JSON.stringify(emergencyBackup));
          
          // Remover metadados do backup antes de salvar
          const { backup_metadata, ...dataToRestore } = data;
          
          // Restaurar dados
          this.storage.save(dataToRestore);
          this.clearCache(); // Limpar cache após restauração
          
          resolve({
            success: true,
            metadata: backup_metadata,
            itemsRestored: Object.keys(dataToRestore).length
          });
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo de backup: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }

  // Validação de backup
  isValidBackup(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Verificar se contém pelo menos uma das chaves esperadas
    const expectedKeys = ['clientes', 'colaboradores', 'servicos', 'agendamentos'];
    const hasValidKeys = expectedKeys.some(key => data.hasOwnProperty(key));
    
    if (!hasValidKeys) {
      return false;
    }
    
    // Verificar estrutura básica dos dados
    for (const key of expectedKeys) {
      if (data[key] && !Array.isArray(data[key].data || data[key])) {
        return false;
      }
    }
    
    return true;
  }

  // Backup automático
  setupAutoBackup() {
    // Backup automático a cada 7 dias
    const lastAutoBackup = localStorage.getItem('stylecut_last_auto_backup');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (!lastAutoBackup || parseInt(lastAutoBackup) < sevenDaysAgo) {
      this.scheduleAutoBackup();
    }
  }

  scheduleAutoBackup() {
    setTimeout(async () => {
      try {
        // Criar backup automático silencioso
        const allData = this.storage.load() || {};
        const autoBackup = {
          ...allData,
          auto_backup: true,
          timestamp: Date.now()
        };
        
        localStorage.setItem('stylecut_auto_backup', JSON.stringify(autoBackup));
        localStorage.setItem('stylecut_last_auto_backup', Date.now().toString());
        
        console.log('Backup automático criado');
      } catch (error) {
        console.error('Erro no backup automático:', error);
      }
    }, 5000); // 5 segundos após o carregamento
  }

  // Utilitários
  getDataVersion() {
    return '1.0.0';
  }

  isDataOutdated(entry) {
    if (!entry.timestamp) return false;
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return entry.timestamp < oneWeekAgo;
  }

  handleStorageError(error) {
    if (error.name === 'QuotaExceededError') {
      // Tentar limpar dados antigos
      this.cleanupOldData();
      
      // Notificar usuário
      if (typeof Validator !== 'undefined') {
        Validator.showNotification(
          'Espaço de armazenamento quase cheio. Dados antigos foram removidos.',
          'warning'
        );
      }
    } else {
      console.error('Erro de storage:', error);
    }
  }

  cleanupOldData() {
    try {
      // Remover backups automáticos antigos
      const autoBackupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('stylecut_auto_backup_')) {
          autoBackupKeys.push(key);
        }
      }
      
      // Manter apenas os 3 backups mais recentes
      autoBackupKeys.sort().slice(0, -3).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Limpar cache
      this.clearCache();
      
      console.log('Limpeza de dados antigos concluída');
    } catch (error) {
      console.error('Erro na limpeza de dados:', error);
    }
  }

  // Estatísticas de uso
  getStats() {
    const allData = this.storage.load() || {};
    const stats = {
      totalItems: 0,
      dataSize: 0,
      lastModified: null,
      collections: {}
    };
    
    for (const [key, value] of Object.entries(allData)) {
      if (key !== 'backup_metadata') {
        const data = value.data || value;
        const count = Array.isArray(data) ? data.length : 0;
        
        stats.collections[key] = {
          count,
          lastModified: value.timestamp || null
        };
        
        stats.totalItems += count;
        
        if (value.timestamp && (!stats.lastModified || value.timestamp > stats.lastModified)) {
          stats.lastModified = value.timestamp;
        }
      }
    }
    
    // Calcular tamanho aproximado
    const dataString = JSON.stringify(allData);
    stats.dataSize = new Blob([dataString]).size;
    
    return stats;
  }

  // Método para depuração
  debug() {
    console.group('StorageManager Debug Info');
    console.log('Cache:', this.cache);
    console.log('Listeners:', this.listeners);
    console.log('Last Sync:', this.lastSync);
    console.log('Stats:', this.getStats());
    console.groupEnd();
  }
}

export { StorageManager };