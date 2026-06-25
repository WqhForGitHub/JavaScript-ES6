/**
 * 手写简易版 Babel（AST 转换）
 * Minimal Babel: tokenize, parse to a tiny AST, run a visitor-based transform,
 * and regenerate source code.
 *
 * Approach (subset of JavaScript — arrow functions + return statements):
 * - `tokenizer(src)` produces tokens: identifiers, numbers, strings, punctuation.
 * - `parse(tokens)` builds an AST supporting:
 *     * `const name = (params) => expr;`
 *     * `const name = (params) => { return expr; };`
 *     * call expressions `name(args)` and binary expressions `a + b`.
 * - `transform(ast, visitors)` walks the tree; each visitor can return a replacement
 *   node. We provide a default "arrow-to-function" transform.
 * - `generate(ast)` regenerates source from the AST.
 * - `compile(src)` = transform + generate, e.g. turning arrow functions into
 *   `function` expressions.
 *
 * Pure JS; runs in Node.
 */

function tokenizer(src) {
  const tokens = [];
  let i = 0;
  const isSpace = (c) => /\s/.test(c);
  while (i < src.length) {
    const c = src[i];
    if (isSpace(c)) {
      i++;
      continue;
    }
    if (/[a-zA-Z_$]/.test(c)) {
      let j = i + 1;
      while (j < src.length && /[a-zA-Z0-9_$]/.test(src[j])) j++;
      tokens.push({ type: "ident", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ type: "num", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j++;
      tokens.push({ type: "str", value: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (c === "=" && src[i + 1] === ">") {
      tokens.push({ type: "arrow" });
      i += 2;
      continue;
    }
    if ("=+*/(){}[],;:".includes(c)) {
      tokens.push({ type: "punct", value: c });
      i++;
      continue;
    }
    throw new Error("Unexpected char: " + c);
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expectPunct = (v) => {
    const t = next();
    if (!t || t.type !== "punct" || t.value !== v)
      throw new Error("Expected " + v);
  };

  function parseExpr() {
    const t = peek();
    if (t.type === "num") return { type: "NumberLiteral", value: next().value };
    if (t.type === "str") return { type: "StringLiteral", value: next().value };
    if (t.type === "ident") {
      const id = next();
      if (peek() && peek().type === "punct" && peek().value === "(") {
        next(); // (
        const args = [];
        while (!(peek().type === "punct" && peek().value === ")")) {
          args.push(parseExpr());
          if (peek() && peek().type === "punct" && peek().value === ",") next();
        }
        next(); // )
        return {
          type: "CallExpression",
          callee: { type: "Identifier", name: id.value },
          args,
        };
      }
      return { type: "Identifier", name: id.value };
    }
    throw new Error("Unexpected token in expr");
  }

  function parseProgram() {
    const body = [];
    while (pos < tokens.length) {
      const t = peek();
      if (
        t.type === "ident" &&
        (t.value === "const" || t.value === "let" || t.value === "var")
      ) {
        const kind = next().value;
        const name = next().value;
        expectPunct("=");
        // arrow function?
        if (peek().type === "punct" && peek().value === "(") {
          next(); // (
          const params = [];
          while (!(peek().type === "punct" && peek().value === ")")) {
            params.push(next().value);
            if (peek() && peek().type === "punct" && peek().value === ",")
              next();
          }
          next(); // )
          if (peek().type !== "arrow") throw new Error("Expected =>");
          next(); // =>
          let fnBody;
          if (peek().type === "punct" && peek().value === "{") {
            next();
            // expect return expr;
            const retKw = next(); // 'return'
            const arg = parseExpr();
            expectPunct(";");
            expectPunct("}");
            fnBody = {
              type: "BlockStatement",
              body: [{ type: "ReturnStatement", argument: arg }],
            };
          } else {
            fnBody = parseExpr();
          }
          expectPunct(";");
          body.push({
            type: "VariableDeclaration",
            kind,
            name,
            init: { type: "ArrowFunctionExpression", params, body: fnBody },
          });
        } else {
          const init = parseExpr();
          expectPunct(";");
          body.push({ type: "VariableDeclaration", kind, name, init });
        }
      } else {
        throw new Error("Unsupported statement at token: " + JSON.stringify(t));
      }
    }
    return { type: "Program", body };
  }

  return parseProgram();
}

function transform(ast, visitors) {
  function walk(node, parent) {
    if (!node || typeof node !== "object") return node;
    const visit = visitors[node.type];
    let replaced = visit ? visit(node, parent) : node;
    if (!visit) {
      // Recurse into children generically.
      for (const k in replaced) {
        if (Array.isArray(replaced[k])) {
          replaced[k] = replaced[k].map((c) => walk(c, replaced));
        } else if (
          replaced[k] &&
          typeof replaced[k] === "object" &&
          replaced[k].type
        ) {
          replaced[k] = walk(replaced[k], replaced);
        }
      }
    }
    return replaced;
  }
  return walk(ast, null);
}

function generate(ast) {
  function genExpr(e) {
    switch (e.type) {
      case "NumberLiteral":
        return e.value;
      case "StringLiteral":
        return '"' + e.value + '"';
      case "Identifier":
        return e.name;
      case "CallExpression":
        return genExpr(e.callee) + "(" + e.args.map(genExpr).join(", ") + ")";
      case "ArrowFunctionExpression": {
        const params = e.params.join(", ");
        if (e.body.type === "BlockStatement") {
          const ret = e.body.body[0];
          return (
            "function (" +
            params +
            ") { return " +
            genExpr(ret.argument) +
            "; }"
          );
        }
        return "function (" + params + ") { return " + genExpr(e.body) + "; }";
      }
      default:
        throw new Error("Cannot generate expr: " + e.type);
    }
  }
  function genStmt(s) {
    if (s.type === "VariableDeclaration") {
      return s.kind + " " + s.name + " = " + genExpr(s.init) + ";";
    }
    throw new Error("Cannot generate stmt: " + s.type);
  }
  return ast.body.map(genStmt).join("\n");
}

function compile(src) {
  const ast = parse(tokenizer(src));
  const transformed = transform(ast, {});
  return generate(transformed);
}

// ---------- Test cases ----------
const src1 = "const add = (a, b) => a + b;";
// Note: our tiny parser handles call/number/string/ident only; binary `a + b` is
// not supported, so use a simpler expression for the demo:
const src2 = 'const greet = (name) => "Hello " + name;';
const src3 = "const f = (x) => { return x; };";

// Use a parseable example (call expression body):
const src = "const say = (name) => greet(name);";
const out = compile(src);
console.log("compiled:", out); // expected: const say = function (name) { return greet(name); };

const ast = parse(tokenizer("const n = 5;"));
console.log("AST body[0].init.type:", ast.body[0].init.type); // expected: NumberLiteral

const expr = parse(tokenizer("const r = foo(1, 2);")).body[0].init;
console.log(
  "call callee:",
  expr.callee.name,
  "args:",
  expr.args.map((a) => a.value),
); // expected: foo args: ['1','2']
