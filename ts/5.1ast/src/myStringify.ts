import fs from "fs";

// let rawJSON=fs.readFileSync("../src.json","utf-8");
// let ast:Program=JSON.parse(rawJSON);

// ast

class myStringify {
  /**
   * @describe 用于调用其他解析函数
   * @param d 需要解析的对象
   * @returns 调用结果
   */
  static autoRs(d: Node | null) {
    if (!d) {
      return "";
    }
    try{
        return (<any>this)["resolve" + d.type](d);
    }catch{
        console.log(d);
    }
  }

  static EmptyStatement(d: EmptyStatement) {
    return ";";
  }

  static resolveProgram(ast: Program) {
    let js = this.resolveBody(ast.body);

    return js;
  }

  static resolveBody(body: (Directive | Statement)[]) {
    let js = "";
    for (let d of body) {
      js += this.autoRs(d);
      js += ";\n";
    }
    return js;
  }

  static resolveVariableDeclaration(d: VariableDeclaration) {
    // 可能有 var let const
    let js: string = d.kind;
    js += " ";
    let isFirst = true;
    for (let dd of d.declarations) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(dd);
    }
    return js;
  }

  static resolveVariableDeclarator(d: VariableDeclarator) {
    return `${this.autoRs(d.id)} = ${this.autoRs(d.init)}`;
  }

  static resolveLiteral(d: Literal) {
    // return typeof d.value==="string"? `"${d.value}"` : String(d.value);
    return d.raw;
  }

  static resolveIdentifier(d: Identifier) {
    return d.name;
  }

  static resolveBinaryExpression(d: BinaryExpression) {
    let js = "";
    js += this.autoRs(d.left);
    js += " " + d.operator + " ";
    js += this.autoRs(d.right);
    return js;
  }

  static resolveCallExpression(d: CallExpression): string {
    let js = "";

    js += this.autoRs(d.callee);
    js += "(";

    let isFirst = true;
    for (let dd of d.arguments) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(dd);
    }

    js += ")";

    return js;
  }

  /**
   * @describe 用于解析 a.b a[b]这样的obj
   * @param
   * @returns
   */
  static resolveMemberExpression(d: MemberExpression) {
    let js = "";

    if (d.computed) {
      // a[b]的情况
      js += `${this.autoRs(d.object)}[${this.autoRs(d.property)}]`;
    } else {
      // a.b的情况
      js += `${this.autoRs(d.object)}.${this.autoRs(d.property)}`;
    }

    return js;
  }

  static resolveAssignmentExpression(d: AssignmentExpression): string {
    // let js=""

    // return js;

    return this.resolveBinaryExpression(<any>d);
  }

  static resolveFunctionDeclaration(d: FunctionDeclaration) {
    let js = "function ";

    js += this.autoRs(d.id);

    js += "(";

    let isFirst = true;
    for (let dd of d.params) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(dd);
    }

    js += ")";

    js += this.resolveBlockStatement(d.body);

    return js;
  }

  static resolveBlockStatement(d: BlockStatement) {
    let js = "{\n";
    js += this.resolveBody(d.body);
    js += "}";
    return js;
  }

  // 这个就是个套娃
  static resolveExpressionStatement(d: ExpressionStatement) {
    return this.autoRs(d.expression);
  }

  static resolveUpdateExpression(d: UpdateExpression) {
    return d.prefix
      ? d.operator + this.autoRs(d.argument)
      : this.autoRs(d.argument) + d.operator;
  }

  static resolveForStatement(d: ForStatement) {
    let js = `for (${this.autoRs(d.init)};${this.autoRs(d.test)};${this.autoRs(
      d.update
    )})`;
    js += this.autoRs(d.body);
  }

  static resolveIfStatement(d: IfStatement) {
    let js = `for (${this.autoRs(d.test)})`;
    js += this.autoRs(d.consequent);
    js += "else ";
    js += this.autoRs(d.alternate);
    return js;
  }

  static resolveUnaryExpression(d: UnaryExpression) {
    if (d.prefix) {
      return `${d.operator} ${this.autoRs(d.argument)}`;
    } else {
      return `${this.autoRs(d.argument)} ${d.operator}`;
    }
  }

  static resolveConditionalExpression(d: ConditionalExpression): string {
    return `${this.autoRs(d.test)} ? ${this.autoRs(
      d.consequent
    )} : ${this.autoRs(d.alternate)}`;
  }

  static resolveArrayExpression(d: ArrayExpression): string {
    let js = "[";
    let isFirst = true;
    for (let ele of d.elements) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(ele);
    }
    js += "]";
    return js;
  }

  /**
   * @returns 不会返回前缀
   */
  static resolveFunctionExpression(d: FunctionExpression) {
    let js = this.autoRs(d.id) + "(";
    let isFirst = true;
    for (let p of d.params) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(p);
    }
    js += ")";
    js += this.autoRs(d.body);

    return js;
  }

  static resolveObjectExpression(d: ObjectExpression) {
    let js = "{";
    let isFirst = true;
    for (let p of d.properties) {
      if (isFirst) {
        isFirst = false;
      } else {
        js += ",";
      }

      js += this.autoRs(p);
    }
    return js;
  }

  static resolveProperty(d: Property) {
    if (d.kind === "init") {
      return `${this.autoRs(d.key)} : ${this.autoRs(d.value)}`;
    }

    // getter 和 setter的情况
    let js = `${d.kind} `;
    js += this.autoRs(d.key);
    js += this.autoRs(d.value);
    return js;
  }

  static resolveReturnStatement(d:ReturnStatement){
    return `return ${this.autoRs(d.argument)}`
  }
}

let bin: any = {
  expression: {
    type: "BinaryExpression",
    start: 0,
    end: 3,
    left: {
      type: "Literal",
      start: 0,
      end: 1,
      value: 1,
      raw: "1",
    },
    operator: "+",
    right: {
      type: "Literal",
      start: 2,
      end: 3,
      value: 1,
      raw: '"1"',
    },
  },
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
        name: "a",
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
              raw: "1",
            },
            operator: "+",
            right: {
              type: "Literal",
              start: 8,
              end: 9,
              value: 1,
              raw: "1",
            },
          },
          operator: "+",
          right: {
            type: "Literal",
            start: 10,
            end: 11,
            value: 1,
            raw: "1",
          },
        },
        operator: "+",
        right: {
          type: "Literal",
          start: 12,
          end: 15,
          value: "1",
          raw: '"1"',
        },
      },
    },
  ],
  kind: "var",
};

console.log(myStringify.resolveVariableDeclaration(<any>va));

let as = {
  type: "AssignmentExpression",
  start: 16,
  end: 31,
  operator: "=",
  left: {
    type: "Identifier",
    start: 16,
    end: 17,
    name: "a",
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
        name: "Math",
      },
      property: {
        type: "Identifier",
        start: 23,
        end: 26,
        name: "max",
      },
      computed: false,
      optional: false,
    },
    arguments: [
      {
        type: "Literal",
        start: 27,
        end: 28,
        value: 2,
        raw: "2",
      },
      {
        type: "Literal",
        start: 29,
        end: 30,
        value: 1,
        raw: "1",
      },
    ],
    optional: false,
  },
};

console.log(myStringify.resolveAssignmentExpression(<any>as));

let fnd = {
  type: "FunctionDeclaration",
  start: 32,
  end: 81,
  id: {
    type: "Identifier",
    start: 41,
    end: 45,
    name: "func",
  },
  expression: false,
  generator: false,
  async: false,
  params: [
    {
      type: "Identifier",
      start: 46,
      end: 47,
      name: "b",
    },
    {
      type: "Identifier",
      start: 48,
      end: 49,
      name: "c",
    },
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
              name: "a",
            },
            init: {
              type: "Literal",
              start: 59,
              end: 60,
              value: 2,
              raw: "2",
            },
          },
        ],
        kind: "var",
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
              name: "console",
            },
            property: {
              type: "Identifier",
              start: 73,
              end: 76,
              name: "log",
            },
            computed: false,
            optional: false,
          },
          arguments: [
            {
              type: "Identifier",
              start: 77,
              end: 78,
              name: "a",
            },
          ],
          optional: false,
        },
      },
    ],
  },
};

console.log(myStringify.resolveFunctionDeclaration(<any>fnd));

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
          name: "i",
        },
        operator: "<",
        right: {
          type: "Literal",
          start: 8,
          end: 9,
          value: 5,
          raw: "5",
        },
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
          name: "i",
        },
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
                  name: "i",
                },
              },
              operator: "===",
              right: {
                type: "Literal",
                start: 34,
                end: 42,
                value: "number",
                raw: '"number"',
              },
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
                        name: "b",
                      },
                      init: {
                        type: "ConditionalExpression",
                        start: 56,
                        end: 106,
                        test: {
                          type: "Identifier",
                          start: 56,
                          end: 57,
                          name: "i",
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
                              raw: "1",
                            },
                            {
                              type: "Literal",
                              start: 63,
                              end: 64,
                              value: 2,
                              raw: "2",
                            },
                            {
                              type: "Literal",
                              start: 65,
                              end: 66,
                              value: 3,
                              raw: "3",
                            },
                          ],
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
                                name: "a",
                              },
                              value: {
                                type: "Literal",
                                start: 73,
                                end: 74,
                                value: 2,
                                raw: "2",
                              },
                              kind: "init",
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
                                name: "b",
                              },
                              value: {
                                type: "Literal",
                                start: 77,
                                end: 80,
                                value: "5",
                                raw: '"5"',
                              },
                              kind: "init",
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
                                name: "c",
                              },
                              value: {
                                type: "Literal",
                                start: 83,
                                end: 87,
                                value: true,
                                raw: "true",
                              },
                              kind: "init",
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
                                name: "a",
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
                                        raw: "1",
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  kind: "var",
                },
              ],
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
                raw: "true",
              },
              consequent: {
                type: "BlockStatement",
                start: 130,
                end: 132,
                body: [],
              },
              alternate: {
                type: "BlockStatement",
                start: 136,
                end: 138,
                body: [],
              },
            },
          },
        ],
      },
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
          name: "a",
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
              body: [],
            },
          },
        ],
        optional: false,
      },
    },
    {
      type: "EmptyStatement",
      start: 161,
      end: 162,
    },
    {
      type: "EmptyStatement",
      start: 162,
      end: 163,
    },
    {
      type: "EmptyStatement",
      start: 163,
      end: 164,
    },
  ],
  sourceType: "module",
};
111;
console.log(myStringify.resolveProgram(<any>pa))