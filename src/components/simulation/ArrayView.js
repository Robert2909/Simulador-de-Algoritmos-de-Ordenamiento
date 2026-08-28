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
            state.forEach((_, idx) => {
                const col = document.createElement('div');
                col.className = 'array-col';
                
                const barContainer = document.createElement('div');
                barContainer.className = 'array-bar-container';
                
                const bar = document.createElement('div');
                bar.className = 'array-bar';
                
                const badgesWrap = document.createElement('div');
                badgesWrap.className = 'pointer-badges';
                bar.appendChild(badgesWrap);
                
                const valLabel = document.createElement('span');
                valLabel.className = 'bar-value';
                bar.appendChild(valLabel);
                
                barContainer.appendChild(bar);
                
                const indexLabel = document.createElement('span');
                indexLabel.className = 'bar-index';
                indexLabel.textContent = idx;
                
                col.appendChild(barContainer);
                col.appendChild(indexLabel);
                
                this.appendChild(col);
            });
        }

        const pointers = payload.presentationSnapshot.activePointers || {};
        
        // Mapear qué punteros semánticos apuntan a cada índice
        const indexPointersMap = {};
        for (const [pointerName, targetIdx] of Object.entries(pointers)) {
            if (targetIdx !== null && targetIdx !== undefined && targetIdx >= 0 && targetIdx < state.length) {
                if (!indexPointersMap[targetIdx]) indexPointersMap[targetIdx] = [];
                indexPointersMap[targetIdx].push(pointerName);
            }
        }
        
        const cols = this.children;
        state.forEach((val, index) => {
            const col = cols[index];
            const bar = col.querySelector('.array-bar');
            const badgesWrap = bar.querySelector('.pointer-badges');
            const valLabel = bar.querySelector('.bar-value');
            
            // Altura dinámica animable y valor
            bar.style.height = `${(val / maxVal) * 100}%`;
            valLabel.textContent = val;
            
            // Reiniciar clases a estado base
            bar.className = 'array-bar';
            
            if (marks['active'] && marks['active'].includes(index)) bar.classList.add('array-bar--active');
            if (marks['compare'] && marks['compare'].includes(index)) bar.classList.add('array-bar--compare');
            if (marks['swap'] && marks['swap'].includes(index)) bar.classList.add('array-bar--swap');
            if (marks['sorted'] && marks['sorted'].includes(index)) bar.classList.add('array-bar--sorted');
            
            // Renderizar insignias de punteros para este índice
            badgesWrap.innerHTML = '';
            const activeHere = indexPointersMap[index] || [];
            activeHere.forEach(pName => {
                const badge = document.createElement('span');
                badge.className = `pointer-badge pointer-badge--${pName}`;
                badge.textContent = pName;
                badgesWrap.appendChild(badge);
            });
            
            // Atributos Accesibles (RFC 3.8)
            bar.setAttribute('role', 'meter');
            bar.setAttribute('aria-valuenow', val);
            bar.setAttribute('aria-label', `Posición ${index}, valor ${val}`);
        });
    }
}

// Registrar el Web Component
customElements.define('array-view', ArrayView);
