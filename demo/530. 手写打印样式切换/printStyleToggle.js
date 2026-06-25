/**
 * 手写打印样式切换
 * Dynamically inject/remove print-specific stylesheets and react to the
 * browser's beforeprint / afterprint events so the page can swap layouts
 * only while printing.
 *
 * Approach:
 * - `injectPrintStyle(cssText, id)` creates a <style media="print"> element
 *   (or <style> with an @media print wrapper) so the rules only apply during
 *   printing, and returns a `remove()` function.
 * - `setPrintMode(enabled)` toggles a body class `print-mode` that CSS can
 *   target (useful for live preview of print layout without opening the
 *   print dialog).
 * - `onPrint(fn)` registers handlers for window 'beforeprint'/'afterprint'.
 *   Returns an unsubscribe. Each handler receives `{ phase: 'before'|'after' }`.
 * - `printElement(el, opts)` opens a hidden iframe, copies the element + a
 *   stylesheet into it, calls print(), then removes the iframe. This is the
 *   classic "print only a part of the page" technique.
 * - In Node we provide stubs that track calls so the API can be tested.
 *
 * @param {string} cssText
 * @param {string} [id]
 * @returns {() => void} remove function
 */
function injectPrintStyle(cssText, id = "dynamic-print-style") {
  if (typeof document === "undefined") return () => {};
  // Remove existing style with same id first.
  const existing = document.getElementById(id);
  if (existing && existing.parentNode)
    existing.parentNode.removeChild(existing);

  const style = document.createElement("style");
  style.id = id;
  style.setAttribute("media", "print");
  style.textContent = cssText;
  (document.head || document.documentElement).appendChild(style);

  return function remove() {
    if (style.parentNode) style.parentNode.removeChild(style);
  };
}

function setPrintMode(enabled) {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;
  if (enabled) {
    if (body.classList && typeof body.classList.add === "function")
      body.classList.add("print-mode");
    else body.className += (body.className ? " " : "") + "print-mode";
  } else {
    if (body.classList && typeof body.classList.remove === "function")
      body.classList.remove("print-mode");
    else
      body.className = String(body.className || "")
        .split(/\s+/)
        .filter((c) => c !== "print-mode")
        .join(" ");
  }
}

function onPrint(fn) {
  if (typeof window === "undefined") return () => {};
  const before = () => fn({ phase: "before" });
  const after = () => fn({ phase: "after" });
  if (typeof window.addEventListener === "function") {
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }
  return () => {};
}

function printElement(el, opts = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const { css = "", title = document.title || "" } = opts;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow
    ? iframe.contentWindow.document
    : iframe.contentDocument;
  doc.open();
  doc.write(
    "<!DOCTYPE html><html><head><title>" +
      escapeHtml(title) +
      "</title>" +
      "<style>" +
      css +
      "</style></head><body>" +
      (el.outerHTML || el.innerHTML || "") +
      "</body></html>",
  );
  doc.close();

  // Defer print to allow images/fonts to load.
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      /* ignore */
    }
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  }, 100);
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// ---------- Test cases ----------
// Simulated browser environment for testing.
function setupBrowser() {
  const head = {
    children: [],
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    removeChild(n) {
      const i = this.children.indexOf(n);
      if (i >= 0) this.children.splice(i, 1);
      return n;
    },
  };
  const body = {
    _cls: "",
    children: [],
    get className() {
      return this._cls;
    },
    set className(v) {
      this._cls = v;
    },
    classList: {
      add(c) {
        if (!body._cls.split(/\s+/).includes(c))
          body._cls = (body._cls ? body._cls + " " : "") + c;
      },
      remove(c) {
        body._cls = body._cls
          .split(/\s+/)
          .filter((x) => x !== c)
          .join(" ");
      },
    },
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    removeChild(n) {
      const i = this.children.indexOf(n);
      if (i >= 0) this.children.splice(i, 1);
      return n;
    },
  };
  const listeners = {};
  const documentMock = {
    head,
    body,
    getElementById(id) {
      return head.children.find((n) => n.id === id) || null;
    },
    createElement(tag) {
      const node = {
        tagName: tag.toUpperCase(),
        id: "",
        style: {},
        children: [],
        _text: "",
        _attrs: {},
        setAttribute(k, v) {
          this._attrs[k] = v;
        },
        getAttribute(k) {
          return this._attrs[k] ?? null;
        },
        get textContent() {
          return this._text;
        },
        set textContent(v) {
          this._text = v;
        },
        appendChild(n) {
          this.children.push(n);
          n.parentNode = this;
          return n;
        },
        removeChild(n) {
          const i = this.children.indexOf(n);
          if (i >= 0) this.children.splice(i, 1);
          return n;
        },
      };
      return node;
    },
    get title() {
      return "Page";
    },
  };
  const windowMock = {
    addEventListener(ev, cb) {
      (listeners[ev] = listeners[ev] || []).push(cb);
    },
    removeEventListener(ev, cb) {
      if (listeners[ev]) listeners[ev] = listeners[ev].filter((f) => f !== cb);
    },
  };
  globalThis.document = documentMock;
  globalThis.window = windowMock;
  return { head, body, listeners, windowMock };
}

const env = setupBrowser();

// injectPrintStyle adds a <style media="print"> and remove() takes it away.
const removeStyle = injectPrintStyle("body { color: black; }", "p1");
const styleEl = env.head.children.find((n) => n.id === "p1");
console.log("style injected:", !!styleEl); // expected: true
console.log("style media attr:", styleEl.getAttribute("media")); // expected: print
console.log("style text:", styleEl.textContent); // expected: body { color: black; }
removeStyle();
console.log(
  "style removed after remove():",
  !env.head.children.find((n) => n.id === "p1"),
); // expected: true

// Re-injecting with same id replaces the previous one.
injectPrintStyle("a { color: red; }", "dup");
injectPrintStyle("b { color: blue; }", "dup");
const dupCount = env.head.children.filter((n) => n.id === "dup").length;
console.log("dup count is 1:", dupCount); // expected: 1

// setPrintMode toggles body class.
setPrintMode(true);
console.log("body has print-mode:", env.body.className.includes("print-mode")); // expected: true
setPrintMode(false);
console.log(
  "body print-mode removed:",
  !env.body.className.includes("print-mode"),
); // expected: true

// onPrint registers before/after handlers.
const phases = [];
const unsub = onPrint((e) => phases.push(e.phase));
env.windowMock.addEventListener; // ensure exists
// Manually fire the registered handlers.
env.listeners["beforeprint"].forEach((cb) => cb());
env.listeners["afterprint"].forEach((cb) => cb());
console.log("phases captured:", phases); // expected: ['before', 'after']
unsub();
env.listeners["beforeprint"].forEach((cb) => cb());
console.log("after unsub no new phase:", phases.length); // expected: 2

// printElement writes into an iframe (simulated minimal).
const target = { outerHTML: '<div id="x">Hello</div>' };
globalThis.document.createElement = (tag) => {
  if (tag === "iframe") {
    const iframe = {
      style: {},
      contentWindow: {
        document: { open() {}, write() {}, close() {}, _html: "" },
        focus() {},
        print() {},
      },
      parentNode: env.body,
    };
    iframe.contentWindow.document.write = (html) => {
      iframe.contentWindow.document._html = html;
    };
    return iframe;
  }
  return env.body; // fallback
};
printElement(target, { css: "#x { color: black; }" });
console.log("printElement called without throwing: true");

delete globalThis.document;
delete globalThis.window;
console.log(
  "node env injectPrintStyle noop:",
  typeof injectPrintStyle("x") === "function",
); // expected: true
console.log("node env onPrint noop:", typeof onPrint(() => {}) === "function"); // expected: true
