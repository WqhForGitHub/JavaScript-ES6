/**
 * 责任链模式 (Chain of Responsibility Pattern)
 *
 * Approach:
 * - Pass a request along a chain of handlers. Each handler decides either to
 *   handle the request (and stop the chain) or to pass it on to the next handler.
 * - Decouples sender from receiver: the sender just kicks off the chain and does
 *   not know which handler will ultimately process the request.
 * - We implement:
 *   1. A linked-list style chain (handler.setNext(next)) returning the next so
 *      handlers can be wired fluently: A.setNext(B).setNext(C).
 *   2. Handlers for an HTTP-style request: Auth -> Logger -> Cache -> Final.
 *   3. A pipeline variant where handlers can short-circuit OR forward, returning a
 *      result; if none handles, returns a default.
 */

class Handler {
  constructor() {
    this.next = null;
  }
  setNext(handler) {
    this.next = handler;
    return handler; // fluent wiring
  }
  handle(request) {
    if (this.next) return this.next.handle(request);
    return { handled: false, request };
  }
}

// ---- Concrete handlers ----
class AuthHandler extends Handler {
  handle(req) {
    if (!req.token) return { handled: true, by: "Auth", error: "No token" };
    req.user = `user-from-${req.token}`;
    return super.handle(req);
  }
}

class LoggerHandler extends Handler {
  handle(req) {
    console.log(`[log] ${req.method} ${req.path} user=${req.user || "-"}`);
    return super.handle(req);
  }
}

class CacheHandler extends Handler {
  constructor() {
    super();
    this.cache = new Map();
  }
  handle(req) {
    if (req.method === "GET" && this.cache.has(req.path)) {
      return { handled: true, by: "Cache", body: this.cache.get(req.path) };
    }
    const result = super.handle(req);
    if (req.method === "GET" && result.handled && result.body) {
      this.cache.set(req.path, result.body);
    }
    return result;
  }
}

class BusinessHandler extends Handler {
  handle(req) {
    if (req.path === "/profile") {
      return { handled: true, by: "Business", body: { name: "Alice" } };
    }
    if (req.path === "/dashboard") {
      return { handled: true, by: "Business", body: { widgets: 3 } };
    }
    return super.handle(req); // not handled -> fall through to default
  }
}

// Build chain: auth -> logger -> cache -> business
function buildChain() {
  const auth = new AuthHandler();
  auth
    .setNext(new LoggerHandler())
    .setNext(new CacheHandler())
    .setNext(new BusinessHandler());
  return auth;
}

// ---- Functional variant ----
function createChain(handlers, fallback) {
  return (req) => {
    for (const h of handlers) {
      const res = h(req);
      if (res && res.handled) return res;
    }
    return fallback(req);
  };
}

// ---------------- Test cases ----------------
const chain = buildChain();

// Missing token -> blocked at Auth
console.log(chain.handle({ method: "GET", path: "/profile" }));
// Expected: { handled: true, by: 'Auth', error: 'No token' }

// Authenticated request flows through to Business, then cached on second call
console.log(chain.handle({ method: "GET", path: "/profile", token: "abc" }));
// Expected: { handled: true, by: 'Business', body: { name: 'Alice' } }
console.log(chain.handle({ method: "GET", path: "/profile", token: "abc" }));
// Expected: { handled: true, by: 'Cache', body: { name: 'Alice' } }

// Unknown path falls through to default (unhandled)
console.log(chain.handle({ method: "GET", path: "/unknown", token: "abc" }));
// Expected: { handled: false, request: { method: 'GET', path: '/unknown', token: 'abc', user: 'user-from-abc' } }

// Functional chain variant
const fnChain = createChain(
  [
    (r) => (r.kind === "a" ? { handled: true, v: "A" } : null),
    (r) => (r.kind === "b" ? { handled: true, v: "B" } : null),
  ],
  (r) => ({ handled: true, v: "default", r }),
);
console.log(fnChain({ kind: "b" }), fnChain({ kind: "z" }));
// Expected: { handled: true, v: 'B' } { handled: true, v: 'default', r: { kind: 'z' } }
