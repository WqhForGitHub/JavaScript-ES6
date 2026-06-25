/**
 * @file stateMonad.js
 * @description 手写 State 单子
 *
 * The State monad threads a piece of state through a series of pure functions
 * without explicit mutation. A State computation is a function `s -> [a, s]`:
 * it takes the current state and returns a value paired with the new state.
 *
 * Interface:
 *   - State.of(value)        : value, state unchanged
 *   - State.get              : return current state as the value
 *   - State.put(s)           : replace state, value is undefined
 *   - State.modify(fn)       : transform state
 *   - State.gets(fn)         : derive a value from state
 *   - map(fn)                : transform the produced value
 *   - chain(fn)              : sequence stateful sub-computations
 *   - run(initialState)      : execute, returning [value, finalState]
 *
 * Laws: monad laws on the value channel, with state threaded left-to-right.
 */

class State {
  constructor(runFn) {
    // runFn : s -> [a, s]
    this.runFn = runFn;
  }

  static of(value) {
    return new State((s) => [value, s]);
  }

  static get = new State((s) => [s, s]);

  static put(s) {
    return new State(() => [undefined, s]);
  }

  static modify(fn) {
    return new State((s) => [undefined, fn(s)]);
  }

  static gets(fn) {
    return new State((s) => [fn(s), s]);
  }

  map(fn) {
    return new State((s) => {
      const [a, s2] = this.runFn(s);
      return [fn(a), s2];
    });
  }

  chain(nextFn) {
    return new State((s) => {
      const [a, s2] = this.runFn(s);
      return nextFn(a).runFn(s2);
    });
  }

  run(initialState) {
    return this.runFn(initialState);
  }

  evalState(initialState) {
    return this.runFn(initialState)[0];
  }

  execState(initialState) {
    return this.runFn(initialState)[1];
  }
}

// ---------- Test cases ----------

// Build a small counter: increment, then read.
const increment = State.modify((n) => n + 1);
const currentCount = State.get;

const program = increment
  .chain(() => increment)
  .chain(() => increment)
  .chain(() => currentCount)
  .map((n) => `count is ${n}`);

console.log(program.run(0)); // [ 'count is 3', 3 ]

// Stack as state.
const push = (x) => State.modify((stack) => [...stack, x]);
const pop = State.gets((stack) => stack[stack.length - 1]).chain((top) =>
  State.modify((stack) => stack.slice(0, -1)).map(() => top),
);

const stackProgram = push(1)
  .chain(() => push(2))
  .chain(() => push(3))
  .chain(() => pop)
  .chain((top) => push(top * 10).map(() => top));

console.log(stackProgram.run([])); // [ 3, [ 1, 2, 30 ] ]

// of leaves state untouched.
console.log(State.of("x").run(99)); // [ 'x', 99 ]

// put/modify change state, value is undefined.
console.log(State.put(5).execState(0)); // 5
console.log(State.modify((n) => n * 2).execState(10)); // 20
