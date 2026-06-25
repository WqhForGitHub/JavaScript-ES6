/**
 * @file traversable.js
 * @description 手写 Traversable
 *
 * Traversable sits between Foldable and Functor: it lets you turn a structure
 * of effects into an effect of structure, e.g. `[Maybe a] -> Maybe [a]` or
 * `[Task a] -> Task [a]`. The two key operations are:
 *
 *   traverse :: Applicative F => (a -> F b) -> T a -> F (T b)
 *   sequence  :: Applicative F => T (F a) -> F (T a)   (= traverse identity)
 *
 * The intuition: traverse runs an effectful computation for every element,
 * accumulating results back into the same shape, and short-circuits on the
 * first "failure" (Nothing / Left).
 *
 * Approach: implement `traverse` for Array using an Applicative interface
 * (`of`, `ap`, `map`), then provide Maybe and Either/Either-List applicatives
 * and demonstrate `sequence` to "validate a list".
 */

// Generic Applicative helpers for the demo applicatives.
const MaybeApp = {
  of: (v) => ({ tag: "just", value: v }),
  map: (m, f) => (m.tag === "just" ? MaybeApp.of(f(m.value)) : m),
  ap: (mf, ma) =>
    mf.tag === "just" && ma.tag === "just"
      ? MaybeApp.of(mf.value(ma.value))
      : { tag: "nothing" },
};

const EitherApp = {
  of: (v) => ({ tag: "right", value: v }),
  map: (e, f) => (e.tag === "right" ? EitherApp.of(f(e.value)) : e),
  ap: (ef, ea) =>
    ef.tag === "right" && ea.tag === "right"
      ? EitherApp.of(ef.value(ea.value))
      : ef.tag === "left"
        ? ef
        : ea,
};

// traverse for arrays given an applicative.
//   traverse(A, f, [x1, x2, ...])
//     = A.of([]) then for each x: acc = A.ap(A.map(acc, list => value => [...list, value]), f(x))
// `A.map(acc, g)` makes g consume the accumulated list; `A.ap` then feeds the
// new value, so we append to keep the original left-to-right order.
// This threads the applicative effect through, short-circuiting on Left/Nothing.
function traverse(A, f, arr) {
  return arr.reduce(
    (acc, x) =>
      A.ap(
        A.map(acc, (list) => (value) => [...list, value]),
        f(x),
      ),
    A.of([]), // empty list, lifted
  );
}

// sequence: turn T(F a) into F(T a).
const sequence = (A, arr) => traverse(A, (x) => x, arr);

// ---------- Tests ----------

// Parse all: if every input parses, return Just [numbers]; else Nothing.
const parseNum = (s) => {
  const n = Number(s);
  return Number.isNaN(n) ? { tag: "nothing" } : MaybeApp.of(n);
};

console.log(JSON.stringify(traverse(MaybeApp, parseNum, ["1", "2", "3"])));
// {"tag":"just","value":[1,2,3]}
console.log(JSON.stringify(traverse(MaybeApp, parseNum, ["1", "oops", "3"])));
// {"tag":"nothing"}

// sequence: a list of Maybes -> Maybe of list.
const maybes = [MaybeApp.of(1), MaybeApp.of(2), MaybeApp.of(3)];
console.log(JSON.stringify(sequence(MaybeApp, maybes)));
// {"tag":"just","value":[1,2,3]}
const withNothing = [MaybeApp.of(1), { tag: "nothing" }, MaybeApp.of(3)];
console.log(JSON.stringify(sequence(MaybeApp, withNothing)));
// {"tag":"nothing"}

// Either variant that collects... actually short-circuits on first Left.
const parseEither = (s) => {
  const n = Number(s);
  return Number.isNaN(n)
    ? { tag: "left", value: `bad: ${s}` }
    : EitherApp.of(n);
};
console.log(JSON.stringify(traverse(EitherApp, parseEither, ["10", "20"])));
// {"tag":"right","value":[10,20]}
console.log(JSON.stringify(traverse(EitherApp, parseEither, ["10", "xx"])));
// {"tag":"left","value":"bad: xx"}

// Traversing an empty list yields the applicative of an empty list.
console.log(JSON.stringify(traverse(MaybeApp, parseNum, [])));
// {"tag":"just","value":[]}

// Traversing with a pure-ish applicative (Identity) just maps.
const IdentityApp = {
  of: (v) => ({ value: v }),
  map: (i, f) => IdentityApp.of(f(i.value)),
  ap: (ifn, ia) => IdentityApp.of(ifn.value(ia.value)),
};
console.log(
  JSON.stringify(
    traverse(IdentityApp, (x) => IdentityApp.of(x + 1), [1, 2, 3]),
  ),
);
// {"value":[2,3,4]}
