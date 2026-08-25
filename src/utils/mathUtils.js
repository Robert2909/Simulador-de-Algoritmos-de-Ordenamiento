/**
 * mathUtils.js
 * 
 * Contiene herramientas matemáticas independientes del estado.
 * Aisla la aleatoriedad para garantizar el Invariante de Determinismo.
 */

/**
 * PRNG (Pseudo-Random Number Generator) basado en Mulberry32.
 * Algoritmo de estado de 32 bits, extremadamente rápido y garantiza
 * que a partir de una misma semilla, la secuencia generada será
 * idéntica matemáticamente.
 */
export class PRNG {
    constructor(seed) {
        this.state = seed;
    }

    /**
     * Retorna un flotante determinista entre 0 (inclusivo) y 1 (exclusivo).
     * Reemplazo estricto de Math.random().
     */
    next() {
        this.state |= 0; 
        this.state = this.state + 0x6D2B79F5 | 0;
        let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /**
     * Genera un entero aleatorio entre min y max (ambos inclusivos).
     */
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /**
     * Desordena un arreglo usando Fisher-Yates (in-place) determinista.
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    /**
     * Utilería principal para inicializar simulaciones aleatorias pero predecibles.
     */
    generateRandomArray(size, min = 1, max = 100) {
        const result = [];
        for (let i = 0; i < size; i++) {
            result.push(this.nextInt(min, max));
        }
        return result;
    }
}
