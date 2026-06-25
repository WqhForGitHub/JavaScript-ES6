/**
 * 手写简易版 Express（路由 + 中间件）
 * Minimal Express: routing with method-based dispatch + middleware chain.
 *
 * Approach:
 * - `express()` returns an app that holds a list of layers. Each layer is either:
 *     * middleware: { type: 'mw', path, fn }            — runs for the path prefix
 *     * route:      { type: 'route', method, path, fn } — runs when method+path match
 * - `app.use([path], fn)` registers middleware. `app.get/post/...` register routes.
 * - `app.handle(req, res)` walks the layer list in order, calling each handler with
 *   `(req, res, next)`. `next()` advances to the next matching layer; `next(err)`
 *   skips to the next error-handling middleware (4-arg function).
 * - `pathToRegex` supports exact paths and `:param` placeholders.
 *
 * Pure JS; we simulate req/res with plain objects so this runs anywhere.
 */

function pathToRegex(path, opts = {}) {
  const keys = [];
  const end = opts.end !== false;
  const pattern = new RegExp(
    (end ? "^" : "^") +
      path
        .replace(/[.+*?^$(){}|[\]\\]/g, "\\$&")
        .replace(/\/$/, "")
        .replace(/:[^/]+/g, (m) => {
          keys.push(m.slice(1));
          return "([^/]+)";
        }) +
      (end ? "/?$" : "(?=/|$)"),
  );
  return { pattern, keys };
}

function matchLayer(layer, url) {
  if (layer.type === "mw") {
    // Middleware matches as a prefix.
    if (layer.path === "/" || layer.path === "") return { params: {} };
    if (
      url === layer.path ||
      url.startsWith(layer.path + "/") ||
      url.startsWith(layer.path)
    ) {
      return { params: {} };
    }
    return null;
  }
  const { pattern, keys } = layer.regex;
  const m = pattern.exec(url.split("?")[0]);
  if (!m) return null;
  const params = {};
  keys.forEach((k, i) => {
    params[k] = decodeURIComponent(m[i + 1]);
  });
  return { params };
}

function express() {
  const stack = [];

  function use(...args) {
    let path = "/";
    let fns = args;
    if (typeof args[0] === "string") {
      path = args[0];
      fns = args.slice(1);
    }
    fns.forEach((fn) => stack.push({ type: "mw", path, fn }));
    return app;
  }

  function _route(method) {
    return function (path, ...fns) {
      fns.forEach((fn) =>
        stack.push({
          type: "route",
          method,
          path,
          fn,
          regex: pathToRegex(path, { end: true }),
        }),
      );
      return app;
    };
  }

  function handle(req, res, done) {
    req.params = req.params || {};
    let idx = 0;
    function next(err) {
      const layer = stack[idx++];
      if (!layer) {
        if (done) return done(err);
        if (err) {
          res.statusCode = 500;
          res.end = res.end || (() => {});
          res.end("Internal Error");
        }
        return;
      }
      // Method match for routes.
      if (
        layer.type === "route" &&
        layer.method.toUpperCase() !== (req.method || "GET").toUpperCase()
      ) {
        return next(err);
      }
      const matched = matchLayer(layer, req.url || "/");
      if (!matched) return next(err);
      Object.assign(req.params, matched.params);
      try {
        if (err) {
          // Skip to error handler (4-arg middleware).
          if (layer.fn.length >= 4) layer.fn(err, req, res, next);
          else next(err);
        } else {
          if (layer.fn.length >= 4)
            next(err); // error handler skipped when no err
          else layer.fn(req, res, next);
        }
      } catch (e) {
        next(e);
      }
    }
    next(null);
  }

  const app = {
    stack,
    use,
    get: _route("get"),
    post: _route("post"),
    put: _route("put"),
    delete: _route("delete"),
    patch: _route("patch"),
    handle,
    listen() {
      /* no-op for tests */ return app;
    },
  };
  return app;
}

// ---------- Test cases ----------
function run(app, method, url) {
  const req = { method, url, params: {} };
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    set(k, v) {
      this.headers[k] = v;
    },
    end(b) {
      this.body = b;
    },
  };
  app.handle(req, res);
  return { req, res };
}

const app = express();
app.use((req, res, next) => {
  req.log = ["mw1"];
  next();
});
app.use((req, res, next) => {
  req.log.push("mw2");
  next();
});
app.get("/", (req, res) => {
  res.end("home:" + req.log.join(","));
});
app.get("/users/:id", (req, res) => {
  res.end("user:" + req.params.id);
});
app.use((err, req, res, next) => {
  res.statusCode = 500;
  res.end("err:" + err.message);
});
app.get("/boom", () => {
  throw new Error("kaboom");
});

const r1 = run(app, "GET", "/");
console.log("GET / ->", r1.res.body); // expected: home:mw1,mw2

const r2 = run(app, "GET", "/users/42");
console.log("GET /users/42 ->", r2.res.body); // expected: user:42

const r3 = run(app, "GET", "/boom");
console.log("GET /boom ->", r3.res.statusCode, r3.res.body); // expected: 500 err:kaboom

const r4 = run(app, "POST", "/");
console.log("POST / (no route) ->", r4.res.body); // expected: undefined (no match -> nothing ends response)
