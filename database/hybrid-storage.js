import { db } from './connection.js';

class HybridStorage {
  constructor(tableName, localStorageKey) {
    this.tableName = tableName;
    this.localStorageKey = localStorageKey;
    this.syncQueue = [];
    this.loadSyncQueue();
  }

  async save(data) {
    try {
      // Tenta salvar no PostgreSQL primeiro
      const result = await this.saveToDatabase(data);
      
      // Se sucesso, atualiza localStorage como cache
      this.updateLocalCache(result);
      
      return result;
    } catch (error) {
      console.warn(`PostgreSQL offline, salvando no localStorage: ${error.message}`);
      
      // Salva no localStorage
      const localResult = this.saveToLocalStorage(data);
      
      // Adiciona à fila de sincronização
      this.addToSyncQueue('save', data);
      
      return localResult;
    }
  }

  async getAll() {
    try {
      // Tenta buscar do PostgreSQL
      const dbData = await this.getAllFromDatabase();
      
      // Atualiza cache local
      this.saveToLocalStorageArray(dbData);
      
      return dbData;
    } catch (error) {
      console.warn(`PostgreSQL offline, usando cache local: ${error.message}`);
      
      // Retorna dados do localStorage
      return this.getFromLocalStorage();
    }
  }

  async update(id, data) {
    try {
      // Tenta atualizar no PostgreSQL
      const result = await this.updateInDatabase(id, data);
      
      // Atualiza cache local
      this.updateLocalCacheItem(result);
      
      return result;
    } catch (error) {
      console.warn(`PostgreSQL offline, atualizando localStorage: ${error.message}`);
      
      // Atualiza no localStorage
      const localResult = this.updateInLocalStorage(id, data);
      
      // Adiciona à fila de sincronização
      this.addToSyncQueue('update', { id, ...data });
      
      return localResult;
    }
  }

  async delete(id) {
    try {
      // Tenta deletar do PostgreSQL
      await this.deleteFromDatabase(id);
      
      // Remove do cache local
      this.removeFromLocalStorage(id);
      
      return true;
    } catch (error) {
      console.warn(`PostgreSQL offline, removendo do localStorage: ${error.message}`);
      
      // Remove do localStorage
      this.removeFromLocalStorage(id);
      
      // Adiciona à fila de sincronização
      this.addToSyncQueue('delete', { id });
      
      return true;
    }
  }

  async syncWithDatabase() {
    if (!db.isConnected) {
      console.log('Database ainda offline, não é possível sincronizar');
      return;
    }

    if (this.syncQueue.length === 0) {
      console.log('Nenhuma operação pendente para sincronizar');
      return;
    }

    console.log(`Sincronizando ${this.syncQueue.length} operações pendentes...`);

    for (const operation of this.syncQueue) {
      try {
        switch (operation.type) {
          case 'save':
            await this.saveToDatabase(operation.data);
            break;
          case 'update':
            await this.updateInDatabase(operation.data.id, operation.data);
            break;
          case 'delete':
            await this.deleteFromDatabase(operation.data.id);
            break;
        }
        console.log(`✅ Operação ${operation.type} sincronizada`);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar operação ${operation.type}:`, error.message);
      }
    }

    // Limpa a fila após sincronização
    this.syncQueue = [];
    this.saveSyncQueue();
    
    // Recarrega dados do banco
    await this.getAll();
    
    console.log('🎉 Sincronização concluída!');
  }

  // Métodos localStorage
  getFromLocalStorage() {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  saveToLocalStorage(item) {
    const data = this.getFromLocalStorage();
    const newItem = { ...item, id: item.id || Date.now() };
    data.push(newItem);
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    return newItem;
  }

  saveToLocalStorageArray(array) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(array));
  }

  updateInLocalStorage(id, updates) {
    const data = this.getFromLocalStorage();
    const index = data.findIndex(item => item.id == id);
    
    if (index >= 0) {
      data[index] = { ...data[index], ...updates };
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
      return data[index];
    }
    
    throw new Error(`Item com ID ${id} não encontrado no localStorage`);
  }

  removeFromLocalStorage(id) {
    const data = this.getFromLocalStorage();
    const filteredData = data.filter(item => item.id != id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(filteredData));
  }

  updateLocalCache(data) {
    if (Array.isArray(data)) {
      this.saveToLocalStorageArray(data);
    } else {
      this.updateLocalCacheItem(data);
    }
  }

  updateLocalCacheItem(item) {
    const data = this.getFromLocalStorage();
    const index = data.findIndex(existing => existing.id === item.id);
    
    if (index >= 0) {
      data[index] = item;
    } else {
      data.push(item);
    }
    
    this.saveToLocalStorageArray(data);
  }

  // Fila de sincronização
  addToSyncQueue(type, data) {
    this.syncQueue.push({
      type,
      data: { ...data },
      timestamp: Date.now()
    });

    this.saveSyncQueue();
  }

  loadSyncQueue() {
    const saved = localStorage.getItem(`${this.localStorageKey}_sync_queue`);
    if (saved) {
      this.syncQueue = JSON.parse(saved);
    }
  }

  saveSyncQueue() {
    localStorage.setItem(`${this.localStorageKey}_sync_queue`, JSON.stringify(this.syncQueue));
  }

  // Métodos que devem ser implementados pelas classes filhas
  async saveToDatabase(data) { 
    throw new Error('Método saveToDatabase deve ser implementado pela classe filha'); 
  }
  
  async getAllFromDatabase() { 
    throw new Error('Método getAllFromDatabase deve ser implementado pela classe filha'); 
  }
  
  async updateInDatabase(id, data) { 
    throw new Error('Método updateInDatabase deve ser implementado pela classe filha'); 
  }
  
  async deleteFromDatabase(id) { 
    throw new Error('Método deleteFromDatabase deve ser implementado pela classe filha'); 
  }
}

export { HybridStorage };