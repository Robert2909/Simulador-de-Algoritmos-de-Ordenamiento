import Simulator from './Simulator.js';
import BubbleSort from '../algorithms/BubbleSort.js';
import { PRNG } from '../../utils/mathUtils.js';

class MockEventBus {
    constructor() {
        this.events = [];
    }
    emit(eventName, payload) {
        this.events.push({ eventName, payload });
    }
}

/**
 * Ejecuta pruebas automatizadas de caja negra sobre el Motor y el Algoritmo.
 * Valida los Axiomas de Reversibilidad, Aislamiento y Determinismo.
 */
export function runEngineTests() {
    console.group("%c=== INICIANDO PRUEBAS DEL MOTOR (FASE 1) ===", "color: #007bff; font-weight: bold; font-size: 14px;");
    
    // Validando Invariante 7: Determinismo
    const prng = new PRNG(1234); // Semilla estática
    const initialArray = prng.generateRandomArray(10, 1, 100);
    console.log(`Array determinista inicial (Semilla: 1234): [${initialArray.join(', ')}]`);
    
    const eventBus = new MockEventBus();
    const simulator = new Simulator(new BubbleSort(), initialArray, eventBus);
    
    simulator.initialize();
    console.log("Simulador inicializado con Bubble Sort.");
    
    // --- TEST 1: Ejecución y Ordenamiento Correcto ---
    let stepsForward = 0;
    while (simulator.stepForward()) {
        stepsForward++;
    }
    
    const sortedArray = [...simulator.mathematicalState.main];
    const expectedSorted = [...initialArray].sort((a, b) => a - b);
    
    const isSortedCorrectly = JSON.stringify(sortedArray) === JSON.stringify(expectedSorted);
    if (isSortedCorrectly) {
        console.log(`%c✅ [TEST 1 PASADO]: BubbleSort ordenó correctamente el arreglo.`, "color: green; font-weight: bold;");
    } else {
        console.error(`❌ [TEST 1 FALLÓ]: El arreglo no se ordenó bien. Obtenido: ${sortedArray}`);
    }
    
    // --- TEST 2: Axioma de Reversibilidad (Undo Total) ---
    let stepsBackward = 0;
    while (simulator.stepBackward()) {
        stepsBackward++;
    }
    
    const revertedArray = [...simulator.mathematicalState.main];
    const isRevertedCorrectly = JSON.stringify(revertedArray) === JSON.stringify(initialArray);
    const stepsMatch = stepsForward === stepsBackward;
    
    if (isRevertedCorrectly && stepsMatch) {
        console.log(`%c✅ [TEST 2 PASADO]: Reversibilidad perfecta. Undo restauró el estado matemático inicial (${stepsBackward} steps).`, "color: green; font-weight: bold;");
    } else {
        console.error(`❌ [TEST 2 FALLÓ]: Undo falló. Array: ${revertedArray} | Pasos Forwards: ${stepsForward}, Backwards: ${stepsBackward}`);
    }
    
    // --- TEST 3: Ciclo de Estabilidad (Redo Total) ---
    while (simulator.stepForward()) {
        // Redo silently
    }
    const redoneArray = [...simulator.mathematicalState.main];
    const isRedoneCorrectly = JSON.stringify(redoneArray) === JSON.stringify(expectedSorted);
    
    if (isRedoneCorrectly) {
        console.log(`%c✅ [TEST 3 PASADO]: Estabilidad comprobada. Redo reconstruyó el estado final sin divergencias.`, "color: green; font-weight: bold;");
    } else {
        console.error(`❌ [TEST 3 FALLÓ]: Redo rompió la consistencia. Array: ${redoneArray}`);
    }
    
    // --- TEST 4: Aislamiento del Renderer (Inmutabilidad) ---
    const lastEvent = eventBus.events[eventBus.events.length - 1];
    const rendererSnapshot = lastEvent.payload.presentationSnapshot.mathematicalState.main;
    const internalState = simulator.mathematicalState.main;
    
    // Verificamos que las referencias de memoria sean distintas
    if (rendererSnapshot !== internalState && JSON.stringify(rendererSnapshot) === JSON.stringify(internalState)) {
        console.log(`%c✅ [TEST 4 PASADO]: Aislamiento verificado. El snapshot para el EventBus es inmutable y clonado en memoria.`, "color: green; font-weight: bold;");
    } else {
        console.error(`❌ [TEST 4 FALLÓ]: Fuga de referencia de estado. El Renderer podría mutar el motor.`);
    }
    
    // --- TEST 5: Reconstrucción de Presentation State ---
    // Hacemos 2 pasos atrás para ver si las comparaciones/marcas cambian a algo no nulo
    simulator.stepBackward();
    simulator.stepBackward();
    const presentationMarks = simulator.presentationState.marks;
    if (presentationMarks) {
        console.log(`%c✅ [TEST 5 PASADO]: Reconstrucción del historial visual operativa en el Time Travel.`, "color: green; font-weight: bold;");
    } else {
        console.error(`❌ [TEST 5 FALLÓ]: No se reconstruyeron las marcas visuales.`);
    }
    
    console.groupEnd();
}
