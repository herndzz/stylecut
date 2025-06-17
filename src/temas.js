import { StorageService } from './storage.js';

/**
 * Gerencia a alternância entre temas claro e escuro.
 */
class TemaManager {
  constructor() {
    this.storage = new StorageService('tema');
    const savedTheme = this.storage.load();
    this.currentTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
    this.applyTheme();
  }

  /**
   * Alterna entre os temas claro e escuro.
   * @returns {string} O novo tema aplicado.
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    try {
      this.storage.save(this.currentTheme);
      this.applyTheme();
    } catch (error) {
      console.error('Erro ao alternar tema:', error);
    }
    return this.currentTheme;
  }

  /**
   * Aplica o tema atual ao documento.
   */
  applyTheme() {
    document.body.className = this.currentTheme;
    console.log(`Tema aplicado: ${this.currentTheme}`); // Para depuração
  }

  /**
   * Obtém o tema atual.
   * @returns {string} O tema atual ('light' ou 'dark').
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}

export { TemaManager };