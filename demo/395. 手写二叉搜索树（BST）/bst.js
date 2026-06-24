/**
 * 手写二叉搜索树（BST）
 *
 * 二叉搜索树是一种有序的二叉树，满足：左子树所有节点值 < 根节点值 < 右子树所有节点值。
 * 中序遍历可得到有序序列。平均查找/插入/删除 O(log n)，最坏退化为 O(n)。
 * 本实现包含 insert / search / 中序/先序/后序遍历 / min / max / remove。
 */

class TreeNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(key) {
    const node = new TreeNode(key);
    if (this.root === null) {
      this.root = node;
    } else {
      this._insertNode(this.root, node);
    }
  }

  _insertNode(node, newNode) {
    if (newNode.key < node.key) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this._insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this._insertNode(node.right, newNode);
      }
    }
  }

  search(key) {
    return this._searchNode(this.root, key);
  }

  _searchNode(node, key) {
    if (node === null) return false;
    if (key < node.key) return this._searchNode(node.left, key);
    if (key > node.key) return this._searchNode(node.right, key);
    return true;
  }

  min() {
    let node = this.root;
    while (node && node.left !== null) {
      node = node.left;
    }
    return node ? node.key : null;
  }

  max() {
    let node = this.root;
    while (node && node.right !== null) {
      node = node.right;
    }
    return node ? node.key : null;
  }

  inOrder() {
    const result = [];
    this._inOrder(this.root, result);
    return result;
  }

  _inOrder(node, result) {
    if (node !== null) {
      this._inOrder(node.left, result);
      result.push(node.key);
      this._inOrder(node.right, result);
    }
  }

  preOrder() {
    const result = [];
    this._preOrder(this.root, result);
    return result;
  }

  _preOrder(node, result) {
    if (node !== null) {
      result.push(node.key);
      this._preOrder(node.left, result);
      this._preOrder(node.right, result);
    }
  }

  postOrder() {
    const result = [];
    this._postOrder(this.root, result);
    return result;
  }

  _postOrder(node, result) {
    if (node !== null) {
      this._postOrder(node.left, result);
      this._postOrder(node.right, result);
      result.push(node.key);
    }
  }

  remove(key) {
    this.root = this._removeNode(this.root, key);
  }

  _removeNode(node, key) {
    if (node === null) return null;
    if (key < node.key) {
      node.left = this._removeNode(node.left, key);
      return node;
    } else if (key > node.key) {
      node.right = this._removeNode(node.right, key);
      return node;
    } else {
      // 叶子节点
      if (node.left === null && node.right === null) return null;
      // 只有一个子节点
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;
      // 有两个子节点：找右子树最小值替换
      const minRight = this._findMinNode(node.right);
      node.key = minRight.key;
      node.right = this._removeNode(node.right, minRight.key);
      return node;
    }
  }

  _findMinNode(node) {
    while (node.left !== null) node = node.left;
    return node;
  }
}

// 测试
const bst = new BinarySearchTree();
[11, 7, 15, 5, 3, 9, 8, 10, 13, 12, 14, 20, 18, 25].forEach((k) => bst.insert(k));

console.log(bst.inOrder().join(','));  // 3,5,7,8,9,10,11,12,13,14,15,18,20,25
console.log(bst.preOrder().join(',')); // 11,7,5,3,9,8,10,15,13,12,14,20,18,25
console.log(bst.postOrder().join(',')); // 3,5,8,10,9,7,12,14,13,18,25,20,15,11

console.log(bst.min()); // 3
console.log(bst.max()); // 25
console.log(bst.search(8)); // true
console.log(bst.search(100)); // false

bst.remove(15);
console.log(bst.inOrder().join(',')); // 3,5,7,8,9,10,11,12,13,14,18,20,25
console.log(bst.search(15)); // false
