/**
 * @file wave.js
 * @description 手写波浪动画：模拟 y = A * sin(ωx + φ + t) 的波形随时间变化，
 *              支持多个波形叠加（振幅相加），并在多个时间步打印 ASCII 可视化。
 *
 * 算法说明：
 *   - 每个波形由 { amplitude(振幅A), omega(角频率ω), phase(相位φ) } 描述。
 *   - 在时间 t 时，位置 x 处的 y 值为：y = Σ A_i * sin(ω_i * x + φ_i + t)
 *   - 将 y 值归一化后映射到 ASCII 网格的行号，绘制 '*' 表示波形点。
 */

/**
 * 计算单个时间步的波形数据
 * @param {Array<{amplitude:number, omega:number, phase:number}>} waves - 波形参数数组
 * @param {number} width - 采样宽度（点数）
 * @param {number} t - 当前时间
 * @returns {number[]} y 值数组（长度为 width）
 */
function computeWave(waves, width, t) {
  const ys = new Array(width).fill(0);
  for (let x = 0; x < width; x++) {
    for (const w of waves) {
      ys[x] += w.amplitude * Math.sin(w.omega * x + w.phase + t);
    }
  }
  return ys;
}

/**
 * 将 y 值数组打印为 ASCII 可视化
 * @param {number[]} ys - y 值数组
 * @param {number} height - ASCII 高度（行数，奇数为佳）
 */
function printWave(ys, height) {
  // 找到最大绝对值用于归一化，避免除零
  const maxAbs = Math.max(...ys.map(Math.abs), 1);
  const halfH = (height - 1) / 2;

  // 建立二维网格，全部填充空格
  const grid = Array.from({ length: height }, () =>
    new Array(ys.length).fill(" "),
  );

  // 绘制中线（x 轴）
  const midRow = Math.floor(halfH);
  for (let x = 0; x < ys.length; x++) {
    grid[midRow][x] = "-";
  }

  // 绘制波点：y > 0 在中线上方，y < 0 在中线下方
  for (let x = 0; x < ys.length; x++) {
    const y = ys[x];
    const row = Math.round(halfH - (y / maxAbs) * halfH);
    if (row >= 0 && row < height) {
      grid[row][x] = "*";
    }
  }

  // 输出每一行
  for (let r = 0; r < height; r++) {
    console.log(grid[r].join(""));
  }
}

/**
 * 模拟波浪动画：在多个时间步打印波形
 * @param {Array<{amplitude:number, omega:number, phase:number}>} waves - 波形参数数组
 * @param {number} width - 采样宽度
 * @param {number} height - ASCII 高度
 * @param {number} duration - 总时长（时间步数）
 * @param {number} step - 时间步长
 */
function animateWaves(waves, width, height, duration, step) {
  console.log(
    `Waves: ${waves
      .map(
        (w, i) =>
          `#${i + 1}(A=${w.amplitude}, ω=${w.omega}, φ=${w.phase.toFixed(2)})`,
      )
      .join(" + ")}`,
  );
  for (let t = 0; t < duration; t += step) {
    console.log(`\n=== t = ${t.toFixed(2)} ===`);
    const ys = computeWave(waves, width, t);
    printWave(ys, height);
  }
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 单波动画 ############");
const singleWave = [{ amplitude: 1, omega: 0.3, phase: 0 }];
animateWaves(singleWave, 60, 11, 4, 1);

console.log(
  "\n\n############ Test 2: 双波叠加（基波 + 高频小波） ############",
);
const dualWaves = [
  { amplitude: 1, omega: 0.3, phase: 0 }, // 基础波
  { amplitude: 0.5, omega: 0.7, phase: Math.PI / 4 }, // 高频小波
];
animateWaves(dualWaves, 60, 11, 6, 1);

console.log("\n\n############ Test 3: 三波叠加 ############");
const tripleWaves = [
  { amplitude: 1, omega: 0.2, phase: 0 },
  { amplitude: 0.4, omega: 0.6, phase: Math.PI / 3 },
  { amplitude: 0.2, omega: 1.2, phase: Math.PI / 2 },
];
animateWaves(tripleWaves, 70, 13, 6, 1);
