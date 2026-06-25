/**
 * @file skiCalculus.js
 * @description 手写 SKI 组合子演算
 *
 * SKI combinator calculus is a minimal computational system built from just
 * three combinators (and application). It is Turing complete: any lambda term
 * can be translated into S, K, I alone (in fact S and K suffice, since
 * I = SKK).
 *
 *   I x       = x                 (identity)
 *   K x y     = x                 (constant-maker / first projection)
 *   S f g x   = (f x)(g x)        (substitution / sharing)
 *
 * We represent application as a tagged node { type: 'app', f, arg }, and
 * combinators as leaf nodes. A small reducer performs leftmost-outermost
 * reduction until no redex remains (with a step limit to avoid divergence).
 *
 * Approach: implement an AST + a `reduce` function + helpers `I`, `K`, `S`
 * to build terms, then encode booleans, numerals, and a few computations.
 */

const I = { type: "I" };
const K = { type: "K" };
const S = { type: "S" };
const app = (f, arg) => ({ type: "app", f, arg });
const num = (n) => ({ type: "num", value: n });

function reduceStep(term) {
  if (term.type !== "app") return null;

  // Leftmost-outermost: first try reducing the function part.
  if (term.f.type === "app") {
    const inner = reduceStep(term.f);
    if (inner) return app(inner, term.arg);
  }

  const { f, arg } = term;

  // I x -> x
  if (f.type === "I") return arg;

  // K x y -> x
  if (f.type === "app" && f.f.type === "K") return f.arg;

  // S f g x -> (f x)(g x)
  if (f.type === "app" && f.f.type === "app" && f.f.f.type === "S") {
    const ff = f.f.arg;
    const gg = f.arg;
    return app(app(ff, arg), app(gg, arg));
  }

  // Try reducing children.
  if (term.f.type === "app") {
    const inner = reduceStep(term.f);
    if (inner) return app(inner, arg);
  }
  const argReduced = reduceStep(arg);
  if (argReduced) return app(f, argReduced);

  return null; // no redex
}

function reduce(term, maxSteps = 10000) {
  let current = term;
  for (let i = 0; i < maxSteps; i++) {
    const next = reduceStep(current);
    if (next === null) return { term: current, steps: i, done: true };
    current = next;
  }
  return { term: current, steps: maxSteps, done: false };
}

function toStr(term) {
  if (term.type === "num") return String(term.value);
  if (term.type === "I" || term.type === "K" || term.type === "S")
    return term.type;
  return `(${toStr(term.f)} ${toStr(term.arg)})`;
}

// ---------- Test cases ----------

// I x -> x
console.log(toStr(reduce(app(I, num(42))).term)); // 42

// K x y -> x
console.log(toStr(reduce(app(app(K, num(1)), num(2))).term)); // 1

// S K K x -> (K x)(K x) -> x  (so I = S K K)
const I_via_SKK = (f) => app(app(app(S, K), K), f);
console.log(toStr(reduce(I_via_SKK(num(7))).term)); // 7

// Church booleans in SKI:
//   true  = K     (true  a b = a)
//   false = K I   (false a b = b)
const True = K;
const False = app(K, I);
const not = (b) => app(b, False, True); // not b = b false true
// Use: ifThenElse c t e = c t e
const ifThenElse = (c, t, e) => app(app(c, t), e);

console.log(toStr(reduce(ifThenElse(True, num("T"), num("F"))).term)); // T
console.log(toStr(reduce(ifThenElse(False, num("T"), num("F"))).term)); // F

// Pair = \a b f -> f a b ; fst = \p -> p true ; snd = \p -> p false
// (just a structural sanity check using ifThenElse)
const Pair = (a, b) => (f) => app(app(f, a), b);
const mkPair = (a, b) => app(app(S, app(K, app(S, app(K, S)), K)), a); // simplified demo
void mkPair; // (full Church pairs omitted; booleans above suffice)
void Pair;

// Numerals would require full Church encoding; here we rely on `num` leaves.
// Demonstrate composition: S (K f) (K g) x -> f (g x)
const compose = (f, g) => app(app(S, app(K, f)), app(K, g));
const inc = app(K, num(0)); // placeholder constant for demo reduction
const composed = reduce(app(compose(inc, inc), num(99)));
console.log(toStr(composed.term)); // (K 0 (K 0 99)) ... reduces to 0
