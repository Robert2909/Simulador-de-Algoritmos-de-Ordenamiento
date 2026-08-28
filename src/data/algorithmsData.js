import BubbleSort from '../core/algorithms/BubbleSort.js';

export const ALGORITHMS_REGISTRY = {
    'bubble-sort': {
        name: 'Ordenamiento Burbuja',
        description: 'Algoritmo de ordenamiento simple y cuadrático, excelente para visualizar comparaciones básicas.',
        classRef: BubbleSort
    },
    'quick-sort': {
        name: 'Ordenamiento Rápido',
        description: 'Algoritmo eficiente de divide y vencerás basado en pivotes.',
        classRef: null
    }
};
