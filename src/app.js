/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos.
 */

import Simulator from './core/engine/Simulator.js';
import { getAlgorithmInstance } from './core/algorithms/AlgorithmRegistry.js';
import { PRNG } from './utils/mathUtils.js';
import { eventBus } from './core/events/EventBus.js';
import { i18n } from './utils/I18nEngine.js';
import { themeManager } from './utils/ThemeManager.js';

// Importar los Web Components (Se autoconectan al DOM)
import './components/ArrayView.js';
import './components/SimulationControls.js';
import './components/CodeViewer.js';

class App {
    constructor() {
        console.log("Inicializando Entorno Interactivo de Visualización de Algoritmos...");
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            i18n.translateDOM();
            
            const langSelector = document.getElementById('lang-selector');
            if (langSelector) langSelector.addEventListener('change', (e) => i18n.setLocale(e.target.value));

            const themeToggleBtn = document.getElementById('theme-toggle');
            if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => themeManager.toggleTheme());

            this.setupUI();
        });
    }

    setupUI() {
        const root = document.getElementById('app-root');
        if (!root) return;

        let currentSimulator = null;
        let playInterval = null;
        let currentDelayMs = 150;

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
        const loadAlgorithm = (algoId) => {
            stopPlayback();
            eventBus.emit('SIMULATION_COMPLETED'); // Forza reset UI Controls
            
            const prng = new PRNG(1234); 
            const initialArray = prng.generateRandomArray(20, 10, 100);
            
            const algo = getAlgorithmInstance(algoId);
            eventBus.emit('ALGORITHM_LOADED', { code: algo.code });
            
            currentSimulator = new Simulator(algo, initialArray, eventBus);
            currentSimulator.initialize();
            
            window.location.hash = algoId;
        };

        // Leer URL Hash inicial
        const initialAlgo = window.location.hash.replace('#', '') || 'bubble-sort';
        
        const algoSelector = document.getElementById('algo-selector');
        if (algoSelector) {
            algoSelector.value = initialAlgo;
            algoSelector.addEventListener('change', (e) => loadAlgorithm(e.target.value));
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

        // Carga Inicial
        loadAlgorithm(initialAlgo);
        console.log("UI y Motor conectados exitosamente.");
    }
}

new App();
