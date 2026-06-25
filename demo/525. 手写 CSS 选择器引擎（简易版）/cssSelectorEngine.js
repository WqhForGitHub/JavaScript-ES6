/**
 * 手写 CSS 选择器引擎（简易版）
 * A minimal CSS selector engine that supports a useful subset of selectors:
 *   - type:        div
 *   - universal:   *
 *   - class:       .item
 *   - id:          #main
 *   - attribute:   [data-x], [data-x="val"], [data-x^="pre"]
 *   - descendant:  div .item
 *   - child:       div > .item
 *   - compound:    div.item#main[data-x="y"]
 *   - comma group: a, b, c
 *
 * Approach:
 * - Split the selector by ',' into groups (top-level OR).
 * - Each group is split by '>' on whitespace into "compound" segments
 *   representing the parent->child chain. Whitespace-only splits mean
 *   descendant combinator; '>' means child combinator.
 * - Each compound selector is parsed into { tag, id, classes[], attrs[], universal }.
 * - Matching: start from all elements (descendants of the root), filter by
 *   the last compound, then walk up the parents verifying each preceding
 *   compound (child requires direct parent, descendant allows any ancestor).
 * - De-duplicate results preserving document order.
 * - `querySelectorEngine(root, selector)` returns an array; `selectOne` returns
 *   the first match or null.
 * - Provide a Node-testable fake DOM builder so the engine can be exercised.
 *
 * @param {Node} root
 * @param {string} selector
 * @returns {Node[]}
 */
function querySelectorEngine(root, selector) {
  if (!root || !selector) return [];
  const groups = splitTopLevel(selector, ",");
  const matched = new Set();
  for (const group of groups) {
    selectGroup(root, group.trim(), matched);
  }
  // Preserve document order using depth-first index.
  const ordered = [];
  walkDFS(root, (n) => {
    if (matched.has(n)) ordered.push(n);
  });
  return ordered;
}

function selectOne(root, selector) {
  const arr = querySelectorEngine(root, selector);
  return arr.length ? arr[0] : null;
}

function selectGroup(root, group, matched) {
  // Split into segments by whitespace, treating '>' specially.
  const tokens = group.split(/\s+/).filter(Boolean);
  const segments = [];
  let chain = []; // {compound, combinator} where combinator is the relation to the PREVIOUS segment
  let pendingCombinator = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === ">") {
      pendingCombinator = ">";
      continue;
    }
    if (pendingCombinator === ">") {
      chain.push({ compound: parseCompound(t), combinator: ">" });
    } else {
      chain.push({
        compound: parseCompound(t),
        combinator: chain.length === 0 ? null : " ",
      });
    }
    pendingCombinator = null;
  }
  if (chain.length === 0) return;

  // Find candidate leaves: all elements matching the last compound.
  const last = chain[chain.length - 1].compound;
  walkDFS(root, (node) => {
    if (node.nodeType !== 1) return;
    if (matchesCompound(node, last)) {
      // Verify ancestors back up the chain.
      if (verifyChain(node, chain, chain.length - 2)) {
        matched.add(node);
      }
    }
  });
}

function verifyChain(node, chain, idx) {
  if (idx < 0) return true;
  const segment = chain[idx];
  // The combinator stored on chain[idx+1] describes how chain[idx+1] relates
  // to chain[idx]; the compound we must match against ancestors is segment's
  // own compound (chain[idx].compound), NOT chain[idx+1].compound.
  const combinator = chain[idx + 1].combinator;
  const compound = segment.compound;
  if (combinator === ">") {
    // Direct parent must match.
    const parent = node.parentNode;
    if (!parent || !matchesCompound(parent, compound)) return false;
    return verifyChain(parent, chain, idx - 1);
  }
  // Descendant: any ancestor matches.
  let ancestor = node.parentNode;
  while (ancestor) {
    if (matchesCompound(ancestor, compound)) {
      if (verifyChain(ancestor, chain, idx - 1)) return true;
    }
    ancestor = ancestor.parentNode;
  }
  return false;
}

function parseCompound(str) {
  const compound = {
    tag: null,
    id: null,
    classes: [],
    attrs: [],
    universal: false,
  };
  let rest = str;
  while (rest.length > 0) {
    if (rest[0] === "*") {
      compound.universal = true;
      rest = rest.slice(1);
    } else if (rest[0] === "#") {
      const m = rest.match(/^#([\w-]+)/);
      compound.id = m[1];
      rest = rest.slice(m[0].length);
    } else if (rest[0] === ".") {
      const m = rest.match(/^\.([\w-]+)/);
      compound.classes.push(m[1]);
      rest = rest.slice(m[0].length);
    } else if (rest[0] === "[") {
      const m = rest.match(/^\[([\w-]+)(?:([~^$*|]?=)"?([^"\]]*)"?)?\]/);
      if (m) {
        compound.attrs.push({
          name: m[1],
          op: m[2] || null,
          value: m[3] != null ? m[3] : "",
        });
        rest = rest.slice(m[0].length);
      } else {
        rest = rest.slice(1);
      }
    } else {
      const m = rest.match(/^[a-zA-Z][\w-]*/);
      if (m) {
        compound.tag = m[0].toLowerCase();
        rest = rest.slice(m[0].length);
      } else {
        rest = rest.slice(1);
      }
    }
  }
  return compound;
}

function matchesCompound(node, compound) {
  if (compound.universal) return true;
  if (compound.tag && node.tagName.toLowerCase() !== compound.tag) return false;
  if (compound.id && node.id !== compound.id) return false;
  for (const cls of compound.classes) {
    if (!node.classList.includes(cls)) return false;
  }
  for (const attr of compound.attrs) {
    const actual = node.getAttribute ? node.getAttribute(attr.name) : null;
    if (actual == null) return false;
    if (!attr.op) continue;
    if (attr.op === "=") {
      if (actual !== attr.value) return false;
    } else if (attr.op === "^=") {
      if (!actual.startsWith(attr.value)) return false;
    } else if (attr.op === "$=") {
      if (!actual.endsWith(attr.value)) return false;
    } else if (attr.op === "*=") {
      if (!actual.includes(attr.value)) return false;
    } else if (attr.op === "~=") {
      if (!actual.split(/\s+/).includes(attr.value)) return false;
    }
  }
  return true;
}

function splitTopLevel(str, delim) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of str) {
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (ch === delim && depth === 0) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function walkDFS(node, cb) {
  cb(node);
  if (node.children) {
    for (const c of node.children) walkDFS(c, cb);
  }
}

// ---------- Test cases ----------
// Build a tiny fake DOM.
function el(tag, attrs = {}, children = []) {
  return {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    id: attrs.id || "",
    classList: (attrs.class || "").split(/\s+/).filter(Boolean),
    _attrs: { ...attrs },
    children,
    parentNode: null,
    getAttribute(name) {
      return this._attrs[name] != null ? this._attrs[name] : null;
    },
  };
}
function link(children) {
  children.forEach((c) => (c.parentNode = null)); // reset
  const linkAll = (n, parent) => {
    n.parentNode = parent;
    n.children.forEach((ch) => linkAll(ch, n));
  };
  children.forEach((c) => linkAll(c, null));
  return children;
}

// DOM:
// <div id="root">
//   <div class="row" data-x="1">
//     <span class="item">A</span>
//     <span class="item active">B</span>
//   </div>
//   <div class="row" data-x="2">
//     <p>P</p>
//   </div>
// </div>
const spanA = el("span", { class: "item" });
const spanB = el("span", { class: "item active" });
const p = el("p");
const row1 = el("div", { class: "row", "data-x": "1" }, [spanA, spanB]);
const row2 = el("div", { class: "row", "data-x": "2" }, [p]);
const root = el("div", { id: "root" }, [row1, row2]);
link([root]);

console.log("select .item count:", querySelectorEngine(root, ".item").length); // expected: 2
console.log(
  "select span.item count:",
  querySelectorEngine(root, "span.item").length,
); // expected: 2
console.log(
  "select .item.active count:",
  querySelectorEngine(root, ".item.active").length,
); // expected: 1
console.log("select #root count:", querySelectorEngine(root, "#root").length); // expected: 1
console.log("select div row:", querySelectorEngine(root, "div .row").length); // expected: 2 (descendant)
console.log(
  "select div>.row count:",
  querySelectorEngine(root, "div > .row").length,
); // expected: 2 (child of root div)
console.log(
  "select [data-x] count:",
  querySelectorEngine(root, "[data-x]").length,
); // expected: 2
console.log(
  'select [data-x="1"] count:',
  querySelectorEngine(root, '[data-x="1"]').length,
); // expected: 1
console.log(
  'select [data-x^="1"] count:',
  querySelectorEngine(root, '[data-x^="1"]').length,
); // expected: 1
console.log(
  "select p, .item count:",
  querySelectorEngine(root, "p, .item").length,
); // expected: 3 (2 spans + 1 p)
console.log("select * count:", querySelectorEngine(root, "*").length); // expected: 6 (root + 2 rows + 2 spans + p)
console.log(
  "selectOne .item.active is spanB:",
  selectOne(root, ".item.active") === spanB,
); // expected: true
console.log("selectOne .nonexistent null:", selectOne(root, ".nonexistent")); // expected: null
