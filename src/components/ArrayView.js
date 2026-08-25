/**
 * ArrayView.js
 * 
 * Web Component puro (Custom Element) que maneja la visualización.
 * Respeta el ciclo de vida estricto para evitar Memory Leaks (RFC 3.4).
 */
import { eventBus } from '../core/events/EventBus.js';

export default class ArrayView extends HTMLElement {
    constructor() {
        super();
        this.handleStepApplied = this.updateUI.bind(this);
    }

    connectedCallback() {
        // Obligación absoluta del RFC: Suscripción en el mount
        eventBus.subscribe('STEP_APPLIED', this.handleStepApplied);
    }

    disconnectedCallback() {
        // Obligación absoluta del RFC: Desuscripción para evitar listeners zombis
        eventBus.unsubscribe('STEP_APPLIED', this.handleStepApplied);
    }

    updateUI(payload) {
        const state = payload.presentationSnapshot.mathematicalState.main;
        const marks = payload.presentationSnapshot.marks || {};
        
        // Renderizado Vanilla
        this.innerHTML = '';
        const maxVal = Math.max(...state, 1);
        
        state.forEach((val, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${(val / maxVal) * 100}%`;
            
            if (marks['active'] && marks['active'].includes(index)) bar.classList.add('array-bar--active');
            if (marks['compare'] && marks['compare'].includes(index)) bar.classList.add('array-bar--compare');
            if (marks['swap'] && marks['swap'].includes(index)) bar.classList.add('array-bar--swap');
            if (marks['sorted'] && marks['sorted'].includes(index)) bar.classList.add('array-bar--sorted');
            
            // Atributos Accesibles (RFC 3.8)
            bar.setAttribute('role', 'meter');
            bar.setAttribute('aria-valuenow', val);
            
            this.appendChild(bar);
        });
    }
}

// Registrar el Web Component
customElements.define('array-view', ArrayView);
