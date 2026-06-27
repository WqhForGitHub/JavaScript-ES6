/**
 * 手写康威生命游戏
 *
 * 康威生命游戏（Conway's Game of Life）是英国数学家 John Conway 于 1970 年提出的元胞自动机。
 *
 * 规则：
 * 1. 任何活细胞，其邻居数少于 2 个（孤立），死亡（underpopulation）
 * 2. 任何活细胞，其邻居数超过 3 个（拥挤），死亡（overpopulation）
 * 3. 任何活细胞，其邻居数为 2 或 3 个，存活（survival）
 * 4. 任何死细胞，其邻居数恰好 3 个，复活（reproduction）
 *
 * 其中"邻居"指周围 8 个格子（含对角线）。
 *
 * 本实现提供：
 * - 网格表示与打印
 * - 单步演化 step
 * - 多代演化 run
 * - 经典图案：滑翔机（Glider）、振荡器（Blinker）、方块（Block）
 */

/**
 * 生命游戏类
 */
class GameOfLife {
  /**
   * @param {number} rows 行数
   * @param {number} cols 列数
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.createEmptyGrid();
  }

  /**
   * 创建空网格
   * @returns {number[][]} 全 0 网格
   */
  createEmptyGrid() {
    return Array.from({ length: this.rows }, () =>
      new Array(this.cols).fill(0),
    );
  }

  /**
   * 设置网格为指定布局
   * @param {number[][]} pattern 初始布局
   * @param {number} rowOffset 行偏移
   * @param {number} colOffset 列偏移
   */
  setPattern(pattern, rowOffset = 0, colOffset = 0) {
    this.grid = this.createEmptyGrid();
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (rowOffset + i < this.rows && colOffset + j < this.cols) {
          this.grid[rowOffset + i][colOffset + j] = pattern[i][j];
        }
      }
    }
  }

  /**
   * 统计某格子周围的活邻居数
   * @param {number} r 行
   * @param {number} c 列
   * @returns {number} 活邻居数
   */
  countNeighbors(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          count += this.grid[nr][nc];
        }
      }
    }
    return count;
  }

  /**
   * 单步演化
   * 根据规则更新所有格子的状态
   */
  step() {
    const newGrid = this.createEmptyGrid();
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const neighbors = this.countNeighbors(i, j);
        const alive = this.grid[i][j] === 1;
        if (alive) {
          // 活细胞：2 或 3 个邻居存活
          newGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          // 死细胞：恰好 3 个邻居复活
          newGrid[i][j] = neighbors === 3 ? 1 : 0;
        }
      }
    }
    this.grid = newGrid;
  }

  /**
   * 运行多代
   * @param {number} generations 代数
   */
  run(generations) {
    for (let i = 0; i < generations; i++) {
      this.step();
    }
  }

  /**
   * 统计当前活细胞数
   * @returns {number} 活细胞总数
   */
  countAlive() {
    let count = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        count += this.grid[i][j];
      }
    }
    return count;
  }

  /**
   * 打印网格
   * 活细胞用 '■'，死细胞用 '·'
   */
  print() {
    const lines = this.grid.map((row) =>
      row.map((c) => (c ? "■" : "·")).join(" "),
    );
    console.log(lines.join("\n"));
  }
}

// 经典图案
/**
 * 滑翔机（Glider）：周期为 4，沿对角线移动
 */
const GLIDER = [
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 1],
];

/**
 * 振荡器（Blinker）：周期为 2，水平/垂直交替
 */
const BLINKER = [[1, 1, 1]];

/**
 * 方块（Block）：静止图案
 */
const BLOCK = [
  [1, 1],
  [1, 1],
];

/**
 * 蜂巢（Beehive）：静止图案
 */
const BEEHIVE = [
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
];

// ===== 测试 =====
console.log("===== 手写康威生命游戏 =====\n");

// 测试 1：滑翔机 4 代演化
console.log("1. 滑翔机（Glider）演化 4 代:");
const game1 = new GameOfLife(6, 6);
game1.setPattern(GLIDER, 1, 1);
console.log("--- 初始 ---");
game1.print();
for (let gen = 1; gen <= 4; gen++) {
  game1.step();
  console.log("--- 第 " + gen + " 代 ---");
  game1.print();
}
console.log("（滑翔机经 4 代演化回到原形状，但位置右下移动一格）\n");

// 测试 2：振荡器 Blinker
console.log("2. 振荡器（Blinker）演化 2 代:");
const game2 = new GameOfLife(5, 5);
game2.setPattern(BLINKER, 2, 1);
console.log("--- 初始（水平）---");
game2.print();
game2.step();
console.log("--- 第 1 代（垂直）---");
game2.print();
game2.step();
console.log("--- 第 2 代（恢复水平）---");
game2.print();
console.log("（Blinker 周期为 2）\n");

// 测试 3：方块（静止图案）
console.log("3. 方块（Block）静止图案 3 代:");
const game3 = new GameOfLife(5, 5);
game3.setPattern(BLOCK, 1, 1);
for (let gen = 0; gen <= 3; gen++) {
  console.log("--- 第 " + gen + " 代 ---");
  game3.print();
  game3.step();
}
console.log("（方块保持不变）\n");

// 测试 4：随机演化
console.log("4. 随机网格演化 5 代:");
const game4 = new GameOfLife(8, 8);
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    game4.grid[i][j] = Math.random() < 0.3 ? 1 : 0;
  }
}
console.log("--- 初始（活细胞数: " + game4.countAlive() + "）---");
game4.print();
for (let gen = 1; gen <= 5; gen++) {
  game4.step();
  console.log(
    "--- 第 " + gen + " 代（活细胞数: " + game4.countAlive() + "）---",
  );
  game4.print();
}
