import { eventBus } from '../core/events/EventBus.js';
import { PRNG } from '../utils/mathUtils.js';
import { i18n } from '../utils/I18nEngine.js';

export default class InputControls extends HTMLElement {
    constructor() {
        super();
        this.prng = new PRNG(Date.now()); 
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
    }

    render() {
        this.innerHTML = `
            <div class="input-controls-wrapper" style="display: flex; gap: var(--spacing-md); align-items: center;">
                <div class="speed-control">
                    <label for="array-size" data-i18n="label_size">Tamaño:</label>
                    <input type="range" id="array-size" min="5" max="100" value="20" style="width: 100px;">
                    <span id="size-display" style="font-family: var(--font-family-mono); font-size: 0.9rem; min-width: 2ch;">20</span>
                </div>
                <button id="btn-generate" class="btn btn-primary" data-i18n="btn_generate">🎲 Random</button>
            </div>
        `;
    }

    setupListeners() {
        this.sizeInput = this.querySelector('#array-size');
        this.sizeDisplay = this.querySelector('#size-display');
        this.btnGenerate = this.querySelector('#btn-generate');

        this.sizeInput.addEventListener('input', (e) => {
            this.sizeDisplay.textContent = e.target.value;
        });

        this.sizeInput.addEventListener('change', () => {
            this.generateAndEmit();
        });

        this.btnGenerate.addEventListener('click', () => {
            this.generateAndEmit();
        });
    }

    generateAndEmit() {
        const size = parseInt(this.sizeInput.value, 10) || 20;
        const seed = Math.floor(Math.random() * 999999);
        const prng = new PRNG(seed);
        const newArray = prng.generateRandomArray(size, 5, 150);
        eventBus.emit('DATA_INPUT_SUBMITTED', { array: newArray, seed: seed });
    }
}

customElements.define('input-controls', InputControls);
