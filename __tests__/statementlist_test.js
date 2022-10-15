module.exports = test => {
    test(`// Comment
    "hello";

    /* Number
       statement */
    42;`, {
        type: 'Program',
        "body": [
            {
              "type": "ExpressionStatement",
              "expression": {
                "type": "StringLiteral",
                "value": "hello"
              }
            },
            {
              "type": "ExpressionStatement",
              "expression": {
                "type": "NumericLiteral",
                "value": 42
              }
            }
          ]
    });
};
