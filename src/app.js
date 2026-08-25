/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos.
 */

import { runEngineTests } from './core/engine/EngineTester.js';
import Simulator from './core/engine/Simulator.js';
import BubbleSort from './core/algorithms/BubbleSort.js';
import { PRNG } from './utils/mathUtils.js';
import { eventBus } from './core/events/EventBus.js';
import BasicRenderer from './components/BasicRenderer.js';

class App {
    constructor() {
        console.log("Inicializando Entorno Interactivo de Visualización de Algoritmos...");
        
        // Ejecutar las pruebas del motor en consola
        runEngineTests();
        
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupUI();
        });
    }

    setupUI() {
        const root = document.getElementById('app-root');
        if (!root) {
            console.error("No se encontró el contenedor principal #app-root");
            return;
        }

        console.log("UI montada exitosamente. Arrancando Simulación Visual.");

        // 1. Array determinista
        const prng = new PRNG(1234);
        const initialArray = prng.generateRandomArray(25, 10, 100);

        // 2. Instanciar Renderizador Básico
        const renderer = new BasicRenderer('visualization-container', eventBus);

        // 3. Instanciar Motor Lógico
        const simulator = new Simulator(new BubbleSort(), initialArray, eventBus);
        simulator.initialize();

        // 4. Ciclo Automático (Avanza un paso cada 150ms)
        setInterval(() => {
            if (simulator.status !== 'completed' && simulator.status !== 'error') {
                simulator.stepForward();
            }
        }, 150);
    }
}

new App();
