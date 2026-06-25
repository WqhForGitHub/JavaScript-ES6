/**
 * @file lattice.js
 * @description 手写格（Lattice）
 *
 * A lattice is a poset in which every pair of elements has both a least upper
 * bound (join, `\/`) and a greatest lower bound (meet, `/\`). Equivalently, a
 * lattice is an algebraic structure with two binary operations satisfying:
 *
 *   meet (`/\`) and join (`\/`) are each:
 *     - commutative:  a /\ b === b /\ a ; a \/ b === b \/ a
 *     - associative:  (a /\ b) /\ c === a /\ (b /\ c) ; same for \/
 *     - idempotent:   a /\ a === a     ; a \/ a === a
 *   absorption:
 *     a /\ (a \/ b) === a ; a \/ (a /\ b) === a
 *
 * A bounded lattice additionally has a top (maximum) and bottom (minimum).
 *
 * Examples implemented:
 *   - Integers under min/max (meet = min, join = max, bottom = -Inf, top = +Inf)
 *   - Subsets under intersection/union
 *   - Booleans under AND/OR
 *   - Divisibility lattice on divisors of 12 (meet = gcd, join = lcm)
 *
 * Approach: a `Lattice` factory + an axiom checker.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const Lattice = ({ meet, join, top, bottom, eq = deepEq }) => ({
  meet,
  join,
  top,
  bottom,
  eq,
});

function checkLattice(L, samples) {
  const results = {};
  for (const a of samples) {
    // idempotence
    results.idempMeet ||= L.eq(L.meet(a, a), a);
    results.idempJoin ||= L.eq(L.join(a, a), a);
    for (const b of samples) {
      // commutativity
      if (!L.eq(L.meet(a, b), L.meet(b, a))) results.meetComm = false;
      if (!L.eq(L.join(a, b), L.join(b, a))) results.joinComm = false;
      // absorption
      if (!L.eq(L.meet(a, L.join(a, b)), a)) results.absorb1 = false;
      if (!L.eq(L.join(a, L.meet(a, b)), a)) results.absorb2 = false;
      for (const c of samples) {
        // associativity
        if (!L.eq(L.meet(L.meet(a, b), c), L.meet(a, L.meet(b, c))))
          results.meetAssoc = false;
        if (!L.eq(L.join(L.join(a, b), c), L.join(a, L.join(b, c))))
          results.joinAssoc = false;
      }
    }
  }
  // Normalise: anything not set false is true.
  return {
    meetComm: results.meetComm !== false,
    joinComm: results.joinComm !== false,
    meetAssoc: results.meetAssoc !== false,
    joinAssoc: results.joinAssoc !== false,
    idempMeet: results.idempMeet === true,
    idempJoin: results.idempJoin === true,
    absorb1: results.absorb1 !== false,
    absorb2: results.absorb2 !== false,
  };
}

// ---------- Lattices ----------

const IntLattice = Lattice({
  meet: (a, b) => Math.min(a, b),
  join: (a, b) => Math.max(a, b),
  top: Infinity,
  bottom: -Infinity,
  eq: (a, b) => a === b,
});

const BoolLattice = Lattice({
  meet: (a, b) => a && b,
  join: (a, b) => a || b,
  top: true,
  bottom: false,
  eq: (a, b) => a === b,
});

const SubsetLattice = Lattice({
  meet: (a, b) => a.filter((x) => b.includes(x)),
  join: (a, b) => Array.from(new Set([...a, ...b])),
  top: ["a", "b", "c"],
  bottom: [],
});

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);
const DivLattice = Lattice({
  meet: gcd,
  join: lcm,
  top: 12,
  bottom: 1,
  eq: (a, b) => a === b,
});

// ---------- Tests ----------

console.log(IntLattice.meet(3, 8)); // 3
console.log(IntLattice.join(3, 8)); // 8
console.log(BoolLattice.meet(true, false)); // false
console.log(BoolLattice.join(true, false)); // true
console.log(SubsetLattice.meet(["a", "b"], ["b", "c"])); // ['b']
console.log(SubsetLattice.join(["a"], ["b", "c"])); // ['a','b','c']
console.log(DivLattice.meet(4, 6)); // 2 (gcd)
console.log(DivLattice.join(4, 6)); // 12 (lcm)

// top/bottom laws: meet(a, top) === a ; join(a, bottom) === a
console.log(IntLattice.meet(5, IntLattice.top)); // 5
console.log(IntLattice.join(5, IntLattice.bottom)); // 5

// Run axiom checks.
const configs = [
  ["Int", IntLattice, [1, 5, 9, 2]],
  ["Bool", BoolLattice, [true, false]],
  ["Subset", SubsetLattice, [[], ["a"], ["b"], ["a", "b"], ["a", "b", "c"]]],
  ["Div", DivLattice, [1, 2, 3, 4, 6, 12]],
];
let pass = true;
for (const [name, L, samples] of configs) {
  const res = checkLattice(L, samples);
  const ok = Object.values(res).every(Boolean);
  console.log(`[${name}] lattice axioms: ${ok}`);
  if (!ok) console.log("  details:", res);
  pass &= ok;
}
console.log("\nAll lattice axioms hold:", pass === 1); // true
