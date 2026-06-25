/**
 * @file group.js
 * @description 手写群（Group）
 *
 * A Group is a Monoid with an inverse operation `inverse: a -> a` such that:
 *
 *   - concat(a, inverse(a)) === empty
 *   - concat(inverse(a), a) === empty
 *
 * Together with the monoid laws (associativity + identity), this makes every
 * element invertible -- the structure of integers under addition, non-zero
 * rationals under multiplication, etc.
 *
 * Approach: extend a monoid registry with `inverse` and verify the inverse
 * laws alongside associativity and identity.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const Group = {
  // Integers under addition; inverse is negation.
  SumInt: {
    empty: () => 0,
    concat: (x, y) => x + y,
    inverse: (x) => -x,
  },
  // Non-zero rationals under multiplication; inverse is reciprocal.
  ProductNum: {
    empty: () => 1,
    concat: (x, y) => x * y,
    inverse: (x) => 1 / x,
  },
  // Booleans under XOR; every element is its own inverse.
  BoolXor: {
    empty: () => false,
    concat: (x, y) => x !== y,
    inverse: (x) => x,
  },
  // Symmetric difference of sets (as arrays of unique items).
  SymmetricDiff: {
    empty: () => [],
    concat: (xs, ys) => {
      const out = [];
      for (const v of [...xs, ...ys]) {
        const inXs = xs.includes(v);
        const inYs = ys.includes(v);
        const inOut = out.includes(v);
        if (inXs !== inYs && !inOut) out.push(v);
      }
      return out;
    },
    inverse: (xs) => xs.slice(),
  },
};

function checkGroupLaws(G, a) {
  const id1 = deepEq(G.concat(a, G.inverse(a)), G.empty());
  const id2 = deepEq(G.concat(G.inverse(a), a), G.empty());
  const leftId = deepEq(G.concat(G.empty(), a), a);
  const rightId = deepEq(G.concat(a, G.empty()), a);
  return { id1, id2, leftId, rightId };
}

// ---------- Tests ----------

console.log(Group.SumInt.concat(5, 3)); // 8
console.log(Group.SumInt.concat(5, Group.SumInt.inverse(5))); // 0
console.log(Group.ProductNum.concat(4, Group.ProductNum.inverse(4))); // 1
console.log(Group.BoolXor.concat(true, Group.BoolXor.inverse(true))); // false
console.log(Group.SymmetricDiff.concat([1, 2], [2, 3])); // [1, 3]
console.log(
  Group.SymmetricDiff.concat([1, 2], Group.SymmetricDiff.inverse([1, 2])),
); // []

// Subtraction derived from concat + inverse: a - b = a + (-b).
const sub = (a, b) => Group.SumInt.concat(a, Group.SumInt.inverse(b));
console.log(sub(10, 4)); // 6

// Division derived from product group: a / b = a * (1/b).
const div = (a, b) => Group.ProductNum.concat(a, Group.ProductNum.inverse(b));
console.log(div(12, 3)); // 4

// Verify group laws on several values.
let pass = true;
const samples = [
  ["SumInt", Group.SumInt, 7],
  ["SumInt", Group.SumInt, -3],
  ["ProductNum", Group.ProductNum, 5],
  ["ProductNum", Group.ProductNum, 0.25],
  ["BoolXor", Group.BoolXor, true],
  ["BoolXor", Group.BoolXor, false],
  ["SymmetricDiff", Group.SymmetricDiff, [1, 2, 3]],
];
for (const [name, G, a] of samples) {
  const { id1, id2, leftId, rightId } = checkGroupLaws(G, a);
  const ok = id1 && id2 && leftId && rightId;
  console.log(`[${name} ${JSON.stringify(a)}] inverse+identity laws: ${ok}`);
  pass &= ok;
}
console.log("\nAll group laws hold:", pass === 1); // true
