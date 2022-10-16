
const {Parser} = require('../src/Parser');
const assert = require('assert');

// List of tests
const tests = [
    require('./literals_test'),
    require('./statement_list_test'),
    require('./block_test'),
    require('./empty_statement_test'),
    require('./binary_expressions_test'),
    require('./assignment_test'),
    require('./variable_test'),
    require('./if_test'),
    require('./relational_test'),
    require('./equality_test'),
    require('./logical_test'),
    require('./unary_test'),
    require('./while_test'),
    require('./do_while_test'),
    require('./for_test'),
    require('./functions_test'),
    require('./member_test'),
];

const parser = new Parser();

function exec() {
    const program =
    `
    foo(x); 
    `;

    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

// Manual testing
exec();

// Test function
function test(program, expected) {
    let ast = parser.parse(program);
    assert.deepEqual(ast, expected); 
}

tests.forEach(testRun => testRun(test));

console.log('All assertions passed.');
