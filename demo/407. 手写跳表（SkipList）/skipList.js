/**
 * 手写跳表（SkipList）
 *
 * 跳表是一种基于有序链表的概率数据结构，通过多层索引实现 O(log n) 的查找/插入/删除。
 * 每个节点以概率 p（通常 0.5）向上"提升"到更高层。最底层是完整链表。
 * 相比平衡树实现更简单，常用于 Redis 的有序集合等场景。
 * 本实现支持插入、查找、删除，并维护一个头节点贯穿所有层。
 */

class SkipNode {
  constructor(value, level) {
    this.value = value;
    this.forward = new Array(level).fill(null); // 各层的后继指针
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.level = 1; // 当前最高层
    this.head = new SkipNode(null, this.maxLevel); // 头节点贯穿所有层
  }

  // 随机生成节点层数
  _randomLevel() {
    let lvl = 1;
    while (Math.random() < this.p && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }

  insert(value) {
    const update = new Array(this.maxLevel).fill(null);
    let current = this.head;
    // 从最高层往下找插入位置
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }
    current = current.forward[0];

    // 不允许重复
    if (current !== null && current.value === value) return false;

    const newLevel = this._randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    const node = new SkipNode(value, newLevel);
    for (let i = 0; i < newLevel; i++) {
      node.forward[i] = update[i].forward[i];
      update[i].forward[i] = node;
    }
    return true;
  }

  search(value) {
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
    }
    current = current.forward[0];
    return current !== null && current.value === value;
  }

  delete(value) {
    const update = new Array(this.maxLevel).fill(null);
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }
    current = current.forward[0];
    if (current === null || current.value !== value) return false;

    for (let i = 0; i < this.level; i++) {
      if (update[i].forward[i] !== current) break;
      update[i].forward[i] = current.forward[i];
    }
    // 降低最高层
    while (this.level > 1 && this.head.forward[this.level - 1] === null) {
      this.level--;
    }
    return true;
  }

  // 打印跳表结构
  print() {
    for (let i = this.level - 1; i >= 0; i--) {
      let str = `Level ${i}: `;
      let current = this.head.forward[i];
      while (current !== null) {
        str += current.value + ' -> ';
        current = current.forward[i];
      }
      str += 'null';
      console.log(str);
    }
  }

  toArray() {
    const result = [];
    let current = this.head.forward[0];
    while (current !== null) {
      result.push(current.value);
      current = current.forward[0];
    }
    return result;
  }
}

// 测试
const sl = new SkipList();
[3, 6, 7, 9, 12, 19, 17, 26, 21, 25].forEach((v) => sl.insert(v));

console.log(sl.search(9)); // true
console.log(sl.search(10)); // false
console.log(sl.toArray()); // [3,6,7,9,12,17,19,21,25,26]

sl.delete(9);
console.log(sl.search(9)); // false
console.log(sl.toArray()); // [3,6,7,12,17,19,21,25,26]

sl.delete(3);
sl.delete(26);
console.log(sl.toArray()); // [6,7,12,17,19,21,25]

console.log('--- 跳表结构 ---');
sl.print();
