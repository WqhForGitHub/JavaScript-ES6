/**
 * @file churchBoolean.js
 * @description 手写 Church 布尔值
 *
 * Church booleans encode truth values as selectors between two arguments:
 *   true  := a => b => a   (choose the first)
 *   false := a => b => b   (choose the second)
 *
 * From these two combinators we derive all boolean logic without ever using
 * JavaScript's own `&&`/`||`/`!`:
 *   not b      := b false true        (or \p a b => p b a)
 *   and p q    := p q false           (both must be true)
 *   or  p q    := p true q            (either suffices)
 *   xor p q    := p (not q) q
 *   ifThenElse c t e := c t e
 *
 * Approach: implement the combinators, plus a `toBool` decoder for readable
 * test output, and exercise every operation.
 */

const T = (a) => (b) => a; // true
const F = (a) => (b) => b; // false

const not = (p) => (a) => (b) => p(b)(a);
const and = (p) => (q) => p(q)(F);
const or = (p) => (q) => p(T)(q);
const xor = (p) => (q) => p(not(q))(q);
const implies = (p) => (q) => or(not(p))(q);
const ifThenElse = (c, t, e) => c(t)(e);
const eq = (p) => (q) => and(implies(p)(q))(implies(q)(p));

// Decode to a JS boolean for display.
const toBool = (c) => c(true)(false);

// ---------- Truth table ----------

console.log("--- not ---");
console.log(toBool(not(T))); // false
console.log(toBool(not(F))); // true

console.log("--- and ---");
for (const p of [T, F]) {
  for (const q of [T, F]) {
    console.log(`${toBool(p)} AND ${toBool(q)} = ${toBool(and(p)(q))}`);
  }
}
// true AND true = true
// true AND false = false
// false AND true = false
// false AND false = false

console.log("--- or ---");
console.log(toBool(or(T)(F))); // true
console.log(toBool(or(F)(F))); // false
console.log(toBool(or(F)(T))); // true

console.log("--- xor ---");
console.log(toBool(xor(T)(T))); // false
console.log(toBool(xor(T)(F))); // true
console.log(toBool(xor(F)(F))); // false
console.log(toBool(xor(F)(T))); // true

console.log("--- ifThenElse ---");
console.log(ifThenElse(T, "yes", "no")); // yes
console.log(ifThenElse(F, "yes", "no")); // no

console.log("--- implies / equivalence ---");
console.log(toBool(implies(T)(F))); // false
console.log(toBool(implies(F)(T))); // true
console.log(toBool(eq(T)(T))); // true
console.log(toBool(eq(T)(F))); // false

// NAND is functionally complete: derive everything from NAND.
const nand = (p) => (q) => not(and(p)(q));
console.log(toBool(nand(T)(T))); // false
console.log(toBool(nand(T)(F))); // true
console.log(toBool(and(T)(T)) === toBool(not(nand(T)(T)))); // true
