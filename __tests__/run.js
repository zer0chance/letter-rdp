
const {Parser} = require('../src/Parser');

const parser = new Parser();

const program =
`  
 // Comment
 "hello"; /* Comment*/

 // Number
 42;
`;

const ast = parser.parse(program);

console.log(JSON.stringify(ast, null, 2));
