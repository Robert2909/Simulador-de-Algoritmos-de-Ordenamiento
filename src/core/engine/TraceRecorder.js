export default class TraceRecorder {
    constructor() {
        this.traces = [];
    }

    addTrace(state) {
        if (state) {
            // El estado profundo se asegura por Array Tipados y copias (slice) en lugar de Object.freeze para O(1) impacto.
            this.traces.push(state);
        }
    }

    getTrace(index) {
        if (index >= 0 && index < this.traces.length) {
            return this.traces[index];
        }
        return null;
    }

    getAllTraces() {
        return this.traces;
    }

    clear() {
        this.traces = [];
    }
    
    get totalSteps() {
        return this.traces.length;
    }
}
