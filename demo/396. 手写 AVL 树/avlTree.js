/**
 * 手写 AVL 树
 *
 * AVL 树是一种自平衡二叉搜索树，任意节点的左右子树高度差不超过 1。
 * 在插入/删除后通过旋转操作（LL、RR、LR、RL 四种情况）重新平衡。
 * 保证查找/插入/删除时间复杂度均为 O(log n)。
 */

class AVLNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  _height(node) {
    return node ? node.height : 0;
  }

  _balanceFactor(node) {
    return node ? this._height(node.left) - this._height(node.right) : 0;
  }

  _updateHeight(node) {
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  // 右旋（LL 情况）
  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this._updateHeight(y);
    this._updateHeight(x);
    return x;
  }

  // 左旋（RR 情况）
  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this._updateHeight(x);
    this._updateHeight(y);
    return y;
  }

  _rebalance(node) {
    this._updateHeight(node);
    const bf = this._balanceFactor(node);
    // LL
    if (bf > 1 && this._balanceFactor(node.left) >= 0) {
      return this._rotateRight(node);
    }
    // LR
    if (bf > 1 && this._balanceFactor(node.left) < 0) {
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }
    // RR
    if (bf < -1 && this._balanceFactor(node.right) <= 0) {
      return this._rotateLeft(node);
    }
    // RL
    if (bf < -1 && this._balanceFactor(node.right) > 0) {
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }
    return node;
  }

  insert(key) {
    this.root = this._insert(this.root, key);
  }

  _insert(node, key) {
    if (node === null) return new AVLNode(key);
    if (key < node.key) {
      node.left = this._insert(node.left, key);
    } else if (key > node.key) {
      node.right = this._insert(node.right, key);
    } else {
      return node; // 不允许重复
    }
    return this._rebalance(node);
  }

  search(key) {
    let node = this.root;
    while (node !== null) {
      if (key < node.key) node = node.left;
      else if (key > node.key) node = node.right;
      else return true;
    }
    return false;
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

  // 校验是否平衡
  isBalanced() {
    const check = (node) => {
      if (node === null) return 0;
      const lh = check(node.left);
      if (lh === -1) return -1;
      const rh = check(node.right);
      if (rh === -1) return -1;
      if (Math.abs(lh - rh) > 1) return -1;
      return 1 + Math.max(lh, rh);
    };
    return check(this.root) !== -1;
  }
}

// 测试
const avl = new AVLTree();
[10, 20, 30, 40, 50, 25].forEach((k) => avl.insert(k));

console.log(avl.inOrder().join(',')); // 10,20,25,30,40,50
console.log(avl.isBalanced()); // true
console.log(avl.search(25)); // true
console.log(avl.search(99)); // false

// 验证：插入递增序列后仍平衡（普通 BST 会退化为链表）
const avl2 = new AVLTree();
for (let i = 1; i <= 100; i++) avl2.insert(i);
console.log(avl2.isBalanced()); // true
console.log(avl2.inOrder()[0], avl2.inOrder()[99]); // 1 100
