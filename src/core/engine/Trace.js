import Step from './Step.js';

/**
 * Trace.js
 * 
 * Línea de tiempo que almacena los pasos generados por un algoritmo.
 */
export default class Trace {
    constructor() {
        this.steps = [];
    }

    addStep(step) {
        this.steps.push(step);
    }

    getStep(index) {
        return this.steps[index] || null;
    }

    get length() {
        return this.steps.length;
    }
}
