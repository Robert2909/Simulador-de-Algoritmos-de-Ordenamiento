import { eventBus } from '../core/events/EventBus.js';
import { PRNG } from '../utils/mathUtils.js';
import { storage } from '../utils/StorageManager.js';

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
        const prefs = storage.load();
        const initialSize = prefs.arraySize;
        
        this.innerHTML = `
            <div class="input-controls-wrapper" style="display: flex; gap: var(--spacing-md); align-items: center; flex-wrap: wrap;">
                <div class="speed-control" style="display: flex; gap: 8px; align-items: center;">
                    <label for="array-size" data-i18n="label_size">Tamaño:</label>
                    <input type="range" id="array-size" min="5" max="100" value="${initialSize}" style="width: 100px;">
                    <span id="size-display" style="font-family: var(--font-family-mono); font-size: 0.9rem; min-width: 2ch;">${initialSize}</span>
                </div>
                <button id="btn-generate" class="btn btn-primary" data-i18n="btn_generate">🎲 Random</button>
                
                <div style="display: flex; gap: 8px; align-items: center; margin-left: auto;">
                    <input type="text" id="csv-input" placeholder="Ej: 5, 12, 4, 8" style="padding: 4px 8px; border-radius: 4px; border: 1px solid oklch(0.5 0 0 / 0.2); width: 150px;">
                    <button id="btn-submit-csv" class="btn btn-primary">Cargar CSV</button>
                </div>
            </div>
        `;
    }

    setupListeners() {
        this.sizeInput = this.querySelector('#array-size');
        this.sizeDisplay = this.querySelector('#size-display');
        this.btnGenerate = this.querySelector('#btn-generate');
        this.csvInput = this.querySelector('#csv-input');
        this.btnSubmitCsv = this.querySelector('#btn-submit-csv');

        this.sizeInput.addEventListener('input', (e) => {
            this.sizeDisplay.textContent = e.target.value;
        });

        this.sizeInput.addEventListener('change', () => {
            this.generateAndEmit();
        });

        this.btnGenerate.addEventListener('click', () => {
            this.generateAndEmit();
        });
        
        this.btnSubmitCsv.addEventListener('click', () => {
            this.submitCsv();
        });
        
        this.csvInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitCsv();
        });
    }

    generateAndEmit() {
        const size = parseInt(this.sizeInput.value, 10) || 20;
        storage.save({ arraySize: size });
        const seed = Math.floor(Math.random() * 999999);
        const prng = new PRNG(seed);
        const newArray = prng.generateRandomArray(size, 5, 150);
        eventBus.emit('DATA_INPUT_SUBMITTED', { array: newArray, seed: seed });
    }

    submitCsv() {
        const rawText = this.csvInput.value;
        if (!rawText.trim()) return;
        
        const newArray = rawText.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (newArray.length === 0) return;
        
        storage.save({ arraySize: newArray.length });
        
        // Al ser entrada manual, enviamos null como seed para indicar que no fue generado
        eventBus.emit('DATA_INPUT_SUBMITTED', { array: newArray, seed: null });
    }
}

customElements.define('input-controls', InputControls);
