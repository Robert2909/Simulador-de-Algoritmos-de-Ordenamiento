/**
 * Step.js
 * 
 * Agrupación lógica de operaciones (Deltas) que ocurren en un instante de "Tiempo Semántico".
 */
export default class Step {
    constructor(index) {
        this.index = index;
        this.operations = [];
    }

    addOperation(delta) {
        this.operations.push(delta);
    }

    isEmpty() {
        return this.operations.length === 0;
    }
}
