/**
 * @file treeLayout.js
 * @description 手写树形图布局：使用简单递归算法为每个节点计算 (x, y) 坐标，
 *              并以 ASCII 字符打印整棵树（带连接线）。
 *
 * 算法说明（简化版 tidy tree）：
 *   - 后序遍历：叶子节点按从左到右依次分配 x 坐标（间隔 2），
 *     深度作为 y 坐标。
 *   - 内部节点的 x = 其子节点 x 坐标的平均（居中于子节点之上）。
 *   - 打印时，每层占两行：一行放节点 ID，一行画连接线
 *     （'|' 表示竖线，'-' 表示水平连接）。
 */

/**
 * 树节点
 */
class TreeNode {
  /**
   * @param {string} id - 节点标识
   * @param {TreeNode[]} [children=[]] - 子节点
   */
  constructor(id, children = []) {
    this.id = id;
    this.children = children;
    this.x = 0;
    this.y = 0;
    this.width = 0; // 子树宽度
  }
}

/**
 * 后序遍历：计算每个节点子树的宽度，并分配 x 坐标
 * @param {TreeNode} node - 当前节点
 * @param {number} depth - 当前深度
 * @param {{nextX:number}} state - 状态对象（下一个可用 x 坐标）
 */
function assignWidths(node, depth, state) {
  node.y = depth;
  if (node.children.length === 0) {
    // 叶子节点：占据下一个可用 x 位置
    node.x = state.nextX;
    node.width = 1;
    state.nextX += 2;
  } else {
    // 递归处理子节点
    for (const child of node.children) {
      assignWidths(child, depth + 1, state);
    }
    // 内部节点居中于子节点
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node.x = (firstChild.x + lastChild.x) / 2;
    node.width = lastChild.x + lastChild.width - firstChild.x;
  }
}

/**
 * 收集所有节点（前序遍历）
 * @param {TreeNode} node
 * @param {TreeNode[]} [result=[]]
 * @returns {TreeNode[]}
 */
function collectNodes(node, result = []) {
  result.push(node);
  for (const child of node.children) {
    collectNodes(child, result);
  }
  return result;
}

/**
 * 收集所有边
 * @param {TreeNode} node
 * @param {Array<{from:TreeNode, to:TreeNode}>} [result=[]]
 * @returns {Array<{from:TreeNode, to:TreeNode}>}
 */
function collectEdges(node, result = []) {
  for (const child of node.children) {
    result.push({ from: node, to: child });
    collectEdges(child, result);
  }
  return result;
}

/**
 * 计算树布局
 * @param {TreeNode} root - 根节点
 */
function layoutTree(root) {
  const state = { nextX: 0 };
  assignWidths(root, 0, state);
}

/**
 * 打印树为 ASCII（节点 + 连接线）
 * @param {TreeNode} root - 根节点
 */
function printTree(root) {
  const nodes = collectNodes(root);
  const edges = collectEdges(root);

  const maxX = Math.max(...nodes.map((n) => n.x));
  const maxY = Math.max(...nodes.map((n) => n.y));

  const W = maxX + 3;
  const H = maxY * 2 + 1; // 每层两行：节点行 + 连接行

  const grid = Array.from({ length: H }, () => new Array(W).fill(" "));

  // 放置节点 ID
  for (const node of nodes) {
    const r = node.y * 2;
    const c = Math.round(node.x);
    const id = String(node.id);
    for (let i = 0; i < id.length; i++) {
      if (c + i < W) grid[r][c + i] = id[i];
    }
  }

  // 绘制连接线：父节点行 + 1 为连接行
  for (const edge of edges) {
    const parentRow = edge.from.y * 2;
    const childRow = edge.to.y * 2;
    const parentCol = Math.round(edge.from.x);
    const childCol = Math.round(edge.to.x);
    const midRow = parentRow + 1; // 等于 childRow - 1

    // 先填充水平连接（不覆盖已有竖线）
    const start = Math.min(parentCol, childCol);
    const end = Math.max(parentCol, childCol);
    for (let c = start; c <= end; c++) {
      if (grid[midRow][c] === " ") {
        grid[midRow][c] = "-";
      }
    }
    // 再放置竖线（父节点下方、子节点上方）
    grid[midRow][parentCol] = "|";
    grid[midRow][childCol] = "|";
  }

  console.log("Tree layout (ASCII):");
  for (const row of grid) {
    console.log(row.join(""));
  }
}

/**
 * 打印所有节点坐标
 * @param {TreeNode} root
 */
function printCoordinates(root) {
  const nodes = collectNodes(root);
  console.log("Node coordinates (x, y):");
  for (const node of nodes) {
    console.log(`  ${node.id}: x=${node.x}, y=${node.y}`);
  }
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 完整二叉树 ############");
const root1 = new TreeNode("A", [
  new TreeNode("B", [new TreeNode("D"), new TreeNode("E")]),
  new TreeNode("C", [new TreeNode("F"), new TreeNode("G")]),
]);
layoutTree(root1);
printCoordinates(root1);
printTree(root1);

console.log("\n\n############ Test 2: 不平衡树 ############");
const root2 = new TreeNode("R", [
  new TreeNode("X", [
    new TreeNode("1"),
    new TreeNode("2", [new TreeNode("a")]),
  ]),
  new TreeNode("Y"),
  new TreeNode("Z", [new TreeNode("z")]),
]);
layoutTree(root2);
printCoordinates(root2);
printTree(root2);

console.log("\n\n############ Test 3: 单链（链表状） ############");
const root3 = new TreeNode("A", [
  new TreeNode("B", [new TreeNode("C", [new TreeNode("D")])]),
]);
layoutTree(root3);
printCoordinates(root3);
printTree(root3);

console.log("\n\n############ Test 4: 三叉树 ############");
const root4 = new TreeNode("P", [
  new TreeNode("a", [new TreeNode("1"), new TreeNode("2")]),
  new TreeNode("b", [new TreeNode("3")]),
  new TreeNode("c", [new TreeNode("4"), new TreeNode("5"), new TreeNode("6")]),
]);
layoutTree(root4);
printCoordinates(root4);
printTree(root4);
