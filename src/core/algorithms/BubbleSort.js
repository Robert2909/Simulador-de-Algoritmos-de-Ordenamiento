import BaseAlgorithm from './BaseAlgorithm.js';

export const BUBBLE_SORT_CODE = [
    "function bubbleSort(arr) {",               // 0
    "  const n = arr.length;",                  // 1
    "  let swapped;",                           // 2
    "  for (let i = 0; i < n - 1; i++) {",      // 3
    "    swapped = false;",                     // 4
    "    for (let j = 0; j < n - i - 1; j++) {",// 5
    "      if (arr[j] > arr[j + 1]) {",         // 6
    "        swap(arr, j, j + 1);",             // 7
    "        swapped = true;",                  // 8
    "      }",                                  // 9
    "    }",                                    // 10
    "    markAsSorted(n - i - 1);",             // 11
    "    if (!swapped) break;",                 // 12
    "  }",                                      // 13
    "  markAllSorted();",                       // 14
    "}"                                         // 15
];

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
        this.code = BUBBLE_SORT_CODE;
    }

    *execute(context) {
        context.setLine(1);
        const n = context.length('main');
        let swapped;

        context.setLine(3);
        for (let i = 0; i < n - 1; i++) {
            context.setLine(4);
            swapped = false;
            
            context.setLine(5);
            for (let j = 0; j < n - i - 1; j++) {
                context.mark(j, 'active');
                context.mark(j + 1, 'active');
                
                context.setLine(6);
                if (context.compare(j, j + 1)) {
                    context.setLine(7);
                    context.swap(j, j + 1);
                    swapped = true;
                }
                
                yield;
                
                context.clearMark('active');
            }

            context.setLine(11);
            context.mark(n - i - 1, 'sorted');
            
            context.setLine(12);
            if (!swapped) {
                break;
            }
        }
        
        context.setLine(14);
        for (let k = 0; k < n; k++) {
            context.mark(k, 'sorted');
        }
        yield;
    }
}
