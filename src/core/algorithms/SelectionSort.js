import BaseAlgorithm from './BaseAlgorithm.js';

export const SELECTION_SORT_CODE = [
    "function selectionSort(arr) {",               // 0
    "  const n = arr.length;",                     // 1
    "  for (let i = 0; i < n - 1; i++) {",         // 2
    "    let minIdx = i;",                         // 3
    "    for (let j = i + 1; j < n; j++) {",       // 4
    "      if (arr[j] < arr[minIdx]) {",           // 5
    "        minIdx = j;",                         // 6
    "      }",                                     // 7
    "    }",                                       // 8
    "    if (minIdx !== i) {",                     // 9
    "      swap(arr, i, minIdx);",                 // 10
    "    }",                                       // 11
    "    markAsSorted(i);",                        // 12
    "  }",                                         // 13
    "  markAllSorted();",                          // 14
    "}"                                            // 15
];

export default class SelectionSort extends BaseAlgorithm {
    constructor() {
        super('selection-sort', 'Selection Sort');
        this.code = SELECTION_SORT_CODE;
    }

    *execute(context) {
        context.setLine(1);
        const n = context.length('main');
        yield;

        context.setLine(2);
        yield;
        
        for (let i = 0; i < n - 1; i++) {
            context.setLine(3);
            let minIdx = i;
            yield;
            
            context.setLine(4);
            yield;
            
            for (let j = i + 1; j < n; j++) {
                context.mark(j, 'active');
                context.mark(minIdx, 'compare');
                
                context.setLine(5);
                yield;
                
                // arr[j] < arr[minIdx] is equivalent to compare(minIdx, j) > 0 
                if (context.compare(minIdx, j)) {
                    context.setLine(6);
                    context.clearMark('compare'); // clear old minIdx
                    minIdx = j;
                    yield;
                } else {
                    context.clearMark('active');
                }
                
                context.setLine(4);
                yield;
            }

            context.setLine(9);
            yield;
            
            if (minIdx !== i) {
                context.setLine(10);
                context.swap(i, minIdx);
                yield;
            }
            
            context.clearMark('compare'); // clear minIdx highlight
            
            context.setLine(12);
            context.mark(i, 'sorted');
            yield;
            
            context.setLine(2);
            yield;
        }
        
        context.setLine(14);
        for (let k = 0; k < n; k++) {
            context.mark(k, 'sorted');
        }
        yield;
    }
}
