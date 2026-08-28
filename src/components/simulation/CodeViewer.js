/**
 * CodeViewer.js
 * 
 * Web Component que renderiza el pseudocódigo del algoritmo actual
 * y resalta la línea en ejecución leyendo el currentLine del Snapshot.
 */
import { eventBus } from '../../core/events/EventBus.js';
import { Lexer } from '../../utils/Lexer.js';

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
        const pre = document.createElement('pre');
        pre.className = 'code-block';
        
        this.currentLineElements = [];
        
        this.codeLines.forEach((lineText, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'code-line';
            
            const tokens = Lexer.tokenize(lineText);
            tokens.forEach(t => {
                if (t.type === 'whitespace') {
                    lineEl.appendChild(document.createTextNode(t.value));
                } else {
                    const span = document.createElement('span');
                    span.className = `token-${t.type} token-id-${t.value}`;
                    span.textContent = t.value;
                    lineEl.appendChild(span);
                }
            });
            
            this.currentLineElements.push(lineEl);
            pre.appendChild(lineEl);
        });
        
        this.appendChild(pre);
    }

    updateUI(payload) {
        const currentLine = payload.presentationSnapshot.currentLine;
        
        // Remover highlight previo
        this.currentLineElements.forEach(el => el.classList.remove('code-line--active'));
        
        // Aplicar highlight si es válido (null check estricto porque null >= 0 es true en JS)
        if (currentLine !== null && currentLine !== undefined && currentLine >= 0 && currentLine < this.currentLineElements.length) {
            this.currentLineElements[currentLine].classList.add('code-line--active');
            // Hacer scroll si es necesario
            this.currentLineElements[currentLine].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

customElements.define('code-viewer', CodeViewer);
