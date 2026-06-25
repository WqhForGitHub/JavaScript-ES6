/**
 * 迭代器模式 (Iterator Pattern)
 *
 * Approach:
 * - Provide a way to access the elements of an aggregate object sequentially
 *   without exposing its underlying representation.
 * - Implement the classic next() -> { value, done } protocol, plus a Symbol.iterator
 *   so the aggregate works with for...of / spread.
 * - Demonstrations:
 *   1. A custom ArrayLike collection with its own Iterator class.
 *   2. A lazy infinite generator (natural numbers).
 *   3. A tree iterator that flattens a nested structure (DFS pre-order).
 *   4. A reverse iterator and a filtered/transformed iterator via composition.
 */

class ArrayIterator {
  constructor(items) {
    this.items = items;
    this.cursor = 0;
  }
  next() {
    if (this.cursor >= this.items.length) {
      return { value: undefined, done: true };
    }
    return { value: this.items[this.cursor++], done: false };
  }
  [Symbol.iterator]() {
    return this;
  }
  reset() {
    this.cursor = 0;
    return this;
  }
}

class Collection {
  constructor(...items) {
    this._items = items;
  }
  [Symbol.iterator]() {
    return new ArrayIterator(this._items);
  }
  iterator() {
    return new ArrayIterator(this._items);
  }
  reverseIterator() {
    return new ArrayIterator([...this._items].reverse());
  }
}

// Lazy infinite natural numbers.
function* naturals(start = 1) {
  let n = start;
  while (true) yield n++;
}

// Tree (DFS pre-order) iterator using a stack.
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
}

class TreeIterator {
  constructor(root) {
    this.stack = [root];
  }
  next() {
    if (this.stack.length === 0) return { value: undefined, done: true };
    const node = this.stack.pop();
    // push children in reverse so leftmost is visited first
    for (let i = node.children.length - 1; i >= 0; i--) {
      this.stack.push(node.children[i]);
    }
    return { value: node.value, done: false };
  }
  [Symbol.iterator]() {
    return this;
  }
}
TreeNode.prototype[Symbol.iterator] = function () {
  return new TreeIterator(this);
};

// Composable iterators: map / filter / take.
class MappedIterator {
  constructor(source, fn) {
    this.source = source;
    this.fn = fn;
  }
  next() {
    const r = this.source.next();
    return r.done ? r : { value: this.fn(r.value), done: false };
  }
  [Symbol.iterator]() {
    return this;
  }
}

class FilteredIterator {
  constructor(source, predicate) {
    this.source = source;
    this.predicate = predicate;
  }
  next() {
    let r = this.source.next();
    while (!r.done && !this.predicate(r.value)) r = this.source.next();
    return r;
  }
  [Symbol.iterator]() {
    return this;
  }
}

// ---------------- Test cases ----------------
// 1. Custom collection works with for...of
const col = new Collection("a", "b", "c");
console.log([...col]);
// Expected: [ 'a', 'b', 'c' ]

const it = col.iterator();
console.log(it.next(), it.next(), it.next(), it.next());
// Expected: { value: 'a', done: false } { value: 'b', done: false } { value: 'c', done: false } { value: undefined, done: true }

console.log([...col.reverseIterator()]);
// Expected: [ 'c', 'b', 'a' ]

// 2. Lazy infinite + take via filter/map composition
const evens = new FilteredIterator(
  new MappedIterator(naturals(), (n) => n * 2),
  (n) => n % 4 === 0,
);
const first3 = [];
for (const v of evens) {
  first3.push(v);
  if (first3.length === 3) break;
}
console.log(first3);
// Expected: [ 4, 8, 12 ]

// 3. Tree DFS traversal
const tree = new TreeNode(1, [
  new TreeNode(2, [new TreeNode(4), new TreeNode(5)]),
  new TreeNode(3, [new TreeNode(6)]),
]);
console.log([...tree]);
// Expected: [ 1, 2, 4, 5, 3, 6 ]
