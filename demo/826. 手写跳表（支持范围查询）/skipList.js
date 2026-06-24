/**
 * 手写跳表（支持范围查询）
 * 功能：O(logN) 查找/插入/删除 + 范围查询
 * 实现：多层链表，概率性提升
 */
class SkipNode { constructor(val, level) { this.val = val; this.next = new Array(level).fill(null); } }
class SkipList {
  constructor(maxLevel = 16, p = 0.5) { this.maxLevel = maxLevel; this.p = p; this.level = 1; this.head = new SkipNode(-Infinity, maxLevel); }
  randomLevel() { let lvl = 1; while (Math.random() < this.p && lvl < this.maxLevel) lvl++; return lvl; }
  insert(val) {
    const update = new Array(this.maxLevel); let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) { while (cur.next[i] && cur.next[i].val < val) cur = cur.next[i]; update[i] = cur; }
    const lvl = this.randomLevel();
    if (lvl > this.level) { for (let i = this.level; i < lvl; i++) update[i] = this.head; this.level = lvl; }
    const node = new SkipNode(val, lvl);
    for (let i = 0; i < lvl; i++) { node.next[i] = update[i].next[i]; update[i].next[i] = node; }
  }
  search(val) { let cur = this.head; for (let i = this.level - 1; i >= 0; i--) { while (cur.next[i] && cur.next[i].val < val) cur = cur.next[i]; } cur = cur.next[0]; return cur && cur.val === val; }
  delete(val) { const update = new Array(this.maxLevel); let cur = this.head; for (let i = this.level - 1; i >= 0; i--) { while (cur.next[i] && cur.next[i].val < val) cur = cur.next[i]; update[i] = cur; } cur = cur.next[0]; if (!cur || cur.val !== val) return false; for (let i = 0; i < this.level; i++) { if (update[i].next[i] !== cur) break; update[i].next[i] = cur.next[i]; } while (this.level > 1 && !this.head.next[this.level - 1]) this.level--; return true; }
  rangeQuery(start, end) { let cur = this.head; for (let i = this.level - 1; i >= 0; i--) { while (cur.next[i] && cur.next[i].val < start) cur = cur.next[i]; } cur = cur.next[0]; const result = []; while (cur && cur.val <= end) { result.push(cur.val); cur = cur.next[0]; } return result; }
}
// ===== 测试 =====
const sl = new SkipList();
[3, 6, 9, 1, 4, 7, 2, 5, 8].forEach(v => sl.insert(v));
console.log('search(5):', sl.search(5)); // true
console.log('search(10):', sl.search(10)); // false
console.log('range(3,7):', sl.rangeQuery(3, 7)); // [3,4,5,6,7]
sl.delete(5); console.log('删除后 search(5):', sl.search(5)); // false
