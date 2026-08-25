import { eventBus } from '../events/EventBus.js';
import { ALGORITHMS_REGISTRY } from '../../data/algorithmsData.js';

class Router {
    constructor() {
        this.currentRoute = null;
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    init() {
        this.handleHashChange();
    }

    handleHashChange() {
        let hash = window.location.hash.substring(1);
        
        if (!hash || !ALGORITHMS_REGISTRY[hash]) {
            hash = 'bubble-sort';
            window.location.hash = hash;
            return;
        }

        this.currentRoute = hash;
        const routeData = ALGORITHMS_REGISTRY[hash];
        
        eventBus.publish('ROUTE_CHANGED', {
            routeId: hash,
            data: routeData
        });
    }
}

export const router = new Router();
