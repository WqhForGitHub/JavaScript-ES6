/**
 * 手写后缀自动机（SAM）
 * 功能：识别字符串所有子串，O(n) 构建
 */
class SAMState {
  constructor() {
    this.next = {};
    this.link = -1;
    this.len = 0;
  }
}
class SuffixAutomaton {
  constructor() {
    this.st = [new SAMState()];
    this.last = 0;
  }
  extend(c) {
    const cur = this.st.length;
    this.st.push(new SAMState());
    this.st[cur].len = this.st[this.last].len + 1;
    let p = this.last;
    while (p !== -1 && !this.st[p].next[c]) {
      this.st[p].next[c] = cur;
      p = this.st[p].link;
    }
    if (p === -1) this.st[cur].link = 0;
    else {
      const q = this.st[p].next[c];
      if (this.st[p].len + 1 === this.st[q].len) this.st[cur].link = q;
      else {
        const clone = this.st.length;
        this.st.push(new SAMState());
        this.st[clone].len = this.st[p].len + 1;
        this.st[clone].next = { ...this.st[q].next };
        this.st[clone].link = this.st[q].link;
        while (p !== -1 && this.st[p].next[c] === q) {
          this.st[p].next[c] = clone;
          p = this.st[p].link;
        }
        this.st[q].link = clone;
        this.st[cur].link = clone;
      }
    }
    this.last = cur;
  }
  build(s) {
    for (const c of s) this.extend(c);
  }
  contains(sub) {
    let p = 0;
    for (const c of sub) {
      if (!this.st[p].next[c]) return false;
      p = this.st[p].next[c];
    }
    return true;
  }
  countDistinct() {
    let count = 0;
    for (let i = 1; i < this.st.length; i++)
      count += this.st[i].len - this.st[this.st[i].link].len;
    return count;
  }
}
// ===== 测试 =====
const sam = new SuffixAutomaton();
sam.build("ababc");
console.log('包含 "ab":', sam.contains("ab")); // true
console.log('包含 "bc":', sam.contains("bc")); // true
console.log('包含 "ac":', sam.contains("ac")); // false
console.log("不同子串数:", sam.countDistinct()); // 11
