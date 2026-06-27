/**
 * 回弹缓动 (Bounce Easing)
 *
 * 回弹缓动模拟球落地反弹的效果, 由多段抛物线 (二次函数) 拼接而成。
 * 每次反弹高度按几何级数衰减, 公式参考 easings.net。
 *
 *  - easeOutBounce:    末尾处多次反弹, 是回弹缓动的基础
 *  - easeInBounce:     easeOutBounce 的镜像 (反向时间)
 *  - easeInOutBounce:  前半段 easeIn, 后半段 easeOut
 *
 * 核心常数: n1 = 7.5625, d1 = 2.75 (经调试使反弹点高度自然衰减)。
 * 边界约定: f(0) = 0, f(1) = 1。
 */

"use strict";

/**
 * easeOutBounce: 回弹缓动的基础实现
 * 由 4 段抛物线拼接, 反弹点分别在 1/d1, 2/d1, 2.5/d1 处,
 * 反弹峰值依次为 0.75, 0.9375, 0.984375 (逐渐接近 1)。
 * @param {number} t ∈ [0,1]
 * @returns {number}
 */
function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    t -= 1.5 / d1;
    return n1 * t * t + 0.75;
  } else if (t < 2.5 / d1) {
    t -= 2.25 / d1;
    return n1 * t * t + 0.9375;
  } else {
    t -= 2.625 / d1;
    return n1 * t * t + 0.984375;
  }
}

/**
 * easeInBounce: 起始处回弹 (easeOutBounce 的时间反演)
 * @param {number} t ∈ [0,1]
 * @returns {number}
 */
function easeInBounce(t) {
  return 1 - easeOutBounce(1 - t);
}

/**
 * easeInOutBounce: 前半 easeIn, 后半 easeOut
 * @param {number} t ∈ [0,1]
 * @returns {number}
 */
function easeInOutBounce(t) {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
}

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
  for (let r = rows; r >= 0; r--) {
    const y = r / rows;
    let line = `${y.toFixed(2)} |`;
    for (let c = 0; c <= cols; c++) {
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
const fns = [
  ["easeInBounce", easeInBounce],
  ["easeOutBounce", easeOutBounce],
  ["easeInOutBounce", easeInOutBounce],
];

console.log("回弹缓动函数值表 (t -> f(t)):\n");
console.log(
  "函数".padEnd(20) + testPoints.map((t) => t.toFixed(2).padStart(8)).join(""),
);
for (const [name, fn] of fns) {
  const row =
    name.padEnd(20) +
    testPoints.map((t) => fn(t).toFixed(3).padStart(8)).join("");
  console.log(row);
}

// 测试 2: 边界检查 f(0)=0, f(1)=1
console.log("\n边界检查 (f(0)=0, f(1)=1):");
let allOk = true;
for (const [name, fn] of fns) {
  const v0 = fn(0);
  const v1 = fn(1);
  const ok = Math.abs(v0) < 1e-12 && Math.abs(v1 - 1) < 1e-12;
  if (!ok) allOk = false;
  console.log(
    `  ${name.padEnd(20)} f(0)=${v0}  f(1)=${v1}  ${ok ? "OK" : "FAIL"}`,
  );
}
console.log(allOk ? "\n全部通过边界检查" : "\n存在边界检查失败");

// 测试 3: 值域检查 - 所有值应在 [0,1] 内 (回弹不超调)
console.log("\n值域检查 (所有值应 ∈ [0, 1]):");
for (const [name, fn] of fns) {
  let inRange = true;
  let minV = Infinity,
    maxV = -Infinity;
  for (let i = 0; i <= 1000; i++) {
    const v = fn(i / 1000);
    if (v < -1e-9 || v > 1 + 1e-9) inRange = false;
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }
  console.log(
    `  ${name.padEnd(20)} 范围 [${minV.toFixed(4)}, ${maxV.toFixed(4)}]  ${inRange ? "OK" : "FAIL"}`,
  );
}

// 测试 4: easeOutBounce 反弹点验证
// 由于 n1 = d1² = 2.75² = 7.5625, 各段抛物线在段切换点 (1/d1, 2/d1, 2.5/d1)
// 恰好达到峰值 1.0; 在段中点 (1.5/d1, 2.25/d1, 2.625/d1) 达到谷值
// 0.75, 0.9375, 0.984375 (谷值逐次递增, 形成衰减反弹)
console.log("\neaseOutBounce 反弹点验证 (峰值=1, 谷值递增):");
console.log(
  `  峰值 t=1/d1  ≈${(1 / 2.75).toFixed(4)}: f=${easeOutBounce(1 / 2.75).toFixed(4)} (期望 1.0)`,
);
console.log(
  `  谷值 t=1.5/d1≈${(1.5 / 2.75).toFixed(4)}: f=${easeOutBounce(1.5 / 2.75).toFixed(4)} (期望 0.75)`,
);
console.log(
  `  峰值 t=2/d1  ≈${(2 / 2.75).toFixed(4)}: f=${easeOutBounce(2 / 2.75).toFixed(4)} (期望 1.0)`,
);
console.log(
  `  谷值 t=2.25/d1≈${(2.25 / 2.75).toFixed(4)}: f=${easeOutBounce(2.25 / 2.75).toFixed(4)} (期望 0.9375)`,
);
console.log(
  `  峰值 t=2.5/d1≈${(2.5 / 2.75).toFixed(4)}: f=${easeOutBounce(2.5 / 2.75).toFixed(4)} (期望 1.0)`,
);

// 测试 5: ASCII 折线图
for (const [name, fn] of fns) {
  plotEasing(fn, name);
}
