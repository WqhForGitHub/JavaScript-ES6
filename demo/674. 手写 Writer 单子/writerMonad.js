/**
 * @file writerMonad.js
 * @description 手写 Writer 单子
 *
 * The Writer monad attaches a log (or any monoid, e.g. a list of strings) to
 * a value as it flows through a computation. It is the pure-functional answer
 * to "printf debugging": each step can append to an accumulating log without
 * mutating any shared state.
 *
 * A Writer holds:
 *   - value : the actual result
 *   - log   : an accumulated log, where log forms a Monoid (here Array<String>)
 *
 * Interface:
 *   - Writer.of(value)         : start with an empty log
 *   - Writer(value, log)       : construct directly
 *   - map(fn)                  : transform the value, keep log
 *   - chain(fn)                : append logs from the sub-computation
 *   - tell(entry)              : append a log entry, value unchanged
 *   - run()                    : return [value, log]
 *
 * The log monoid: identity = [], combine = concat.
 */

class Writer {
  constructor(value, log = []) {
    this.value = value;
    this.log = log;
  }

  static of(value) {
    return new Writer(value, []);
  }

  // Append a log entry, keeping the same value.
  static tell(entry) {
    return new Writer(undefined, [entry]);
  }

  map(fn) {
    return new Writer(fn(this.value), this.log);
  }

  chain(fn) {
    const next = fn(this.value);
    return new Writer(next.value, this.log.concat(next.log));
  }

  // Applicative: combine logs from function and arg writers.
  ap(argWriter) {
    return new Writer(
      this.value(argWriter.value),
      this.log.concat(argWriter.log),
    );
  }

  run() {
    return [this.value, this.log];
  }

  toString() {
    return `Writer(${JSON.stringify(this.value)}, ${JSON.stringify(this.log)})`;
  }
}

// ---------- Test cases ----------

// A small "numbered steps" computation that logs what it did.
const step = (label, fn) => (x) =>
  Writer.tell(`${label}(${x})`).chain(() => {
    const result = fn(x);
    return new Writer(result, [`${label} -> ${result}`]);
  });

const pipeline = Writer.of(3)
  .chain(step("double", (x) => x * 2))
  .chain(step("inc", (x) => x + 1))
  .chain(step("square", (x) => x * x));

const [value, log] = pipeline.run();
console.log("value:", value); // value: 49
console.log("log:", log);
// [
//   "double(3)",
//   "double -> 6",
//   "inc(6)",
//   "inc -> 7",
//   "square(7)",
//   "square -> 49"
// ]

// of produces an empty log.
console.log(Writer.of("x").run()); // [ 'x', [] ]

// Applicative combination keeps both logs.
const add = (x) => (y) => x + y;
const applied = Writer.of(add)
  .ap(new Writer(10, ["got 10"]))
  .ap(new Writer(20, ["got 20"]));
console.log(applied.run()); // [ 30, [ 'got 10', 'got 20' ] ]
