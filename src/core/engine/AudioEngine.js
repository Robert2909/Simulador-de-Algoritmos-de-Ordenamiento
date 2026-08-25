/**
 * AudioEngine.js
 * 
 * Cumple con el RFC 5.3 (Sonificación Defensiva).
 * Convierte los valores del arreglo en frecuencias audibles usando Web Audio API,
 * aplicando envolventes para evitar "pops" acústicos.
 */
import { eventBus } from '../events/EventBus.js';

export class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.isMuted = false;
        
        eventBus.subscribe('STEP_APPLIED', this.handleStep.bind(this));
        
        // Política de Autoplay: Inicializar en el primer click
        const unlock = () => {
            if (!this.audioCtx) this.init();
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.1; // Volumen general bajo para no ensordecer
        this.masterGain.connect(this.audioCtx.destination);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            // Transición suave al silenciar para no cortar bruscamente
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.1, this.audioCtx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    playTone(frequency, type = 'sine', duration = 0.05) {
        if (this.isMuted || !this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        
        // RFC 5.3: Envolvente Anti-Pops
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration * 5); // Dejar que la envolvente caiga a 0
    }

    handleStep(payload) {
        if (this.isMuted || !this.audioCtx || payload.isUndo) return;
        
        const array = payload.presentationSnapshot.mathematicalState.main;
        const maxVal = Math.max(...array, 1);
        
        for (const op of payload.operations) {
            if (op.type === 'COMPARE') {
                const val = array[op.leftIndex];
                // Frecuencia base suave: 200Hz a 800Hz
                const freq = 200 + (val / maxVal) * 600;
                this.playTone(freq, 'sine', 0.03);
            } else if (op.type === 'SWAP') {
                const val = array[op.leftIndex];
                // Frecuencia aguda/metálica para impacto: 300Hz a 900Hz
                const freq = 300 + (val / maxVal) * 600;
                this.playTone(freq, 'triangle', 0.05);
            }
        }
    }
}

export const audioEngine = new AudioEngine();
