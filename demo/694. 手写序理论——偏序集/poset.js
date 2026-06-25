/**
 * @file poset.js
 * @description 手写序理论——偏序集（Partially Ordered Set, Poset）
 *
 * A poset is a set equipped with a binary relation `<=` that is:
 *   1. Reflexive:     a <= a
 *   2. Antisymmetric: a <= b and b <= a  imply  a === b
 *   3. Transitive:    a <= b and b <= c  imply  a <= c
 *
 * Unlike a total order, not every pair need be comparable.
 *
 * Approach: implement a `Poset` over an explicit finite carrier set and a
 * relation, provide `compare` returning '<' | '>' | '=' | '||' (incomparable),
 * and verify the three axioms. Examples: divisibility on natural numbers, the
 * subset relation on a powerset, and a small "diamond" DAG.
 */

const Poset = (elements, leq) => ({
  elements,
  leq,
  eq: (a, b) => leq(a, b) && leq(b, a),
  // Comparison: returns one of '<', '>', '=', or '||' (incomparable).
  compare(a, b) {
    const ab = leq(a, b);
    const ba = leq(b, a);
    if (ab && ba) return "=";
    if (ab) return "<";
    if (ba) return ">";
    return "||";
  },
  // All elements <= a (the down-set / order ideal of a).
  downset(a) {
    return this.elements.filter((x) => this.leq(x, a));
  },
  // All elements >= a (the up-set of a).
  upset(a) {
    return this.elements.filter((x) => this.leq(a, x));
  },
});

// ---------- Axiom checker ----------
function checkPoset(P) {
  let reflexive = true;
  let antisymmetric = true;
  let transitive = true;

  for (const a of P.elements) {
    reflexive &&= P.leq(a, a);
  }
  for (const a of P.elements) {
    for (const b of P.elements) {
      if (P.leq(a, b) && P.leq(b, a) && a !== b) antisymmetric = false;
      for (const c of P.elements) {
        if (P.leq(a, b) && P.leq(b, c) && !P.leq(a, c)) transitive = false;
      }
    }
  }
  return { reflexive, antisymmetric, transitive };
}

// ---------- Examples ----------

// 1. Divisibility on {1, 2, 3, 4, 6, 12}.
const divPoset = Poset([1, 2, 3, 4, 6, 12], (a, b) => b % a === 0);
console.log(divPoset.compare(2, 4)); // '<'
console.log(divPoset.compare(4, 2)); // '>'
console.log(divPoset.compare(4, 6)); // '||' (incomparable)
console.log(divPoset.compare(3, 3)); // '='
console.log(divPoset.downset(6)); // [1, 2, 3, 6]
console.log(divPoset.upset(2)); // [2, 4, 6, 12]

// 2. Subset relation on the powerset of {a, b}.
const subsets = [[], ["a"], ["b"], ["a", "b"]];
const key = (s) => s.join("");
const subsetPoset = Poset(subsets, (a, b) => a.every((x) => b.includes(x)));
console.log(subsetPoset.compare(["a"], ["a", "b"])); // '<'
console.log(subsetPoset.compare(["a"], ["b"])); // '||'

// 3. A "diamond" DAG: { bot, x, y, top } with bot <= x, bot <= y, x <= top,
//    y <= top (and reflexive). x and y are incomparable.
const diamond = ["bot", "x", "y", "top"];
const diamondEdges = { bot: ["x", "y"], x: ["top"], y: ["top"], top: [] };
const reach = (a, b) => {
  if (a === b) return true;
  const stack = [a];
  const seen = new Set();
  while (stack.length) {
    const n = stack.pop();
    if (n === b) return true;
    if (seen.has(n)) continue;
    seen.add(n);
    stack.push(...(diamondEdges[n] || []));
  }
  return false;
};
const diamondPoset = Poset(diamond, reach);
console.log(diamondPoset.compare("x", "y")); // '||'
console.log(diamondPoset.compare("bot", "top")); // '<'

// Verify axioms.
for (const [name, P] of [
  ["divisibility", divPoset],
  ["subset", subsetPoset],
  ["diamond", diamondPoset],
]) {
  const res = checkPoset(P);
  console.log(`[${name}] poset axioms:`, res);
}
console.log(
  "divisibility reflexive & antisymmetric & transitive:",
  Object.values(checkPoset(divPoset)).every(Boolean),
); // true
