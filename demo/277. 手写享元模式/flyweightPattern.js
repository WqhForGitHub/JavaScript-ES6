/**
 * 享元模式 (Flyweight Pattern)
 *
 * Approach:
 * - Share fine-grained objects efficiently to support large numbers of similar
 *   objects. Split state into:
 *     * Intrinsic state: shared, immutable, stored in the flyweight (e.g. tree
 *       species, texture, color).
 *     * Extrinsic state: passed in by the client at call time (e.g. position).
 * - A FlyweightFactory creates/caches flyweights by key and reuses them.
 * - Example: a forest of 1,000,000 trees where only a handful of distinct TreeType
 *   objects (species) exist, each reused across many positions.
 */

// ---- Flyweight (intrinsic, shared) ----
class TreeType {
  constructor(name, color, texture) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }
  draw(x, y) {
    // extrinsic state (x,y) passed in
    return `${this.color} ${this.name} at (${x},${y}) [${this.texture}]`;
  }
}

// ---- Flyweight factory ----
class TreeFactory {
  static _pool = new Map();
  static get(name, color, texture) {
    const key = `${name}|${color}|${texture}`;
    if (!this._pool.has(key)) {
      this._pool.set(key, new TreeType(name, color, texture));
    }
    return this._pool.get(key);
  }
  static count() {
    return this._pool.size;
  }
}

// ---- Context object: stores extrinsic state + reference to flyweight ----
class Tree {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // shared flyweight
  }
  draw() {
    return this.type.draw(this.x, this.y);
  }
}

// ---- Forest: many trees, few shared types ----
class Forest {
  constructor() {
    this.trees = [];
  }
  plantTree(x, y, name, color, texture) {
    const type = TreeFactory.get(name, color, texture);
    this.trees.push(new Tree(x, y, type));
    return this;
  }
  draw() {
    return this.trees.map((t) => t.draw());
  }
}

// ---------------- Test cases ----------------
const forest = new Forest();
forest
  .plantTree(0, 0, 'Oak', 'green', 'rough')
  .plantTree(1, 5, 'Oak', 'green', 'rough') // reuses existing Oak flyweight
  .plantTree(3, 2, 'Pine', 'dark-green', 'smooth')
  .plantTree(7, 8, 'Pine', 'dark-green', 'smooth')
  .plantTree(9, 1, 'Birch', 'light-green', 'peeling');

console.log(forest.draw().slice(0, 3));
// Expected: [
//   'green Oak at (0,0) [rough]',
//   'green Oak at (1,5) [rough]',
//   'dark-green Pine at (3,2) [smooth]'
// ]

// Many trees, but only 3 distinct flyweights shared in memory.
console.log('trees:', forest.trees.length, '| flyweights:', TreeFactory.count());
// Expected: trees: 5 | flyweights: 3

// Reusing the same flyweight instance for identical configs
const a = TreeFactory.get('Oak', 'green', 'rough');
const b = TreeFactory.get('Oak', 'green', 'rough');
console.log(a === b);
// Expected: true
