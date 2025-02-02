interface Node {
  type: string;
  loc: SourceLocation | null;
}

interface SourceLocation {
  source: string | null;
  start: Position;
  end: Position;
}

interface Position {
  line: number; // >= 1
  column: number; // >= 0
}

interface Identifier extends Expression, Pattern {
  type: "Identifier";
  name: string;
}

interface Literal extends Expression {
  type: "Literal";
  value: string | boolean | null | number | RegExp;
  raw: string;
}

interface RegExpLiteral extends Literal {
  regex: {
    pattern: string;
    flags: string;
  };
}

interface Program extends Node {
  type: "Program";
  body: (Directive | Statement)[];
}

interface Function extends Node {
  id: Identifier | null;
  params: [Pattern];
  body: FunctionBody;
}

interface Statement extends Node {}

interface ExpressionStatement extends Statement {
  type: "ExpressionStatement";
  expression: Expression;
}

interface Directive extends ExpressionStatement {
  expression: Literal;
  directive: string;
}

interface BlockStatement extends Statement {
  type: "BlockStatement";
  body: [Statement];
}

interface FunctionBody extends BlockStatement {
  body: [Directive | Statement];
}

interface EmptyStatement extends Statement {
  type: "EmptyStatement";
}

interface DebuggerStatement extends Statement {
  type: "DebuggerStatement";
}

interface WithStatement extends Statement {
  type: "WithStatement";
  object: Expression;
  body: Statement;
}

interface ReturnStatement extends Statement {
  type: "ReturnStatement";
  argument: Expression | null;
}

interface LabeledStatement extends Statement {
  type: "LabeledStatement";
  label: Identifier;
  body: Statement;
}

interface BreakStatement extends Statement {
  type: "BreakStatement";
  label: Identifier | null;
}

interface ContinueStatement extends Statement {
  type: "ContinueStatement";
  label: Identifier | null;
}

interface IfStatement extends Statement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

interface SwitchStatement extends Statement {
  type: "SwitchStatement";
  discriminant: Expression;
  cases: [SwitchCase];
}

interface SwitchCase extends Node {
  type: "SwitchCase";
  test: Expression | null;
  consequent: [Statement];
}

interface ThrowStatement extends Statement {
  type: "ThrowStatement";
  argument: Expression;
}

interface TryStatement extends Statement {
  type: "TryStatement";
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

interface CatchClause extends Node {
  type: "CatchClause";
  param: Pattern;
  body: BlockStatement;
}

interface WhileStatement extends Statement {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}

interface DoWhileStatement extends Statement {
  type: "DoWhileStatement";
  body: Statement;
  test: Expression;
}

interface ForStatement extends Statement {
  type: "ForStatement";
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

interface ForInStatement extends Statement {
  type: "ForInStatement";
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
}

interface Declaration extends Statement {}

interface FunctionDeclaration extends Function, Declaration {
  type: "FunctionDeclaration";
  id: Identifier;
}

interface VariableDeclaration extends Declaration {
  type: "VariableDeclaration";
  declarations: [VariableDeclarator];
  kind: "var";
}

interface VariableDeclarator extends Node {
  type: "VariableDeclarator";
  id: Pattern;
  init: Expression | null;
}

interface Expression extends Node {}

interface ThisExpression extends Expression {
  type: "ThisExpression";
}

interface ArrayExpression extends Expression {
  type: "ArrayExpression";
  elements: [Expression | null];
}

interface ObjectExpression extends Expression {
  type: "ObjectExpression";
  properties: [Property];
}

// 这个东西在es5居然不能computed (即动态属性名)
interface Property extends Node {
  type: "Property";
  key: Literal | Identifier;
  value: Expression;
  kind: "init" | "get" | "set";
}

interface FunctionExpression extends Function, Expression {
  type: "FunctionExpression";
}

interface UnaryExpression extends Expression {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
}

enum UnaryOperator {
  "-",
  "+",
  "!",
  "~",
  "typeof",
  "void",
  "delete",
}

interface UpdateExpression extends Expression {
  type: "UpdateExpression";
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
}

enum UpdateOperator {
  "++",
  "--",
}

interface BinaryExpression extends Expression {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

enum BinaryOperator {
  "==",
  "!=",
  "===",
  "!==",
  "<",
  "<=",
  ">",
  ">=",
  "<<",
  ">>",
  ">>>",
  "+",
  "-",
  "*",
  "/",
  "%",
  ",",
  "^",
  "&",
  "in",
  "instanceof",
}

interface AssignmentExpression extends Expression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  left: Pattern | Expression;
  right: Expression;
}

enum AssignmentOperator {
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "<<=",
  ">>=",
  ">>>=",
  ",=",
  "^=",
  "&=",
}

interface LogicalExpression extends Expression {
  type: "LogicalExpression";
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
}

enum LogicalOperator {
  "||",
  "&&",
}

interface MemberExpression extends Expression, Pattern {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
}

interface ConditionalExpression extends Expression {
  type: "ConditionalExpression";
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}

interface CallExpression extends Expression {
  type: "CallExpression";
  callee: Expression;
  arguments: [Expression];
}

interface NewExpression extends Expression {
  type: "NewExpression";
  callee: Expression;
  arguments: [Expression];
}

interface SequenceExpression extends Expression {
  type: "SequenceExpression";
  expressions: [Expression];
}

// 在es5只可能是identifier
interface Pattern extends Node {}
