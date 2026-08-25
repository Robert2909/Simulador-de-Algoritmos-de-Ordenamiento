/**
 * Controls.js
 * 
 * Componente visual para los controles de reproducción.
 * Traduce las interacciones del usuario (clicks, sliders) en "Intenciones"
 * enviadas a través del EventBus. No muta el motor directamente.
 */
export default class Controls {
    constructor(containerId, eventBus) {
        this.container = document.getElementById(containerId);
        this.eventBus = eventBus;
        this.isPlaying = false;
        
        // Elementos del DOM
        this.btnPrev = document.getElementById('btn-prev');
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.btnNext = document.getElementById('btn-next');
        this.speedSlider = document.getElementById('speed-slider');

        this.bindEvents();
    }

    bindEvents() {
        this.btnPlayPause.addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            this.updatePlayBtnUI();
            
            if (this.isPlaying) {
                this.eventBus.emit('PLAY_REQUESTED');
            } else {
                this.eventBus.emit('PAUSE_REQUESTED');
            }
        });

        this.btnNext.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.eventBus.emit('STEP_FORWARD_REQUESTED');
            }
        });

        this.btnPrev.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.eventBus.emit('STEP_BACKWARD_REQUESTED');
            }
        });

        this.speedSlider.addEventListener('input', (e) => {
            // Invertimos lógicamente: slider a la derecha (alto) = menos milisegundos (más rápido)
            // Asumimos slider min 10, max 1000. 
            // Si slider = 1000, delay = 10ms. Si slider = 10, delay = 1000ms.
            const sliderVal = parseInt(e.target.value, 10);
            const delayMs = 1010 - sliderVal; 
            this.eventBus.emit('SPEED_CHANGED', delayMs);
        });

        // Escuchar cuando el motor llegue al final por sí solo para auto-pausar la UI
        this.eventBus.subscribe('SIMULATION_COMPLETED', () => {
            this.isPlaying = false;
            this.updatePlayBtnUI();
        });
    }

    updatePlayBtnUI() {
        this.btnPlayPause.textContent = this.isPlaying ? '⏸ Pausa' : '▶ Play';
        if (this.isPlaying) {
            this.btnPlayPause.classList.add('btn-active');
        } else {
            this.btnPlayPause.classList.remove('btn-active');
        }
    }
}
