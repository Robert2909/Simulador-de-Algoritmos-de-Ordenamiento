import BubbleSort from '../core/algorithms/BubbleSort.js';

export const ALGORITHMS_REGISTRY = {
    'bubble-sort': {
        name: 'Ordenamiento Burbuja',
        description: 'Algoritmo de ordenamiento simple y cuadrático, excelente para visualizar comparaciones básicas.',
        classRef: BubbleSort, 
        codeText: `for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            swap(arr, j, j + 1);
        }
    }
}`
    },
    'quick-sort': {
        name: 'Ordenamiento Rápido',
        description: 'Algoritmo eficiente de divide y vencerás basado en pivotes.',
        classRef: null,
        codeText: `function quickSort(arr, low, high) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    }
};
