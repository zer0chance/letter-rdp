#!/usr/bin/env node

/**
 * Usage:
 *   node ./bin/letter-rdp -e "let x = 10; console.log(x);"
 *   node ./bin/letter-rdp -f code.lt
 */

'use strict';

const {readFileSync} = require('fs');
const {Parser} = require('../src/Parser');

function main(argv) {
    const [_node, _path, mode, expr] = argv;

    const parser = new Parser();

    let ast = null;

    if (mode === '-e') {
        ast = parser.parse(expr);
    }
    
    if (mode === '-f') {
        const src = readFileSync(exp, 'utf-8');
        ast = parser.parse(src);
    }

    console.log(JSON.stringify(ast, null, 2));
}

main(process.argv);