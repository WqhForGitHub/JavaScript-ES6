/**
 * 手写动态移除 CSS 文件
 * Dynamically remove a <link rel="stylesheet"> from the document by href,
 * by <link> element reference, or by id.
 *
 * Approach:
 * - Provide three matching strategies:
 *   1. exact href match (also tries absolute URL via link.href),
 *   2. element reference,
 *   3. element id.
 * - Walk document.querySelectorAll('link[rel="stylesheet"]') and filter.
 * - Remove matched nodes from their parent and return the removed list.
 * - Provide `removeAllCss()` to strip every stylesheet (useful for testing).
 * - Safe in Node: returns an empty array when there is no document.
 *
 * @param {{href?:string, el?:HTMLLinkElement, id?:string}} matcher
 * @returns {HTMLLinkElement[]} removed links
 */
function removeCssFile(matcher = {}) {
  if (typeof document === "undefined") return [];
  const { href, el, id } = matcher;
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  const toRemove = links.filter((link) => {
    if (el) return link === el;
    if (id) return link.id === id;
    if (href) {
      // Compare both raw attribute and resolved absolute href.
      return link.getAttribute("href") === href || link.href === href;
    }
    return false;
  });

  toRemove.forEach((link) => {
    if (link.parentNode) link.parentNode.removeChild(link);
  });

  return toRemove;
}

function removeAllCss() {
  if (typeof document === "undefined") return [];
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  links.forEach((link) => {
    if (link.parentNode) link.parentNode.removeChild(link);
  });
  return links;
}

// ---------- Test cases ----------
// Build a fake DOM so the logic can run under Node.
function setupFakeDom() {
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

  const makeLink = (attrs) => ({
    tagName: "LINK",
    _attrs: { rel: "stylesheet", ...attrs },
    parentNode: head,
    getAttribute(k) {
      return this._attrs[k] ?? null;
    },
    get href() {
      return this._attrs.href;
    },
    get id() {
      return this._attrs.id || "";
    },
    get rel() {
      return this._attrs.rel;
    },
  });

  const l1 = makeLink({ href: "https://cdn.example/a.css", id: "theme" });
  const l2 = makeLink({ href: "/static/b.css" });
  const l3 = makeLink({ href: "https://cdn.example/c.css" });
  head.children.push(l1, l2, l3);

  const documentMock = {
    head,
    querySelectorAll(sel) {
      // Pretend every link is rel="stylesheet".
      return head.children.filter((l) => l.tagName === "LINK");
    },
  };
  globalThis.document = documentMock;
  return { head, l1, l2, l3 };
}

const { head, l1, l2, l3 } = setupFakeDom();

// Remove by href (exact attribute match).
const removed1 = removeCssFile({ href: "/static/b.css" });
console.log("removed by href count:", removed1.length); // expected: 1
console.log("removed by href is l2:", removed1[0] === l2); // expected: true

// Remove by id.
const removed2 = removeCssFile({ id: "theme" });
console.log("removed by id count:", removed2.length); // expected: 1
console.log("removed by id is l1:", removed2[0] === l1); // expected: true

// Remove by element reference.
const removed3 = removeCssFile({ el: l3 });
console.log("removed by el count:", removed3.length); // expected: 1
console.log("removed by el is l3:", removed3[0] === l3); // expected: true

// Nothing left.
console.log("remaining links:", head.children.length); // expected: 0

// Re-add and removeAllCss.
head.children.push(l1, l2, l3);
const allRemoved = removeAllCss();
console.log("removeAllCss count:", allRemoved.length); // expected: 3

// Node-only env: no document -> empty array.
delete globalThis.document;
console.log("no document returns []:", removeCssFile({ href: "x.css" }).length); // expected: 0
