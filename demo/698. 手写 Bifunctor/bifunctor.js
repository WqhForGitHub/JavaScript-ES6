/**
 * @file bifunctor.js
 * @description 手写 Bifunctor
 *
 * A Bifunctor is a type constructor of kind `* -> * -> *` (two type
 * parameters) that admits a `bimap` operation, mapping over BOTH channels
 * simultaneously while preserving structure. Examples: tuples/pairs, Either,
 * Result, these/kinds.
 *
 * Interface:
 *   - bimap(f, g, fa)   : (a -> c) -> (b -> d) -> f a b -> f c d
 *   - first(f, fa)      : map only the left/first channel
 *   - second(g, fa)     : map only the right/second channel
 *
 * Laws (bifunctor laws):
 *   1. Identity:   bimap(id, id, u) === u
 *   2. Composition:
 *        bimap(f . g, h . k, u) === bimap(f, h, bimap(g, k, u))
 *
 * Approach: implement bimap for Pair and Either, derive first/second from it,
 * and verify the laws.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const Bifunctor = (bimap) => ({
  bimap,
  first(f, u) {
    return bimap(f, (x) => x, u);
  },
  second(g, u) {
    return bimap((x) => x, g, u);
  },
});

// Pair: { first, second }
const PairBF = Bifunctor((f, g, p) => ({
  first: f(p.first),
  second: g(p.second),
}));

// Either: Left maps first channel, Right maps second channel.
const EitherBF = Bifunctor((f, g, e) =>
  e.tag === "left"
    ? { tag: "left", value: f(e.value) }
    : { tag: "right", value: g(e.value) },
);

// ---------- Law checker ----------
function checkIdentity(BF, u, extract = (x) => x) {
  const id = (x) => x;
  return deepEq(extract(BF.bimap(id, id, u)), extract(u));
}

function checkComposition(BF, u, f, g, h, k, extract = (x) => x) {
  const composed = BF.bimap(
    (x) => f(g(x)),
    (x) => h(k(x)),
    u,
  );
  const stepwise = BF.bimap(f, h, BF.bimap(g, k, u));
  return deepEq(extract(composed), extract(stepwise));
}

// ---------- Tests ----------

const pair = { first: 10, second: "hi" };
console.log(
  PairBF.bimap(
    (x) => x + 1,
    (s) => s.toUpperCase(),
    pair,
  ),
);
// { first: 11, second: 'HI' }
console.log(PairBF.first((x) => x * 2, pair)); // { first: 20, second: 'hi' }
console.log(PairBF.second((s) => s + "!", pair)); // { first: 10, second: 'hi!' }

const right = { tag: "right", value: 5 };
const left = { tag: "left", value: "err" };
console.log(
  EitherBF.bimap(
    (s) => s.toUpperCase(),
    (x) => x + 1,
    right,
  ),
);
// { tag: 'right', value: 6 }
console.log(
  EitherBF.bimap(
    (s) => s.toUpperCase(),
    (x) => x + 1,
    left,
  ),
);
// { tag: 'left', value: 'ERR' }
console.log(EitherBF.first((s) => `[${s}]`, left)); // { tag: 'left', value: '[err]' }
console.log(EitherBF.second((x) => x * 10, right)); // { tag: 'right', value: 50 }

// Laws.
console.log("Pair identity:", checkIdentity(PairBF, pair)); // true
console.log(
  "Pair composition:",
  checkComposition(
    PairBF,
    pair,
    (x) => x + 1,
    (x) => x * 2,
    (s) => s + "!",
    (s) => s.toUpperCase(),
  ),
); // true

console.log("Either identity (right):", checkIdentity(EitherBF, right)); // true
console.log("Either identity (left):", checkIdentity(EitherBF, left)); // true
console.log(
  "Either composition (right):",
  checkComposition(
    EitherBF,
    right,
    (s) => s + "!",
    (s) => s,
    (x) => x + 1,
    (x) => x * 2,
  ),
); // true
console.log(
  "Either composition (left):",
  checkComposition(
    EitherBF,
    left,
    (s) => s + "!",
    (s) => s,
    (x) => x + 1,
    (x) => x * 2,
  ),
); // true
