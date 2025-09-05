class APIService {
  constructor() {
    this.baseURL = window.location.origin;
    this.isOnline = navigator.onLine;
    
    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Conexão restaurada');
      this.syncPendingOperations();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Modo offline ativado');
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API offline, usando localStorage:', error.message);
      throw error;
    }
  }

  // COLABORADORES
  async getColaboradores() {
    try {
      return await this.request('/colaboradores');
    } catch (error) {
      return JSON.parse(localStorage.getItem('colaboradores') || '[]');
    }
  }

  async createColaborador(colaborador) {
    try {
      const result = await this.request('/colaboradores', {
        method: 'POST',
        body: JSON.stringify(colaborador)
      });
      
      this.updateLocalCache('colaboradores', result);
      return result;
    } catch (error) {
      const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
      const novoColaborador = { ...colaborador, id: Date.now() };
      colaboradores.push(novoColaborador);
      localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
      this.addToPendingSync('colaboradores', 'POST', novoColaborador);
      return novoColaborador;
    }
  }

  async updateColaborador(id, colaborador) {
    try {
      const result = await this.request(`/colaboradores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(colaborador)
      });
      
      this.updateLocalCacheItem('colaboradores', result);
      return result;
    } catch (error) {
      const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
      const index = colaboradores.findIndex(c => c.id == id);
      if (index >= 0) {
        colaboradores[index] = { ...colaboradores[index], ...colaborador };
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
        this.addToPendingSync('colaboradores', 'PUT', { id, ...colaborador });
        return colaboradores[index];
      }
      throw new Error('Colaborador não encontrado');
    }
  }

  async deleteColaborador(id) {
    try {
      await this.request(`/colaboradores/${id}`, { method: 'DELETE' });
      this.removeFromLocalCache('colaboradores', id);
    } catch (error) {
      const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
      const filtered = colaboradores.filter(c => c.id != id);
      localStorage.setItem('colaboradores', JSON.stringify(filtered));
      this.addToPendingSync('colaboradores', 'DELETE', { id });
    }
  }
  
  // CLIENTES
  async getClientes() {
    try {
      return await this.request('/clientes');
    } catch (error) {
      return JSON.parse(localStorage.getItem('clientes') || '[]');
    }
  }

  async createCliente(cliente) {
    try {
      const result = await this.request('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente)
      });
      
      // Atualizar cache local
      this.updateLocalCache('clientes', result);
      return result;
    } catch (error) {
      // Fallback para localStorage
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const novoCliente = { ...cliente, id: Date.now() };
      clientes.push(novoCliente);
      localStorage.setItem('clientes', JSON.stringify(clientes));
      
      // Adicionar à fila de sincronização
      this.addToPendingSync('clientes', 'POST', novoCliente);
      return novoCliente;
    }
  }

  async updateCliente(id, cliente) {
    try {
      const result = await this.request(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente)
      });
      
      this.updateLocalCacheItem('clientes', result);
      return result;
    } catch (error) {
      // Fallback para localStorage
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const index = clientes.findIndex(c => c.id == id);
      if (index >= 0) {
        clientes[index] = { ...clientes[index], ...cliente };
        localStorage.setItem('clientes', JSON.stringify(clientes));
        this.addToPendingSync('clientes', 'PUT', { id, ...cliente });
        return clientes[index];
      }
      throw new Error('Cliente não encontrado');
    }
  }

  async deleteCliente(id) {
    try {
      await this.request(`/clientes/${id}`, { method: 'DELETE' });
      this.removeFromLocalCache('clientes', id);
    } catch (error) {
      // Fallback para localStorage
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const filtered = clientes.filter(c => c.id != id);
      localStorage.setItem('clientes', JSON.stringify(filtered));
      this.addToPendingSync('clientes', 'DELETE', { id });
    }
  }

  // SERVIÇOS
  async getServicos() {
    try {
      return await this.request('/servicos');
    } catch (error) {
      return JSON.parse(localStorage.getItem('servicos') || '[]');
    }
  }

  async createServico(servico) {
    try {
      const result = await this.request('/servicos', {
        method: 'POST',
        body: JSON.stringify(servico)
      });
      
      this.updateLocalCache('servicos', result);
      return result;
    } catch (error) {
      const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
      const novoServico = { ...servico, id: Date.now() };
      servicos.push(novoServico);
      localStorage.setItem('servicos', JSON.stringify(servicos));
      this.addToPendingSync('servicos', 'POST', novoServico);
      return novoServico;
    }
  }

  async updateServico(id, servico) {
    try {
      const result = await this.request(`/servicos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(servico)
      });
      
      this.updateLocalCacheItem('servicos', result);
      return result;
    } catch (error) {
      const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
      const index = servicos.findIndex(s => s.id == id);
      if (index >= 0) {
        servicos[index] = { ...servicos[index], ...servico };
        localStorage.setItem('servicos', JSON.stringify(servicos));
        this.addToPendingSync('servicos', 'PUT', { id, ...servico });
        return servicos[index];
      }
      throw new Error('Serviço não encontrado');
    }
  }

  async deleteServico(id) {
    try {
      await this.request(`/servicos/${id}`, { method: 'DELETE' });
      this.removeFromLocalCache('servicos', id);
    } catch (error) {
      const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
      const filtered = servicos.filter(s => s.id != id);
      localStorage.setItem('servicos', JSON.stringify(filtered));
      this.addToPendingSync('servicos', 'DELETE', { id });
    }
  }

  // Métodos auxiliares
  updateLocalCache(key, item) {
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
  }

  updateLocalCacheItem(key, item) {
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(key, JSON.stringify(items));
  }

  removeFromLocalCache(key, id) {
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = items.filter(i => i.id != id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  addToPendingSync(resource, method, data) {
    const pending = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    pending.push({ resource, method, data, timestamp: Date.now() });
    localStorage.setItem('pendingSync', JSON.stringify(pending));
  }

  async syncPendingOperations() {
    const pending = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    
    if (pending.length === 0) return;
    
    console.log(`🔄 Sincronizando ${pending.length} operações pendentes...`);
    
    for (const operation of pending) {
      try {
        const { resource, method, data } = operation;
        
        switch (method) {
          case 'POST':
            await this.request(`/${resource}`, {
              method: 'POST',
              body: JSON.stringify(data)
            });
            break;
          case 'PUT':
            await this.request(`/${resource}/${data.id}`, {
              method: 'PUT',
              body: JSON.stringify(data)
            });
            break;
          case 'DELETE':
            await this.request(`/${resource}/${data.id}`, {
              method: 'DELETE'
            });
            break;
        }
        
        console.log(`✅ Operação ${method} ${resource} sincronizada`);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar:`, error);
      }
    }
    
    // Limpar operações pendentes
    localStorage.removeItem('pendingSync');
    console.log('🎉 Sincronização concluída!');
  }
}

export { APIService };