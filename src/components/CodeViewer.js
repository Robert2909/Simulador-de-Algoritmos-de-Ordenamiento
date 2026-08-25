/**
 * CodeViewer.js
 * 
 * Web Component que renderiza el pseudocódigo del algoritmo actual
 * y resalta la línea en ejecución leyendo el currentLine del Snapshot.
 */
import { eventBus } from '../core/events/EventBus.js';

export default class CodeViewer extends HTMLElement {
    constructor() {
        super();
        this.codeLines = [];
        this.currentLineElements = [];
        this.handleStepApplied = this.updateUI.bind(this);
        this.handleAlgorithmLoaded = (payload) => {
            this.codeLines = payload.code || [];
            this.renderInitialCode();
        };
    }

    connectedCallback() {
        eventBus.subscribe('ALGORITHM_LOADED', this.handleAlgorithmLoaded);
        eventBus.subscribe('STEP_APPLIED', this.handleStepApplied);
    }

    disconnectedCallback() {
        eventBus.unsubscribe('ALGORITHM_LOADED', this.handleAlgorithmLoaded);
        eventBus.unsubscribe('STEP_APPLIED', this.handleStepApplied);
    }

    renderInitialCode() {
        this.innerHTML = '';
        const container = document.createElement('pre');
        container.className = 'code-block';
        
        this.currentLineElements = this.codeLines.map((lineText, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line';
            lineEl.textContent = lineText;
            lineEl.dataset.lineIndex = index;
            container.appendChild(lineEl);
            return lineEl;
        });

        this.appendChild(container);
    }

    updateUI(payload) {
        const currentLine = payload.presentationSnapshot.currentLine;
        
        // Remover highlight previo
        this.currentLineElements.forEach(el => el.classList.remove('code-line--active'));
        
        // Aplicar highlight si es válido
        if (currentLine !== undefined && currentLine >= 0 && currentLine < this.currentLineElements.length) {
            this.currentLineElements[currentLine].classList.add('code-line--active');
            // Hacer scroll si es necesario
            this.currentLineElements[currentLine].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

customElements.define('code-viewer', CodeViewer);
