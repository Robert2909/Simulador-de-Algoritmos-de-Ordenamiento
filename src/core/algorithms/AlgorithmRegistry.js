/**
 * AlgorithmRegistry.js
 * 
 * Diccionario de algoritmos disponibles. Sirve como punto de entrada
 * dinámico para el enrutador (Router) de la aplicación.
 */
import BubbleSort from './BubbleSort.js';

export const AlgorithmRegistry = {
    'bubble-sort': BubbleSort
};

export function getAlgorithmInstance(id) {
    const AlgoClass = AlgorithmRegistry[id] || AlgorithmRegistry['bubble-sort'];
    return new AlgoClass();
}
