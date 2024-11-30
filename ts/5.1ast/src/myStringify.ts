// import fs from "fs";

// let rawJSON=fs.readFileSync("../src.json","utf-8");
// let ast:Program=JSON.parse(rawJSON);

// ast

export class myStringify {
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
        console.log("未知的解析：")
        console.log(d);
    }
  }

  static resolveEmptyStatement(d: EmptyStatement) {
    return "";
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
      if (dd.type==="FunctionExpression"){
        js+="function "
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
    return js;
  }

  static resolveIfStatement(d: IfStatement) {
    let js = `if (${this.autoRs(d.test)})`;
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
    js+="}"
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

  static resolveDebuggerStatement(d:DebuggerStatement){
    return "debugger";
  }

  static resolveBreakStatement(d:BreakStatement){
    return "break";
  }

  static resolveContinueStatement(d:ContinueStatement){
    return "continue";
  }

  static resolveSwitchStatement(d:SwitchStatement){
    let js= `switch (${this.autoRs(d.discriminant)}):{\n`

    for (let dd of d.cases){
      if (dd.test){
        js+=`case ${dd.test}:\n`;
      }else{
        js+=`default:\n`;
      }

      // SwitchCase就不单独写了
      for (let ddd of dd.consequent){
        js+=this.autoRs(ddd);
        js+="\n"
      }
    }

    js+="}"
    return js;
  }

  static resolveTryStatement(d:TryStatement){
    let js="try"
    js+=this.autoRs(d.block);
    js+="catch("

    if (!d.handler){
      throw Error("try后必须有catch");
    }

    js+=this.autoRs(d.handler.param)
    js+=")"

    js+=this.autoRs(d.handler.body);

    if (d.finalizer){
      js+="finally"
      js+=this.autoRs(d.finalizer)
    }

    return js;
  }

  static resolveThrowStatement(d:ThrowStatement){
    return `throw ${this.autoRs(d.argument)}`;
  }

  static resolveNewExpression(d:NewExpression){
    let js="new ";
    js+=this.autoRs(d.callee);
    js+="("

    let isFirst=true
    for (let dd of d.arguments){
      if (isFirst){
        isFirst=false
      }else{
        js+=","
      }

      js+=this.autoRs(dd);
    }

    js+=")"
    return js;
  }
}
