/**
 * 手写主题色切换（CSS 变量方式）
 * Switch theme colors by updating CSS custom properties on :root.
 *
 * Approach:
 * - Themes are plain objects mapping CSS variable names (without the leading
 *   `--`) to color values: e.g. { primary: '#1890ff', bg: '#fff', text: '#333' }.
 * - `applyTheme(theme)` writes each variable to document.documentElement.style
 *   via `setProperty('--name', value)`.
 * - `setTheme(name)` looks up the registered theme, applies it, persists the
 *   name in localStorage, and notifies subscribers.
 * - `registerTheme(name, theme)` adds a new theme at runtime.
 * - `toggle([a, b])` flips between two named themes.
 * - Provide `getTheme()`, `subscribe()`, `getAllThemes()`.
 *
 * Browser-only; in Node we keep an in-memory variable map for testing.
 *
 * @param {Record<string, Record<string, string>>} themes - { light: {...}, dark: {...} }
 * @param {string} [initialName]
 * @returns {{setTheme:Function, applyTheme:Function, registerTheme:Function, toggle:Function, getTheme:Function, getVariables:Function, subscribe:Function, getAllThemes:Function}}
 */
function createThemeColorToggle(themes, initialName) {
  const registry = { ...themes };
  const STORAGE_KEY = "theme-color";
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const subscribers = new Set();
  let currentName = initialName || Object.keys(registry)[0] || "default";
  // In-memory CSS variable store for Node tests.
  const varStore = {};

  function applyTheme(themeObj) {
    for (const [key, value] of Object.entries(themeObj)) {
      const cssVar = key.startsWith("--") ? key : "--" + key;
      varStore[cssVar] = value;
      if (isBrowser) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    }
  }

  function setTheme(name) {
    if (!registry[name]) return false;
    currentName = name;
    applyTheme(registry[name]);
    if (isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, name);
      } catch {
        /* ignore */
      }
    }
    subscribers.forEach((fn) => {
      try {
        fn(name, registry[name]);
      } catch (e) {
        /* swallow */
      }
    });
    return true;
  }

  // Seed.
  let storedName = null;
  if (isBrowser) {
    try {
      storedName = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  setTheme(storedName && registry[storedName] ? storedName : currentName);

  return {
    setTheme,
    applyTheme,
    registerTheme(name, themeObj) {
      registry[name] = themeObj;
    },
    toggle(a, b) {
      const next = currentName === a ? b : a;
      return setTheme(next) ? next : currentName;
    },
    getTheme() {
      return currentName;
    },
    getVariables() {
      return { ...varStore };
    },
    getAllThemes() {
      return Object.keys(registry);
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}

// ---------- Test cases ----------
const themes = {
  ocean: { primary: "#1890ff", bg: "#ffffff", text: "#333333" },
  sunset: { primary: "#ff7a45", bg: "#fff7e6", text: "#5c3a1e" },
  forest: { primary: "#52c41a", bg: "#f6ffed", text: "#234d12" },
};

const theme = createThemeColorToggle(themes, "ocean");
console.log("initial theme:", theme.getTheme()); // expected: ocean
console.log("initial vars:", theme.getVariables());
// expected: { '--primary': '#1890ff', '--bg': '#ffffff', '--text': '#333333' }

const events = [];
const unsub = theme.subscribe((name) => events.push(name));

theme.setTheme("sunset");
console.log("after setTheme sunset:", theme.getTheme()); // expected: sunset
console.log("primary var:", theme.getVariables()["--primary"]); // expected: #ff7a45

theme.toggle("sunset", "forest");
console.log("after toggle sunset/forest:", theme.getTheme()); // expected: forest

theme.toggle("sunset", "forest");
console.log("toggle again:", theme.getTheme()); // expected: sunset

theme.registerTheme("night", {
  primary: "#722ed1",
  bg: "#141414",
  text: "#ffffff",
});
console.log("all themes:", theme.getAllThemes()); // expected: ['ocean','sunset','forest','night']

theme.setTheme("night");
console.log("after setTheme night:", theme.getVariables()["--bg"]); // expected: #141414

console.log("subscriber events:", events); // expected: ['sunset','forest','sunset','night']

unsub();
theme.setTheme("ocean");
console.log("events after unsubscribe:", events.length); // expected: 4
