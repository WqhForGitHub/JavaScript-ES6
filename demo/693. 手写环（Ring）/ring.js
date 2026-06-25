/**
 * @file ring.js
 * @description 手写环（Ring）
 *
 * A Ring is an algebraic structure with two binary operations, conventionally
 * called `+` (addition) and `*` (multiplication), and a set of laws:
 *
 *   (R, +)  is an abelian (commutative) group:
 *     - associativity, identity `zero`, inverse `neg`, commutativity
 *   (R, *)  is a monoid:
 *     - associativity, identity `one`
 *   Multiplication distributes over addition:
 *     - a * (b + c) = (a * b) + (a * c)
 *     - (b + c) * a = (b * a) + (c * a)
 *
 * Classic examples: integers under + and *, matrices, polynomials, modular
 * arithmetic. Here we implement an Integer ring and a small n x n matrix ring
 * (over integers) and verify the ring axioms.
 *
 * Approach: represent a ring as an object exposing `zero`, `one`, `add`,
 * `mul`, `neg`; provide a generic axiom checker.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Integer ring (using JS numbers that stay exact for the test ranges).
const IntRing = {
  zero: () => 0,
  one: () => 1,
  add: (x, y) => x + y,
  mul: (x, y) => x * y,
  neg: (x) => -x,
  eq: (x, y) => x === y,
};

// Modular arithmetic ring Z_n.
const ModRing = (n) => ({
  zero: () => 0,
  one: () => 1 % n,
  add: (x, y) => (x + y) % n,
  mul: (x, y) => (x * y) % n,
  neg: (x) => (n - (x % n)) % n,
  eq: (x, y) => x % n === y % n,
});

// 2x2 matrix ring over a base ring (entries are [a,b,c,d] for [[a,b],[c,d]]).
const Matrix2Ring = (R) => ({
  zero: () => [R.zero(), R.zero(), R.zero(), R.zero()],
  one: () => [R.one(), R.zero(), R.zero(), R.one()],
  add: (m, n) => m.map((v, i) => R.add(v, n[i])),
  mul: (m, n) => [
    R.add(R.mul(m[0], n[0]), R.mul(m[1], n[2])),
    R.add(R.mul(m[0], n[1]), R.mul(m[1], n[3])),
    R.add(R.mul(m[2], n[0]), R.mul(m[3], n[2])),
    R.add(R.mul(m[2], n[1]), R.mul(m[3], n[3])),
  ],
  neg: (m) => m.map((v) => R.neg(v)),
  eq: (m, n) => m.every((v, i) => R.eq(v, n[i])),
});

// ---------- Axiom checker ----------
function checkRing(R, samples) {
  const [a, b, c] = samples;
  const results = {};

  // Additive group: associativity, identity, inverse, commutativity.
  results.addAssoc = R.eq(R.add(R.add(a, b), c), R.add(a, R.add(b, c)));
  results.addIdL = R.eq(R.add(R.zero(), a), a);
  results.addIdR = R.eq(R.add(a, R.zero()), a);
  results.addInvL = R.eq(R.add(R.neg(a), a), R.zero());
  results.addInvR = R.eq(R.add(a, R.neg(a)), R.zero());
  results.addComm = R.eq(R.add(a, b), R.add(b, a));

  // Multiplicative monoid.
  results.mulAssoc = R.eq(R.mul(R.mul(a, b), c), R.mul(a, R.mul(b, c)));
  results.mulIdL = R.eq(R.mul(R.one(), a), a);
  results.mulIdR = R.eq(R.mul(a, R.one()), a);

  // Distributivity.
  results.distL = R.eq(R.mul(a, R.add(b, c)), R.add(R.mul(a, b), R.mul(a, c)));
  results.distR = R.eq(R.mul(R.add(b, c), a), R.add(R.mul(b, a), R.mul(c, a)));

  return results;
}

// ---------- Tests ----------

console.log(IntRing.add(2, 3)); // 5
console.log(IntRing.mul(2, 3)); // 6
console.log(IntRing.neg(5)); // -5

const Z5 = ModRing(5);
console.log(Z5.add(3, 4)); // 2  (7 mod 5)
console.log(Z5.mul(3, 4)); // 2  (12 mod 5)
console.log(Z5.add(Z5.neg(3), 3)); // 0

const MR = Matrix2Ring(IntRing);
const m1 = [1, 2, 3, 4];
const m2 = [5, 6, 7, 8];
console.log(MR.add(m1, m2)); // [6, 8, 10, 12]
console.log(MR.mul(m1, [1, 0, 0, 1])); // [1, 2, 3, 4] (identity)

// Run axiom checks.
const rings = [
  ["Int", IntRing, [2, 3, 4]],
  ["Z5", Z5, [2, 3, 4]],
  [
    "Matrix2",
    MR,
    [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [1, 1, 0, 1],
    ],
  ],
];
let pass = true;
for (const [name, R, samples] of rings) {
  const res = checkRing(R, samples);
  const ok = Object.values(res).every(Boolean);
  console.log(`[${name}] all ring axioms: ${ok}`);
  if (!ok) console.log("  details:", res);
  pass &= ok;
}
console.log("\nAll ring axioms hold:", pass === 1); // true
