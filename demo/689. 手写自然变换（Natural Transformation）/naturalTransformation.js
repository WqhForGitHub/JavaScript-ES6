/**
 * @file naturalTransformation.js
 * @description 手写自然变换（Natural Transformation）
 *
 * A natural transformation `alpha : F -> G` between two functors F and G is a
 * family of functions that maps F(a) to G(a) for every type `a`, such that
 * the following "naturality square" commutes for every pure function f:
 *
 *        F(a) --alpha_a--> G(a)
 *         |                 |
 *       F(f)              G(f)
 *         v                 v
 *        F(b) --alpha_b--> G(b)
 *
 * i.e.   G(f) . alpha  ==  alpha . F(f)
 *
 * This file implements several natural transformations between common
 * functors (Maybe -> Either, Maybe -> List, List -> Maybe, Identity -> Maybe,
 * Pair -> List) and a checker that verifies the naturality condition.
 *
 * Approach: each transformation is `F a -> G a`; the checker composes both
 * sides of the square and compares results by deep equality.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- Functor maps (only what we need) ----
const F = {
  Maybe: {
    map: (u, f) => (u.tag === "just" ? { tag: "just", value: f(u.value) } : u),
  },
  List: {
    map: (u, f) => u.map(f),
  },
  Identity: {
    map: (u, f) => ({ value: f(u.value) }),
  },
  Either: {
    map: (u, f) =>
      u.tag === "right" ? { tag: "right", value: f(u.value) } : u,
  },
  Pair: {
    map: (u, f) => ({ first: f(u.first), second: f(u.second) }),
  },
};

// ---- Natural transformations ----
// Maybe -> Either  (Nothing maps to Left, Just a to Right a)
const maybeToEither = (m) =>
  m.tag === "just"
    ? { tag: "right", value: m.value }
    : { tag: "left", value: null };

// Maybe -> List  (Just a -> [a], Nothing -> [])
const maybeToList = (m) => (m.tag === "just" ? [m.value] : []);

// List -> Maybe  (first element or Nothing)
const listToMaybe = (xs) =>
  xs.length === 0 ? { tag: "nothing" } : { tag: "just", value: xs[0] };

// Identity -> Maybe  (always Just, since identity always holds a value)
const identityToMaybe = (i) => ({ tag: "just", value: i.value });

// Pair -> List  (both elements)
const pairToList = (p) => [p.first, p.second];

// ---- Naturality checker ----
// Given F.map, G.map, alpha, value a, and a function f, verify the square.
function isNatural(Fmap, Gmap, alpha, fa, f) {
  // Path 1: alpha first, then G(f)
  const path1 = Gmap(alpha(fa), f);
  // Path 2: F(f) first, then alpha
  const path2 = alpha(Fmap(fa, f));
  return deepEq(path1, path2);
}

function assert(label, Fmap, Gmap, alpha, fa, f) {
  const ok = isNatural(Fmap, Gmap, alpha, fa, f);
  console.log(`[${label}] natural: ${ok}`);
  return ok;
}

// ---- Tests ----
const inc = (x) => x + 1;
const up = (s) => s.toUpperCase();

let all = true;
all &= assert(
  "Maybe->Either",
  F.Maybe.map,
  F.Either.map,
  maybeToEither,
  { tag: "just", value: 5 },
  inc,
);
all &= assert(
  "Maybe->Either (Nothing)",
  F.Maybe.map,
  F.Either.map,
  maybeToEither,
  { tag: "nothing" },
  inc,
);

all &= assert(
  "Maybe->List",
  F.Maybe.map,
  F.List.map,
  maybeToList,
  { tag: "just", value: "hi" },
  up,
);
all &= assert(
  "Maybe->List (Nothing)",
  F.Maybe.map,
  F.List.map,
  maybeToList,
  { tag: "nothing" },
  up,
);

all &= assert(
  "List->Maybe",
  F.List.map,
  F.Maybe.map,
  listToMaybe,
  [1, 2, 3],
  inc,
);
all &= assert(
  "List->Maybe (empty)",
  F.List.map,
  F.Maybe.map,
  listToMaybe,
  [],
  inc,
);

all &= assert(
  "Identity->Maybe",
  F.Identity.map,
  F.Maybe.map,
  identityToMaybe,
  { value: 10 },
  inc,
);

all &= assert(
  "Pair->List",
  F.Pair.map,
  F.List.map,
  pairToList,
  { first: 1, second: 2 },
  inc,
);

console.log("\nAll natural transformations commute:", all === 1); // true
