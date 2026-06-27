/**
 * 手写思维导图布局算法
 *
 * 思维导图布局思路：
 * 1. 根节点放在中心位置。
 * 2. 一级子节点分两侧分布：一半放右侧，一半放左侧。
 * 3. 每一侧的子节点垂直排列，各自再向同侧延伸出二级子节点。
 * 4. 通过深度优先遍历计算每个节点的坐标 (x, y)。
 * 5. 最后把布局按 ASCII 树的形式打印出来。
 *
 * 坐标系约定：
 * - x 向右为正；y 向下为正。
 * - 根节点 x=0，左右两侧子树分别向 x 正负方向延伸。
 */

/**
 * 创建一个节点对象。
 * @param {string} text - 节点文本。
 * @param {Node[]} [children=[]] - 子节点数组。
 * @returns {Node} 节点对象。
 */
function createNode(text, children = []) {
  return {
    text,
    children,
    // 布局坐标，后续计算
    x: 0,
    y: 0,
    // 该子树占用的垂直空间（行数）
    span: 1,
  };
}

/**
 * 计算子树占用的垂直跨度。
 * 叶子节点跨度为 1；分支节点跨度等于所有子节点跨度之和（至少为 1）。
 * @param {Node} node - 当前节点。
 * @returns {number} 子树跨度（单位为行）。
 */
function computeSpan(node) {
  if (node.children.length === 0) {
    node.span = 1;
    return 1;
  }
  let total = 0;
  for (const child of node.children) {
    total += computeSpan(child);
  }
  node.span = Math.max(total, 1);
  return node.span;
}

/**
 * 为子树中的每个节点分配坐标。
 * @param {Node} node - 当前节点。
 * @param {number} x - 当前节点的 x 坐标。
 * @param {number} yTop - 子树顶部对应的 y 坐标。
 * @param {number} dir - 水平方向：1 表示向右，-1 表示向左。
 * @param {number} stepX - 每一级水平方向上的间距。
 */
function layoutSubtree(node, x, yTop, dir, stepX) {
  node.x = x;
  // 让当前节点垂直居中于其子树跨度内
  node.y = yTop + (node.span - 1) / 2;

  let yCursor = yTop;
  for (const child of node.children) {
    layoutSubtree(child, x + dir * stepX, yCursor, dir, stepX);
    yCursor += child.span;
  }
}

/**
 * 对整棵思维导图进行布局。
 * 会把子节点平均分配到左右两侧。
 * @param {Node} root - 根节点。
 * @param {number} [stepX=8] - 每一级水平方向上的间距。
 */
function layoutMindMap(root, stepX = 8) {
  // 先计算所有子树跨度
  computeSpan(root);
  root.x = 0;
  root.y = (root.span - 1) / 2;

  // 把一级子节点拆成左右两组
  const mid = Math.ceil(root.children.length / 2);
  const rightChildren = root.children.slice(0, mid);
  const leftChildren = root.children.slice(mid);

  // 右侧子树
  let yCursor = 0;
  for (const child of rightChildren) {
    layoutSubtree(child, stepX, yCursor, 1, stepX);
    yCursor += child.span;
  }
  // 左侧子树（从同一顶部开始）
  yCursor = 0;
  for (const child of leftChildren) {
    layoutSubtree(child, -stepX, yCursor, -1, stepX);
    yCursor += child.span;
  }
}

/**
 * 收集所有节点到一个数组，用于后续渲染。
 * @param {Node} node - 根节点。
 * @returns {Node[]} 所有节点列表。
 */
function collectNodes(node) {
  const list = [node];
  for (const child of node.children) {
    list.push(...collectNodes(child));
  }
  return list;
}

/**
 * 把思维导图渲染成 ASCII 图。
 * 使用稀疏字符网格，把节点文本写入对应坐标，并用 '-' 连接父子节点。
 * @param {Node} root - 根节点。
 * @returns {string} ASCII 图字符串。
 */
function renderMindMap(root) {
  const nodes = collectNodes(root);
  // 收集所有父子连线
  const edges = [];
  const walk = (node) => {
    for (const child of node.children) {
      edges.push([node, child]);
      walk(child);
    }
  };
  walk(root);

  // 计算网格边界（x 单位为字符列，y 单位为行；y 放大 2 倍避免重叠）
  const scaleX = 1;
  const scaleY = 2;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x * scaleX);
    maxX = Math.max(maxX, n.x * scaleX + n.text.length - 1);
    minY = Math.min(minY, n.y * scaleY);
    maxY = Math.max(maxY, n.y * scaleY);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  // 初始化字符网格为空格
  const grid = Array.from({ length: height }, () => Array(width).fill(" "));

  // 把节点文本写到网格中
  const toCol = (x) => x - minX;
  const toRow = (y) => y - minY;
  for (const n of nodes) {
    const row = toRow(n.y * scaleY);
    const col = toCol(n.x * scaleX);
    for (let i = 0; i < n.text.length; i++) {
      if (row >= 0 && row < height && col + i >= 0 && col + i < width) {
        grid[row][col + i] = n.text[i];
      }
    }
  }

  // 绘制父子连线（水平 '-'）
  for (const [parent, child] of edges) {
    const pRow = toRow(parent.y * scaleY);
    const cRow = toRow(child.y * scaleY);
    if (pRow === cRow) {
      // 同一行：直接用 '-' 连接
      const x1 = toCol(parent.x * scaleX) + parent.text.length;
      const x2 = toCol(child.x * scaleX) - 1;
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      for (let x = lo; x <= hi; x++) {
        if (x >= 0 && x < width && grid[pRow][x] === " ") {
          grid[pRow][x] = "-";
        }
      }
    } else {
      // 不同行：先从父节点水平延伸一步，再画 '|' 到子节点行
      const dir = child.x > parent.x ? 1 : -1;
      const px = toCol(parent.x * scaleX) + (dir > 0 ? parent.text.length : -1);
      const cx = toCol(child.x * scaleX) + (dir > 0 ? -1 : child.text.length);
      // 水平线
      const lo = Math.min(px, cx);
      const hi = Math.max(px, cx);
      for (let x = lo; x <= hi; x++) {
        if (x >= 0 && x < width && grid[pRow][x] === " ") {
          grid[pRow][x] = "-";
        }
      }
      // 垂直线连接 pRow 到 cRow
      const vCol = dir > 0 ? hi : hi; // 在转折点列画竖线
      const vLo = Math.min(pRow, cRow);
      const vHi = Math.max(pRow, cRow);
      for (let r = vLo; r <= vHi; r++) {
        if (
          r >= 0 &&
          r < height &&
          vCol >= 0 &&
          vCol < width &&
          grid[r][vCol] === " "
        ) {
          grid[r][vCol] = "|";
        }
      }
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

// ============================================================
// 测试用例
// ============================================================

// 构造一棵思维导图：
//               编程语言
//              /   |    \
//            前端  后端  移动端
//           /  \    |      \
//        HTML CSS  Node   Flutter
//         |        |
//       Canvas    Express
console.log("===== 测试 1：思维导图布局 =====");
const root = createNode("编程语言", [
  createNode("前端", [
    createNode("HTML", [createNode("Canvas")]),
    createNode("CSS"),
  ]),
  createNode("后端", [createNode("Node", [createNode("Express")])]),
  createNode("移动端", [createNode("Flutter")]),
]);

layoutMindMap(root, 10);
console.log(renderMindMap(root));

console.log("\n===== 节点坐标列表 =====");
for (const n of collectNodes(root)) {
  console.log(`${n.text.padEnd(8)} -> (x=${n.x}, y=${n.y}, span=${n.span})`);
}

// 测试 2：只有根节点
console.log("\n===== 测试 2：只有根节点 =====");
const single = createNode("中心");
layoutMindMap(single);
console.log(renderMindMap(single));

// 测试 3：两侧均衡分布
console.log("\n===== 测试 3：4 个一级子节点均衡分布 =====");
const root2 = createNode("Root", [
  createNode("A"),
  createNode("B"),
  createNode("C"),
  createNode("D"),
]);
layoutMindMap(root2, 10);
console.log(renderMindMap(root2));
