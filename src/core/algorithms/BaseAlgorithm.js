/**
 * BaseAlgorithm.js
 * 
 * Clase abstracta que todos los algoritmos deben implementar.
 * Prohíbe mutar el estado global o generar copias masivas.
 * Solo puede interactuar a través del AlgorithmContext.
 */
export default class BaseAlgorithm {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    /**
     * Función generadora obligatoria.
     * @param {AlgorithmContext} context - La API para leer/mutar estado (Queries y Commands).
     * @yields Cede el control al Motor para cerrar el Step actual.
     */
    *execute(context) {
        throw new Error('El método execute(context) debe ser implementado por la clase hija.');
    }
}
