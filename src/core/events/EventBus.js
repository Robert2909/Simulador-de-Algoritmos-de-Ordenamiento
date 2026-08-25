class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    subscribe(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
    }

    unsubscribe(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
            if (this.listeners.get(eventName).size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    publish(eventName, payload = null) {
        if (this.listeners.has(eventName)) {
            for (const callback of this.listeners.get(eventName)) {
                callback(payload);
            }
        }
    }
}

export const eventBus = new EventBus();
