/**
 * @file forceGraph.js
 * @description 手写力导向图布局：节点间存在库仑斥力（互相排斥），
 *              边存在胡克吸引力（弹簧拉力）。迭代计算合力并更新位置，
 *              最终输出节点坐标与 ASCII 可视化。
 *
 * 算法说明（经典 Fruchterman-Reingold 简化版）：
 *   - 斥力（每对节点）：F_rep = k_rep / dist^2，方向沿连线远离对方。
 *   - 引力（每条边）：F_spring = k_spring * (dist - L0)，方向沿连线互相靠近。
 *   - 每节点合力 = 所有斥力 + 所有引力，更新速度 v = (v + F) * damping，
 *     限制单步最大位移避免发散，再更新位置 x += v。
 *   - 迭代多次直至收敛。
 */

/**
 * 力导向图布局类
 */
class ForceGraph {
  /**
   * @param {Array<{id:string}>} nodes - 节点
   * @param {Array<{source:string, target:string}>} edges - 边
   * @param {Object} [options]
   * @param {number} [options.repulsion=5000] - 库仑斥力常数
   * @param {number} [options.springLength=50] - 弹簧自然长度 L0
   * @param {number} [options.springK=0.05] - 弹簧劲度系数
   * @param {number} [options.damping=0.85] - 阻尼系数
   * @param {number} [options.maxStep=5] - 单次迭代最大位移
   */
  constructor(nodes, edges, options = {}) {
    this.nodes = nodes.map((n) => ({
      id: n.id,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
    }));
    this.edges = edges;
    this.repulsion = options.repulsion || 5000;
    this.springLength = options.springLength || 50;
    this.springK = options.springK || 0.05;
    this.damping = options.damping || 0.85;
    this.maxStep = options.maxStep || 5;
  }

  /** 初始化节点位置（网格 + 随机扰动） */
  initPositions(width = 200, height = 100) {
    const n = this.nodes.length;
    this.nodes.forEach((node, i) => {
      const cols = Math.ceil(Math.sqrt(n));
      node.x = (i % cols) * (width / cols) + Math.random() * 10;
      node.y = Math.floor(i / cols) * (height / cols) + Math.random() * 10;
      node.vx = 0;
      node.vy = 0;
    });
  }

  /** 计算一次合力并更新位置 */
  step() {
    // 重置力
    for (const node of this.nodes) {
      node.fx = 0;
      node.fy = 0;
    }

    // 库仑斥力（每对节点）
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.01) {
          dist = 0.01;
          dx = (Math.random() - 0.5) * 0.1;
          dy = (Math.random() - 0.5) * 0.1;
        }
        const force = this.repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        // a 受力远离 b（负方向），b 受力远离 a（正方向）
        a.fx -= fx;
        a.fy -= fy;
        b.fx += fx;
        b.fy += fy;
      }
    }

    // 胡克吸引力（每条边）
    for (const edge of this.edges) {
      const a = this.nodes.find((n) => n.id === edge.source);
      const b = this.nodes.find((n) => n.id === edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = this.springK * (dist - this.springLength);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      // a 被 b 吸引（正方向），b 被 a 吸引（负方向）
      a.fx += fx;
      a.fy += fy;
      b.fx -= fx;
      b.fy -= fy;
    }

    // 更新速度与位置
    for (const node of this.nodes) {
      node.vx = (node.vx + node.fx) * this.damping;
      node.vy = (node.vy + node.fy) * this.damping;
      // 限制最大位移
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > this.maxStep) {
        node.vx = (node.vx / speed) * this.maxStep;
        node.vy = (node.vy / speed) * this.maxStep;
      }
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  /**
   * 运行多次迭代
   * @param {number} iterations - 迭代次数
   * @param {number} [logEvery] - 每隔多少次打印一次能量
   */
  run(iterations, logEvery) {
    for (let i = 0; i < iterations; i++) {
      this.step();
      if (logEvery && (i % logEvery === 0 || i === iterations - 1)) {
        const energy = this.nodes.reduce(
          (s, n) => s + n.vx * n.vx + n.vy * n.vy,
          0,
        );
        console.log(
          `Iter ${String(i).padStart(3)}: energy=${energy.toFixed(3)}`,
        );
      }
    }
  }

  /** 打印所有节点坐标 */
  printPositions() {
    console.log("Final node positions:");
    for (const node of this.nodes) {
      console.log(`  ${node.id}: (${node.x.toFixed(2)}, ${node.y.toFixed(2)})`);
    }
  }
}

/**
 * 用 ASCII 可视化图布局
 * @param {ForceGraph} fg - 力导向图实例
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 */
function visualize(fg, width, height) {
  const xs = fg.nodes.map((n) => n.x);
  const ys = fg.nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const grid = Array.from({ length: height }, () => new Array(width).fill("."));

  // 先画边（避免节点被覆盖）
  for (const edge of fg.edges) {
    const a = fg.nodes.find((n) => n.id === edge.source);
    const b = fg.nodes.find((n) => n.id === edge.target);
    const ax = Math.round(((a.x - minX) / rangeX) * (width - 1));
    const ay = Math.round(((a.y - minY) / rangeY) * (height - 1));
    const bx = Math.round(((b.x - minX) / rangeX) * (width - 1));
    const by = Math.round(((b.y - minY) / rangeY) * (height - 1));
    // Bresenham 风格连线
    let cx = ax;
    let cy = ay;
    const dx = Math.sign(bx - cx);
    const dy = Math.sign(by - cy);
    const steps = Math.max(Math.abs(bx - cx), Math.abs(by - cy)) || 1;
    for (let s = 0; s <= steps; s++) {
      if (grid[cy] && grid[cy][cx] === ".") grid[cy][cx] = "-";
      cx = ax + Math.round(((bx - ax) * s) / steps);
      cy = ay + Math.round(((by - ay) * s) / steps);
    }
    void dx;
    void dy;
  }

  // 再画节点
  for (const node of fg.nodes) {
    const x = Math.round(((node.x - minX) / rangeX) * (width - 1));
    const y = Math.round(((node.y - minY) / rangeY) * (height - 1));
    if (grid[y] && x >= 0 && x < width) {
      grid[y][x] = node.id[0];
    }
  }

  console.log("\nASCII visualization:");
  for (const row of grid) {
    console.log(row.join(""));
  }
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 路径图 A-B-C-D-E ############");
const nodes1 = [
  { id: "A" },
  { id: "B" },
  { id: "C" },
  { id: "D" },
  { id: "E" },
];
const edges1 = [
  { source: "A", target: "B" },
  { source: "B", target: "C" },
  { source: "C", target: "D" },
  { source: "D", target: "E" },
];
const fg1 = new ForceGraph(nodes1, edges1, {
  repulsion: 3000,
  springLength: 40,
  springK: 0.1,
  damping: 0.9,
});
fg1.initPositions();
fg1.run(120, 30);
fg1.printPositions();
visualize(fg1, 50, 12);

console.log("\n\n############ Test 2: 星形图（中心 + 4 叶） ############");
const nodes2 = [
  { id: "C" },
  { id: "N1" },
  { id: "N2" },
  { id: "N3" },
  { id: "N4" },
];
const edges2 = [
  { source: "C", target: "N1" },
  { source: "C", target: "N2" },
  { source: "C", target: "N3" },
  { source: "C", target: "N4" },
];
const fg2 = new ForceGraph(nodes2, edges2, {
  repulsion: 8000,
  springLength: 35,
  springK: 0.15,
  damping: 0.85,
});
fg2.initPositions();
fg2.run(150, 50);
fg2.printPositions();
visualize(fg2, 40, 15);

console.log("\n\n############ Test 3: 含环的图 ############");
const nodes3 = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
const edges3 = [
  { source: "1", target: "2" },
  { source: "2", target: "3" },
  { source: "3", target: "4" },
  { source: "4", target: "1" },
  { source: "1", target: "3" },
];
const fg3 = new ForceGraph(nodes3, edges3, {
  repulsion: 5000,
  springLength: 45,
  springK: 0.08,
});
fg3.initPositions();
fg3.run(150, 50);
fg3.printPositions();
visualize(fg3, 40, 15);
