/**
 * 手写 LRU 缓存
 *
 * LRU（Least Recently Used）缓存淘汰策略：当缓存满时，淘汰最近最少使用的元素。
 * 实现：使用双向链表维护访问顺序（最近访问的移到头部，淘汰尾部），
 * 配合哈希表实现 O(1) 的 get / put。
 *   - get(key)：命中则将节点移到头部并返回值，否则返回 -1。
 *   - put(key, value)：存在则更新并移到头部；不存在则新建节点加入头部，
 *     若超出容量则删除尾部节点及对应哈希表项。
 */

class DLinkedNode {
  constructor(key = 0, value = 0) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // key -> node
    // 使用虚拟头尾节点简化边界处理
    this.head = new DLinkedNode();
    this.tail = new DLinkedNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }

  _removeTail() {
    const node = this.tail.prev;
    this._removeNode(node);
    return node;
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key);
    this._moveToHead(node); // 访问后移到头部
    return node.value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this._moveToHead(node);
    } else {
      const node = new DLinkedNode(key, value);
      this.cache.set(key, node);
      this._addToHead(node);
      if (this.cache.size > this.capacity) {
        const tail = this._removeTail();
        this.cache.delete(tail.key);
      }
    }
  }
}

// 测试
const lru = new LRUCache(2);
lru.put(1, 1); // 缓存 {1=1}
lru.put(2, 2); // 缓存 {1=1, 2=2}
console.log(lru.get(1)); // 1，访问 1 使其成为最近使用
lru.put(3, 3); // 淘汰 key 2，缓存 {1=1, 3=3}
console.log(lru.get(2)); // -1（已淘汰）
lru.put(4, 4); // 淘汰 key 1，缓存 {3=3, 4=4}
console.log(lru.get(1)); // -1（已淘汰）
console.log(lru.get(3)); // 3
console.log(lru.get(4)); // 4

// 测试更新已存在 key
const lru2 = new LRUCache(2);
lru2.put(1, 1);
lru2.put(2, 2);
lru2.put(1, 10); // 更新 1
console.log(lru2.get(1)); // 10
lru2.put(3, 3); // 淘汰 2
console.log(lru2.get(2)); // -1
console.log(lru2.get(1)); // 10
