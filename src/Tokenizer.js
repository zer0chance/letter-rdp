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

        // Numbers
        if (!Number.isNaN(Number(string[0]))) {
            let number = '';

            while (!Number.isNaN(Number(string[this._cursor]))) {
                number += string[this._cursor++];
            }
            return {
                type: 'NUMBER',
                value: number
            };
        }

        // Strings
        if (string[0] === '"') {
            let str = '';
            do {
                if (this.isEOF()) {
                    throw new SyntaxError(`Unexpected end of input "${str}"`);
                }
                str += string[this._cursor++];
            } while (string[this._cursor] !== '"');
            str += this._cursor++; // skip closing '"'
            return {
                type: 'STRING',
                value: str
            };
        } else if (string[0] === "'") {
            let str = '';
            do {
                if (this.isEOF()) {
                    throw new SyntaxError(`Unexpected end of input "${str}"`);
                }
                str += string[this._cursor++];
            } while (string[this._cursor] !== "'");
            str += this._cursor++; // skip closing '"'
            return {
                type: 'STRING',
                value: str
            };
        }

        return null;
    }
}

module.exports = {
    Tokenizer
};
