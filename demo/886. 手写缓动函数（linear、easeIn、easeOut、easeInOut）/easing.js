/**
 * 缓动函数 (Easing Functions)
 *
 * 每个函数接收归一化时间 t ∈ [0, 1] 表示动画进度，返回缓动后的进度值。
 * 约定: f(0) = 0, f(1) = 1 (首尾对齐)。
 *
 * 包含 linear 以及 easeIn / easeOut / easeInOut 的二次 (Quad)、
 * 三次 (Cubic) 和四次 (Quart) 变体。
 * 公式参考 Robert Penner 的缓动函数 (easings.net)。
 */

const Easing = {
  // 线性: 匀速
  linear: (t) => t,

  // ---- 二次方 (Quad) ----
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  // ---- 三次方 (Cubic) ----
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // ---- 四次方 (Quart) ----
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

// ---- 测试 ----

const testPoints = [0, 0.25, 0.5, 0.75, 1];

const names = [
  "linear",
  "easeInQuad",
  "easeOutQuad",
  "easeInOutQuad",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
  "easeInQuart",
  "easeOutQuart",
  "easeInOutQuart",
];

console.log("缓动函数值表 (t -> f(t)):\n");
console.log(
  "函数".padEnd(16) +
    testPoints.map((t) => `t=${t.toFixed(2)}`.padStart(10)).join(""),
);
for (const name of names) {
  const fn = Easing[name];
  const row =
    name.padEnd(16) +
    testPoints.map((t) => fn(t).toFixed(4).padStart(10)).join("");
  console.log(row);
}

// 边界检查: 所有缓动 f(0) 必须为 0, f(1) 必须为 1
console.log("\n边界检查 (f(0)=0, f(1)=1):");
let allOk = true;
for (const name of names) {
  const fn = Easing[name];
  const v0 = fn(0);
  const v1 = fn(1);
  const ok = Math.abs(v0) < 1e-12 && Math.abs(v1 - 1) < 1e-12;
  if (!ok) allOk = false;
  console.log(
    `  ${name.padEnd(16)} f(0)=${v0}  f(1)=${v1}  ${ok ? "OK" : "FAIL"}`,
  );
}
console.log(allOk ? "\n全部通过边界检查" : "\n存在边界检查失败");

// 单调性检查: 所有缓动应单调递增
console.log("\n单调性检查 (采样 101 点):");
for (const name of names) {
  const fn = Easing[name];
  let monotonic = true;
  let prev = -Infinity;
  for (let i = 0; i <= 100; i++) {
    const v = fn(i / 100);
    if (v < prev - 1e-12) {
      monotonic = false;
      break;
    }
    prev = v;
  }
  console.log(`  ${name.padEnd(16)} ${monotonic ? "单调递增 OK" : "非单调"}`);
}

// ---- ASCII 可视化: 每个缓动函数的曲线图 ----
console.log("\n===== ASCII 曲线图 (横轴 t, 纵轴 f(t)) =====");

/**
 * 打印缓动函数的 ASCII 折线图
 * @param {Function} fn   缓动函数
 * @param {string} name   函数名
 * @param {number} cols   列数 (采样点)
 * @param {number} rows   行数 (图高)
 */
function plotEasing(fn, name, cols = 50, rows = 12) {
  const samples = [];
  for (let i = 0; i <= cols; i++) samples.push(fn(i / cols));

  console.log(`\n${name}:`);
  for (let r = rows; r >= 0; r--) {
    const y = r / rows;
    let line = `${y.toFixed(2)} |`;
    for (let c = 0; c <= cols; c++) {
      const v = samples[c];
      // 该列函数值是否落在当前行带内
      if (Math.abs(v - y) <= 0.5 / rows + 1e-9) {
        line += "*";
      } else {
        line += " ";
      }
    }
    console.log(line);
  }
  console.log("    +" + "-".repeat(cols + 1));
  console.log(
    "     " +
      Array.from({ length: cols + 1 }, (_, i) =>
        i % 10 === 0 ? "|" : " ",
      ).join("") +
      "  t=1.0",
  );
}

for (const name of names) {
  plotEasing(Easing[name], name);
}
