/**
 * 弹性缓动 (Elastic Easing)
 *
 * 弹性缓动基于指数衰减的正弦波, 产生类似弹簧振动的过冲效果。
 * 公式参考 Robert Penner 缓动函数 (easings.net)。
 *
 *  - easeInElastic:   起始处振荡, 逐渐收敛到 1
 *  - easeOutElastic:  从 0 弹出, 末尾处振荡衰减
 *  - easeInOutElastic:两端均振荡
 *
 * 核心思想: 振幅按 2 的指数衰减, 频率由 (2π/3) 或 (2π/4.5) 决定。
 * 边界约定: f(0) = 0, f(1) = 1。
 */

"use strict";

const Easing = {
  /**
   * easeInElastic: 起始处振荡放大
   * @param {number} t ∈ [0,1]
   * @returns {number}
   */
  easeInElastic(t) {
    const c4 = (2 * Math.PI) / 3; // 周期常数
    if (t === 0) return 0;
    if (t === 1) return 1;
    // -2^(10t-10) · sin((10t - 10.75)·c4)
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  /**
   * easeOutElastic: 末尾处振荡衰减
   * @param {number} t ∈ [0,1]
   * @returns {number}
   */
  easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    // 2^(-10t) · sin((10t - 0.75)·c4) + 1
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  /**
   * easeInOutElastic: 两端振荡
   * @param {number} t ∈ [0,1]
   * @returns {number}
   */
  easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) {
      // -(2^(20t-10) · sin((20t - 11.125)·c5)) / 2
      return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    }
    // (2^(-20t+10) · sin((20t - 11.125)·c5)) / 2 + 1
    return (
      (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
    );
  },
};

/**
 * 在 [0,1] 上采样缓动函数, 打印 ASCII 折线图
 * @param {Function} fn  缓动函数
 * @param {string} name  函数名
 * @param {number} cols  列数 (采样点)
 * @param {number} rows  行数 (图高)
 */
function plotEasing(fn, name, cols = 60, rows = 16) {
  const samples = [];
  for (let i = 0; i <= cols; i++) samples.push(fn(i / cols));

  console.log(`\n${name}:`);
  // 从顶 (y=1) 到底 (y=0) 逐行绘制
  for (let r = rows; r >= 0; r--) {
    const y = r / rows;
    let line = `${y.toFixed(2)} |`;
    for (let c = 0; c <= cols; c++) {
      // 该列的函数值是否落在当前行带 [y - 0.5/rows, y + 0.5/rows]
      const v = samples[c];
      if (Math.abs(v - y) <= 0.5 / rows + 1e-9) {
        line += "*";
      } else {
        line += " ";
      }
    }
    console.log(line);
  }
  console.log("    +" + "-".repeat(cols + 1));
}

// ---- 测试 ----

// 测试 1: 关键点采样值
const testPoints = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
const names = ["easeInElastic", "easeOutElastic", "easeInOutElastic"];

console.log("弹性缓动函数值表 (t -> f(t)):\n");
console.log(
  "函数".padEnd(20) + testPoints.map((t) => t.toFixed(2).padStart(8)).join(""),
);
for (const name of names) {
  const fn = Easing[name];
  const row =
    name.padEnd(20) +
    testPoints.map((t) => fn(t).toFixed(3).padStart(8)).join("");
  console.log(row);
}

// 测试 2: 边界检查 f(0)=0, f(1)=1
console.log("\n边界检查 (f(0)=0, f(1)=1):");
let allOk = true;
for (const name of names) {
  const fn = Easing[name];
  const v0 = fn(0);
  const v1 = fn(1);
  const ok = Math.abs(v0) < 1e-12 && Math.abs(v1 - 1) < 1e-12;
  if (!ok) allOk = false;
  console.log(
    `  ${name.padEnd(20)} f(0)=${v0}  f(1)=${v1}  ${ok ? "OK" : "FAIL"}`,
  );
}
console.log(allOk ? "\n全部通过边界检查" : "\n存在边界检查失败");

// 测试 3: easeOutElastic 在 t 较小时会出现过冲 (>1)
console.log("\n过冲检测 (easeOutElastic 应在 t≈0.3 附近超过 1):");
let overshoot = false;
for (let i = 1; i < 100; i++) {
  if (Easing.easeOutElastic(i / 100) > 1) {
    overshoot = true;
    break;
  }
}
console.log("  easeOutElastic 存在过冲 (>1):", overshoot, "(期望 true)");

// 测试 4: ASCII 折线图
for (const name of names) {
  plotEasing(Easing[name], name);
}
