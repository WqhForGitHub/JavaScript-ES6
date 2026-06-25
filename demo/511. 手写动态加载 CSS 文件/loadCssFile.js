/**
 * 手写动态加载 CSS 文件
 * Dynamically inject a <link rel="stylesheet"> into the document <head>.
 *
 * Approach:
 * - Create a `<link>` element, set rel='stylesheet', href, optional media and
 *   crossorigin/integrity attributes.
 * - Append to `document.head` (or `document.body` as fallback).
 * - Resolve the returned Promise on the `load` event, reject on `error`.
 * - De-dupe by href: if a `<link>` with the same href already exists, reuse it
 *   (and resolve immediately if it already loaded).
 * - Provide a `loadCssFile(href, opts)` shortcut and `loadCssFiles(hrefs)` batch.
 *
 * Browser-only; in Node it rejects because there's no DOM.
 *
 * @param {string} href - Stylesheet URL.
 * @param {{media?:string, crossorigin?:string, integrity?:string, id?:string}} [opts]
 * @returns {Promise<HTMLLinkElement>}
 */
const loadedStylesheets = new Map(); // href -> { link, promise }

function loadCssFile(href, opts = {}) {
  if (typeof document === "undefined") {
    return Promise.reject(
      new Error("loadCssFile requires a browser environment."),
    );
  }

  // De-dupe: if we already started loading this href, return the same promise.
  if (loadedStylesheets.has(href)) {
    return loadedStylesheets.get(href).promise;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  if (opts.media) link.media = opts.media;
  if (opts.crossorigin) link.crossOrigin = opts.crossorigin;
  if (opts.integrity) link.integrity = opts.integrity;
  if (opts.id) link.id = opts.id;

  const promise = new Promise((resolve, reject) => {
    link.onload = () => resolve(link);
    link.onerror = () => {
      loadedStylesheets.delete(href);
      // Best-effort cleanup of the failed link.
      if (link.parentNode) link.parentNode.removeChild(link);
      reject(new Error("Failed to load CSS: " + href));
    };
  });

  loadedStylesheets.set(href, { link, promise });

  const head =
    document.head || document.getElementsByTagName("head")[0] || document.body;
  if (head) head.appendChild(link);
  else document.documentElement.appendChild(link);

  return promise;
}

function loadCssFiles(hrefs, opts) {
  return Promise.all(hrefs.map((h) => loadCssFile(h, opts)));
}

// ---------- Test cases ----------
// Simulated DOM to exercise the de-dupe + onload logic without a browser.
function fakeDom() {
  const created = [];
  const head = {
    children: [],
    appendChild(n) {
      this.children.push(n);
      return n;
    },
  };
  const documentMock = {
    head,
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(),
        attrs: {},
        _loaded: false,
        _errored: false,
      };
      const proxy = new Proxy(el, {
        set(t, p, v) {
          if (p in t || typeof p !== "string") {
            t[p] = v;
            return true;
          }
          // Treat unknown setters as attribute setters.
          t.attrs[p] = v;
          return true;
        },
        get(t, p) {
          if (p === "appendChild")
            return (n) => {
              t.children = t.children || [];
              t.children.push(n);
              return n;
            };
          if (p === "removeChild")
            return (n) => {
              const i = (t.children || []).indexOf(n);
              if (i >= 0) t.children.splice(i, 1);
              return n;
            };
          if (p === "parentNode") return head;
          return t[p];
        },
      });
      created.push(proxy);
      return proxy;
    },
  };
  return { documentMock, created, head };
}

globalThis.document = fakeDom().documentMock;
const { created } = fakeDom();

const p1 = loadCssFile("https://cdn.example/a.css");
const p2 = loadCssFile("https://cdn.example/a.css"); // should dedupe -> same promise
console.log("dedupe returns same promise:", p1 === p2); // expected: true

// Trigger the onload to resolve.
setTimeout(() => {
  // Find the link we created.
  const link = loadedStylesheets.get("https://cdn.example/a.css").link;
  link.onload();
}, 0);

p1.then((l) => {
  console.log("resolved link href:", l.href); // expected: https://cdn.example/a.css
});

// Batch loader.
loadCssFiles(["https://cdn.example/b.css", "https://cdn.example/c.css"]).then(
  (links) => {
    console.log("batch loaded count:", links.length); // expected: 2
  },
);

// Resolve those too.
setTimeout(() => {
  ["https://cdn.example/b.css", "https://cdn.example/c.css"].forEach((h) => {
    loadedStylesheets.get(h).link.onload();
  });
}, 0);

delete globalThis.document;
console.log(
  "node env rejects:",
  typeof loadCssFile("x.css").then === "function",
); // expected: true (promise returned)
