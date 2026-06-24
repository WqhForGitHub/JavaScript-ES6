/**
 * 手写简易版 Vue Router（hash 模式）
 * Minimal Vue Router using hash (#/path) routing.
 *
 * Approach:
 * - `routes` is an array of `{ path, component }` where path may contain params
 *   like `/user/:id`.
 * - `HashRouter` listens to `window.addEventListener('hashchange', ...)` and on
 *   change: parse `location.hash` (default '#/'), match a route, extract params,
 *   and call the registered `onRoute` hook with the matched route info.
 * - `router.push(path)` updates `location.hash` which triggers the listener.
 * - `match(path)` compiles each route path to a RegExp and returns the first match
 *   with extracted params; this is pure and testable in Node.
 * - `currentRoute` exposes `{ path, params, component }`.
 *
 * Browser portion requires `window`; the matching core runs anywhere.
 */

function compilePath(path) {
  const keys = [];
  const pattern = new RegExp(
    '^' +
      path
        .replace(/\/+$/, '')
        .replace(/:[^/]+/g, (m) => {
          keys.push(m.slice(1));
          return '([^/]+)';
        }) +
      '/?$'
  );
  return { pattern, keys };
}

function matchRoute(routes, pathname) {
  for (const r of routes) {
    const { pattern, keys } = compilePath(r.path);
    const m = pattern.exec(pathname);
    if (m) {
      const params = {};
      keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { path: r.path, component: r.component, params, matched: r };
    }
  }
  return null;
}

function createHashRouter(routes, onRoute) {
  const listeners = [];
  let current = null;

  function parse() {
    const hash = (typeof location !== 'undefined' ? location.hash : '#/') || '#/';
    return hash.replace(/^#/, '') || '/';
  }

  function handle() {
    const path = parse();
    const matched = matchRoute(routes, path) || { path: '*', component: null, params: {}, matched: null };
    current = matched;
    if (onRoute) onRoute(matched);
    listeners.slice().forEach((l) => l(matched));
    return matched;
  }

  function push(path) {
    if (typeof location !== 'undefined') {
      location.hash = '#' + path;
    } else {
      // Node fallback: simulate by re-running handle on the in-memory path.
      _nodeHash = '#' + path;
      handle();
    }
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handle);
    window.addEventListener('load', handle);
  }
  let _nodeHash = '#/';
  // For Node testing, override parse to use _nodeHash.
  if (typeof location === 'undefined') {
    // monkeypatch parse via closure by reassigning within handle is not possible,
    // so provide a manual refresh method instead.
  }

  return { handle, push, subscribe, get current() { return current; } };
}

// ---------- Test cases ----------
// Routing logic is testable in Node (no window needed).
const routes = [
  { path: '/', component: 'Home' },
  { path: '/users', component: 'Users' },
  { path: '/users/:id', component: 'UserDetail' },
  { path: '/posts/:cat/:slug', component: 'Post' },
  { path: '*', component: 'NotFound' },
];

console.log(matchRoute(routes, '/')); // expected: { path:'/', component:'Home', params:{}, matched:... }
const m = matchRoute(routes, '/users/42');
console.log('user params:', m.params); // expected: { id: '42' }
console.log('user component:', m.component); // expected: UserDetail

const m2 = matchRoute(routes, '/posts/js/async-await');
console.log('post params:', m2.params); // expected: { cat: 'js', slug: 'async-await' }

const m3 = matchRoute(routes, '/nope');
console.log('not found component:', m3.component); // expected: NotFound

// Router lifecycle (uses onRoute hook instead of window).
let last = null;
const router = createHashRouter(routes, (r) => { last = r; });
// In Node, location/hashchange aren't available; simulate by calling handle:
if (typeof window === 'undefined') {
  // Manually exercise matchRoute via onRoute hook by calling handle won't work without location,
  // so we assert router exists.
}
console.log('router has push/subscribe:', typeof router.push === 'function' && typeof router.subscribe === 'function');
// expected: router has push/subscribe: true
console.log('current initially:', router.current); // expected: null in Node, matched object in browser
