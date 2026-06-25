/**
 * 中间件模式 - Koa 风格 (Koa-style Middleware)
 *
 * Approach:
 * - Koa middleware is an onion model: each middleware is (ctx, next) => Promise.
 *   Calling await next() yields control downstream; code AFTER next() runs on the
 *   way back up (response phase). This enables logging/timing/error-handling
 *   wrappers around inner handlers.
 * - compose(middlewares) returns a function(ctx) that runs the chain. Each
 *   middleware receives next() bound to dispatch(i+1). If a middleware never calls
 *   next(), downstream is skipped. If next() is called multiple times we throw to
 *   match Koa's invariant.
 * - We implement compose from scratch, then run a small pipeline.
 */

function compose(middlewares) {
  if (!Array.isArray(middlewares))
    throw new TypeError("middlewares must be an array");
  for (const mw of middlewares) {
    if (typeof mw !== "function")
      throw new TypeError("middleware must be a function");
  }
  return function (ctx, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      const fn = i === middlewares.length ? next : middlewares[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

class Application {
  constructor() {
    this.middlewares = [];
  }
  use(mw) {
    this.middlewares.push(mw);
    return this;
  }
  callback() {
    const fn = compose(this.middlewares);
    return (ctx) => fn(ctx);
  }
  run(ctx = {}) {
    return this.callback()(ctx);
  }
}

// ---------------- Test cases ----------------
const log = [];
const app = new Application();

// Outer middleware measures total time (onion: wraps inner).
app.use(async (ctx, next) => {
  log.push("A enter");
  await next();
  log.push("A exit");
});

// Logger records request path on the way down and status on the way up.
app.use(async (ctx, next) => {
  log.push(`B log request ${ctx.path}`);
  ctx.status = 200;
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
  log.push(`B log status ${ctx.status}`);
});

// Response handler (does not call next).
app.use(async (ctx) => {
  log.push("C handler");
  ctx.body = { ok: true, path: ctx.path };
});

(async () => {
  const ctx = { path: "/api" };
  await app.run(ctx);
  console.log(log);
  // Expected: [
  //   'A enter',
  //   'B log request /api',
  //   'C handler',
  //   'B log status 200',
  //   'A exit'
  // ]
  console.log(ctx.body);
  // Expected: { ok: true, path: '/api' }

  // Error handling: an inner throw is caught by B's try/catch -> status 500
  const errApp = new Application();
  errApp.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  });
  errApp.use(async () => {
    throw new Error("boom");
  });
  const errCtx = { path: "/x" };
  await errApp.run(errCtx);
  console.log(errCtx.status, errCtx.body);
  // Expected: 500 { error: 'boom' }

  // next() called twice -> rejected
  const badApp = new Application();
  badApp.use(async (ctx, next) => {
    await next();
    await next();
  });
  badApp.use(async () => {});
  try {
    await badApp.run({});
  } catch (e) {
    console.log("Compose error:", e.message);
    // Expected: Compose error: next() called multiple times
  }
})();
