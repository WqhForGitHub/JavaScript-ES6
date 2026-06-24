/**
 * 手写 AC 自动机（Aho-Corasick）
 * 功能：多模式串同时匹配
 * 实现：Trie + fail 指针（KMP 思想推广到多串）
 */
class ACNode { constructor() { this.children = {}; this.fail = null; this.output = []; } }
class ACAutomaton {
  constructor() { this.root = new ACNode(); }
  insert(word) { let cur = this.root; for (const c of word) { if (!cur.children[c]) cur.children[c] = new ACNode(); cur = cur.children[c]; } cur.output.push(word); }
  build() {
    const queue = []; this.root.fail = null;
    for (const c in this.root.children) { this.root.children[c].fail = this.root; queue.push(this.root.children[c]); }
    while (queue.length) {
      const cur = queue.shift();
      for (const c in cur.children) {
        const child = cur.children[c]; let f = cur.fail;
        while (f && !f.children[c]) f = f.fail;
        child.fail = f ? f.children[c] : this.root;
        child.output = child.output.concat(child.fail.output);
        queue.push(child);
      }
    }
  }
  search(text) {
    const matches = []; let cur = this.root;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      while (cur && !cur.children[c]) cur = cur.fail;
      cur = cur ? cur.children[c] : this.root;
      if (cur) for (const word of cur.output) matches.push({ word, end: i + 1, start: i - word.length + 2 });
    }
    return matches;
  }
}
// ===== 测试 =====
const ac = new ACAutomaton();
['he', 'she', 'his', 'hers'].forEach(w => ac.insert(w));
ac.build();
const results = ac.search('ahishers');
console.log('匹配结果:');
results.forEach(m => console.log('  ' + m.word + ' at [' + m.start + ', ' + m.end + ']'));
