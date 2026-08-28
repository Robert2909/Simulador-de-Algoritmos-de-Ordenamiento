import Simulator from '../core/engine/Simulator.js';
import { router } from '../router/Router.js';
import { PRNG } from '../utils/mathUtils.js';
import { eventBus } from '../core/events/EventBus.js';
import { appStore } from '../store/Store.js';

import '../components/simulation/ArrayView.js';
import '../components/simulation/CodeViewer.js';
import '../components/simulation/SimulationControls.js';
import '../components/simulation/InputControls.js';

export class SimulatorView extends HTMLElement {
    constructor() {
        super();

        this.currentSimulator = null;
        this.playInterval = null;
        this.currentDelayMs = Math.max(10, Math.floor(150 / (appStore.getState().preferences.speed || 1.0)));
        
        this.boundStartPlayback = this.startPlayback.bind(this);
        this.boundStopPlayback = this.stopPlayback.bind(this);
        this.boundStepForward = () => this.currentSimulator?.stepForward();
        this.boundStepBackward = () => this.currentSimulator?.stepBackward();
        this.boundSpeedChanged = (newDelayMs) => {
            this.currentDelayMs = newDelayMs;
            if (this.playInterval) this.startPlayback();
        };
        this.boundDataInput = (payload) => this.handleDataInput(payload);
        this.boundKeydown = this.handleKeydown.bind(this);
        this.boundAlgoChange = this.handleAlgoChange.bind(this);
    }

    connectedCallback() {
        // Obligatorio para que el Web Component llene el viewport flex
        this.style.display = 'flex';
        this.style.flexDirection = 'column';
        this.style.flex = '1';
        this.style.overflow = 'hidden';

        this.render();
        this.setupRouting();
        this.bindEvents();
    }

    disconnectedCallback() {
        this.stopPlayback();
        this.unbindEvents();
    }

    render() {
        this.innerHTML = `
            <main class="app-main" style="flex: 1;">
                <array-view id="visualization-container" class="visualization-area" data-i18n-aria="aria_visualization" aria-label="Visualización del arreglo"></array-view>
                <code-viewer id="code-container" class="code-area" data-i18n-aria="aria_code" aria-label="Código fuente del algoritmo"></code-viewer>
            </main>
            <footer class="app-footer">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
                    <input-controls></input-controls>
                    <simulation-controls id="controls-container" class="controls-area" data-i18n-aria="aria_controls" aria-label="Controles de simulación"></simulation-controls>
                </div>
            </footer>
        `;
    }

    bindEvents() {
        eventBus.subscribe('PLAY_REQUESTED', this.boundStartPlayback);
        eventBus.subscribe('PAUSE_REQUESTED', this.boundStopPlayback);
        eventBus.subscribe('STEP_FORWARD_REQUESTED', this.boundStepForward);
        eventBus.subscribe('STEP_BACKWARD_REQUESTED', this.boundStepBackward);
        eventBus.subscribe('SPEED_CHANGED', this.boundSpeedChanged);
        eventBus.subscribe('DATA_INPUT_SUBMITTED', this.boundDataInput);
        document.addEventListener('keydown', this.boundKeydown);
        
        const algoSelector = document.getElementById('algo-selector');
        if (algoSelector) {
            algoSelector.addEventListener('change', this.boundAlgoChange);
        }
    }

    unbindEvents() {
        eventBus.unsubscribe('PLAY_REQUESTED', this.boundStartPlayback);
        eventBus.unsubscribe('PAUSE_REQUESTED', this.boundStopPlayback);
        eventBus.unsubscribe('STEP_FORWARD_REQUESTED', this.boundStepForward);
        eventBus.unsubscribe('STEP_BACKWARD_REQUESTED', this.boundStepBackward);
        eventBus.unsubscribe('SPEED_CHANGED', this.boundSpeedChanged);
        eventBus.unsubscribe('DATA_INPUT_SUBMITTED', this.boundDataInput);
        document.removeEventListener('keydown', this.boundKeydown);
        
        const algoSelector = document.getElementById('algo-selector');
        if (algoSelector) {
            algoSelector.removeEventListener('change', this.boundAlgoChange);
        }
    }

    handleKeydown(e) {
        if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (this.playInterval) {
                eventBus.emit('PAUSE_REQUESTED');
            } else {
                eventBus.emit('PLAY_REQUESTED');
            }
        }
    }

    handleAlgoChange(e) {
        window.location.hash = e.target.value;
        this.loadAlgorithm(e.target.value);
    }

    stopPlayback() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    startPlayback() {
        this.stopPlayback();
        this.playInterval = setInterval(() => {
            if (this.currentSimulator.status === 'completed' || this.currentSimulator.status === 'error') {
                this.stopPlayback();
                eventBus.emit('SIMULATION_COMPLETED');
            } else {
                this.currentSimulator.stepForward();
            }
        }, this.currentDelayMs);
    }

    setupRouting() {
        const initialConfig = router.getInitialConfig();
        const initialAlgo = initialConfig.algoId;
        
        let customInitialArray = null;
        if (initialConfig.customArrayConfig) {
            const prng = new PRNG(initialConfig.customArrayConfig.seed);
            customInitialArray = prng.generateRandomArray(initialConfig.customArrayConfig.size, 10, 100);
        }

        const algoSelector = document.getElementById('algo-selector');
        if (algoSelector) {
            algoSelector.value = initialAlgo;
        }

        this.loadAlgorithm(initialAlgo, customInitialArray);
    }

    handleDataInput(payload) {
        const algoSelector = document.getElementById('algo-selector');
        const currentAlgo = algoSelector ? algoSelector.value : router.parseHash().algoId;
        router.updateHash(currentAlgo, payload.seed, payload.array.length);
        this.loadAlgorithm(currentAlgo, payload.array);
    }

    loadAlgorithm(algoId, customArray = null) {
        this.stopPlayback();
        eventBus.emit('SIMULATION_COMPLETED');
        
        let initialArray = customArray;
        if (!initialArray) {
            const prng = new PRNG(1234); 
            initialArray = prng.generateRandomArray(appStore.getState().preferences.arraySize || 10, 10, 100);
        }
        
        const algo = router.getAlgorithmInstance(algoId);
        const algoData = router.getAlgorithmData(algoId);
        
        eventBus.emit('ALGORITHM_LOADED', { code: algoData.codeText ? algoData.codeText.split('\n') : algo.code });
        
        this.currentSimulator = new Simulator(algo, initialArray, eventBus);
        this.currentSimulator.initialize();
        
        window.location.hash = algoId;
    }
}

customElements.define('simulator-view', SimulatorView);
