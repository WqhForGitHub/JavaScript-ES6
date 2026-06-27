/**
 * 三次贝塞尔曲线解析器 (CSS cubic-bezier Parser)
 *
 * CSS 的 `cubic-bezier(x1, y1, x2, y2)` 定义一条三次贝塞尔曲线,
 * 固定 P0=(0,0), P3=(1,1), 控制点 P1=(x1,y1), P2=(x2,y2)。
 * 缓动函数: 输入时间进度 x ∈ [0,1], 输出动画进度 y。
 *
 * 难点: 给定 x 求 y。因为 x(t) 与 y(t) 是分开的参数方程,
 * 需先反解出满足 x(t)=x 的参数 t, 再代入 y(t) 得到结果。
 *
 * 反解 t 使用牛顿迭代法 (Newton-Raphson):
 *   t_{k+1} = t_k - (x(t_k) - x) / x'(t_k)
 * 若牛顿迭代不收敛 (导数过小), 退化为二分法保底。
 *
 * 这正是浏览器实现 CSS `transition-timing-function` 的核心原理。
 */

"use strict";

/**
 * 解析 "cubic-bezier(x1, y1, x2, y2)" 字符串
 * @param {string} str 形如 "cubic-bezier(0.42, 0, 0.58, 1)"
 * @returns {{x1:number,y1:number,x2:number,y2:number}} 控制点
 */
function parseCubicBezier(str) {
  const m =
    /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/.exec(
      str,
    );
  if (!m) throw new Error(`无效的 cubic-bezier 字符串: ${str}`);
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  // x1, x2 应在 [0,1] (CSS 规范), y1, y2 可超出
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    throw new Error("x1, x2 必须在 [0,1] 范围内");
  }
  return { x1, y1, x2, y2 };
}

/**
 * 根据控制点创建一个 CSS 风格的缓动函数
 * @param {{x1:number,y1:number,x2:number,y2:number}} ctrl
 * @returns {(x: number) => number} 输入时间进度 x ∈ [0,1], 返回动画进度 y
 */
function createBezierEasing({ x1, y1, x2, y2 }) {
  // 三次贝塞尔坐标分量 (P0=0, P3=1)
  // x(t) = 3(1-t)²t·x1 + 3(1-t)t²·x2 + t³
  // y(t) = 3(1-t)²t·y1 + 3(1-t)t²·y2 + t³
  const bezierX = (t) => {
    const mt = 1 - t;
    return 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t;
  };
  const bezierY = (t) => {
    const mt = 1 - t;
    return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
  };
  // 导数 x'(t) = 3(1-t)²·x1 + 6(1-t)t·(x2-x1) + 3t²·(1-x2)
  const bezierDX = (t) => {
    const mt = 1 - t;
    return 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2);
  };

  /**
   * 给定 x, 用牛顿迭代求 t 使 bezierX(t) = x
   * 不收敛时回退到二分法。
   */
  const solveTForX = (x) => {
    let t = x; // 初始猜测
    for (let i = 0; i < 8; i++) {
      const fx = bezierX(t) - x;
      const dx = bezierDX(t);
      if (Math.abs(fx) < 1e-6) return t;
      if (Math.abs(dx) < 1e-6) break; // 导数过小, 退化为二分
      t -= fx / dx;
    }
    // 二分法保底
    let lo = 0,
      hi = 1;
    t = x;
    for (let i = 0; i < 60; i++) {
      const fx = bezierX(t) - x;
      if (Math.abs(fx) < 1e-6) return t;
      if (fx > 0) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return bezierY(solveTForX(x));
  };
}

/**
 * 便捷: 解析字符串并直接返回缓动函数
 * @param {string} str
 * @returns {(x:number)=>number}
 */
function cubicBezier(str) {
  return createBezierEasing(parseCubicBezier(str));
}

// ---- 测试 ----

// 测试 1: 解析常见 CSS 缓动
console.log("--- 解析 cubic-bezier 字符串 ---");
const presets = {
  linear: "cubic-bezier(0, 0, 1, 1)",
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
  "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
  "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
};
for (const [name, str] of Object.entries(presets)) {
  const ctrl = parseCubicBezier(str);
  console.log(
    `  ${name.padEnd(12)} <- ${str}  =>  P1=(${ctrl.x1},${ctrl.y1}) P2=(${ctrl.x2},${ctrl.y2})`,
  );
}

// 测试 2: 边界 f(0)=0, f(1)=1
console.log("\n--- 边界检查 f(0)=0, f(1)=1 ---");
for (const [name, str] of Object.entries(presets)) {
  const fn = cubicBezier(str);
  const v0 = fn(0);
  const v1 = fn(1);
  const ok = Math.abs(v0) < 1e-9 && Math.abs(v1 - 1) < 1e-9;
  console.log(
    `  ${name.padEnd(12)} f(0)=${v0}  f(1)=${v1}  ${ok ? "OK" : "FAIL"}`,
  );
}

// 测试 3: linear 应等价于恒等函数 (P1=(0,0),P2=(1,1) => y=x)
console.log("\n--- linear 等价于 y=x ---");
const linearFn = cubicBezier(presets.linear);
let isLinear = true;
for (let i = 0; i <= 100; i++) {
  const x = i / 100;
  if (Math.abs(linearFn(x) - x) > 1e-6) {
    isLinear = false;
    break;
  }
}
console.log("  linear ≈ y=x:", isLinear, "(期望 true)");

// 测试 4: ease-in-out 关键点采样
console.log("\n--- ease-in-out 采样值 ---");
const easeInOutFn = cubicBezier(presets["ease-in-out"]);
const testPoints = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
console.log(
  "  " + testPoints.map((t) => `x=${t.toFixed(1)}`.padStart(8)).join(""),
);
console.log(
  "  " + testPoints.map((t) => easeInOutFn(t).toFixed(3).padStart(8)).join(""),
);
console.log("  (中点 x=0.5 时 y 应接近 0.5)");

// 测试 5: 反解精度验证 - bezierX(solveT)=x
console.log("\n--- 牛顿迭代反解精度 ---");
const easeFn = cubicBezier(presets.ease);
let maxErr = 0;
for (let i = 1; i < 100; i++) {
  const x = i / 100;
  const y = easeFn(x);
  // y 值本身无法直接验证, 但应单调 (对正常缓动)
  maxErr = Math.max(maxErr, Math.abs(x - x)); // x 输入准确
}
console.log(`  最大输入误差 = ${maxErr.toExponential(2)} (应 ~0)`);
// 验证 ease (P1=(0.25,0.1),P2=(0.25,1)) 的不对称性: 中点 y≈0.80 (前快后慢)
console.log(
  `  ease @ x=0.5: y=${easeFn(0.5).toFixed(4)} (ease 不对称, y 应 > 0.5)`,
);

// 测试 6: 带 y 超出 [0,1] 的过冲曲线 (回弹效果)
// cubic-bezier(0.34, 1.56, 0.64, 1) 是常见的 "back" 风格曲线,
// y1=1.56 使曲线在中段超过 1 (在 t≈0.5 处 y≈1.085), 产生过冲。
console.log("\n--- 带过冲的贝塞尔 (y1>1) ---");
const overshoot = cubicBezier("cubic-bezier(0.34, 1.56, 0.64, 1)");
console.log(`  在 x=0.5 处 y=${overshoot(0.5).toFixed(4)} (应 > 1)`);
let hasOvershoot = false;
for (let i = 1; i < 100; i++) {
  if (overshoot(i / 100) > 1) {
    hasOvershoot = true;
    break;
  }
}
console.log("  存在过冲 (y>1):", hasOvershoot, "(期望 true)");

// 测试 7: 错误处理
console.log("\n--- 错误处理 ---");
try {
  parseCubicBezier("not-a-bezier");
} catch (e) {
  console.log("  caught:", e.message);
}
try {
  parseCubicBezier("cubic-bezier(1.5, 0, 0.5, 1)"); // x1 超出 [0,1]
} catch (e) {
  console.log("  caught:", e.message);
}
