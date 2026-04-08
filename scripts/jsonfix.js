    const originalJSONParse = JSON.parse.bind(JSON);
    
    JSON.parse = function(text, reviver) {
        if (typeof text !== "string") {
            return originalJSONParse(text, reviver);
        }
        
        try {
            return originalJSONParse(text, reviver);
        } catch (err) {
            // Check if error is trailing data issue
            if (!/unexpected non-whitespace character after JSON data/i.test(err.message)) {
                throw err;
            }
            
            // Extract first valid JSON object/array
            let i = 0;
            while (i < text.length && /\s/.test(text[i])) i++;
            
            const opener = text[i];
            if (opener !== "{" && opener !== "[") throw err;
            
            const closer = opener === "{" ? "}" : "]";
            let depth = 0;
            let inString = false;
            let escaped = false;
            
            for (; i < text.length; i++) {
                const ch = text[i];
                
                if (inString) {
                    if (escaped) escaped = false;
                    else if (ch === "\\") escaped = true;
                    else if (ch === "\"") inString = false;
                    continue;
                }
                
                if (ch === "\"") {
                    inString = true;
                    continue;
                }
                
                if (ch === opener) depth++;
                else if (ch === closer) {
                    depth--;
                    if (depth === 0) {
                        return originalJSONParse(text.slice(0, i + 1), reviver);
                    }
                }
            }
            
            throw err;
        }
    };