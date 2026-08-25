import BaseAlgorithm from './BaseAlgorithm.js';

/**
 * BubbleSort.js
 * 
 * Implementación de Bubble Sort usando el nuevo AlgorithmContext.
 * Separa Queries y Commands, emite deltas tipados y usa yield
 * exclusivamente para delimitar el Semantic Time.
 */
export default class BubbleSort extends BaseAlgorithm {
    constructor() {
        super('bubble-sort', 'Bubble Sort');
    }

    *execute(context) {
        const n = context.length('main');
        let swapped;

        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                // Marcar elementos activos (observación visual)
                context.mark(j, 'active');
                context.mark(j + 1, 'active');
                
                // Query derivada (comparación)
                if (context.compare(j, j + 1)) {
                    // Command (mutación del estado matemático)
                    context.swap(j, j + 1);
                    swapped = true;
                }
                
                // Frontera lógica temporal (Step)
                yield;
                
                // Limpiar marcas transitorias
                context.clearMark('active');
            }

            // Marcar el último elemento como ordenado definitivamente
            context.mark(n - i - 1, 'sorted');
            
            // Cierre visual del ciclo exterior opcional (pedagogía)
            // yield; // Se puede omitir si no queremos un step exclusivo para marcar sorted

            if (!swapped) {
                break;
            }
        }
        
        // Al terminar, nos aseguramos de que todos estén marcados
        for (let k = 0; k < n; k++) {
            context.mark(k, 'sorted');
        }
        yield;
    }
}
