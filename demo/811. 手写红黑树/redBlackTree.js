/**
 * 手写红黑树
 * 性质：1.节点红/黑 2.根黑 3.叶子(NIL)黑 4.红节点子必黑 5.任一节点到叶子路径黑节点数相同
 * 实现思路：插入/删除后通过旋转和变色维持平衡
 */
const RED = "R",
  BLACK = "B";
class RBNode {
  constructor(val) {
    this.val = val;
    this.color = RED;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}
class RBTree {
  constructor() {
    this.root = null;
  }
  rotateLeft(node) {
    const r = node.right;
    node.right = r.left;
    if (r.left) r.left.parent = node;
    r.parent = node.parent;
    if (!node.parent) this.root = r;
    else if (node === node.parent.left) node.parent.left = r;
    else node.parent.right = r;
    r.left = node;
    node.parent = r;
  }
  rotateRight(node) {
    const l = node.left;
    node.left = l.right;
    if (l.right) l.right.parent = node;
    l.parent = node.parent;
    if (!node.parent) this.root = l;
    else if (node === node.parent.right) node.parent.right = l;
    else node.parent.left = l;
    l.right = node;
    node.parent = l;
  }
  insert(val) {
    const node = new RBNode(val);
    if (!this.root) {
      this.root = node;
      node.color = BLACK;
      return;
    }
    let cur = this.root;
    while (true) {
      if (val < cur.val) {
        if (!cur.left) {
          cur.left = node;
          break;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = node;
          break;
        }
        cur = cur.right;
      }
    }
    node.parent = cur;
    this.insertFixup(node);
  }
  insertFixup(node) {
    while (node.parent && node.parent.color === RED) {
      const gp = node.parent.parent;
      if (node.parent === gp.left) {
        const uncle = gp.right;
        if (uncle && uncle.color === RED) {
          node.parent.color = BLACK;
          uncle.color = BLACK;
          gp.color = RED;
          node = gp;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this.rotateLeft(node);
          }
          node.parent.color = BLACK;
          node.parent.parent.color = RED;
          this.rotateRight(node.parent.parent);
        }
      } else {
        const uncle = gp.left;
        if (uncle && uncle.color === RED) {
          node.parent.color = BLACK;
          uncle.color = BLACK;
          gp.color = RED;
          node = gp;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this.rotateRight(node);
          }
          node.parent.color = BLACK;
          node.parent.parent.color = RED;
          this.rotateLeft(node.parent.parent);
        }
      }
    }
    this.root.color = BLACK;
  }
  search(val) {
    let cur = this.root;
    while (cur) {
      if (val === cur.val) return true;
      cur = val < cur.val ? cur.left : cur.right;
    }
    return false;
  }
  inorder(node, arr) {
    if (!node) return;
    this.inorder(node.left, arr);
    arr.push((node.color === RED ? "R" : "B") + node.val);
    this.inorder(node.right, arr);
  }
}
// ===== 测试 =====
const tree = new RBTree();
[10, 20, 30, 15, 25, 5, 1].forEach((v) => tree.insert(v));
const result = [];
tree.inorder(tree.root, result);
console.log("中序遍历:", result.join(" "));
console.log("search(15):", tree.search(15)); // true
console.log("search(100):", tree.search(100)); // false
