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

    // Assignment
    [/^=/, 'SIMPLE_ASSIGN'],
    [/^[+\-\*\/\%]=/, 'COMPLEX_ASSIGN'],

    // Number
    [/^\d+/, 'NUMBER'],

    // Keyword
    [/^\blet\b/, 'let'],

    // Identifiers
    [/^\w+/, 'IDENTIFIER'],

    // String
    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],

    // Math
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],
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
