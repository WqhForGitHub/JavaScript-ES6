/**
 * @file readerMonad.js
 * @description 手写 Reader 单子
 *
 * The Reader monad models a computation that depends on a shared, immutable
 * environment `r`. It is the standard pattern for dependency injection: you
 * compose functions of the form `r -> a` declaratively, and only at the end
 * hand the actual environment to `run`.
 *
 * Interface:
 *   - Reader.of(value)   : a computation ignoring the environment
 *   - Reader.ask         : the computation that returns the environment
 *   - Reader(fn)         : wrap an `r -> a` function
 *   - map(fn)            : transform the produced value
 *   - chain(fn)          : sequence a computation that itself needs `r`
 *   - run(env)           : execute with a concrete environment
 */

class Reader {
  constructor(fn) {
    this.fn = fn;
  }

  static of(value) {
    return new Reader(() => value);
  }

  // The primitive "read the environment" computation.
  static ask = new Reader((env) => env);

  static asks(fn) {
    return new Reader(fn);
  }

  map(fn) {
    return new Reader((env) => fn(this.fn(env)));
  }

  chain(nextFn) {
    return new Reader((env) => nextFn(this.fn(env)).fn(env));
  }

  // Apply a Reader-wrapped function to a Reader-wrapped value (Applicative).
  ap(readerArg) {
    return new Reader((env) => this.fn(env)(readerArg.fn(env)));
  }

  run(env) {
    return this.fn(env);
  }
}

// ---------- Test cases ----------

const config = { apiBase: "https://api.example.com", timeout: 5000 };

// A computation that needs the environment.
const endpoint = Reader.asks((env) => `${env.apiBase}/users`);

// Chain: use the environment multiple times.
const request = endpoint.chain((url) =>
  Reader.asks((env) => ({ url, timeout: env.timeout })),
);

console.log(request.run(config));
// { url: 'https://api.example.com/users', timeout: 5000 }

// Reader.of ignores the environment.
console.log(Reader.of(42).run("anything")); // 42

// map transforms the value.
const upper = Reader.asks((env) => env.apiBase).map((s) => s.toUpperCase());
console.log(upper.run(config)); // HTTPS://API.EXAMPLE.COM

// Applicative: combine two readers with a wrapped function.
const concat = Reader.of((a) => (b) => `${a}|${b}`)
  .ap(Reader.asks((env) => env.apiBase))
  .ap(Reader.asks((env) => String(env.timeout)));
console.log(concat.run(config)); // https://api.example.com|5000

// Local modification of the environment for a sub-computation.
Reader.prototype.local = function (modify) {
  return new Reader((env) => this.fn(modify(env)));
};
const withProdBase = endpoint.local((env) => ({
  ...env,
  apiBase: "https://prod.example.com",
}));
console.log(withProdBase.run(config)); // https://prod.example.com/users
