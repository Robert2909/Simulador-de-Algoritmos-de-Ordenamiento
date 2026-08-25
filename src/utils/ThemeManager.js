/**
 * ThemeManager.js
 * 
 * Gestiona el cambio entre modo claro y oscuro, persistiendo la 
 * preferencia en localStorage e inyectando un atributo data-theme al DOM.
 */
import { storage } from './StorageManager.js';

export class ThemeManager {
    constructor() {
        // Recuperamos la preferencia guardada (del StorageManager unificado)
        this.currentTheme = storage.load().theme;
        this.isColorblind = storage.load().colorblind;
        
        // Si es 'system', calculamos en base a las preferencias del OS
        if (this.currentTheme === 'system') {
            this.currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        this.applyTheme(this.currentTheme);
        this.applyColorblind(this.isColorblind);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        // Persistencia Defensiva
        storage.save({ theme: this.currentTheme });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleColorblind() {
        this.isColorblind = !this.isColorblind;
        this.applyColorblind(this.isColorblind);
        storage.save({ colorblind: this.isColorblind });
    }

    applyColorblind(active) {
        document.documentElement.setAttribute('data-colorblind', active ? 'true' : 'false');
    }
}

export const themeManager = new ThemeManager();
