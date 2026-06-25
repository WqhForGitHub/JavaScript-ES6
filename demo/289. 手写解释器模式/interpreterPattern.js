/**
 * 解释器模式 (Interpreter Pattern)
 *
 * Approach:
 * - Given a language, define a representation for its grammar and an interpreter
 *   that uses the representation to interpret sentences in the language.
 * - Each grammar rule becomes a class with an interpret(context) method. Composite
 *   expressions (AND/OR/NOT) delegate to their sub-expressions.
 * - We implement a tiny boolean rule evaluator over a context of key/value facts:
 *     Expression := TRUE | FALSE | Variable | NOT Expr | (Expr AND Expr) | (Expr OR Expr)
 *   and a parser that builds the AST from a simple lisp-style string, then evaluates.
 * - Practical use: rule engines, query filters, template evaluation.
 */

// ---- AST node interface ----
class Expression {
  interpret(context) {
    throw new Error("abstract");
  }
}

class TrueExpr extends Expression {
  interpret() {
    return true;
  }
  toString() {
    return "true";
  }
}

class FalseExpr extends Expression {
  interpret() {
    return false;
  }
  toString() {
    return "false";
  }
}

class VariableExpr extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
  interpret(context) {
    return Boolean(context[this.name]);
  }
  toString() {
    return this.name;
  }
}

class NotExpr extends Expression {
  constructor(expr) {
    super();
    this.expr = expr;
  }
  interpret(context) {
    return !this.expr.interpret(context);
  }
  toString() {
    return `(not ${this.expr})`;
  }
}

class AndExpr extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
  interpret(context) {
    return this.left.interpret(context) && this.right.interpret(context);
  }
  toString() {
    return `(and ${this.left} ${this.right})`;
  }
}

class OrExpr extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
  interpret(context) {
    return this.left.interpret(context) || this.right.interpret(context);
  }
  toString() {
    return `(or ${this.left} ${this.right})`;
  }
}

// ---- Parser: tokenize + recursive descent over S-expr lists ----
function tokenize(src) {
  return src.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
}

function parse(tokens) {
  const tok = tokens.shift();
  if (tok === "(") {
    const op = tokens.shift().toLowerCase();
    const args = [];
    while (tokens[0] !== ")") args.push(parse(tokens));
    tokens.shift(); // consume ')'
    switch (op) {
      case "and": {
        let expr = args[0];
        for (let i = 1; i < args.length; i++) expr = new AndExpr(expr, args[i]);
        return expr;
      }
      case "or": {
        let expr = args[0];
        for (let i = 1; i < args.length; i++) expr = new OrExpr(expr, args[i]);
        return expr;
      }
      case "not":
        return new NotExpr(args[0]);
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  }
  // atom
  if (tok === "true") return new TrueExpr();
  if (tok === "false") return new FalseExpr();
  return new VariableExpr(tok);
}

function evaluate(src, context) {
  return parse(tokenize(src)).interpret(context);
}

// ---------------- Test cases ----------------
const ctx = { vip: true, loggedIn: true, banned: false, age: 30 };

console.log(evaluate("vip", ctx));
// Expected: true
console.log(evaluate("(not banned)", ctx));
// Expected: true
console.log(evaluate("(and vip loggedIn)", ctx));
// Expected: true
console.log(evaluate("(or banned (not loggedIn))", ctx));
// Expected: false
console.log(evaluate("(and (or vip loggedIn) (not banned))", ctx));
// Expected: true

// Reusing the AST: parse once, interpret many times against different contexts
const rule = parse(tokenize("(and loggedIn (not banned))"));
console.log([
  rule.interpret({ loggedIn: true, banned: false }),
  rule.interpret({ loggedIn: true, banned: true }),
]);
// Expected: [ true, false ]
console.log(rule.toString());
// Expected: (and loggedIn (not banned))
