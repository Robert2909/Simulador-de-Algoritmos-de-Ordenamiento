/**
 * Store.js
 * Capa 2: Centraliza el estado global de la aplicación (Application State).
 * Implementa un patrón reactivo unidireccional puro.
 * Separa las preferencias globales del estado de simulación.
 */
import { storage } from '../services/StorageManager.js';

class Store {
    constructor() {
        this.state = {
            preferences: storage.load(),
            navigation: {
                currentView: 'simulator' // simulator, theory, quizzes
            }
        };
        this.listeners = new Set();
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    dispatch(action, payload) {
        switch (action) {
            case 'UPDATE_PREFERENCES':
                this.state.preferences = { ...this.state.preferences, ...payload };
                storage.save(this.state.preferences);
                break;
            case 'NAVIGATE':
                this.state.navigation.currentView = payload.view;
                break;
            default:
                console.warn(`Store: Acción desconocida ${action}`);
        }
        this.notify();
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

export const appStore = new Store();
