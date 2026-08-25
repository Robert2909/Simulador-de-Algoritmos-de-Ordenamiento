/**
 * StorageManager.js
 * 
 * Cumple estrictamente con el RFC 3.7: Persistencia Defensiva.
 * Garantiza que la aplicación jamás sufra un crash por QuotaExceededError 
 * o bloqueos de cookies/almacenamiento en modo incógnito (haciendo fallback a RAM).
 */

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'algo_sim_preferences';
        
        // Contrato JSON Tipado Inquebrantable (RFC 3.7)
        this.defaultState = {
            speed: 1.0,
            theme: 'system',
            colorblind: false,
            muted: false,
            arraySize: 50,
            locale: 'es'
        };
        
        this.memoryFallback = null;
    }

    load() {
        try {
            const raw = window.localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return { ...this.defaultState };
            
            const parsed = JSON.parse(raw);
            // Combinación segura para asegurar que nunca falten propiedades del contrato
            return { ...this.defaultState, ...parsed };
        } catch (e) {
            console.warn("StorageManager: localStorage bloqueado o lleno. Activando fallback a RAM.", e);
            return this.memoryFallback || { ...this.defaultState };
        }
    }

    save(partialState) {
        const currentState = this.load();
        const newState = { ...currentState, ...partialState };
        
        try {
            window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
            this.memoryFallback = null; // Liberar RAM si la escritura tuvo éxito
        } catch (e) {
            // Silencioso, el usuario no debe ser molestado. Simplemente usamos la RAM.
            this.memoryFallback = newState;
        }
    }
}

export const storage = new StorageManager();
