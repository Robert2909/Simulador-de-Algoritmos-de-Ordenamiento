export default class PRNG {
    constructor(seed) {
        this.seed = seed;
    }

    // Algoritmo Mulberry32 (Rápido y de altísima calidad de distribución)
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    nextRange(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}
