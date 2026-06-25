/**
 * @file taglessFinal.js
 * @description 手写 Tagless Final 模式
 *
 * Tagless Final is an encoding technique for embedded domain-specific
 * languages (DSLs). Instead of representing expressions as a tagged data
 * structure (the "initial" encoding / AST) and interpreting them later, you
 * express the language directly as a set of operations on an abstract type
 * `Repr`, parametric in the interpreter. Different interpreters (eval, show,
 * count, compile, ...) are just different concrete choices of `Repr`.
 *
 * Benefits:
 *   - no pattern matching / no tags,
 *   - extensible in BOTH the set of interpreters AND the set of operations
 *     (the "expression problem"),
 *   - type-safe by construction.
 *
 * Approach: define an arithmetic DSL with literals, addition, and
 * multiplication. Provide several interpreters (Number evaluator, String
 * pretty-printer, operation counter) by supplying concrete `Repr` factories.
 * Each "expression" is a polymorphic function `repr => expr(repr)`.
 */

// ---------- The DSL "interface" (a function from a repr module to a value) ----------
// Each operation is a function returning the repr-specific result.
// We model an expression as:  Expr = R => any  where R is an interpreter module
// exposing `lit`, `add`, `mul`.

const lit = (n) => (R) => R.lit(n);
const add = (a, b) => (R) => R.add(a(R), b(R));
const mul = (a, b) => (R) => R.mul(a(R), b(R));

// A slightly richer DSL: subtraction and negation, demonstrating extensibility.
const sub = (a, b) => (R) => R.sub(a(R), b(R));
const neg = (a) => (R) => R.neg(a(R));

// ---------- Interpreters (concrete `Repr` choices) ----------

// 1. Numeric evaluator: Repr = number.
const EvalRepr = {
  lit: (n) => n,
  add: (x, y) => x + y,
  mul: (x, y) => x * y,
  sub: (x, y) => x - y,
  neg: (x) => -x,
};

// 2. Pretty-printer: Repr = string.
const ShowRepr = {
  lit: (n) => String(n),
  add: (x, y) => `(${x} + ${y})`,
  mul: (x, y) => `(${x} * ${y})`,
  sub: (x, y) => `(${x} - ${y})`,
  neg: (x) => `(-${x})`,
};

// 3. Operation counter: Repr = { value, ops }.
const CountRepr = {
  lit: (n) => ({ value: n, ops: 0 }),
  add: (a, b) => ({ value: a.value + b.value, ops: a.ops + b.ops + 1 }),
  mul: (a, b) => ({ value: a.value * b.value, ops: a.ops + b.ops + 1 }),
  sub: (a, b) => ({ value: a.value - b.value, ops: a.ops + b.ops + 1 }),
  neg: (a) => ({ value: -a.value, ops: a.ops + 1 }),
};

// 4. "Compile to JS source" interpreter: Repr = string of JS.
const CompileRepr = {
  lit: (n) => `${n}`,
  add: (x, y) => `(${x} + ${y})`,
  mul: (x, y) => `(${x} * ${y})`,
  sub: (x, y) => `(${x} - ${y})`,
  neg: (x) => `(-${x})`,
};

// ---------- A sample expression: (1 + 2) * (3 + 4) ----------
const expr = mul(add(lit(1), lit(2)), add(lit(3), lit(4)));

console.log(expr(EvalRepr)); // 21
console.log(expr(ShowRepr)); // ((1 + 2) * (3 + 4))
console.log(expr(CountRepr)); // { value: 21, ops: 3 }
console.log(expr(CompileRepr)); // ((1 + 2) * (3 + 4))

// An expression using the extended ops: -(5 - 2) * 10
const expr2 = mul(neg(sub(lit(5), lit(2))), lit(10));
console.log(expr2(EvalRepr)); // -30
console.log(expr2(ShowRepr)); // ((-(5 - 2)) * 10)
console.log(expr2(CountRepr)); // { value: -30, ops: 2 }

// Compile then eval to prove the compiled source is executable JS.
const src = expr2(CompileRepr);
console.log(src, "=>", new Function(`return ${src}`)()); // (-(5 - 2) * 10) => -30

// Polymorphism in action: the SAME expression, four interpretations, no tags.
const expr3 = add(lit(7), mul(lit(2), lit(3)));
console.log(expr3(EvalRepr), "|", expr3(ShowRepr), "|", expr3(CountRepr).ops);
// 13 | (7 + (2 * 3)) | 2

// Adding a NEW interpreter requires NO changes to existing expressions.
const NegateCountRepr = {
  ...CountRepr,
  // Override to count negation differently (e.g., weight 2).
  neg: (a) => ({ value: -a.value, ops: a.ops + 2 }),
};
console.log(expr2(NegateCountRepr)); // { value: -30, ops: 3 }  (neg now counts 2)
