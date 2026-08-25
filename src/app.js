/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos.
 */

import Simulator from './core/engine/Simulator.js';
import { router } from './core/router/Router.js';
import { PRNG } from './utils/mathUtils.js';
import { eventBus } from './core/events/EventBus.js';
import { i18n } from './utils/I18nEngine.js';
import { themeManager } from './utils/ThemeManager.js';
import { audioEngine } from './core/engine/AudioEngine.js';
import { storage } from './utils/StorageManager.js';

// Importar los Web Components (Se autoconectan al DOM)
import './components/ArrayView.js';
import './components/SimulationControls.js';
import './components/CodeViewer.js';
import './components/InputControls.js';

class App {
    constructor() {
        console.log("Inicializando Entorno Interactivo de Visualización de Algoritmos...");
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            i18n.translateDOM();
            
            const prefs = storage.load();
            
            const langSelector = document.getElementById('lang-selector');
            if (langSelector) {
                langSelector.value = prefs.locale;
                langSelector.addEventListener('change', (e) => i18n.setLocale(e.target.value));
            }

            const themeToggleBtn = document.getElementById('theme-toggle');
            if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => themeManager.toggleTheme());

            const colorblindToggleBtn = document.getElementById('colorblind-toggle');
            if (colorblindToggleBtn) {
                // UI Inicial
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

            this.setupUI();
        });
    }

    setupUI() {
        const root = document.getElementById('app-root');
        if (!root) return;

        let currentSimulator = null;
        let playInterval = null;
        let currentDelayMs = storage.load().speed;

        const stopPlayback = () => {
            if (playInterval) {
                clearInterval(playInterval);
                playInterval = null;
            }
        };

        const startPlayback = () => {
            stopPlayback();
            playInterval = setInterval(() => {
                if (currentSimulator.status === 'completed' || currentSimulator.status === 'error') {
                    stopPlayback();
                    eventBus.emit('SIMULATION_COMPLETED');
                } else {
                    currentSimulator.stepForward();
                }
            }, currentDelayMs);
        };

        // Función de Enrutamiento y Montaje
        const loadAlgorithm = (algoId, customArray = null) => {
            stopPlayback();
            eventBus.emit('SIMULATION_COMPLETED'); // Forza reset UI Controls
            
            let initialArray = customArray;
            if (!initialArray) {
                const prng = new PRNG(1234); 
                initialArray = prng.generateRandomArray(storage.load().arraySize, 10, 100);
            }
            
            const algo = router.getAlgorithmInstance(algoId);
            const algoData = router.getAlgorithmData(algoId);
            
            // Enviamos todo el código fuente al visor (si es que la DB lo tiene) o desde la clase
            eventBus.emit('ALGORITHM_LOADED', { code: algoData.codeText ? algoData.codeText.split('\n') : algo.code });
            
            currentSimulator = new Simulator(algo, initialArray, eventBus);
            currentSimulator.initialize();
            
            window.location.hash = algoId;
        };

        // Lógica de Enrutamiento (RFC 3.1 y 3.9) externalizada al Router
        const initialConfig = router.getInitialConfig();
        const initialAlgo = initialConfig.algoId;
        
        let customInitialArray = null;
        if (initialConfig.customArrayConfig) {
            const prng = new PRNG(initialConfig.customArrayConfig.seed);
            customInitialArray = prng.generateRandomArray(initialConfig.customArrayConfig.size, 10, 100);
        }
        
        const algoSelector = document.getElementById('algo-selector');
        if (algoSelector) {
            algoSelector.value = initialAlgo;
            algoSelector.addEventListener('change', (e) => {
                // Al cambiar manualmente desde el selector, limpiamos la URL para generar nueva semilla
                window.location.hash = e.target.value;
                loadAlgorithm(e.target.value);
            });
        }

        // Suscripciones globales del reproductor
        eventBus.subscribe('PLAY_REQUESTED', startPlayback);
        eventBus.subscribe('PAUSE_REQUESTED', stopPlayback);
        eventBus.subscribe('STEP_FORWARD_REQUESTED', () => currentSimulator?.stepForward());
        eventBus.subscribe('STEP_BACKWARD_REQUESTED', () => currentSimulator?.stepBackward());
        eventBus.subscribe('SPEED_CHANGED', (newDelayMs) => {
            currentDelayMs = newDelayMs;
            if (playInterval) startPlayback();
        });

        // Suscripción al InputController (Sección 4.6 del RFC)
        eventBus.subscribe('DATA_INPUT_SUBMITTED', (payload) => {
            const currentAlgo = algoSelector ? algoSelector.value : router.parseHash().algoId;
            
            // Actualizar URL mediante el router central
            router.updateHash(currentAlgo, payload.seed, payload.array.length);
            
            loadAlgorithm(currentAlgo, payload.array);
        });
        
        // Atajos de teclado universales (RFC 3.8)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (playInterval) {
                    stopPlayback();
                    // Notificar a la UI para cambiar botones
                    eventBus.emit('SIMULATION_STARTED'); // Hack rápido: los botones escuchan esto para Play/Pause
                } else {
                    startPlayback();
                }
            }
        });

        // Carga Inicial
        loadAlgorithm(initialAlgo, customInitialArray);
        console.log("UI y Motor conectados exitosamente.");
    }
}

new App();
