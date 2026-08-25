/**
 * Controlador Principal de la Aplicación
 * Punto de entrada donde se instancian e inicializan los módulos.
 */

import { runEngineTests } from './core/engine/EngineTester.js';

class App {
    constructor() {
        // Inicializamos estado global u orquestador aquí
        console.log("Inicializando Entorno Interactivo de Visualización de Algoritmos...");
        
        // Ejecutar las pruebas del motor según la FASE 1
        runEngineTests();
        
        this.init();
    }

    /**
     * Configura event listeners y arranca la interfaz inicial
     */
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupUI();
        });
    }

    /**
     * Monta los componentes en el DOM
     */
    setupUI() {
        const root = document.getElementById('app-root');
        if (!root) {
            console.error("No se encontró el contenedor principal #app-root");
            return;
        }

        // TODO: Instanciar el Simulator (Motor Lógico)
        // TODO: Instanciar ArrayView, CodeViewer, Controls (Vistas)
        // TODO: Conectar Vistas con eventos del Simulator
        
        console.log("UI montada exitosamente. Lista para inicializar simulación.");
    }
}

// Arrancar la app
new App();
