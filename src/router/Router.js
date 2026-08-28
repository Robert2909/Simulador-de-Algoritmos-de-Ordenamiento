import { eventBus } from '../core/events/EventBus.js';
import { ALGORITHMS_REGISTRY } from '../data/algorithmsData.js';

class Router {
    // Lógica pura de Parseo RFC 3.9
    parseHash() {
        const rawHash = window.location.hash.replace('#', '');
        if (!rawHash) return { algoId: 'bubble-sort', params: new URLSearchParams() };
        
        const [algoId, queryString] = rawHash.split('?');
        return { 
            algoId: algoId || 'bubble-sort', 
            params: new URLSearchParams(queryString || '') 
        };
    }

    updateHash(algoId, seed, size) {
        window.location.hash = `${algoId}?seed=${seed}&size=${size}`;
    }

    getInitialConfig() {
        const { algoId, params } = this.parseHash();
        const config = { algoId, customArrayConfig: null };

        if (params.has('seed') && params.has('size')) {
            const seed = parseInt(params.get('seed'), 10);
            const size = parseInt(params.get('size'), 10);
            if (!isNaN(seed) && !isNaN(size)) {
                config.customArrayConfig = { seed, size };
            }
        }
        return config;
    }

    getAlgorithmInstance(id) {
        const entry = ALGORITHMS_REGISTRY[id] || ALGORITHMS_REGISTRY['bubble-sort'];
        if (entry && entry.classRef) {
            return new entry.classRef();
        }
        throw new Error(`Algoritmo no soportado o incompleto: ${id}`);
    }
    
    getAlgorithmData(id) {
        return ALGORITHMS_REGISTRY[id] || ALGORITHMS_REGISTRY['bubble-sort'];
    }
}

export const router = new Router();
