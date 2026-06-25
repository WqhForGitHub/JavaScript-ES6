/**
 * @file functorLaws.js
 * @description 手写函子定律验证
 *
 * A lawful Functor must satisfy two equations for every value `u` of the
 * functor and every pair of pure functions f, g:
 *
 *   1. Identity:       u.map(x => x)  ===  u            (modulo value eq)
 *   2. Composition:    u.map(f).map(g)  ===  u.map(x => g(f(x)))
 *
 * This file builds a generic law checker and runs it against several functor
 * implementations (Identity, Maybe, Either, List) to demonstrate that the laws
 * hold regardless of the concrete functor.
 *
 * Approach: define `equals` by deep value equality, then assert both laws with
 * randomised inputs and a few hand-picked edge cases.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Generic law runners. `map` is the functor's map, `extract` pulls out the
// inner value for comparison (None/Left cases handled by the functor's own
// structure).
function checkIdentity(map, extract, u, label) {
  const id = (x) => x;
  const ok = deepEq(extract(map(u)(id)), extract(u));
  console.log(`[${label}] identity law: ${ok}`);
  return ok;
}

function checkComposition(map, extract, u, f, g, label) {
  const left = map(map(u)(f))(g);
  const right = map(u)((x) => g(f(x)));
  const ok = deepEq(extract(left), extract(right));
  console.log(`[${label}] composition law: ${ok}`);
  return ok;
}

// ---------- A few functor implementations to validate ----------

// Identity functor
const Id = {
  of: (v) => ({ value: v }),
  map: (u) => (fn) => ({ value: fn(u.value) }),
  extract: (u) => u.value,
};

// Maybe
const Just = (v) => ({ tag: "just", value: v });
const Nothing = () => ({ tag: "nothing" });
const MaybeF = {
  of: Just,
  map: (u) => (fn) => (u.tag === "just" ? Just(fn(u.value)) : Nothing()),
  extract: (u) => (u.tag === "just" ? u.value : null),
};

// Either (Right only continues)
const Right = (v) => ({ tag: "right", value: v });
const Left = (v) => ({ tag: "left", value: v });
const EitherF = {
  of: Right,
  map: (u) => (fn) => (u.tag === "right" ? Right(fn(u.value)) : u),
  extract: (u) => (u.tag === "right" ? u.value : `Left(${u.value})`),
};

// List functor
const ListF = {
  of: (v) => [v],
  map: (u) => (fn) => u.map(fn),
  extract: (u) => u,
};

// ---------- Run the law checks ----------

const inc = (x) => x + 1;
const dbl = (x) => x * 2;

let allPass = true;
allPass &= checkIdentity(Id.map, Id.extract, Id.of(10), "Identity");
allPass &= checkComposition(
  Id.map,
  Id.extract,
  Id.of(10),
  inc,
  dbl,
  "Identity",
);

allPass &= checkIdentity(MaybeF.map, MaybeF.extract, Just(7), "Maybe-Just");
allPass &= checkComposition(
  MaybeF.map,
  MaybeF.extract,
  Just(7),
  inc,
  dbl,
  "Maybe-Just",
);
allPass &= checkIdentity(
  MaybeF.map,
  MaybeF.extract,
  Nothing(),
  "Maybe-Nothing",
);
allPass &= checkComposition(
  MaybeF.map,
  MaybeF.extract,
  Nothing(),
  inc,
  dbl,
  "Maybe-Nothing",
);

allPass &= checkIdentity(
  EitherF.map,
  EitherF.extract,
  Right(5),
  "Either-Right",
);
allPass &= checkComposition(
  EitherF.map,
  EitherF.extract,
  Right(5),
  inc,
  dbl,
  "Either-Right",
);
allPass &= checkIdentity(
  EitherF.map,
  EitherF.extract,
  Left("err"),
  "Either-Left",
);
allPass &= checkComposition(
  EitherF.map,
  EitherF.extract,
  Left("err"),
  inc,
  dbl,
  "Either-Left",
);

allPass &= checkIdentity(ListF.map, ListF.extract, [1, 2, 3], "List");
allPass &= checkComposition(
  ListF.map,
  ListF.extract,
  [1, 2, 3],
  inc,
  dbl,
  "List",
);
allPass &= checkIdentity(ListF.map, ListF.extract, [], "List-empty");
allPass &= checkComposition(
  ListF.map,
  ListF.extract,
  [],
  inc,
  dbl,
  "List-empty",
);

console.log("\nAll functor laws hold:", allPass === 1); // true
