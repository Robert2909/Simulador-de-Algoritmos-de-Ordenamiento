/**
 * CodeViewer.js
 * 
 * Web Component que renderiza el pseudocódigo del algoritmo actual
 * y resalta la línea en ejecución leyendo el currentLine del Snapshot.
 */
import { eventBus } from '../../core/events/EventBus.js';
import { Lexer } from '../../utils/Lexer.js';
import { NarrativeEngine } from '../../services/NarrativeEngine.js';
import { i18n } from '../../services/I18nEngine.js';

export default class CodeViewer extends HTMLElement {
    constructor() {
        super();
        this.codeLines = [];
        this.currentLineElements = [];
        this.currentAlgoId = 'bubble-sort';
        this.lastPayload = null;
        this.narrativeTextEl = null;

        this.handleStepApplied = this.updateUI.bind(this);
        this.handleAlgorithmLoaded = (payload) => {
            if (payload.algoId) this.currentAlgoId = payload.algoId;
            this.codeLines = payload.code || [];
            this.renderInitialCode();
        };
        this.handleLocaleChanged = () => {
            if (this.titleEl) this.titleEl.textContent = i18n.t('code_viewer_title');
            if (this.badgeLabelEl) this.badgeLabelEl.textContent = i18n.t('narrative_step_label');
            if (this.lastPayload && this.narrativeTextEl) {
                this.narrativeTextEl.textContent = NarrativeEngine.getNarrative(this.currentAlgoId, this.lastPayload);
            }
        };
    }

    connectedCallback() {
        eventBus.subscribe('ALGORITHM_LOADED', this.handleAlgorithmLoaded);
        eventBus.subscribe('STEP_APPLIED', this.handleStepApplied);
        eventBus.subscribe('LOCALE_CHANGED', this.handleLocaleChanged);
    }

    disconnectedCallback() {
        eventBus.unsubscribe('ALGORITHM_LOADED', this.handleAlgorithmLoaded);
        eventBus.unsubscribe('STEP_APPLIED', this.handleStepApplied);
        eventBus.unsubscribe('LOCALE_CHANGED', this.handleLocaleChanged);
    }

    renderInitialCode() {
        this.innerHTML = '';
        
        // Header del Visor
        const header = document.createElement('div');
        header.className = 'code-viewer-header';
        this.titleEl = document.createElement('span');
        this.titleEl.className = 'code-viewer-title';
        this.titleEl.textContent = i18n.t('code_viewer_title');
        header.appendChild(this.titleEl);
        this.appendChild(header);

        // Bloque de Pseudocódigo
        const pre = document.createElement('pre');
        pre.className = 'code-block';
        
        this.currentLineElements = [];
        
        this.codeLines.forEach((lineText) => {
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

        // Panel de Narrativa Dinámica en Lenguaje Natural
        const narrativePanel = document.createElement('div');
        narrativePanel.className = 'narrative-panel';
        narrativePanel.setAttribute('aria-live', 'polite');

        const badge = document.createElement('div');
        badge.className = 'narrative-badge';
        
        const icon = document.createElement('span');
        icon.className = 'narrative-icon';
        icon.textContent = '💡';
        
        this.badgeLabelEl = document.createElement('span');
        this.badgeLabelEl.className = 'narrative-step-label';
        this.badgeLabelEl.textContent = i18n.t('narrative_step_label');
        
        badge.appendChild(icon);
        badge.appendChild(this.badgeLabelEl);

        this.narrativeTextEl = document.createElement('p');
        this.narrativeTextEl.className = 'narrative-text';
        this.narrativeTextEl.textContent = i18n.t('narrative_idle');

        narrativePanel.appendChild(badge);
        narrativePanel.appendChild(this.narrativeTextEl);

        this.appendChild(narrativePanel);
    }

    updateUI(payload) {
        this.lastPayload = payload;
        const currentLine = payload.presentationSnapshot.currentLine;
        
        // Remover highlight previo
        this.currentLineElements.forEach(el => el.classList.remove('code-line--active'));
        
        // Aplicar highlight si es válido (null check estricto porque null >= 0 es true en JS)
        if (currentLine !== null && currentLine !== undefined && currentLine >= 0 && currentLine < this.currentLineElements.length) {
            this.currentLineElements[currentLine].classList.add('code-line--active');
            // Hacer scroll si es necesario
            this.currentLineElements[currentLine].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Actualizar la Narrativa en Lenguaje Natural
        if (this.narrativeTextEl) {
            this.narrativeTextEl.textContent = NarrativeEngine.getNarrative(this.currentAlgoId, payload);
        }
    }
}

customElements.define('code-viewer', CodeViewer);
