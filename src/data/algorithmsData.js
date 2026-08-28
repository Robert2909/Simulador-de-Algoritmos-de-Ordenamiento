import BubbleSort from '../core/algorithms/BubbleSort.js';
import SelectionSort from '../core/algorithms/SelectionSort.js';

export const ALGORITHMS_REGISTRY = {
    'bubble-sort': {
        name: 'Ordenamiento Burbuja',
        description: 'Algoritmo de ordenamiento simple y cuadrático, excelente para visualizar comparaciones básicas.',
        classRef: BubbleSort
    },
    'selection-sort': {
        name: 'Ordenamiento por Selección',
        description: 'Algoritmo de ordenamiento que selecciona iterativamente el elemento más pequeño y lo coloca en su posición correcta.',
        classRef: SelectionSort
    },
    'quick-sort': {
        name: 'Ordenamiento Rápido',
        description: 'Algoritmo eficiente de divide y vencerás basado en pivotes.',
        classRef: null
    }
};
