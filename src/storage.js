/**
 * Centraliza operações de armazenamento no localStorage.
 */
class StorageService {
  constructor(key) {
    this.key = key;
  }

  /**
   * Carrega dados do localStorage.
   * @returns {any} Dados armazenados ou null se inválido ou inexistente.
   */
  load() {
    const data = localStorage.getItem(this.key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erro ao parsear JSON para a chave "${this.key}":`, error);
      return null;
    }
  }

  /**
   * Salva dados no localStorage.
   * @param {any} data - Dados a serem salvos.
   */
  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar dados para a chave "${this.key}":`, error);
    }
  }
}

export { StorageService };