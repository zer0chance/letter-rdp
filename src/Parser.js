//------------------------------------------
// Default AST factory
const DefaultFactory = {
    Program(body) {
        return {
            type: 'Program',
            body
        };
    },

    EmptyStatement() { 
        return {
            type: 'EmptyStatement'
        };
    },

    BlockStatement(body) {
        return {
            type: 'BlockStatement',
            body
        };
    },

    ExpressionStatement(expression) {
        return {
            type: 'ExpressionStatement',
            expression
        };
    },

    NumericLiteral(value) {
        return {
            type: 'NumericLiteral',
            value: Number(value)
        };
    },

    StringLiteral(value) {
        return {
            type: 'StringLiteral',
            value: value.slice(1, -1)
        };
    }
};

//------------------------------------------
// SExpression AST factory
const SExpressionFactory = {
    Program(body) {
        return ['begin', body];
    },

    EmptyStatement() { },

    BlockStatement(body) {
        return ['begin', body];
    },

    ExpressionStatement(expression) {
        return expression;
    },

    NumericLiteral(value) {
        return Number(value);
    },

    StringLiteral(value) {
        return value;
    }
}

const AST_MODE = 'default';

const factory = AST_MODE === 'default' ? DefaultFactory : SExpressionFactory;

const {Tokenizer} = require('./Tokenizer');

/**
 * Letter recursive-descent parser
 */
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
        return factory.Program(this.StatementList());
    }

    /**
     * StatementList
     *   : Statement
     *   | StatementList Statement
     *   ;
     */
    StatementList(stopLookahead = null) {
        const statementList = [this.Statement()];
        while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
            let st = this.Statement();
            statementList.push(st);
        }
        return statementList;
    }

    /**
     * Statement
     *   : ExpressionStatement
     *   | BlockStatement
     *   | EmptyStatement
     *   ;
     */
    Statement() {
        switch(this._lookahead.type) {
            case (';'):
                return this.EmptyStatement();
            case ('{'):
                return this.BlockStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * EmptyStatement
     *   : ';'
     *   ;
     */
    EmptyStatement() {
        this._eat(';');
        return factory.EmptyStatement();
    }

    /**
     * BlockStatement
     *   : '{' OptStatementList '}'
     *   ;
     */
    BlockStatement() {
        this._eat('{');

        const body = this._lookahead.type !== '}' ? this.StatementList(/* stop lookahead */ '}') : [];
        this._eat('}');

        return factory.BlockStatement(body);
    }

    /**
     * ExpressionStatement
     *   : Expression ';'
     *   ;
     */
    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return factory.ExpressionStatement(expression);
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
        return factory.NumericLiteral(token.value);
    }

    /**
     * StringLiteral
     *   : STRING
     *   ;
     */
    StringLiteral() {
        const token = this._eat('STRING');
        return factory.StringLiteral(token.value);
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
