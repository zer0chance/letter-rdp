/**
 * Letter recursive-descent parser
 */

const {Tokenizer} = require('./Tokenizer');

class Parser {
    constructor() {
        this._string = '';
        this._tokenizer = new Tokenizer();
    }
    /**
     * Parses string into AST
     */
    parse(string) {
        this._string = string;
        this._tokenizer.init(this._string);

        // First token is lookahead to predictive parsing.
        this._lookahead = this._tokenizer.getNextToken();

        // Parse recursively starting from the entry point.
        return this.Program();
    }

    /**
     * Entry point:
     * 
     * Program
     *   : StatementList
     *   ;
     */
    Program() {
        return {
            type: 'Program',
            body: this.StatementList()
        };
    }

    /**
     * StatementList
     *   : Statement
     *   | StatementList Statement
     *   ;
     */
    StatementList() {
        const statementList = [this.Statement()];
        while (this._lookahead != null) {
            let st = this.Statement();
            statementList.push(st);
        }
        return statementList;
    }

    /**
     * Statement
     *   : ExpressionStatement
     *   ;
     */
    Statement() {
        return this.ExpressionStatement();
    }

    /**
     * ExpressionStatement
     *   : Expression ';'
     *   ;
     */
     ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return {
            type: 'ExpressionStatement',
            expression
        };
    }

    /**
     * Expression
     *   : Literal
     *   ;
     */
    Expression() {
        return this.Literal();
    }

    /**
     * Literal
     *   : NumericLiteral
     *   | StringLiteral
     *   ;
     */
    Literal() {
        switch(this._lookahead.type){
            case 'NUMBER':
                return this.NumericLiteral();
            case 'STRING':
                return this.StringLiteral();
        }
        throw new SyntaxError('Unexpected literal!');
    }

    /**
     * NumericLiteral
     *   : NUMBER
     *   ;
     */
    NumericLiteral() {
        const token = this._eat('NUMBER');
        return {
            type: 'NumericLiteral',
            value: Number(token.value)
        };
    }

    /**
     * StringLiteral
     *   : STRING
     *   ;
     */
    StringLiteral() {
        const token = this._eat('STRING');
        return {
            type: 'StringLiteral',
            value: token.value.slice(1, -1)
        };
    }

    /**
     * Expects a token of a given type.
     */
    _eat(tokenType) {
        const token = this._lookahead;

        if (token == null) {
            throw new SyntaxError(`Unexpected end of input, expected "${tokenType}"`);
        }

        if (tokenType !== token.type) {
            throw new SyntaxError(`Unexpected token ${token.type}, expected "${tokenType}"`);
        }

        // Advance to the next token.
        this._lookahead = this._tokenizer.getNextToken();

        return token;
    }
}

module.exports = {
    Parser,
};
