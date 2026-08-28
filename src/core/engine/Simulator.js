import AlgorithmContext from './AlgorithmContext.js';
import Trace from './Trace.js';
import Step from './Step.js';

/**
 * Simulator.js
 * 
 * Motor central de simulación. Implementa los Axiomas de Reversibilidad,
 * separando el tiempo semántico de la ejecución.
 */
export default class Simulator {
    constructor(algorithmInstance, initialArray, eventBus = null) {
        this.algorithm = algorithmInstance;
        this.eventBus = eventBus;
        
        // Estado Matemático
        this.mathematicalState = {
            main: [...initialArray],
            buffers: {}
        };
        
        // Copia inmutable cruda para Testing de Caja Negra (RFC 4.7)
        this._initialArrayBackup = [...initialArray];
        
        // Estado de Presentación
        this.presentationState = {
            activePointers: {},
            marks: {},
            lastComparison: null,
            currentLine: null
        };
        
        this.trace = new Trace();
        this.status = 'idle'; 
        this.currentStepIndex = 0; // Base 0
        
        this._currentStep = new Step(0);
        this._iterator = null;
        this._isGenerating = false; // Bandera para saber si mutamos en tiempo real
        
        this.context = new AlgorithmContext(this);
    }

    initialize() {
        this._iterator = this.algorithm.execute(this.context);
        this.status = 'ready';
        // Emitir el fotograma inicial (paso 0) para que la UI se dibuje instantáneamente
        this._emitStepApplied(new Step(0));
    }

    stepForward() {
        if (this.currentStepIndex >= this.trace.length) {
            // Explorar futuro
            if (this.status === 'completed' || this.status === 'error') return false;
            
            this._isGenerating = true;
            try {
                const result = this._iterator.next();
                this._isGenerating = false;
                
                if (result.done) {
                    this.status = 'completed';
                    if (!this._currentStep.isEmpty()) {
                        this.trace.addStep(this._currentStep);
                        this.currentStepIndex++;
                        const step = this._currentStep;
                        this._currentStep = new Step(this.trace.length);
                        this._emitStepApplied(step);
                    }
                    
                    // Estrategia de Testing (RFC 4.7) - Ejecutar silenciosamente
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
                        import('../../utils/Validator.js').then(module => {
                            module.Validator.validateSimulation(this, this._initialArrayBackup);
                        });
                    }
                    
                    return false;
                }
                
                const step = this._currentStep;
                this.trace.addStep(step);
                this.currentStepIndex++;
                this._currentStep = new Step(this.trace.length);
                
                this._emitStepApplied(step);
                return true;
                
            } catch(e) {
                this.status = 'error';
                console.error("Engine Error:", e);
                throw e;
            }
        } else {
            // Replay (Redo)
            const step = this.trace.getStep(this.currentStepIndex);
            this._applyStep(step);
            this.currentStepIndex++;
            this._emitStepApplied(step);
            return true;
        }
    }

    stepBackward() {
        if (this.currentStepIndex <= 0) return false;
        
        this.currentStepIndex--;
        const step = this.trace.getStep(this.currentStepIndex);
        this._undoStep(step);
        this._reconstructPresentationState(this.currentStepIndex);
        
        this._emitStepApplied(step, true);
        return true;
    }

    // --- API del Contexto (Queries & Commands) ---

    getValue(index, bufferName = 'main') {
        const buffer = this._getBuffer(bufferName);
        if (index < 0 || index >= buffer.length) {
            throw new Error(`Engine Error: Lectura inválida en '${bufferName}'[${index}]`);
        }
        return buffer[index];
    }

    getBufferLength(bufferName = 'main') {
        return this._getBuffer(bufferName).length;
    }

    registerDelta(delta) {
        // En tiempo real, los commands mutan inmediatamente el estado
        // porque el algoritmo necesita ver el estado correcto en la sig línea.
        this._applyOperation(delta);
        this._currentStep.addOperation(delta);
    }

    // --- Funciones Core de Reversibilidad ---

    _applyStep(step) {
        for (const op of step.operations) {
            this._applyOperation(op);
        }
    }

    _undoStep(step) {
        // Operaciones inversas en orden LIFO
        for (let i = step.operations.length - 1; i >= 0; i--) {
            const op = step.operations[i];
            
            if (op.type === 'SWAP') {
                const buffer = this._getBuffer(op.buffer);
                this._doSwap(buffer, op.leftIndex, op.rightIndex);
            } else if (op.type === 'SET') {
                const buffer = this._getBuffer(op.buffer);
                buffer[op.index] = op.previousValue; 
            }
        }
    }

    _applyOperation(op) {
        if (op.type === 'SWAP') {
            const buffer = this._getBuffer(op.buffer);
            this._validateIndex(buffer, op.leftIndex, op.rightIndex);
            this._doSwap(buffer, op.leftIndex, op.rightIndex);
        } else if (op.type === 'SET') {
            const buffer = this._getBuffer(op.buffer);
            this._validateIndex(buffer, op.index);
            buffer[op.index] = op.nextValue;
        } else if (op.type === 'MARK') {
            this.presentationState.marks[op.role] = op.indices;
        } else if (op.type === 'CLEAR_MARK') {
            delete this.presentationState.marks[op.role];
        } else if (op.type === 'COMPARE') {
            this.presentationState.lastComparison = {
                left: op.leftIndex,
                right: op.rightIndex,
                result: op.result
            };
        } else if (op.type === 'SET_LINE') {
            this.presentationState.currentLine = op.lineIndex;
        } else if (op.type === 'SET_POINTER') {
            this.presentationState.activePointers[op.name] = op.index;
        } else if (op.type === 'CLEAR_POINTER') {
            delete this.presentationState.activePointers[op.name];
        }
    }

    _reconstructPresentationState(targetStepIndex) {
        this.presentationState.activePointers = {};
        this.presentationState.marks = {};
        this.presentationState.lastComparison = null;
        this.presentationState.currentLine = null;
        
        for (let s = 0; s < targetStepIndex; s++) {
            const step = this.trace.getStep(s);
            for (const op of step.operations) {
                if (op.type === 'MARK') {
                    this.presentationState.marks[op.role] = op.indices;
                } else if (op.type === 'CLEAR_MARK') {
                    delete this.presentationState.marks[op.role];
                } else if (op.type === 'SET_POINTER') {
                    this.presentationState.activePointers[op.name] = op.index;
                } else if (op.type === 'CLEAR_POINTER') {
                    delete this.presentationState.activePointers[op.name];
                } else if (op.type === 'COMPARE') {
                    this.presentationState.lastComparison = {
                        left: op.leftIndex,
                        right: op.rightIndex,
                        result: op.result
                    };
                } else if (op.type === 'SET_LINE') {
                    this.presentationState.currentLine = op.lineIndex;
                }
            }
        }
    }

    // --- Helpers Internos ---

    _getBuffer(bufferName) {
        if (bufferName === 'main') return this.mathematicalState.main;
        if (!this.mathematicalState.buffers[bufferName]) {
            this.mathematicalState.buffers[bufferName] = [];
        }
        return this.mathematicalState.buffers[bufferName];
    }

    _validateIndex(buffer, ...indices) {
        for (const idx of indices) {
            if (idx < 0 || idx >= buffer.length) {
                throw new Error(`Engine Error: Índice ${idx} fuera de rango.`);
            }
        }
    }

    _doSwap(buffer, i, j) {
        if (i !== j) {
            const temp = buffer[i];
            buffer[i] = buffer[j];
            buffer[j] = temp;
        }
    }

    _emitStepApplied(step, isUndo = false) {
        if (!this.eventBus) return;
        
        const presentationSnapshot = {
            activePointers: { ...this.presentationState.activePointers },
            marks: { ...this.presentationState.marks },
            lastComparison: this.presentationState.lastComparison 
                ? { ...this.presentationState.lastComparison } : null,
            currentLine: this.presentationState.currentLine,
            mathematicalState: {
                main: [...this.mathematicalState.main]
            }
        };

        this.eventBus.emit('STEP_APPLIED', {
            step: this.currentStepIndex,
            isUndo,
            operations: step.operations,
            presentationSnapshot
        });
    }
}
