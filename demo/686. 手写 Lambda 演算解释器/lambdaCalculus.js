/**
 * @file lambdaCalculus.js
 * @description 手写 Lambda 演算解释器
 *
 * A tiny interpreter for the untyped lambda calculus. It supports:
 *   - Variables:          x
 *   - Abstraction:        \x. body   (written as (lambda x body) in our AST)
 *   - Application:        f a        (written as (app f a))
 *
 * Evaluation uses normal-order reduction (leftmost-outermost) with:
 *   - alpha-renaming to avoid name capture,
 *   - capture-avoiding substitution,
 *   - a step budget to detect divergence (e.g., Omega).
 *
 * The interpreter also parses a small Lisp-like surface syntax so you can
 * write terms as strings, e.g. "((lambda x x) (lambda y y))".
 */

// ---------- AST ----------
const Var = (name) => ({ type: "var", name });
const Lam = (param, body) => ({ type: "lam", param, body });
const App = (fn, arg) => ({ type: "app", fn, arg });

// ---------- Parsing (s-expression style) ----------
// Surface syntax:
//   (lambda x BODY)   abstraction
//   (F A)             application (left-associative when chained: (F A B) = ((F A) B))
//   x                 a single-token variable
function tokenize(src) {
  return src
    .replace(/;[^\n]*/g, "")
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// A small cursor over the token list so nested lists can be parsed.
function parseFrom(tokens) {
  if (tokens.length === 0) throw new Error("Unexpected end of input");
  const tok = tokens.shift();
  if (tok === ")") throw new Error("Unexpected ')'");
  if (tok !== "(") return Var(tok);

  // We are inside a list. Determine the head.
  if (tokens[0] === "lambda") {
    tokens.shift(); // consume 'lambda'
    const param = tokens.shift();
    const body = parseFrom(tokens);
    if (tokens.shift() !== ")")
      throw new Error("Expected ')' after lambda body");
    return Lam(param, body);
  }

  // Application: head followed by zero or more args, left-associative.
  let node = parseFrom(tokens);
  while (tokens[0] && tokens[0] !== ")") {
    node = App(node, parseFrom(tokens));
  }
  if (tokens.shift() !== ")") throw new Error("Expected ')'");
  return node;
}

function parse(src) {
  return parseFrom(tokenize(src));
}

// ---------- Free variables & fresh names ----------
function freeVars(term, bound = new Set()) {
  switch (term.type) {
    case "var":
      return bound.has(term.name) ? new Set() : new Set([term.name]);
    case "lam": {
      const b = new Set(bound);
      b.add(term.param);
      return freeVars(term.body, b);
    }
    case "app": {
      const s = new Set(freeVars(term.fn, bound));
      for (const v of freeVars(term.arg, bound)) s.add(v);
      return s;
    }
  }
}

let freshCounter = 0;
function freshName(base) {
  freshCounter += 1;
  return `${base}_${freshCounter}`;
}

// Capture-avoiding substitution: term[name := value].
function substitute(term, name, value) {
  switch (term.type) {
    case "var":
      return term.name === name ? value : term;
    case "app":
      return App(
        substitute(term.fn, name, value),
        substitute(term.arg, name, value),
      );
    case "lam": {
      if (term.param === name) return term; // shadowed
      if (freeVars(value).has(term.param)) {
        // capture risk: alpha-rename the binder
        const newName = freshName(term.param);
        const renamed = substitute(term.body, term.param, Var(newName));
        return Lam(newName, substitute(renamed, name, value));
      }
      return Lam(term.param, substitute(term.body, name, value));
    }
  }
}

// ---------- Evaluation: normal-order reduction ----------
function step(term) {
  switch (term.type) {
    case "var":
    case "lam":
      return null;
    case "app": {
      // Try reducing the function to a lambda (outermost).
      if (term.fn.type === "lam") {
        // beta reduction
        return substitute(term.fn.body, term.fn.param, term.arg);
      }
      const fnStep = step(term.fn);
      if (fnStep) return App(fnStep, term.arg);
      const argStep = step(term.arg);
      if (argStep) return App(term.fn, argStep);
      return null;
    }
  }
}

function evalTerm(term, maxSteps = 100000) {
  let current = term;
  for (let i = 0; i < maxSteps; i++) {
    const next = step(current);
    if (next === null) return current;
    current = next;
  }
  throw new Error("Divergence or step budget exceeded");
}

// ---------- Pretty printing ----------
function toStr(term) {
  switch (term.type) {
    case "var":
      return term.name;
    case "lam":
      return `(lambda ${term.param} ${toStr(term.body)})`;
    case "app":
      return `(${toStr(term.fn)} ${toStr(term.arg)})`;
  }
}

// ---------- Test cases ----------

// Identity applied to itself: (\x. x) (\y. y) -> \y. y
const id = parse("(lambda x x)");
console.log(toStr(evalTerm(App(id, id)))); // (lambda y y)

// Church booleans in the lambda calculus.
const T = parse("(lambda a (lambda b a))");
const F = parse("(lambda a (lambda b b))");
const ifThenElse = parse("(lambda c (lambda t (lambda e ((c t) e))))");

const pickTrue = evalTerm(App(App(App(ifThenElse, T), Var("yes")), Var("no")));
console.log(toStr(pickTrue)); // yes
const pickFalse = evalTerm(App(App(App(ifThenElse, F), Var("yes")), Var("no")));
console.log(toStr(pickFalse)); // no

// K combinator: K x y = x
const K = parse("(lambda x (lambda y x))");
console.log(toStr(evalTerm(App(App(K, Var("1")), Var("2"))))); // 1

// Alpha-renaming: (\x. \y. x) y should NOT capture the free y.
const tricky = parse("(lambda x (lambda y x))");
const applied = evalTerm(App(tricky, Var("y")));
console.log(toStr(applied)); // (lambda y_1 y) -- renamed binder, body is the free y

// Divergence (Omega) must hit the step budget and throw.
const omega = parse("((lambda x (x x)) (lambda x (x x)))");
try {
  evalTerm(omega, 1000);
  console.log("Omega unexpectedly terminated");
} catch (e) {
  console.log("Omega diverged as expected:", /budget/.test(e.message)); // true
}
