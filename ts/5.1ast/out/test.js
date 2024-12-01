"use strict";
import { myStringify } from "./myStringify.js";
let bin = {
  expression: {
    type: "BinaryExpression",
    start: 0,
    end: 3,
    left: {
      type: "Literal",
      start: 0,
      end: 1,
      value: 1,
      raw: "1"
    },
    operator: "+",
    right: {
      type: "Literal",
      start: 2,
      end: 3,
      value: 1,
      raw: '"1"'
    }
  }
};
console.log(myStringify.resolveBinaryExpression(bin.expression));
let va = {
  type: "VariableDeclaration",
  start: 0,
  end: 15,
  declarations: [
    {
      type: "VariableDeclarator",
      start: 4,
      end: 15,
      id: {
        type: "Identifier",
        start: 4,
        end: 5,
        name: "a"
      },
      init: {
        type: "BinaryExpression",
        start: 6,
        end: 15,
        left: {
          type: "BinaryExpression",
          start: 6,
          end: 11,
          left: {
            type: "BinaryExpression",
            start: 6,
            end: 9,
            left: {
              type: "Literal",
              start: 6,
              end: 7,
              value: 1,
              raw: "1"
            },
            operator: "+",
            right: {
              type: "Literal",
              start: 8,
              end: 9,
              value: 1,
              raw: "1"
            }
          },
          operator: "+",
          right: {
            type: "Literal",
            start: 10,
            end: 11,
            value: 1,
            raw: "1"
          }
        },
        operator: "+",
        right: {
          type: "Literal",
          start: 12,
          end: 15,
          value: "1",
          raw: '"1"'
        }
      }
    }
  ],
  kind: "var"
};
console.log(myStringify.resolveVariableDeclaration(va));
let as = {
  type: "AssignmentExpression",
  start: 16,
  end: 31,
  operator: "=",
  left: {
    type: "Identifier",
    start: 16,
    end: 17,
    name: "a"
  },
  right: {
    type: "CallExpression",
    start: 18,
    end: 31,
    callee: {
      type: "MemberExpression",
      start: 18,
      end: 26,
      object: {
        type: "Identifier",
        start: 18,
        end: 22,
        name: "Math"
      },
      property: {
        type: "Identifier",
        start: 23,
        end: 26,
        name: "max"
      },
      computed: false,
      optional: false
    },
    arguments: [
      {
        type: "Literal",
        start: 27,
        end: 28,
        value: 2,
        raw: "2"
      },
      {
        type: "Literal",
        start: 29,
        end: 30,
        value: 1,
        raw: "1"
      }
    ],
    optional: false
  }
};
console.log(myStringify.resolveAssignmentExpression(as));
let fnd = {
  type: "FunctionDeclaration",
  start: 32,
  end: 81,
  id: {
    type: "Identifier",
    start: 41,
    end: 45,
    name: "func"
  },
  expression: false,
  generator: false,
  async: false,
  params: [
    {
      type: "Identifier",
      start: 46,
      end: 47,
      name: "b"
    },
    {
      type: "Identifier",
      start: 48,
      end: 49,
      name: "c"
    }
  ],
  body: {
    type: "BlockStatement",
    start: 50,
    end: 81,
    body: [
      {
        type: "VariableDeclaration",
        start: 53,
        end: 60,
        declarations: [
          {
            type: "VariableDeclarator",
            start: 57,
            end: 60,
            id: {
              type: "Identifier",
              start: 57,
              end: 58,
              name: "a"
            },
            init: {
              type: "Literal",
              start: 59,
              end: 60,
              value: 2,
              raw: "2"
            }
          }
        ],
        kind: "var"
      },
      {
        type: "ExpressionStatement",
        start: 65,
        end: 79,
        expression: {
          type: "CallExpression",
          start: 65,
          end: 79,
          callee: {
            type: "MemberExpression",
            start: 65,
            end: 76,
            object: {
              type: "Identifier",
              start: 65,
              end: 72,
              name: "console"
            },
            property: {
              type: "Identifier",
              start: 73,
              end: 76,
              name: "log"
            },
            computed: false,
            optional: false
          },
          arguments: [
            {
              type: "Identifier",
              start: 77,
              end: 78,
              name: "a"
            }
          ],
          optional: false
        }
      }
    ]
  }
};
console.log(myStringify.resolveFunctionDeclaration(fnd));
let pa = {
  type: "Program",
  start: 0,
  end: 164,
  body: [
    {
      type: "ForStatement",
      start: 0,
      end: 140,
      init: null,
      test: {
        type: "BinaryExpression",
        start: 6,
        end: 9,
        left: {
          type: "Identifier",
          start: 6,
          end: 7,
          name: "i"
        },
        operator: "<",
        right: {
          type: "Literal",
          start: 8,
          end: 9,
          value: 5,
          raw: "5"
        }
      },
      update: {
        type: "UpdateExpression",
        start: 10,
        end: 13,
        operator: "++",
        prefix: true,
        argument: {
          type: "Identifier",
          start: 12,
          end: 13,
          name: "i"
        }
      },
      body: {
        type: "BlockStatement",
        start: 14,
        end: 140,
        body: [
          {
            type: "IfStatement",
            start: 17,
            end: 138,
            test: {
              type: "BinaryExpression",
              start: 21,
              end: 42,
              left: {
                type: "UnaryExpression",
                start: 21,
                end: 29,
                operator: "typeof",
                prefix: true,
                argument: {
                  type: "Identifier",
                  start: 28,
                  end: 29,
                  name: "i"
                }
              },
              operator: "===",
              right: {
                type: "Literal",
                start: 34,
                end: 42,
                value: "number",
                raw: '"number"'
              }
            },
            consequent: {
              type: "BlockStatement",
              start: 43,
              end: 114,
              body: [
                {
                  type: "VariableDeclaration",
                  start: 50,
                  end: 108,
                  declarations: [
                    {
                      type: "VariableDeclarator",
                      start: 54,
                      end: 106,
                      id: {
                        type: "Identifier",
                        start: 54,
                        end: 55,
                        name: "b"
                      },
                      init: {
                        type: "ConditionalExpression",
                        start: 56,
                        end: 106,
                        test: {
                          type: "Identifier",
                          start: 56,
                          end: 57,
                          name: "i"
                        },
                        consequent: {
                          type: "ArrayExpression",
                          start: 60,
                          end: 67,
                          elements: [
                            {
                              type: "Literal",
                              start: 61,
                              end: 62,
                              value: 1,
                              raw: "1"
                            },
                            {
                              type: "Literal",
                              start: 63,
                              end: 64,
                              value: 2,
                              raw: "2"
                            },
                            {
                              type: "Literal",
                              start: 65,
                              end: 66,
                              value: 3,
                              raw: "3"
                            }
                          ]
                        },
                        alternate: {
                          type: "ObjectExpression",
                          start: 70,
                          end: 106,
                          properties: [
                            {
                              type: "Property",
                              start: 71,
                              end: 74,
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: "Identifier",
                                start: 71,
                                end: 72,
                                name: "a"
                              },
                              value: {
                                type: "Literal",
                                start: 73,
                                end: 74,
                                value: 2,
                                raw: "2"
                              },
                              kind: "init"
                            },
                            {
                              type: "Property",
                              start: 75,
                              end: 80,
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: "Identifier",
                                start: 75,
                                end: 76,
                                name: "b"
                              },
                              value: {
                                type: "Literal",
                                start: 77,
                                end: 80,
                                value: "5",
                                raw: '"5"'
                              },
                              kind: "init"
                            },
                            {
                              type: "Property",
                              start: 81,
                              end: 87,
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: "Identifier",
                                start: 81,
                                end: 82,
                                name: "c"
                              },
                              value: {
                                type: "Literal",
                                start: 83,
                                end: 87,
                                value: true,
                                raw: "true"
                              },
                              kind: "init"
                            },
                            {
                              type: "Property",
                              start: 88,
                              end: 105,
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: "Identifier",
                                start: 92,
                                end: 93,
                                name: "a"
                              },
                              kind: "get",
                              value: {
                                type: "FunctionExpression",
                                start: 93,
                                end: 105,
                                id: null,
                                expression: false,
                                generator: false,
                                async: false,
                                params: [],
                                body: {
                                  type: "BlockStatement",
                                  start: 95,
                                  end: 105,
                                  body: [
                                    {
                                      type: "ReturnStatement",
                                      start: 96,
                                      end: 104,
                                      argument: {
                                        type: "Literal",
                                        start: 103,
                                        end: 104,
                                        value: 1,
                                        raw: "1"
                                      }
                                    }
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  ],
                  kind: "var"
                }
              ]
            },
            alternate: {
              type: "IfStatement",
              start: 122,
              end: 138,
              test: {
                type: "Literal",
                start: 125,
                end: 129,
                value: true,
                raw: "true"
              },
              consequent: {
                type: "BlockStatement",
                start: 130,
                end: 132,
                body: []
              },
              alternate: {
                type: "BlockStatement",
                start: 136,
                end: 138,
                body: []
              }
            }
          }
        ]
      }
    },
    {
      type: "ExpressionStatement",
      start: 142,
      end: 161,
      expression: {
        type: "CallExpression",
        start: 142,
        end: 158,
        callee: {
          type: "Identifier",
          start: 142,
          end: 143,
          name: "a"
        },
        arguments: [
          {
            type: "FunctionExpression",
            start: 144,
            end: 157,
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [],
            body: {
              type: "BlockStatement",
              start: 155,
              end: 157,
              body: []
            }
          }
        ],
        optional: false
      }
    },
    {
      type: "EmptyStatement",
      start: 161,
      end: 162
    },
    {
      type: "EmptyStatement",
      start: 162,
      end: 163
    },
    {
      type: "EmptyStatement",
      start: 163,
      end: 164
    }
  ],
  sourceType: "module"
};
111;
console.log(myStringify.resolveProgram(pa));
let paa = {
  "type": "Program",
  "start": 0,
  "end": 64,
  "body": [
    {
      "type": "TryStatement",
      "start": 0,
      "end": 63,
      "block": {
        "type": "BlockStatement",
        "start": 3,
        "end": 9,
        "body": [
          {
            "type": "ExpressionStatement",
            "start": 6,
            "end": 7,
            "expression": {
              "type": "Literal",
              "start": 6,
              "end": 7,
              "value": 1,
              "raw": "1"
            }
          }
        ]
      },
      "handler": {
        "type": "CatchClause",
        "start": 9,
        "end": 47,
        "param": {
          "type": "Identifier",
          "start": 15,
          "end": 16,
          "name": "e"
        },
        "body": {
          "type": "BlockStatement",
          "start": 17,
          "end": 47,
          "body": [
            {
              "type": "ThrowStatement",
              "start": 20,
              "end": 45,
              "argument": {
                "type": "NewExpression",
                "start": 26,
                "end": 45,
                "callee": {
                  "type": "Identifier",
                  "start": 30,
                  "end": 35,
                  "name": "Error"
                },
                "arguments": [
                  {
                    "type": "Literal",
                    "start": 36,
                    "end": 42,
                    "value": "nmsl",
                    "raw": '"nmsl"'
                  },
                  {
                    "type": "Literal",
                    "start": 43,
                    "end": 44,
                    "value": 2,
                    "raw": "2"
                  }
                ]
              }
            }
          ]
        }
      },
      "finalizer": {
        "type": "BlockStatement",
        "start": 54,
        "end": 63,
        "body": [
          {
            "type": "ExpressionStatement",
            "start": 57,
            "end": 61,
            "expression": {
              "type": "Literal",
              "start": 57,
              "end": 61,
              "value": 1312,
              "raw": "1312"
            }
          }
        ]
      }
    }
  ],
  "sourceType": "module"
};
console.log(myStringify.autoRs(paa));
//# sourceMappingURL=test.js.map
