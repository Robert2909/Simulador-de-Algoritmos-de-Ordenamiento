export default class SyntaxTokenizer {
    static highlight(codeString) {
        if (!codeString) return '';
        
        let result = '';
        let i = 0;
        const keywords = new Set(['for', 'let', 'const', 'if', 'else', 'while', 'function', 'return', 'yield', 'class', 'constructor', 'new']);
        
        while (i < codeString.length) {
            let char = codeString[i];
            
            // HTML Escaping
            if (char === '<') { result += '&lt;'; i++; continue; }
            if (char === '>') { result += '&gt;'; i++; continue; }
            
            // Numbers
            if (/\d/.test(char)) {
                let numStr = '';
                while (i < codeString.length && /\d/.test(codeString[i])) {
                    numStr += codeString[i];
                    i++;
                }
                result += `<span class="token-number">${numStr}</span>`;
                continue;
            }
            
            // Words (Keywords & Functions)
            if (/[a-zA-Z_]/.test(char)) {
                let wordStr = '';
                while (i < codeString.length && /[a-zA-Z0-9_]/.test(codeString[i])) {
                    wordStr += codeString[i];
                    i++;
                }
                
                if (keywords.has(wordStr)) {
                    result += `<span class="token-keyword">${wordStr}</span>`;
                } else if (i < codeString.length && codeString[i] === '(') {
                    result += `<span class="token-function">${wordStr}</span>`;
                } else {
                    result += wordStr;
                }
                continue;
            }
            
            // Default
            result += char;
            i++;
        }
        
        return result;
    }
}
