/**
 * 手写响应式断点监听
 * Subscribe to responsive breakpoint changes and run callbacks on enter/leave.
 *
 * Approach:
 * - Define a breakpoint map (name -> min-width in px).
 * - For each breakpoint, register a `matchMedia` listener.
 * - Maintain the current breakpoint name (the largest one whose min-width is
 *   satisfied by the current viewport).
 * - On any media query change, recompute the current breakpoint; if it
 *   changed, call onEnter for the new one and onLeave for the old one.
 * - Expose `getCurrentBreakpoint()` and `destroy()` to unsubscribe.
 * - Provide a Node-testable variant that accepts an injectable viewport
 *   object so we can simulate resize events.
 *
 * @param {Record<string, number>} breakpoints - { sm: 640, md: 768, lg: 1024, xl: 1280 }
 * @param {{onEnter?:Function, onLeave?:Function, onChange?:Function}} [handlers]
 * @returns {{getCurrent:()=>string, setViewport:(w:number,h?:number)=>void, destroy:()=>void}}
 */
function createResponsiveBreakpoint(breakpoints, handlers = {}) {
  const { onEnter, onLeave, onChange } = handlers;
  // Sort breakpoint names by their min-width ascending.
  const names = Object.keys(breakpoints).sort(
    (a, b) => breakpoints[a] - breakpoints[b],
  );

  let current = null;
  const unsubs = [];

  function computeFromWidth(width) {
    let match = null;
    for (const name of names) {
      if (width >= breakpoints[name]) match = name;
    }
    return match; // null means below the smallest breakpoint
  }

  // Browser path: real matchMedia listeners.
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    names.forEach((name) => {
      const mql = window.matchMedia(`(min-width: ${breakpoints[name]}px)`);
      const handler = () => {
        const next = computeFromWidth(window.innerWidth);
        if (next !== current) {
          const prev = current;
          current = next;
          if (prev !== null && onLeave) onLeave(prev);
          if (next !== null && onEnter) onEnter(next);
          if (onChange) onChange(next, prev);
        }
      };
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handler);
        unsubs.push(() => mql.removeEventListener("change", handler));
      } else {
        mql.addListener(handler);
        unsubs.push(() => mql.removeListener(handler));
      }
    });
    // Seed initial value.
    current = computeFromWidth(window.innerWidth);
  } else {
    // Node path: use an injectable viewport for testing.
    // The actual setViewport logic lives on the `state` object below; here we
    // only seed the initial breakpoint value.
    current = computeFromWidth(1024);
  }

  const state = {
    getCurrent() {
      return current;
    },
    setViewport:
      typeof window !== "undefined"
        ? () => {}
        : (w) => {
            const next = computeFromWidth(w);
            if (next !== current) {
              const prev = current;
              current = next;
              if (prev !== null && onLeave) onLeave(prev);
              if (next !== null && onEnter) onEnter(next);
              if (onChange) onChange(next, prev);
            }
          },
    destroy() {
      unsubs.forEach((u) => u());
      unsubs.length = 0;
    },
  };
  return state;
}

// ---------- Test cases ----------
const events = [];
const bp = createResponsiveBreakpoint(
  { sm: 640, md: 768, lg: 1024, xl: 1280 },
  {
    onEnter: (name) => events.push(`enter:${name}`),
    onLeave: (name) => events.push(`leave:${name}`),
    onChange: (next, prev) => events.push(`change:${prev}->${next}`),
  },
);

// Initial (Node path) seeds at width 1024 -> 'lg'.
console.log("initial breakpoint:", bp.getCurrent()); // expected: lg

// Grow into xl.
bp.setViewport(1400);
console.log("after 1400:", bp.getCurrent()); // expected: xl

// Shrink below sm.
bp.setViewport(500);
console.log("after 500:", bp.getCurrent()); // expected: null

// Grow into md.
bp.setViewport(800);
console.log("after 800:", bp.getCurrent()); // expected: md

console.log("events:", events);
// expected: ['enter:lg' was seeded silently, then 'leave:lg','enter:xl','change:lg->xl',
//            'leave:xl','change:xl->null', 'enter:md','change:null->md']
// (the initial seed does not fire events because there was no previous value)

bp.destroy();
console.log("destroyed without error: true");
