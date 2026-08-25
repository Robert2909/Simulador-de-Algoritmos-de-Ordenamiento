/**
 * BasicRenderer.js
 * 
 * Componente visual básico y directo. No utiliza Shadow DOM aún.
 * Su única responsabilidad es reaccionar a los eventos del Motor (EventBus)
 * y dibujar el estado matemático en el contenedor usando barras de colores.
 */
export default class BasicRenderer {
    constructor(containerId, eventBus) {
        this.container = document.getElementById(containerId);
        this.eventBus = eventBus;
        
        // ¡Cumpliendo el RFC! El Renderer NO sabe qué es Simulator, 
        // solo escucha la red y recibe Snapshots Inmutables.
        this.eventBus.subscribe('STEP_APPLIED', this.updateUI.bind(this));
    }
    
    updateUI(payload) {
        const state = payload.presentationSnapshot.mathematicalState.main;
        const marks = payload.presentationSnapshot.marks || {};
        
        // Limpiamos contenedor (Vanilla extremo)
        this.container.innerHTML = '';
        
        // Buscamos el valor máximo para calcular alturas relativas
        const maxVal = Math.max(...state, 1);
        
        state.forEach((val, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // Altura relativa al contenedor
            const heightPercent = (val / maxVal) * 100;
            bar.style.height = `${heightPercent}%`;
            
            // Si el índice está marcado (e.g. active, sorted) aplicamos modificador BEM
            if (marks['active'] && marks['active'].includes(index)) {
                bar.classList.add('array-bar--active');
            }
            if (marks['sorted'] && marks['sorted'].includes(index)) {
                bar.classList.add('array-bar--sorted');
            }
            
            this.container.appendChild(bar);
        });
    }
}
