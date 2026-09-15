/**
 * I18nEngine.js
 * 
 * Motor puro de internacionalización. 
 * Escanea el DOM buscando atributos data-i18n y data-i18n-aria
 * para inyectar traducciones sin acoplar la lógica a un framework.
 */
import { translations } from '../data/i18n.js';
import { storage } from './StorageManager.js';
import { eventBus } from '../core/events/EventBus.js';

export class I18nEngine {
    constructor() {
        this.currentLocale = storage.load().locale || 'es';
        document.documentElement.lang = this.currentLocale;
    }

    setLocale(locale) {
        if (translations[locale]) {
            this.currentLocale = locale;
            storage.save({ locale });
            document.documentElement.lang = locale;
            this.translateDOM();
            eventBus.emit('LOCALE_CHANGED', { locale });
        } else {
            console.warn(`[I18n] Locale '${locale}' no soportado.`);
        }
    }

    t(key, params = {}) {
        let str = (translations[this.currentLocale] && translations[this.currentLocale][key]) || key;
        for (const [k, v] of Object.entries(params)) {
            str = str.replaceAll(`{${k}}`, v);
        }
        return str;
    }

    translateDOM(rootElement = document) {
        // 1. Traducciones de contenido textual
        const textElements = rootElement.querySelectorAll('[data-i18n]');
        textElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // 2. Traducciones de Accesibilidad (ARIA)
        const ariaElements = rootElement.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });

        // 3. Traducciones de Placeholder
        const placeholderElements = rootElement.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', this.t(key));
        });
    }
}

export const i18n = new I18nEngine();
