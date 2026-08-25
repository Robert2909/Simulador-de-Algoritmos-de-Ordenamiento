/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos.
 */

import Simulator from './core/engine/Simulator.js';
import BubbleSort from './core/algorithms/BubbleSort.js';
import { PRNG } from './utils/mathUtils.js';
import { eventBus } from './core/events/EventBus.js';

// Importar los Web Components (Se autoconectan al DOM)
import './components/ArrayView.js';
import './components/SimulationControls.js';

class App {
    constructor() {
        console.log("Inicializando Entorno Interactivo de Visualización de Algoritmos...");
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupUI();
        });
    }

    setupUI() {
        const root = document.getElementById('app-root');
        if (!root) return;

        // 1. Array determinista inicial
        const prng = new PRNG(1234);
        const initialArray = prng.generateRandomArray(20, 10, 100);

        // 2. Motor Lógico (Los web components se instancian solos a través del HTML)
        const simulator = new Simulator(new BubbleSort(), initialArray, eventBus);
        simulator.initialize();

        // 4. Orquestación del Tiempo (Player)
        let playInterval = null;
        let currentDelayMs = 150; // Delay inicial (1010 - 860 del slider)

        const stopPlayback = () => {
            if (playInterval) {
                clearInterval(playInterval);
                playInterval = null;
            }
        };

        const startPlayback = () => {
            stopPlayback();
            playInterval = setInterval(() => {
                if (simulator.status === 'completed' || simulator.status === 'error') {
                    stopPlayback();
                    eventBus.emit('SIMULATION_COMPLETED');
                } else {
                    simulator.stepForward();
                }
            }, currentDelayMs);
        };

        eventBus.subscribe('PLAY_REQUESTED', startPlayback);
        eventBus.subscribe('PAUSE_REQUESTED', stopPlayback);
        eventBus.subscribe('STEP_FORWARD_REQUESTED', () => simulator.stepForward());
        eventBus.subscribe('STEP_BACKWARD_REQUESTED', () => simulator.stepBackward());
        
        eventBus.subscribe('SPEED_CHANGED', (newDelayMs) => {
            currentDelayMs = newDelayMs;
            if (playInterval) {
                startPlayback(); // Reinicia el intervalo con la nueva velocidad
            }
        });
        
        console.log("UI y Motor conectados exitosamente.");
    }
}

new App();
