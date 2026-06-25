/**
 * @file profunctor.js
 * @description 手写 Profunctor
 *
 * A Profunctor is a type constructor of kind `* -> * -> *` that is
 * *contravariant* in its first argument and *covariant* in its second --
 * the natural shape of a function `a -> b` (or more generally any "arrow").
 *
 * The central operation is `dimap`:
 *
 *   dimap :: (a' -> a) -> (b -> b') -> p a b -> p a' b'
 *
 * i.e. pre-compose a function on the input (contravariant) and post-compose a
 * function on the output (covariant). From `dimap` we derive:
 *
 *   lmap(f)  = dimap(f, id)        -- map over input only
 *   rmap(g)  = dimap(id, g)        -- map over output only
 *
 * Laws:
 *   1. Identity:    dimap(id, id, u) === u
 *   2. Composition: dimap(f . g, h . k, u) === dimap(g, k, dimap(f, h, u))
 *
 * Approach: implement the function-arrow profunctor and a "tagged" profunctor
 * that wraps an effectful function, then verify the laws.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const Profunctor = (dimap) => ({
  dimap,
  lmap(f, u) {
    return dimap(f, (x) => x, u);
  },
  rmap(g, u) {
    return dimap((x) => x, g, u);
  },
  // Compose two profunctor arrows sequentially (for the function profunctor).
});

// The function arrow profunctor: p a b = a -> b.
const FnProfunctor = Profunctor((pre, post, fn) => (x) => post(fn(pre(x))));

// A "Star" profunctor: wraps an effectful function a -> F b, here a -> Maybe b.
// dimap returns a new star (wrapped in { fn }) so the abstraction is preserved
// across transformations.
const StarMaybe = Profunctor((pre, post, star) =>
  starOf((x) => {
    const m = star.fn(pre(x));
    return m.tag === "just"
      ? { tag: "just", value: post(m.value) }
      : { tag: "nothing" };
  }),
);

const starOf = (fn) => ({ fn });

// ---------- Law checker ----------
function checkIdentity(P, u, runWith, samples = [0, 1, 2, 7]) {
  const id = (x) => x;
  const lhs = P.dimap(id, id, u);
  // Compare by running both on sample inputs.
  return samples.every((x) => deepEq(runWith(lhs, x), runWith(u, x)));
}

function checkComposition(
  P,
  u,
  f,
  g,
  h,
  k,
  runWith,
  samples = [0, 1, 2, 7, 10],
) {
  // Profunctor composition law:
  //   dimap(f . g, h . k, p) === dimap(g, h, dimap(f, k, p))
  // (the pre-composition nests inward as f-then-g; the post-composition
  //  nests outward as k-then-h, mirroring function composition order).
  const composed = P.dimap(
    (x) => f(g(x)),
    (x) => h(k(x)),
    u,
  );
  const stepwise = P.dimap(g, h, P.dimap(f, k, u));
  return samples.every((x) =>
    deepEq(runWith(composed, x), runWith(stepwise, x)),
  );
}

// ---------- Tests ----------

// A function: x -> x * 2 + 1
const doubleInc = (x) => x * 2 + 1;

// dimap with pre = (+10), post = (*3): result = (x + 10) * 2 + 1 then * 3
const transformed = FnProfunctor.dimap(
  (x) => x + 10,
  (x) => x * 3,
  doubleInc,
);
console.log(transformed(0)); // (0+10)*2+1 = 21, *3 = 63
console.log(transformed(2)); // (2+10)*2+1 = 25, *3 = 75

// lmap/rmap.
const lmapped = FnProfunctor.lmap((x) => x + 1, doubleInc);
console.log(lmapped(0)); // (0+1)*2+1 = 3
const rmapped = FnProfunctor.rmap((x) => x * 10, doubleInc);
console.log(rmapped(0)); // (0*2+1)*10 = 10

// Star (effectful) profunctor: parse string -> number wrapped in Maybe.
const parse = starOf((s) => {
  const n = Number(s);
  return Number.isNaN(n) ? { tag: "nothing" } : { tag: "just", value: n };
});
// Pre-process: trim; post-process: +100.
const parseClean = StarMaybe.dimap(
  (s) => String(s).trim(),
  (n) => n + 100,
  parse,
);
console.log(JSON.stringify(parseClean.fn(" 42 "))); // {"tag":"just","value":142}
console.log(JSON.stringify(parseClean.fn(" abc "))); // {"tag":"nothing"}

// Laws.
console.log(
  "Fn identity:",
  checkIdentity(FnProfunctor, doubleInc, (fn, x) => fn(x)),
); // true
console.log(
  "Fn composition:",
  checkComposition(
    FnProfunctor,
    doubleInc,
    (x) => x + 1,
    (x) => x * 2,
    (x) => x - 3,
    (x) => x * 5,
    (fn, x) => fn(x),
  ),
); // true

const strSamples = ["42", " 7 ", "hello", "100"];
console.log(
  "Star identity:",
  checkIdentity(StarMaybe, parse, (s, x) => s.fn(x), strSamples),
); // true
console.log(
  "Star composition:",
  checkComposition(
    StarMaybe,
    parse,
    (s) => s.trim(),
    (s) => s.toLowerCase(),
    (n) => n + 1,
    (n) => n * 2,
    (s, x) => s.fn(x),
    strSamples,
  ),
); // true
