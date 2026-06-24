/**
 * 手写字典树（Trie）
 *
 * 字典树（前缀树）是一种用于高效存储和检索字符串集合的树形结构。
 * 每个节点包含一个子节点映射和是否为单词结尾的标志。
 * 查找/插入长度为 L 的字符串时间复杂度 O(L)，常用于自动补全、拼写检查。
 */

class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // 插入单词
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  // 搜索单词（完整匹配）
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  // 判断是否存在以 prefix 为前缀的单词
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }

  // 删除单词
  remove(word) {
    return this._remove(this.root, word, 0);
  }

  _remove(node, word, index) {
    if (index === word.length) {
      if (!node.isEnd) return false;
      node.isEnd = false;
      return Object.keys(node.children).length === 0;
    }
    const ch = word[index];
    if (!node.children[ch]) return false;
    const shouldDelete = this._remove(node.children[ch], word, index + 1);
    if (shouldDelete) {
      delete node.children[ch];
      return Object.keys(node.children).length === 0 && !node.isEnd;
    }
    return false;
  }

  // 自动补全：返回所有以 prefix 开头的单词
  autoComplete(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    const result = [];
    this._collect(node, prefix, result);
    return result;
  }

  _collect(node, prefix, result) {
    if (node.isEnd) result.push(prefix);
    for (const ch in node.children) {
      this._collect(node.children[ch], prefix + ch, result);
    }
  }
}

// 测试
const trie = new Trie();
['apple', 'app', 'application', 'apply', 'banana', 'band'].forEach((w) => trie.insert(w));

console.log(trie.search('apple')); // true
console.log(trie.search('app')); // true
console.log(trie.search('appl')); // false
console.log(trie.startsWith('app')); // true
console.log(trie.startsWith('ban')); // true
console.log(trie.startsWith('cat')); // false

console.log(trie.autoComplete('app')); // ['app', 'apple', 'application', 'apply']

trie.remove('apple');
console.log(trie.search('apple')); // false
console.log(trie.search('app')); // true
