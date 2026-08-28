/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos globales.
 */

import { i18n } from './services/I18nEngine.js';
import { themeManager } from './services/ThemeManager.js';
import { audioEngine } from './services/AudioEngine.js';
import { appStore } from './store/Store.js';

// Importar Vistas y Componentes Transversales
import './views/SimulatorView.js';

class App {
    constructor() {
        console.log("Inicializando Entorno Web Interactivo...");
        this.init();
    }

    init() {
        const start = () => {
            // 1. Inicialización Global
            i18n.translateDOM();
            
            const prefs = appStore.getState().preferences;
            
            // 2. Conectar UI Global con Servicios
            const langSelector = document.getElementById('lang-selector');
            if (langSelector) {
                langSelector.value = prefs.locale;
                langSelector.addEventListener('change', (e) => i18n.setLocale(e.target.value));
            }

            const themeToggleBtn = document.getElementById('theme-toggle');
            if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => themeManager.toggleTheme());

            const colorblindToggleBtn = document.getElementById('colorblind-toggle');
            if (colorblindToggleBtn) {
                colorblindToggleBtn.style.opacity = prefs.colorblind ? '1' : '0.5';
                colorblindToggleBtn.addEventListener('click', () => {
                    themeManager.toggleColorblind();
                    colorblindToggleBtn.style.opacity = themeManager.isColorblind ? '1' : '0.5';
                });
            }

            const muteToggleBtn = document.getElementById('mute-toggle');
            if (muteToggleBtn) {
                muteToggleBtn.textContent = prefs.muted ? '🔇' : '🔊';
                muteToggleBtn.addEventListener('click', () => {
                    const isMuted = audioEngine.toggleMute();
                    muteToggleBtn.textContent = isMuted ? '🔇' : '🔊';
                });
            }

            // 3. Montar la Vista Actual (SimulatorView por defecto)
            this.mountView('simulator-view');
        };

        if (document.readyState === 'loading') {
            document.addEventListener("DOMContentLoaded", start);
        } else {
            start();
        }
    }

    mountView(viewTagName) {
        const viewport = document.getElementById('app-viewport');
        if (!viewport) return;
        
        viewport.innerHTML = ''; // Desmonta la vista anterior (unmount)
        const newView = document.createElement(viewTagName);
        viewport.appendChild(newView); // Llama a connectedCallback() de la nueva vista
        
        console.log(`Vista ${viewTagName} montada.`);
    }
}

new App();
