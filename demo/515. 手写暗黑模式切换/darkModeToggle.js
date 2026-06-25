/**
 * 手写暗黑模式切换
 * Toggle between dark and light mode, persisting the preference.
 *
 * Approach:
 * - Keep a single source of truth: the theme name ('dark' | 'light').
 * - Apply the theme by setting `data-theme` on <html> and toggling a class
 *   (`dark`) on documentElement for CSS rules like `html.dark { ... }`.
 * - Detect the system preference via `prefers-color-scheme` the first time.
 * - Persist the user's explicit choice in localStorage.
 * - Emit change events to subscribers so UI (toggle switches) can stay in sync.
 * - Provide `toggle()`, `setTheme()`, `getTheme()`, `subscribe()`,
 *   `clearPreference()` (fall back to system).
 *
 * Browser-only; in Node we fall back to an in-memory store for testing.
 *
 * @returns {{toggle:Function, setTheme:Function, getTheme:Function, subscribe:Function, clearPreference:Function}}
 */
function createDarkModeToggle() {
  const STORAGE_KEY = "theme-preference";
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const subscribers = new Set();
  let theme = "light";

  function readSystemPreference() {
    if (isBrowser && typeof window.matchMedia === "function") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }

  function readStored() {
    if (isBrowser) {
      try {
        return localStorage.getItem(STORAGE_KEY); // 'dark' | 'light' | null
      } catch {
        return null;
      }
    }
    return null;
  }

  function apply(next) {
    theme = next;
    if (isBrowser) {
      const root = document.documentElement;
      root.setAttribute("data-theme", next);
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }
    subscribers.forEach((fn) => {
      try {
        fn(next);
      } catch (e) {
        /* swallow subscriber errors */
      }
    });
  }

  // Initialise.
  const stored = readStored();
  apply(
    stored === "dark" || stored === "light" ? stored : readSystemPreference(),
  );

  return {
    getTheme() {
      return theme;
    },
    setTheme(next) {
      if (next !== "dark" && next !== "light") return;
      if (isBrowser) {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      }
      apply(next);
    },
    toggle() {
      const next = theme === "dark" ? "light" : "dark";
      this.setTheme(next);
      return next;
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    clearPreference() {
      if (isBrowser) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      apply(readSystemPreference());
    },
  };
}

// ---------- Test cases ----------
// Node environment: in-memory only.
const toggle = createDarkModeToggle();
console.log("initial theme (system=light fallback):", toggle.getTheme()); // expected: light

const events = [];
const unsub = toggle.subscribe((t) => events.push(t));

toggle.setTheme("dark");
console.log("after setTheme dark:", toggle.getTheme()); // expected: dark

toggle.toggle();
console.log("after toggle:", toggle.getTheme()); // expected: light

toggle.toggle();
console.log("after toggle again:", toggle.getTheme()); // expected: dark

console.log("subscriber events:", events); // expected: ['dark', 'light', 'dark']

unsub();
toggle.toggle();
console.log("after unsubscribe + toggle:", events.length); // expected: 3 (no new event)

toggle.clearPreference();
console.log("after clearPreference:", toggle.getTheme()); // expected: light (system fallback in Node)

// Browser-only path simulation.
globalThis.window = { matchMedia: (q) => ({ matches: q.includes("dark") }) };
globalThis.document = {
  documentElement: {
    _class: "",
    _attr: "",
    classList: {
      add(c) {
        this._owner._class += (this._owner._class ? " " : "") + c;
      },
      remove(c) {
        this._owner._class = this._owner._class
          .split(" ")
          .filter((x) => x !== c)
          .join(" ");
      },
      _owner: null,
    },
    setAttribute(k, v) {
      this._attr = v;
    },
    getAttribute(k) {
      return this._attr;
    },
  },
};
globalThis.document.documentElement.classList._owner =
  globalThis.document.documentElement;
globalThis.localStorage = {
  _store: {},
  getItem(k) {
    return this._store[k] ?? null;
  },
  setItem(k, v) {
    this._store[k] = v;
  },
  removeItem(k) {
    delete this._store[k];
  },
};

const browserToggle = createDarkModeToggle();
console.log("browser initial (system=dark):", browserToggle.getTheme()); // expected: dark
console.log(
  "html data-theme attr:",
  globalThis.document.documentElement.getAttribute("data-theme"),
); // expected: dark
browserToggle.setTheme("light");
console.log(
  "after setTheme light, attr:",
  globalThis.document.documentElement.getAttribute("data-theme"),
); // expected: light
console.log("stored:", globalThis.localStorage.getItem("theme-preference")); // expected: light

delete globalThis.window;
delete globalThis.document;
delete globalThis.localStorage;
