/**
 * 手写 LFU 缓存
 *
 * LFU（Least Frequently Used）缓存淘汰策略：当缓存满时，淘汰访问频率最低的元素；
 * 频率相同时淘汰最久未使用的（LRU）。
 * 实现：使用三个哈希表：
 *   - keyTable：key -> {value, freq} 节点
 *   - freqTable：freq -> 双向链表（同频率按访问时间排序，头新尾旧）
 *   - minFreq：记录当前最小频率
 * get / put 均摊 O(1)。
 */

class DLinkedNode {
  constructor(key = 0, value = 0, freq = 0) {
    this.key = key;
    this.value = value;
    this.freq = freq;
    this.prev = null;
    this.next = null;
  }
}

class DLinkedList {
  constructor() {
    this.head = new DLinkedNode();
    this.tail = new DLinkedNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
    this.size++;
  }
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
  }
  removeTail() {
    if (this.size === 0) return null;
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
  isEmpty() {
    return this.size === 0;
  }
}

class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.minFreq = 0;
    this.keyTable = new Map(); // key -> node
    this.freqTable = new Map(); // freq -> DLinkedList
  }

  _getFreqList(freq) {
    if (!this.freqTable.has(freq)) {
      this.freqTable.set(freq, new DLinkedList());
    }
    return this.freqTable.get(freq);
  }

  // 访问节点后频率 +1，并移动到新频率链表头部
  _increaseFreq(node) {
    const list = this.freqTable.get(node.freq);
    list.removeNode(node);
    // 若移除的是最小频率且链表空了，更新 minFreq
    if (node.freq === this.minFreq && list.isEmpty()) {
      this.minFreq++;
    }
    node.freq++;
    this._getFreqList(node.freq).addToHead(node);
  }

  get(key) {
    if (!this.keyTable.has(key)) return -1;
    const node = this.keyTable.get(key);
    this._increaseFreq(node);
    return node.value;
  }

  put(key, value) {
    if (this.capacity === 0) return;
    if (this.keyTable.has(key)) {
      const node = this.keyTable.get(key);
      node.value = value;
      this._increaseFreq(node);
      return;
    }
    // 容量满，淘汰最小频率链表尾部（最久未使用）
    if (this.keyTable.size >= this.capacity) {
      const minList = this.freqTable.get(this.minFreq);
      const removed = minList.removeTail();
      this.keyTable.delete(removed.key);
    }
    // 新节点频率为 1
    const node = new DLinkedNode(key, value, 1);
    this.keyTable.set(key, node);
    this._getFreqList(1).addToHead(node);
    this.minFreq = 1;
  }
}

// 测试
const lfu = new LFUCache(2);
lfu.put(1, 1); // freq: {1:1}
lfu.put(2, 2); // freq: {1:1, 2:1}
console.log(lfu.get(1)); // 1，freq: {1:2, 2:1}
lfu.put(3, 3); // 淘汰 key 2（freq=1 最小且最久未使用），freq: {1:2, 3:1}
console.log(lfu.get(2)); // -1
console.log(lfu.get(3)); // 3，freq: {1:2, 3:2}
lfu.put(4, 4); // minFreq=2，淘汰 key 1，freq: {3:2, 4:1}
console.log(lfu.get(1)); // -1
console.log(lfu.get(3)); // 3，freq: {3:3, 4:1}
console.log(lfu.get(4)); // 4，freq: {3:3, 4:2}

// 另一组测试
const lfu2 = new LFUCache(3);
lfu2.put(2, 2);
lfu2.put(1, 1);
console.log(lfu2.get(2)); // 2
console.log(lfu2.get(1)); // 1
console.log(lfu2.get(2)); // 2
lfu2.put(3, 3); // 容量3未满，直接放入
lfu2.put(4, 4); // 容量满，淘汰 freq 最小的 key 3 (freq=1)
console.log(lfu2.get(3)); // -1
console.log(lfu2.get(2)); // 2
console.log(lfu2.get(1)); // 1
