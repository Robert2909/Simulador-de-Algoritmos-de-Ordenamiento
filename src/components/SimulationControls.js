/**
 * SimulationControls.js
 * 
 * Web Component para los controles. Inyecta su propio HTML y 
 * gestiona el EventBus de manera autónoma.
 */
import { eventBus } from '../core/events/EventBus.js';
import { i18n } from '../utils/I18nEngine.js';
import { storage } from '../utils/StorageManager.js';

export default class SimulationControls extends HTMLElement {
    constructor() {
        super();
        this.isPlaying = false;
        this.handleSimulationCompleted = () => {
            this.isPlaying = false;
            this.updatePlayBtnUI();
        };
    }

    connectedCallback() {
        const prefs = storage.load();
        const initialSliderValue = prefs.speed;

        // Inyectamos el marcado base al conectarse al DOM
        this.innerHTML = `
            <div class="playback-controls">
                <button id="btn-prev" class="btn" data-i18n="btn_prev"></button>
                <button id="btn-play-pause" class="btn btn-primary" data-i18n="btn_play"></button>
                <button id="btn-next" class="btn" data-i18n="btn_next"></button>
            </div>
            <div class="speed-control">
                <label for="speed-slider" data-i18n="label_speed"></label>
                <input type="range" id="speed-slider" min="0.1" max="5.0" step="0.1" value="${initialSliderValue}">
            </div>
        `;

        this.btnPrev = this.querySelector('#btn-prev');
        this.btnPlayPause = this.querySelector('#btn-play-pause');
        this.btnNext = this.querySelector('#btn-next');
        this.speedSlider = this.querySelector('#speed-slider');

        // Traducimos el componente inmediatamente después de inyectarlo
        i18n.translateDOM(this);

        this.handlePlayRequested = () => {
            this.isPlaying = true;
            this.updatePlayBtnUI();
        };
        
        this.handlePauseRequested = () => {
            this.isPlaying = false;
            this.updatePlayBtnUI();
        };

        this.bindEvents();
        eventBus.subscribe('SIMULATION_COMPLETED', this.handleSimulationCompleted);
        eventBus.subscribe('PLAY_REQUESTED', this.handlePlayRequested);
        eventBus.subscribe('PAUSE_REQUESTED', this.handlePauseRequested);
    }

    disconnectedCallback() {
        eventBus.unsubscribe('SIMULATION_COMPLETED', this.handleSimulationCompleted);
        eventBus.unsubscribe('PLAY_REQUESTED', this.handlePlayRequested);
        eventBus.unsubscribe('PAUSE_REQUESTED', this.handlePauseRequested);
    }

    bindEvents() {
        this.btnPlayPause.addEventListener('click', () => {
            eventBus.emit(this.isPlaying ? 'PAUSE_REQUESTED' : 'PLAY_REQUESTED');
        });

        this.btnNext.addEventListener('click', () => {
            if (!this.isPlaying) eventBus.emit('STEP_FORWARD_REQUESTED');
        });

        this.btnPrev.addEventListener('click', () => {
            if (!this.isPlaying) eventBus.emit('STEP_BACKWARD_REQUESTED');
        });

        this.speedSlider.addEventListener('input', (e) => {
            const speedMultiplier = parseFloat(e.target.value) || 1.0; 
            const delayMs = Math.max(10, Math.floor(150 / speedMultiplier));
            eventBus.emit('SPEED_CHANGED', delayMs);
            storage.save({ speed: speedMultiplier });
        });
    }

    updatePlayBtnUI() {
        this.btnPlayPause.textContent = this.isPlaying ? i18n.t('btn_pause') : i18n.t('btn_play');
        if (this.isPlaying) {
            this.btnPlayPause.classList.add('btn-active');
        } else {
            this.btnPlayPause.classList.remove('btn-active');
        }
    }
}

// Registrar el Web Component
customElements.define('simulation-controls', SimulationControls);
