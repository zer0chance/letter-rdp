module.exports = test => {
    test(`2 + 2;`, {
        type: 'Program',
        body: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "BinaryExpression",
                operator: "+",
                left: {
                    type: 'NumericLiteral',
                    value: 2
                },
                right: {
                    type: 'NumericLiteral',
                    value: 2
                }
              }
            },
          ]
    });

    test(`2 * 2;`, {
        type: 'Program',
        body: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "BinaryExpression",
                operator: "*",
                left: {
                    type: 'NumericLiteral',
                    value: 2
                },
                right: {
                    type: 'NumericLiteral',
                    value: 2
                }
              }
            },
          ]
    });

    test(`3 + 2 - 2;`, {
        type: 'Program',
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "-",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: 'NumericLiteral',
                            value: 3
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 2
                        }
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 2
                    }
                }
            }
        ]
    });

    // Left assocoative
    test(`2 * 2 * 2;`, {
        type: 'Program',
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: 'NumericLiteral',
                            value: 2
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 2
                        }
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 2
                    }
                }
            }
        ]
    });

    // Right associative because of precidence
    test(`2 + 2 * 2;`, {
        type: 'Program',
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: 'NumericLiteral',
                        value: 2
                    },
                    right: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: 'NumericLiteral',
                            value: 2
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 2
                        }
                    }
                }
            }
        ]
    });

    // Left assocoative because of parentheses
    test(`(2 + 2) * 2;`, {
        type: 'Program',
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: 'NumericLiteral',
                            value: 2
                        },
                        right: {
                            type: 'NumericLiteral',
                            value: 2
                        }
                    },
                    right: {
                        type: 'NumericLiteral',
                        value: 2
                    }
                }
            }
        ]
    });
};
