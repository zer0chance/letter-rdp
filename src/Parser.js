/**
 * Letter recursive-descent parser
 */

class Parser {
    /**
     * Parses string into AST
     */
    parse(string) {
        this._string = string;

        // Parse recursively starting from the entry point.
        return this.Program();
    }

    /**
     * Entry point:
     * 
     * Program
     *   : NumericalLiteral
     *   ;
     */
    Program() {
        return this.NumericLiteral();
    }

    /**
     * NumericLiteral
     *   : NUMBER
     *   ;
     */
    NumericLiteral() {
        return {
            type: 'NumericLiteral',
            value: Number(this._string),
        };
    }
}

module.exports = {
    Parser,
};
