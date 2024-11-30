"use strict";
export class myStringify {
  /**
   * @describe 用于调用其他解析函数
   * @param d 需要解析的对象
   * @returns 调用结果
   */
  static autoRs(d) {
    if (!d) {
      return "";
    }
    try {
      return this["resolve" + d.type](d);
    } catch {
      console.log("\u672A\u77E5\u7684\u89E3\u6790\uFF1A");
      console.log(d);
    }
  }
  static resolveEmptyStatement(d) {
    return "";
  }
  static resolveProgram(ast) {
    let js = this.resolveBody(ast.body);
    return js;
  }
  static resolveBody(body) {
    let js = "";
    for (let d of body) {
      js += this.autoRs(d);
      js += ";\n";
    }
    return js;
  }
  static resolveVariableDeclaration(d) {
    let js = d.kind;
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
  static resolveVariableDeclarator(d) {
    return `${this.autoRs(d.id)} = ${this.autoRs(d.init)}`;
  }
  static resolveLiteral(d) {
    return d.raw;
  }
  static resolveIdentifier(d) {
    return d.name;
  }
  static resolveBinaryExpression(d) {
    let js = "";
    js += this.autoRs(d.left);
    js += " " + d.operator + " ";
    js += this.autoRs(d.right);
    return js;
  }
  static resolveCallExpression(d) {
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
      if (dd.type === "FunctionExpression") {
        js += "function ";
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
  static resolveMemberExpression(d) {
    let js = "";
    if (d.computed) {
      js += `${this.autoRs(d.object)}[${this.autoRs(d.property)}]`;
    } else {
      js += `${this.autoRs(d.object)}.${this.autoRs(d.property)}`;
    }
    return js;
  }
  static resolveAssignmentExpression(d) {
    return this.resolveBinaryExpression(d);
  }
  static resolveFunctionDeclaration(d) {
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
  static resolveBlockStatement(d) {
    let js = "{\n";
    js += this.resolveBody(d.body);
    js += "}";
    return js;
  }
  // 这个就是个套娃
  static resolveExpressionStatement(d) {
    return this.autoRs(d.expression);
  }
  static resolveUpdateExpression(d) {
    return d.prefix ? d.operator + this.autoRs(d.argument) : this.autoRs(d.argument) + d.operator;
  }
  static resolveForStatement(d) {
    let js = `for (${this.autoRs(d.init)};${this.autoRs(d.test)};${this.autoRs(
      d.update
    )})`;
    js += this.autoRs(d.body);
    return js;
  }
  static resolveIfStatement(d) {
    let js = `if (${this.autoRs(d.test)})`;
    js += this.autoRs(d.consequent);
    js += "else ";
    js += this.autoRs(d.alternate);
    return js;
  }
  static resolveUnaryExpression(d) {
    if (d.prefix) {
      return `${d.operator} ${this.autoRs(d.argument)}`;
    } else {
      return `${this.autoRs(d.argument)} ${d.operator}`;
    }
  }
  static resolveConditionalExpression(d) {
    return `${this.autoRs(d.test)} ? ${this.autoRs(
      d.consequent
    )} : ${this.autoRs(d.alternate)}`;
  }
  static resolveArrayExpression(d) {
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
  static resolveFunctionExpression(d) {
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
  static resolveObjectExpression(d) {
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
    js += "}";
    return js;
  }
  static resolveProperty(d) {
    if (d.kind === "init") {
      return `${this.autoRs(d.key)} : ${this.autoRs(d.value)}`;
    }
    let js = `${d.kind} `;
    js += this.autoRs(d.key);
    js += this.autoRs(d.value);
    return js;
  }
  static resolveReturnStatement(d) {
    return `return ${this.autoRs(d.argument)}`;
  }
}
//# sourceMappingURL=myStringify.js.map
