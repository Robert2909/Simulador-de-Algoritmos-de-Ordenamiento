/**
 * Lexer.js
 * 
 * Implementa el RFC 5.4: Parseo Dinámico de Código sin Regex Complejas.
 * Es un Autómata Finito Determinista (DFA) simple que lee el pseudocódigo
 * en una sola pasada (O(N)) para evitar catastrophic backtracking.
 */

export class Lexer {
    static tokenize(code) {
        const tokens = [];
        let i = 0;
        
        const isAlpha = c => /[a-zA-Z_]/.test(c);
        const isNum = c => /[0-9]/.test(c);
        const isWhitespace = c => /\s/.test(c);
        const isOperator = c => /[+\-*/=<>!&|]/.test(c);
        const isPunctuation = c => /[()[\]{};,.]/.test(c);
        
        // Palabras clave típicas de pseudocódigo y JS
        const keywords = new Set([
            'function', 'for', 'while', 'if', 'else', 'return', 
            'let', 'const', 'var', 'to', 'downto', 'do', 'swap', 'yield', 'length', 'true', 'false'
        ]);
        
        while (i < code.length) {
            const char = code[i];
            
            // 1. Whitespace
            if (isWhitespace(char)) {
                let text = '';
                while (i < code.length && isWhitespace(code[i])) {
                    text += code[i++];
                }
                tokens.push({ type: 'whitespace', value: text });
                continue;
            }
            
            // 2. Comentarios Lineales (//)
            if (char === '/' && code[i+1] === '/') {
                tokens.push({ type: 'comment', value: code.substring(i) });
                break; // El comentario consume el resto de la línea
            }
            
            // 3. Identificadores y Palabras Clave
            if (isAlpha(char)) {
                let text = '';
                while (i < code.length && (isAlpha(code[i]) || isNum(code[i]))) {
                    text += code[i++];
                }
                if (keywords.has(text)) {
                    tokens.push({ type: 'keyword', value: text });
                } else {
                    tokens.push({ type: 'identifier', value: text });
                }
                continue;
            }
            
            // 4. Números
            if (isNum(char)) {
                let text = '';
                while (i < code.length && isNum(code[i])) {
                    text += code[i++];
                }
                tokens.push({ type: 'number', value: text });
                continue;
            }
            
            // 5. Operadores
            if (isOperator(char)) {
                let text = '';
                while (i < code.length && isOperator(code[i])) {
                    text += code[i++];
                }
                tokens.push({ type: 'operator', value: text });
                continue;
            }
            
            // 6. Puntuación
            if (isPunctuation(char)) {
                tokens.push({ type: 'punctuation', value: code[i++] });
                continue;
            }
            
            // 7. Desconocido (Fallback)
            tokens.push({ type: 'unknown', value: code[i++] });
        }
        
        return tokens;
    }
}
