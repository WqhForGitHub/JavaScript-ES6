/**
 * @file monadLaws.js
 * @description 手写单子定律验证
 *
 * A lawful Monad must satisfy three equations for every monad value `m` of
 * type M, every value `a`, and every Kleisli arrow `f: a -> M b`:
 *
 *   1. Left identity:    M.of(a).chain(f)   ===  f(a)
 *   2. Right identity:   m.chain(M.of)      ===  m
 *   3. Associativity:    m.chain(f).chain(g)
 *                          ===  m.chain(x => f(x).chain(g))
 *
 * This file builds a generic checker and validates Identity, Maybe, Either,
 * and List monads against the laws with hand-picked and edge inputs.
 *
 * Approach: deep equality on extracted values; each monad supplies `of`,
 * `chain`, and `extract`.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function checkLeftIdentity(M, a, f, label) {
  const ok = deepEq(M.extract(M.chain(M.of(a))(f)), M.extract(f(a)));
  console.log(`[${label}] left identity: ${ok}`);
  return ok;
}

function checkRightIdentity(M, m, label) {
  const ok = deepEq(M.extract(M.chain(m)(M.of)), M.extract(m));
  console.log(`[${label}] right identity: ${ok}`);
  return ok;
}

function checkAssociativity(M, m, f, g, label) {
  const left = M.chain(M.chain(m)(f))(g);
  const right = M.chain(m)((x) => M.chain(f(x))(g));
  const ok = deepEq(M.extract(left), M.extract(right));
  console.log(`[${label}] associativity: ${ok}`);
  return ok;
}

// ---------- Monad implementations ----------

const IdentityM = {
  of: (v) => ({ value: v }),
  chain: (m) => (f) => f(m.value),
  extract: (m) => m.value,
};

const Just = (v) => ({ tag: "just", value: v });
const Nothing = () => ({ tag: "nothing" });
const MaybeM = {
  of: Just,
  chain: (m) => (f) => (m.tag === "just" ? f(m.value) : Nothing()),
  extract: (m) => (m.tag === "just" ? ["just", m.value] : ["nothing"]),
};

const Right = (v) => ({ tag: "right", value: v });
const Left = (v) => ({ tag: "left", value: v });
const EitherM = {
  of: Right,
  chain: (m) => (f) => (m.tag === "right" ? f(m.value) : m),
  extract: (m) => [m.tag, m.value],
};

const ListM = {
  of: (v) => [v],
  chain: (m) => (f) => m.flatMap(f),
  extract: (m) => m,
};

// ---------- Run checks ----------

const incM = (x) => IdentityM.of(x + 1); // a -> Identity number
const dblM = (x) => IdentityM.of(x * 2);
let pass = true;
pass &= checkLeftIdentity(IdentityM, 10, incM, "Identity");
pass &= checkRightIdentity(IdentityM, IdentityM.of(10), "Identity");
pass &= checkAssociativity(IdentityM, IdentityM.of(10), incM, dblM, "Identity");

const justInc = (x) => MaybeM.of(x + 1);
const justDbl = (x) => MaybeM.of(x * 2);
const toNothing = (_) => Nothing();
pass &= checkLeftIdentity(MaybeM, 5, justInc, "Maybe-Just");
pass &= checkRightIdentity(MaybeM, Just(5), "Maybe-Just");
pass &= checkAssociativity(MaybeM, Just(5), justInc, justDbl, "Maybe-Just");
pass &= checkRightIdentity(MaybeM, Nothing(), "Maybe-Nothing");
pass &= checkAssociativity(
  MaybeM,
  Just(5),
  justInc,
  toNothing,
  "Maybe->Nothing",
);
pass &= checkAssociativity(
  MaybeM,
  Just(5),
  toNothing,
  justInc,
  "Maybe->Nothing",
);

const rightInc = (x) => EitherM.of(x + 1);
const rightDbl = (x) => EitherM.of(x * 2);
const toLeft = (x) => Left("boom");
pass &= checkLeftIdentity(EitherM, 4, rightInc, "Either-Right");
pass &= checkRightIdentity(EitherM, Right(4), "Either-Right");
pass &= checkAssociativity(
  EitherM,
  Right(4),
  rightInc,
  rightDbl,
  "Either-Right",
);
pass &= checkRightIdentity(EitherM, Left("err"), "Either-Left");
pass &= checkAssociativity(EitherM, Right(4), toLeft, rightInc, "Either->Left");

const listInc = (x) => ListM.of(x + 1);
const listDbl = (x) => ListM.of(x * 2);
const dup = (x) => ListM.of(x); // identity-ish for list
pass &= checkLeftIdentity(ListM, 7, listInc, "List");
pass &= checkRightIdentity(ListM, [1, 2, 3], "List");
pass &= checkAssociativity(ListM, [1, 2, 3], listInc, listDbl, "List");
pass &= checkRightIdentity(ListM, [], "List-empty");
pass &= checkAssociativity(ListM, [1, 2, 3], dup, listInc, "List-dup");

console.log("\nAll monad laws hold:", pass === 1); // true
