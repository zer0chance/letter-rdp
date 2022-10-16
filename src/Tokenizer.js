/**
 * Spec
 */
const Spec = [
    // Whitespaces
    [/^\s+/, null],

    // Symbols, delimiters
    [/^;/,  ';'],
    [/^{/,  '{'],
    [/^}/,  '}'],
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^,/,  ','],

    // Comments
    [/^\/\/.*/, null],
    [/^\/\*[\s\S]*?\*\//, null],

    // Number
    [/^\d+/, 'NUMBER'],

    // Keyword
    [/^\blet\b/,   'let'  ],
    [/^\bif\b/,    'if'   ],
    [/^\belse\b/,  'else' ],
    [/^\btrue\b/,  'true' ],
    [/^\bfalse\b/, 'false'],
    [/^\bnull\b/,  'null' ],
    [/^\bwhile\b/, 'while'],
    [/^\bdo\b/,    'do'   ],
    [/^\bfor\b/,   'for'  ],
    [/^\bdef\b/,   'def'  ],
    [/^\breturn\b/, 'return'],

    // Identifiers
    [/^\w+/, 'IDENTIFIER'],

    // String
    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],

    // Equality
    [/^[=!]=/, 'EQUALITY_OPERATOR'],

    // Assignment
    [/^=/, 'SIMPLE_ASSIGN'],
    [/^[+\-\*\/\%]=/, 'COMPLEX_ASSIGN'],

    // Math
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],

    // Relation
    [/^[><]=?/, 'RELATIONAL_OPERATOR'],
    
    // Logical
    [/^&&/,   'LOGICAL_AND'],
    [/^\|\|/, 'LOGICAL_OR' ],
    [/^!/, 'LOGICAL_NOT'],
];

/**
 * Extracts tokens from the string.
 */
class Tokenizer {
    /**
     * Initialize the string.
     */
    init(string) {
        this._string = string;
        this._cursor = 0;
    }

    isEOF() {
        return this._cursor === this._string.length;
    }

    hasTokens() {
        return this._cursor < this._string.length;
    }

    /**
     * Returns next token.
     */
    getNextToken() {
        if (!this.hasTokens()) return null;

        const string = this._string.slice(this._cursor);

        for (const [regex, tokenType] of Spec) {
            const tokenValue = this._match(regex, string);
            if (tokenValue == null) {
                continue;
            }
            if (tokenType == null) {
                // Skipping this token (e.g. whitespace)
                return this.getNextToken();
            }

            return {
                type:  tokenType,
                value: tokenValue
            };
        }

        throw new SyntaxError(`Unexpected token: "${string}"`);
    }

    _match(regex, string) {
        let matched = regex.exec(string);
        if (!matched) {
            return null;
        }

        this._cursor += matched[0].length;
        return matched[0];
    } 
}

module.exports = {
    Tokenizer
};
