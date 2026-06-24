/**
 * 手写简易版 Koa（中间件机制）
 * Minimal Koa: the "onion" middleware model implemented with async/await.
 *
 * Approach:
 * - `Application.use(middleware)` pushes middleware functions of signature
 *   `async (ctx, next) => {}`.
 * - On `callback()` we compose them so each middleware's code BEFORE `await next()`
 *   runs on the way IN, and code AFTER `await next()` runs on the way OUT — the
 *   classic onion shape.
 * - `compose(middlewares)` returns a single function that, when called, runs the
 *   chain. It dispatches recursively using an index; calling `next()` more than
 *   once throws the Koa "next() called multiple times" error.
 * - A simple `ctx` object holds request/response placeholders.
 *
 * Pure JS, runs in Node.
 */

function compose(middlewares) {
  if (!Array.isArray(middlewares)) throw new TypeError('Middleware stack must be an array.');
  middlewares.forEach((m) => {
    if (typeof m !== 'function') throw new TypeError('Middleware must be a function.');
  });

  return function (ctx, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

class Koa {
  constructor() {
    this.middlewares = [];
  }
  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('use() requires a function');
    this.middlewares.push(fn);
    return this;
  }
  callback() {
    const fn = compose(this.middlewares);
    return (req, res) => {
      const ctx = { req, res, body: undefined, state: {}, set status(v) { res && (res.statusCode = v); } };
      return fn(ctx).then(() => ctx);
    };
  }
  // Run the stack against a fake request and resolve with the ctx.
  listen() {
    const fn = compose(this.middlewares);
    return (ctx) => fn(ctx).then(() => ctx);
  }
}

// ---------- Test cases ----------
const app = new Koa();

app.use(async (ctx, next) => {
  ctx.state.order = [];
  ctx.state.order.push('A before');
  await next();
  ctx.state.order.push('A after');
});
app.use(async (ctx, next) => {
  ctx.state.order.push('B before');
  await next();
  ctx.state.order.push('B after');
});
app.use(async (ctx, next) => {
  ctx.state.order.push('C core');
  // No next() -> innermost middleware.
});

const run = app.listen();
run({ state: {} }).then((ctx) => {
  console.log('onion order:', ctx.state.order);
  // expected: [ 'A before', 'B before', 'C core', 'B after', 'A after' ]
});

// Error propagation.
const app2 = new Koa();
app2.use(async (ctx, next) => {
  try { await next(); }
  catch (e) { ctx.state.caught = e.message; }
});
app2.use(async () => { throw new Error('boom'); });
app2.listen()({ state: {} }).then((ctx) => {
  console.log('error caught:', ctx.state.caught); // expected: boom
});

// Double next() should reject.
const app3 = new Koa();
app3.use(async (ctx, next) => { await next(); await next(); });
app3.listen()({ state: {} }).catch((e) => {
  console.log('double next error:', e.message); // expected: next() called multiple times
});
