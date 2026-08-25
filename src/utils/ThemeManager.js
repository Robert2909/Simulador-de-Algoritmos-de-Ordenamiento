/**
 * ThemeManager.js
 * 
 * Gestiona el cambio entre modo claro y oscuro, persistiendo la 
 * preferencia en localStorage e inyectando un atributo data-theme al DOM.
 */
export class ThemeManager {
    constructor() {
        // Recuperamos la preferencia guardada, o por defecto 'light'
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

export const themeManager = new ThemeManager();
