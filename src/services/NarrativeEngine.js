/**
 * NarrativeEngine.js
 * 
 * Capa de Presentación / Servicios Pedagógicos.
 * Traduce cada paso semántico del algoritmo a lenguaje natural dinámico
 * interpolando las variables del arreglo y punteros en tiempo real.
 * Cumple con el Principio de Contigüidad Espacial y Temporal (Mayer).
 */
import { i18n } from './I18nEngine.js';

export class NarrativeEngine {
    /**
     * Genera la explicación en lenguaje natural del paso actual.
     * @param {string} algoId - Identificador del algoritmo ('bubble-sort', 'selection-sort').
     * @param {Object} payload - Payload del evento STEP_APPLIED emitido por Simulator.
     * @returns {string} Explicación localizada y formateada.
     */
    static getNarrative(algoId, payload) {
        if (!payload || !payload.presentationSnapshot) {
            return i18n.t('narrative_idle');
        }

        const snapshot = payload.presentationSnapshot;
        const line = snapshot.currentLine;
        const state = snapshot.mathematicalState.main || [];
        const pointers = snapshot.activePointers || {};
        const lastComp = snapshot.lastComparison;
        const operations = payload.operations || [];
        const n = state.length;

        if (line === null || line === undefined || line < 0) {
            return i18n.t('narrative_idle');
        }

        if (algoId === 'bubble-sort') {
            return this._getBubbleSortNarrative(line, state, pointers, lastComp, operations, n);
        } else if (algoId === 'selection-sort') {
            return this._getSelectionSortNarrative(line, state, pointers, lastComp, operations, n);
        }

        return i18n.t('narrative_idle');
    }

    static _getBubbleSortNarrative(line, state, pointers, lastComp, operations, n) {
        const i = pointers.i !== undefined ? pointers.i : 0;
        const j = pointers.j !== undefined ? pointers.j : 0;
        const jPlus1 = j + 1;
        const valJ = state[j] !== undefined ? state[j] : '?';
        const valJPlus1 = state[jPlus1] !== undefined ? state[jPlus1] : '?';

        switch (line) {
            case 0:
                return i18n.t('narrative_bubble_0');
            case 1:
                return i18n.t('narrative_bubble_1', { n });
            case 2:
                return i18n.t('narrative_bubble_2');
            case 3:
                return i18n.t('narrative_bubble_3', { i });
            case 4:
                return i18n.t('narrative_bubble_4', { i });
            case 5:
                return i18n.t('narrative_bubble_5', { j, jPlus1, valJ, valJPlus1 });
            case 6: {
                const isGreater = lastComp ? lastComp.result : (valJ > valJPlus1);
                const result = isGreater ? i18n.t('narrative_term_true') : i18n.t('narrative_term_false');
                const action = isGreater ? i18n.t('narrative_term_need_swap') : i18n.t('narrative_term_no_swap');
                return i18n.t('narrative_bubble_6', { j, jPlus1, valJ, valJPlus1, result, action });
            }
            case 7: {
                const swapOp = operations.find(op => op.type === 'SWAP');
                const left = swapOp ? swapOp.leftIndex : j;
                const right = swapOp ? swapOp.rightIndex : jPlus1;
                const valLeft = state[left] !== undefined ? state[left] : '?';
                const valRight = state[right] !== undefined ? state[right] : '?';
                return i18n.t('narrative_bubble_7', { j: left, jPlus1: right, valLeft, valRight });
            }
            case 8:
                return i18n.t('narrative_bubble_8');
            case 11: {
                const idxSorted = n - i - 1;
                const valSorted = state[idxSorted] !== undefined ? state[idxSorted] : '?';
                return i18n.t('narrative_bubble_11', { i, idxSorted, valSorted });
            }
            case 12: {
                // Si la bandera swapped fue false o true
                const hadSwaps = operations.some(op => op.type === 'SWAP') || (i < n - 2);
                const swapStatus = hadSwaps 
                    ? i18n.t('narrative_term_had_swaps')
                    : i18n.t('narrative_term_no_swaps');
                return i18n.t('narrative_bubble_12', { swapStatus });
            }
            case 14:
                return i18n.t('narrative_bubble_14', { n });
            default:
                return i18n.t('narrative_idle');
        }
    }

    static _getSelectionSortNarrative(line, state, pointers, lastComp, operations, n) {
        const i = pointers.i !== undefined ? pointers.i : 0;
        const j = pointers.j !== undefined ? pointers.j : i + 1;
        const minIdx = pointers.min !== undefined ? pointers.min : i;
        const valI = state[i] !== undefined ? state[i] : '?';
        const valJ = state[j] !== undefined ? state[j] : '?';
        const valMin = state[minIdx] !== undefined ? state[minIdx] : '?';

        switch (line) {
            case 0:
                return i18n.t('narrative_selection_0');
            case 1:
                return i18n.t('narrative_selection_1', { n });
            case 2:
                return i18n.t('narrative_selection_2', { i });
            case 3:
                return i18n.t('narrative_selection_3', { i, valI });
            case 4:
                return i18n.t('narrative_selection_4', { j, valJ });
            case 5: {
                const isSmaller = lastComp ? lastComp.result : (valJ < valMin);
                const result = isSmaller ? i18n.t('narrative_term_true') : i18n.t('narrative_term_false');
                const action = isSmaller ? i18n.t('narrative_term_new_min') : i18n.t('narrative_term_keep_min');
                return i18n.t('narrative_selection_5', { j, valJ, valMin, result, action });
            }
            case 6:
                return i18n.t('narrative_selection_6', { j, valJ });
            case 9:
                return i18n.t('narrative_selection_9', { minIdx, i });
            case 10: {
                const swapOp = operations.find(op => op.type === 'SWAP');
                const left = swapOp ? swapOp.leftIndex : i;
                const right = swapOp ? swapOp.rightIndex : minIdx;
                const currentValI = state[left] !== undefined ? state[left] : '?';
                const currentValMin = state[right] !== undefined ? state[right] : '?';
                return i18n.t('narrative_selection_10', { i: left, minIdx: right, valI: currentValI, valMin: currentValMin });
            }
            case 12:
                return i18n.t('narrative_selection_12', { i, valI });
            case 14:
                return i18n.t('narrative_selection_14', { n });
            default:
                return i18n.t('narrative_idle');
        }
    }
}
