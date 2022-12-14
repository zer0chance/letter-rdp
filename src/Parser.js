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
     *   | VariableStatement
     *   | IfStatement
     *   | FunctionDeclaration
     *   | ReturnStatement
     *   | ClassDeclaration
     *   ;
     */
    Statement() {
        switch(this._lookahead.type) {
            case (';'):
                return this.EmptyStatement();
            case ('{'):
                return this.BlockStatement();
            case ('let'):
                return this.VariableStatement();
            case ('if'):
                return this.IfStatement();
            case 'while':
            case 'do':
            case 'for':
                return this.IterationStatement();
            case ('def'):
                return this.FunctionDeclaration();
            case ('return'):
                return this.ReturnStatement();
            case ('class'):
                return this.ClassDeclaration();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * FunctionDeclaration
     *   : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
     *   ;
     */
    FunctionDeclaration() {
        this._eat('def');
        const name = this.Identifier();

        this._eat('(');
        const params = this._lookahead.type !== ')' ?
                this.FormalParameterList() :
                [];
        this._eat(')');

        const body = this.BlockStatement();

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body
        };
    }

    /**
     * ClassDeclaration
     *   : 'class' Identifier OptClassExtends BlockStatement
     *   ;
     */
     ClassDeclaration() {
        this._eat('class');
        const id = this.Identifier();

        const superClass = this._lookahead.type === 'extends' ?
                this.ClassExtends() :
                null;

        const body = this.BlockStatement();

        return {
            type: 'ClassDeclaration',
            id,
            superClass,
            body
        };
    }

    /**
     * ClassExtends
     *   : 'extends' Identifier
     *   ;
     */
    ClassExtends() {
        this._eat('extends');
        return this.Identifier();
    }

    /**
     * FormalParameterList
     *   : Identifier
     *   | FormalParameterList ',' Identifier
     *   ;
     */
    FormalParameterList() {
        let params = [];
        // TODO: implement default values
        do {
            params.push(this.Identifier());
        }
        while (this._lookahead.type === ',' && this._eat(','));

        return params;
    }

    /**
     * ReturnStatement
     *   | 'return' OptExpression
     *   ;
     */
    ReturnStatement() {
        this._eat('return');

        const argument = this._lookahead.type !== ';' ?
        this.Expression() :
        null;

        this._eat(';');

        return {
            type: 'ReturnStatement',
            argument
        };
    }

    /**
     * IfStatement
     *   : 'if' '(' Expression ')' Statement
     *   | 'if' '(' Expression ')' Statement 'else' Statement
     *   ;
     */
    IfStatement() {
        this._eat('if');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');

        const consequent = this.Statement();

        let alternate = null;
        if (this._lookahead.type === 'else') {
            this._eat('else');
            alternate = this.Statement();
        }

        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate
        };
    }

    /**
     * IterationStatement
     *   : WhileStatement
     *   | DoWhileStatement
     *   | ForStatement
     *   ;
     */
    IterationStatement() {
        switch (this._lookahead.type) {
            case 'while':
                return this.WhileStatement();
            case 'do':
                return this.DoWhileStatement();
            case 'for':           
                return this.ForStatement();
        }
    }

    /**
     * WhileStatement
     *   : 'while' '(' Expression ')' Statement
     *   ;
     */
    WhileStatement() {
        this._eat('while');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');

        const body = this.Statement();

        return {
            type: 'WhileStatement',
            test,
            body
        };
    }

    /**
     * DoWhileStatement
     *   : 'do' Statement 'while' '(' Expression ')' ';'
     *   ;
     */
    DoWhileStatement() {
        this._eat('do');
        const body = this.Statement();

        this._eat('while');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');
        this._eat(';');

        return {
            type: 'DoWhileStatement',
            body,
            test
        };
    }

    /**
     * ForStatement
     *   : 'for' '(' OptForStatementInit ';' OptExpression ';' OptExpression ')' Statement
     *   ;
     */
    ForStatement() {
        this._eat('for');
        this._eat('(');

        const init = this._lookahead.type !== ';' ? this.ForStatementInit() : null;
        this._eat(';');

        const test = this._lookahead.type !== ';' ? this.Expression() : null;
        this._eat(';');

        const update = this._lookahead.type !== ')' ? this.Expression() : null;
        this._eat(')');

        const body = this.Statement();

        return {
            type: 'ForStatement',
            init,
            test,
            update,
            body
        };
    }

    /**
     * ForStatementInit
     *   : VariableStatementInit
     *   | Expression
     *   ;
     */
    ForStatementInit() {
        if (this._lookahead.type === 'let') {
            return this.VariableStatementInit();
        }
        // TODO: Sequence expressions: for (x = 1, y = 2; ..
        return this.Expression();
    }


    /**
     * VariableStatementInit
     *   : 'let' VariableDeclarationList
     *   ;
     */
    VariableStatementInit() {
        this._eat('let');
        const declarations = this.VariableDeclarationList();
        return {
            type: 'VariableStatement',
            declarations
        };       
    }

    /**
     * VariableStatement
     *   : VariableStatementInit ';'
     */
    VariableStatement() {
        const variableStatement = this.VariableStatementInit();
        this._eat(';');
        return variableStatement;
    }

    /**
     * VariableDeclarationList
     *   : VariableDeclaration
     *   | VariableDeclarationList ',' VariableDeclaration
     *   ;
     */
    VariableDeclarationList() {
        const declarations = [];

        do {
            declarations.push(this.VariableDeclaration());
        } while (this._lookahead.type === ',' && this._eat(','));

        return declarations;
    }

    /**
     * VariableDeclaration
     *   : Identidier OptVariableInititalizer
     *   ;
     */
    VariableDeclaration() {
        const id = this.Identifier();
        const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' ?
                     this.VariableInitializer() :
                     null;
        
        return {
            type: 'VariableDeclaration',
            id,
            init
        };
    }

    /**
     * VariableInitializer
     *   : SIMPLE_ASSIGN AssignmentExpression
     *   ;
     */
    VariableInitializer() {
        this._eat('SIMPLE_ASSIGN');
        return this.AssignmentExpression();
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
     *   : AssignmentExpression
     *   ;
     */
    Expression() {
        return this.AssignmentExpression(); // Lowest precedence first
    }

    /**
     * AssignmentExpression
     *   : LogicalORExpression
     *   | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *   ;
     */
    AssignmentExpression() {
        const left = this.LogicalORExpression();

        if (!this._isAssignmentOperator(this._lookahead.type)) {
            return left;
        }

        return {
            type: 'AssignmentExpression',
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.AssignmentExpression()
        };
    }

    _isAssignmentOperator(tokenType) {
        return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
    }

    _checkValidAssignmentTarget(target) {
        if (target.type === 'Identifier' || target.type === 'MemberExpression')
            return target;
        throw new SyntaxError(`Invalid left hand side expression: ${target.value}`);
    }

    /**
     * AssignmentOperator
     *   : SIMPLE_ASSIGN
     *   | COMPLEX_ASSIGN
     *   ;
     */
    AssignmentOperator() {
        switch (this._lookahead.type) {
            case 'SIMPLE_ASSIGN':
                return this._eat('SIMPLE_ASSIGN');
            case 'COMPLEX_ASSIGN':
                return this._eat('COMPLEX_ASSIGN');
            default:
                throw new SyntaxError(`Invalid assignment operator: ${this._lookahead.type}`);
        } 
    }

    /**
     * LogicalANDExpression
     *   : EqualityExpression
     *   | EqualityExpression LOGICAL_AND LogicalANDExpression
     *   ;
     */
    LogicalANDExpression() {
        return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND');
    }

    /**
     * LogicalORExpression
     *   : LogicalORExpression
     *   | LogicalANDExpression LOGICAL_OR LogicalORExpression
     *   ;
     */
    LogicalORExpression() {
        return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR');
    }

    /**
     * Generic logical expression.
     */
    _LogicalExpression(builderName, operatorToken) {
        let left = this[builderName]();

        while (this._lookahead.type === operatorToken) {
            // Operator *, /
            const operator = this._eat(operatorToken).value;

            const right = this[builderName]();
            left = {
                type: 'LogicalExpression',
                operator,
                left,
                right
            };
        }

        return left;
    }

    /**
     * Identifier
     *   : IDENTIFIER
     *   ;
     */
    Identifier() {
        const name = this._eat('IDENTIFIER').value;
        return {
            type: 'Identifier',
            name
        };
    }

    /**
     * EqualityExpression
     *   : RelationalExpression
     *   | RelationalExpression EQUALITY_OPERATOR EqualityExpression
     *   ;
     */
    EqualityExpression() {
        return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
    }

    /**
     * RelationalExpression
     *   : AdditiveExpression
     *   | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
     *   ;
     */
    RelationalExpression() {
        return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
    }

    /**
     * AddiiveExpression
     *   : MultiplicativeExpression
     *   | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression
     *   ;
     */
    AdditiveExpression() {
        return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR');
    }

    /**
     * MultiplicativeExpression
     *   : UnaryExpression
     *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR UnaryExpression
     *   ;
     */
    MultiplicativeExpression() {
        return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
    }

    /**
     * Generic binary expression.
     */
    _BinaryExpression(builderName, operatorToken) {
        let left = this[builderName]();

        while (this._lookahead.type === operatorToken) {
            // Operator *, /
            const operator = this._eat(operatorToken).value;

            const right = this[builderName]();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            };
        }

        return left;
    }

    /**
     * UnaryExpression
     *   : ADDITIVE_OPERATOR UnaryExpression
     *   | LOGICAL_NOT UnaryExpression
     *   ;
     */
    UnaryExpression() {
        let operator;
        switch(this._lookahead.type) {
            case 'ADDITIVE_OPERATOR':
                operator = this._eat('ADDITIVE_OPERATOR').value;
                break;
            case 'LOGICAL_NOT':
                operator = this._eat('LOGICAL_NOT').value;
                break;
        }
        if (operator != null) {
            return {
                type: 'UnaryExpression',
                operator,
                argument: this.UnaryExpression()
            };
        }
        return this.LeftHandSideExpression();
    }

    /**
     * LeftHandSideExpression
     *   : CallMemberExpression
     *   ;
     */
    LeftHandSideExpression() {
        return this.CallMemberExpression();
    }

    /**
     * CallMemberExpression
     *   : MemberExpression
     *   | CallExpression
     *   ;
     */
    CallMemberExpression() {
        if (this._lookahead.type === 'super') {
            return this._CallExpression(this.Super());
        }

        const member = this.MemberExpression(); // Part of the call

        if (this._lookahead.type === '(') {
            return this._CallExpression(member);
        }

        return member;
    }

    /**
     * CallExpression
     *   : Callee Arguments
     *   ;
     * 
     * Callee
     *   : MemberExpression
     *   | CallExpression
     *   ;
     */
    _CallExpression(callee) {
        let callExpression = {
            type: 'CallExpression',
            callee,
            arguments: this.Arguments()
        };

        if (this._lookahead.type === '(') {
            callExpression = this._CallExpression(callExpression);
        }

        return callExpression;
    }

    /**
     * Arguments
     *   : '(' OptArgumentsList ')'
     *   ;
     */
    Arguments() {
        this._eat('(');
        const argumentList = this._lookahead.type !== ')' ? 
                this.ArgumentList() :
                [];
        this._eat(')');
        return argumentList;
    }

    /**
     * ArgumentList
     *   : AssignmentExpression
     *   : ArgumentList ',' AssignmentExpression
     */
    ArgumentList() {
        const argumentList = [];

        do {
            argumentList.push(this.AssignmentExpression());
        } while (this._lookahead.type === ',' && this._eat(','));

        return argumentList;
    }

    /**
     * MemberExpression
     *   : PrimaryExpression
     *   | MemberExpression '.' Identifier
     *   | MemberExpression '[' Expression ']'
     *   ; 
     */
    MemberExpression() {
        let object = this.PrimaryExpression();

        while (this._lookahead.type === '.' || this._lookahead.type === '[') {
            if (this._lookahead.type === '.') {
                this._eat('.');
                const property = this.Identifier();
                object = {
                    type: 'MemberExpression',
                    computed: false,
                    object,
                    property
                };
            } else {
                this._eat('[');
                const property = this.Expression();
                this._eat(']');
                object = {
                    type: 'MemberExpression',
                    computed: true,
                    object,
                    property
                };
            }
        }

        return object;
    }

    /**
     * ThisExpression
     *   : 'this'
     *   ;
     */
    ThisExpression() {
        this._eat('this');
        return {
            type: 'ThisExpression'
        };
    }

    /**
     * Super
     *   : 'super'
     *   ;
     */
    Super() {
        this._eat('super');
        return {
            type: 'Super'
        };
    }

    /**
     * NewExpression
     *   : 'new' MemberExpression Arguments
     *   ;
     */
    NewExpression() {
        this._eat('new');
        return {
            type: 'NewExpression',
            callee: this.MemberExpression(),
            arguments: this.Arguments()
        };
    }

    /**
     * PrimaryExpression
     *   : Literal
     *   | ParenthesizedExpression
     *   | Identifier
     *   | ThisExpression
     *   | NewExpression
     *   ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        switch(this._lookahead.type) {
            case '(':
                return this.ParenthesizedExpression();
            case 'IDENTIFIER':
                return this.Identifier();
            case 'this':
                return this.ThisExpression();
            case 'new':
                return this.NewExpression();
            default:
                throw new SyntaxError(`Unexpected primary expression: ${this._lookahead.type}`);
        }
    }

    /**
     * ParenthesizedExpression
     *   : '(' Expression ')'
     *   ;
     */
    ParenthesizedExpression() {
        this._eat('(');
        const expression = this.Expression();
        this._eat(')');
        return expression;
    }

    _isLiteral(tokenType) {
        switch (tokenType) {
            case 'NUMBER':
            case 'STRING':
            case 'true':
            case 'false':
            case 'null':
                return true;
            default:
                return false;
        }
    }

    /**
     * Literal
     *   : NumericLiteral
     *   | StringLiteral
     *   | BooleanLiteral
     *   | NullLiteral
     *   ;
     */
    Literal() {
        switch(this._lookahead.type){
            case 'NUMBER':
                return this.NumericLiteral();
            case 'STRING':
                return this.StringLiteral();
            case 'true':
                return this.BooleanLiteral(true);
            case 'false':
                return this.BooleanLiteral(false);
            case 'null':
                return this.NullLiteral();
            }

        throw new SyntaxError('Unexpected literal!');
    }

    /**
     * BooleanLiteral
     *   : 'true'
     *   | 'false'
     *   ;
     */
    BooleanLiteral(value) {
        this._eat(value ? 'true' : 'false');
        return {
            type: 'BooleanLiteral',
            value
        };
    }

    /**
     * NullLiteral
     *   : 'null'
     *   ;
     */
    NullLiteral() {
        this._eat('null');
        return {
            type: 'NullLiteral',
            value: null
        };
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
