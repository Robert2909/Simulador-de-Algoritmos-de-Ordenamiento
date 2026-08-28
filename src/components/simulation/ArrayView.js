/**
 * ArrayView.js
 * 
 * Web Component puro (Custom Element) que maneja la visualización.
 * Respeta el ciclo de vida estricto para evitar Memory Leaks (RFC 3.4).
 */
import { eventBus } from '../../core/events/EventBus.js';
import { i18n } from '../../services/I18nEngine.js';

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
        const maxVal = Math.max(...state, 1);
        
        // Manejo de Estados Límite (Edge & Empty States RFC 10.4)
        if (state.length === 0) {
            this.innerHTML = `<div class="empty-state" style="margin: auto; padding: 20px; text-align: center; color: var(--text-muted); font-size: 1.2rem;">${i18n.t('msg_empty_array')}</div>`;
            return;
        }

        if (state.length === 1) {
            this.innerHTML = `<div class="empty-state" style="margin: auto; padding: 20px; text-align: center; color: var(--primary-color); font-size: 1.2rem; font-weight: bold;">${i18n.t('msg_single_element')}</div>`;
            return;
        }

        // Renderizado Híbrido: Si cambia el tamaño, recreamos DOM; si no, reciclamos (permitiendo transiciones CSS)
        if (this.children.length !== state.length || this.querySelector('.empty-state')) {
            this.innerHTML = '';
            state.forEach(() => {
                const bar = document.createElement('div');
                this.appendChild(bar);
            });
        }
        
        const bars = this.children;
        state.forEach((val, index) => {
            const bar = bars[index];
            
            // Altura dinámica animable
            bar.style.height = `${(val / maxVal) * 100}%`;
            
            // Reiniciar clases a estado base
            bar.className = 'array-bar';
            
            if (marks['active'] && marks['active'].includes(index)) bar.classList.add('array-bar--active');
            if (marks['compare'] && marks['compare'].includes(index)) bar.classList.add('array-bar--compare');
            if (marks['swap'] && marks['swap'].includes(index)) bar.classList.add('array-bar--swap');
            if (marks['sorted'] && marks['sorted'].includes(index)) bar.classList.add('array-bar--sorted');
            
            // Atributos Accesibles (RFC 3.8)
            bar.setAttribute('role', 'meter');
            bar.setAttribute('aria-valuenow', val);
        });
    }
}

// Registrar el Web Component
customElements.define('array-view', ArrayView);
