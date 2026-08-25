/**
 * AlgorithmContext.js
 * 
 * Contrato estricto (API) inyectado en la función generadora del algoritmo.
 * Proporciona métodos para leer datos (Queries) y solicitar operaciones
 * visuales/matemáticas (Commands) sin mutar directamente el estado global.
 */
export default class AlgorithmContext {
    constructor(engine) {
        this.engine = engine;
    }

    // --- Queries (No generan traza, solo leen) ---

    /**
     * Obtiene el valor en un índice específico.
     */
    get(index, buffer = 'main') {
        return this.engine.getValue(index, buffer);
    }

    /**
     * Obtiene el tamaño del arreglo.
     */
    length(buffer = 'main') {
        return this.engine.getBufferLength(buffer);
    }

    // --- Observational Operations (Eventos de traza visual, no matemáticos) ---

    /**
     * Compara dos valores y registra la observación visual.
     */
    compare(i, j, buffer = 'main') {
        const valI = this.get(i, buffer);
        const valJ = this.get(j, buffer);
        const result = valI > valJ;
        
        this.engine.registerDelta({
            type: 'COMPARE',
            buffer,
            leftIndex: i,
            rightIndex: j,
            result
        });
        
        return result;
    }

    /**
     * Marca un índice (o un conjunto de índices) con un rol visual semántico (Ej. 'pivot').
     * @param {number|number[]} indices - Índice o arreglo de índices a marcar.
     * @param {string} role - Rol semántico del canal visual.
     * @param {string} buffer - Opcional.
     */
    mark(indices, role, buffer = 'main') {
        const idxArray = Array.isArray(indices) ? indices : [indices];
        this.engine.registerDelta({
            type: 'MARK',
            buffer,
            indices: idxArray,
            role
        });
    }

    /**
     * Limpia un rol visual específico.
     */
    clearMark(role, buffer = 'main') {
        this.engine.registerDelta({
            type: 'CLEAR_MARK',
            buffer,
            role
        });
    }

    // --- State Mutations (Commands matemáticos reversibles) ---

    /**
     * Solicita el intercambio de dos valores.
     */
    swap(i, j, buffer = 'main') {
        this.engine.registerDelta({
            type: 'SWAP',
            buffer,
            leftIndex: i,
            rightIndex: j
        });
    }

    /**
     * Solicita la mutación de un valor (con memoria del estado previo).
     */
    set(index, value, buffer = 'main') {
        const previousValue = this.get(index, buffer);
        this.engine.registerDelta({
            type: 'SET',
            buffer,
            index,
            previousValue,
            nextValue: value
        });
    }
}
