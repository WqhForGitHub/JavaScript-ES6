/**
 * 组合模式 (Composite Pattern)
 *
 * Approach:
 * - Compose objects into tree structures to represent part-whole hierarchies.
 *   Composite lets clients treat individual objects and compositions of objects
 *   uniformly (same interface: operation()).
 * - Component declares the interface; Leaf performs the actual work; Composite
 *   stores children and delegates operation() to each child (recursively).
 * - We model a file system: Files (leaves) and Folders (composites). Operations
 *   like size(), display(), and find(name) work uniformly on any node.
 */

class FileSystemNode {
  constructor(name) {
    this.name = name;
  }
  size() {
    throw new Error("abstract");
  }
  display(indent = "") {
    throw new Error("abstract");
  }
  find(name) {
    return this.name === name ? this : null;
  }
  add() {
    throw new Error("Cannot add to a leaf");
  }
  remove() {
    throw new Error("Cannot remove from a leaf");
  }
}

class File extends FileSystemNode {
  constructor(name, size) {
    super(name);
    this._size = size;
  }
  size() {
    return this._size;
  }
  display(indent = "") {
    return `${indent}- ${this.name} (${this._size}B)`;
  }
}

class Folder extends FileSystemNode {
  constructor(name) {
    super(name);
    this.children = [];
  }
  add(node) {
    this.children.push(node);
    return this;
  }
  remove(node) {
    const i = this.children.indexOf(node);
    if (i !== -1) this.children.splice(i, 1);
    return this;
  }
  size() {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }
  display(indent = "") {
    const lines = [`${indent}+ ${this.name}/`];
    for (const child of this.children) {
      lines.push(child.display(indent + "  "));
    }
    return lines.join("\n");
  }
  find(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.find(name);
      if (found) return found;
    }
    return null;
  }
}

// ---------------- Test cases ----------------
const root = new Folder("root");
const src = new Folder("src");
src.add(new File("index.js", 100)).add(new File("app.js", 250));
const docs = new Folder("docs");
docs.add(new File("readme.md", 80)).add(new File("api.md", 120));
root.add(src).add(docs).add(new File("package.json", 40));

console.log(root.display());
// Expected (tree):
// + root/
//   + src/
//     - index.js (100B)
//     - app.js (250B)
//   + docs/
//     - readme.md (80B)
//     - api.md (120B)
//   - package.json (40B)

console.log(root.size());
// Expected: 590

// Uniform treatment: find returns either File or Folder
console.log(root.find("app.js")?.name, root.find("docs")?.name);
// Expected: app.js docs

// Leaf operations reject add/remove
try {
  new File("x", 1).add(new File("y", 1));
} catch (e) {
  console.log("Leaf error:", e.message);
  // Expected: Leaf error: Cannot add to a leaf
}
