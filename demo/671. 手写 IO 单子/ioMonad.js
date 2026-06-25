/**
 * @file ioMonad.js
 * @description 手写 IO 单子
 *
 * IO captures impure, side-effecting computations as a pure value: a thunk
 * that, when run, produces a value. By wrapping effects we can compose them
 * with `map` and `chain` without actually running them, keeping the program
 * referentially transparent until the very end (the "edge" of the program).
 *
 * Interface:
 *   - IO.of(value)         : lift a pure value
 *   - IO.from(fn)          : wrap an effectful thunk
 *   - map(fn)              : transform the eventual result
 *   - chain(fn)            : sequence another IO-producing computation
 *   - run() / unsafePerformIO : actually execute the effect
 *
 * Laws: standard monad laws, modulo effects only observed at run time.
 */

class IO {
  constructor(effect) {
    // effect: () -> value  (a deferred computation)
    this.effect = effect;
  }

  static of(value) {
    return new IO(() => value);
  }

  static from(fn) {
    return new IO(fn);
  }

  map(fn) {
    return new IO(() => fn(this.effect()));
  }

  chain(fn) {
    return new IO(() => fn(this.effect()).effect());
  }

  // Sequence two IOs, discarding the first result.
  chain_(io) {
    return this.chain(() => io);
  }

  run() {
    return this.effect();
  }

  // Alias commonly seen in libraries.
  unsafePerformIO() {
    return this.run();
  }
}

// ---------- Test cases ----------

// Build a tiny impure program out of pure pieces.
let log = [];
const writeLine = (s) =>
  IO.from(() => {
    log.push(s);
    return s;
  });
const readLine = () => IO.from(() => "hello world");

const program = readLine()
  .map((s) => s.toUpperCase())
  .chain((upper) => writeLine(`Echo: ${upper}`).map(() => upper.length));

// Nothing has run yet.
console.log(log.length); // 0

// Running executes the composed effects.
const length = program.run();
console.log(length); // 11
console.log(log); // ["Echo: HELLO WORLD"]

// Pure value via of never touches state.
const pure = IO.of(42).map((x) => x + 8);
console.log(pure.run()); // 50
console.log(log.length); // 1 (unchanged)

// Monadic left-identity sanity check (effects deferred until run).
const f = (n) => IO.of(n * 10);
console.log(IO.of(3).chain(f).run() === f(3).run()); // true
