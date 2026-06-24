/**
 * 手写字典树进阶（支持删除、前缀搜索）
 * 功能：insert, search, startsWith, remove, autocomplete
 */
class TrieNode { constructor() { this.children = {}; this.isEnd = false; } }
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) { let cur = this.root; for (const c of word) { if (!cur.children[c]) cur.children[c] = new TrieNode(); cur = cur.children[c]; } cur.isEnd = true; }
  search(word) { let cur = this.root; for (const c of word) { if (!cur.children[c]) return false; cur = cur.children[c]; } return cur.isEnd; }
  startsWith(prefix) { let cur = this.root; for (const c of prefix) { if (!cur.children[c]) return false; cur = cur.children[c]; } return true; }
  remove(word) { this._remove(this.root, word, 0); }
  _remove(node, word, idx) {
    if (idx === word.length) { if (!node.isEnd) return false; node.isEnd = false; return Object.keys(node.children).length === 0; }
    const c = word[idx]; if (!node.children[c]) return false;
    const shouldDelete = this._remove(node.children[c], word, idx + 1);
    if (shouldDelete) { delete node.children[c]; return Object.keys(node.children).length === 0 && !node.isEnd; }
    return false;
  }
  autocomplete(prefix) {
    let cur = this.root;
    for (const c of prefix) { if (!cur.children[c]) return []; cur = cur.children[c]; }
    const results = [];
    this._dfs(cur, prefix, results);
    return results;
  }
  _dfs(node, prefix, results) { if (node.isEnd) results.push(prefix); for (const c in node.children) this._dfs(node.children[c], prefix + c, results); }
}
// ===== 测试 =====
const trie = new Trie();
['apple', 'app', 'application', 'apply', 'banana', 'band'].forEach(w => trie.insert(w));
console.log('search("app"):', trie.search('app')); // true
console.log('search("appl"):', trie.search('appl')); // false
console.log('autocomplete("app"):', trie.autocomplete('app')); // ['app','apple','application','apply']
trie.remove('app');
console.log('删除app后 search("app"):', trie.search('app')); // false
console.log('search("apple"):', trie.search('apple')); // true
