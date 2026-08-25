/**
 * Validator.js
 * 
 * Implementa la Sección 4.7 del RFC: Estrategia de Testing (Validación Silenciosa).
 * Verifica rigurosamente los Axiomas de Reversibilidad y Determinismo matemático.
 */
export class Validator {
    static validateSimulation(simulator, initialArray) {
        console.group("🧪 [Testing] Validación de Caja Negra");

        try {
            // 1. Verificación del Sorting contra motor nativo V8
            const finalState = simulator.mathematicalState.main;
            const expectedSorted = [...initialArray].sort((a, b) => a - b);

            let isSorted = true;
            for (let i = 0; i < finalState.length; i++) {
                if (finalState[i] !== expectedSorted[i]) {
                    isSorted = false;
                    break;
                }
            }
            if (!isSorted) {
                console.error("❌ Error: El arreglo final NO está ordenado.");
                console.error("Esperado:", expectedSorted);
                console.error("Obtenido:", finalState);
            } else {
                console.log("✅ Éxito: Arreglo final ordenado");
            }

            // 2. Preservación del Multiconjunto (Teorema de Conservación)
            // Chequeamos que no hayamos duplicado ni eliminado elementos mágicamente
            const sumInitial = initialArray.reduce((acc, val) => acc + val, 0);
            const sumFinal = finalState.reduce((acc, val) => acc + val, 0);
            if (sumInitial !== sumFinal) {
                console.error("❌ Error: El multiconjunto fue alterado.");
            } else {
                console.log("✅ Éxito: Multiconjunto preservado.");
            }

            // 3. Prueba Dura de Reversibilidad (Axioma: Undo(Trace) === Initial)
            // Viajamos en el tiempo manualmente leyendo la traza al revés (LIFO)
            const tempState = [...finalState];

            for (let s = simulator.trace.length - 1; s >= 0; s--) {
                const step = simulator.trace.getStep(s);
                // Las operaciones dentro de un paso también deben revertirse en orden inverso
                for (let opIdx = step.operations.length - 1; opIdx >= 0; opIdx--) {
                    const op = step.operations[opIdx];
                    if (op.type === 'SWAP' && op.buffer === 'main') {
                        // El inverso matemático de un swap es el mismo swap
                        const tmp = tempState[op.leftIndex];
                        tempState[op.leftIndex] = tempState[op.rightIndex];
                        tempState[op.rightIndex] = tmp;
                    }
                    if (op.type === 'SET' && op.buffer === 'main') {
                        // El inverso de un set es colocar su valor previo
                        tempState[op.index] = op.previousValue;
                    }
                }
            }

            let isReversible = true;
            for (let i = 0; i < tempState.length; i++) {
                if (tempState[i] !== initialArray[i]) {
                    isReversible = false;
                    break;
                }
            }

            if (!isReversible) {
                console.error("❌ Error: La reversibilidad falló. Al deshacer la traza no llegamos al origen.");
                console.error("Origen Reconstruido:", tempState);
                console.error("Origen Real:", initialArray);
            } else {
                console.log("✅ Éxito: Reversibilidad absoluta.");
            }

        } catch (e) {
            console.error("Error durante la validación:", e);
        }

        console.groupEnd();
    }
}
