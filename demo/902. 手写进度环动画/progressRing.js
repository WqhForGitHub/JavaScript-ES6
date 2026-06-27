/**
 * @file progressRing.js
 * @description 手写进度环动画：从 0 到目标百分比以缓动方式动画，
 *              打印每帧进度值与 ASCII 圆弧表示。
 *
 * 算法说明：
 *   - 进度环是一个圆，进度百分比 p 对应圆弧角度 = p/100 * 2π。
 *   - 从顶部（-π/2）开始顺时针绘制弧线。
 *   - 使用缓动函数（如 easeOutCubic）让动画先快后慢。
 *   - 每帧采样大量角度点，将圆弧上的点映射到 ASCII 网格。
 */

/**
 * 缓动函数 - easeOutCubic（先快后慢）
 * @param {number} t - 归一化时间 [0,1]
 * @returns {number} 缓动后的进度 [0,1]
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * 缓动函数 - easeInOutQuad
 * @param {number} t - 归一化时间 [0,1]
 * @returns {number}
 */
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * 绘制进度环的 ASCII 表示
 * @param {number} percent - 当前进度百分比 0-100
 * @param {number} radius - 圆环半径（字符数）
 */
function printRing(percent, radius) {
  const size = radius * 2 + 1;
  const grid = Array.from({ length: size }, () => new Array(size).fill(" "));

  const cx = radius;
  const cy = radius;
  // 从顶部 -π/2 开始顺时针，角度跨度 = percent/100 * 2π
  const totalAngle = (percent / 100) * Math.PI * 2;

  // 采样密集角度点，将圆弧画到网格上
  for (
    let angle = -Math.PI / 2;
    angle < -Math.PI / 2 + totalAngle;
    angle += 0.02
  ) {
    const x = Math.round(cx + radius * Math.cos(angle));
    const y = Math.round(cy + radius * Math.sin(angle));
    if (x >= 0 && x < size && y >= 0 && y < size) {
      grid[y][x] = "#";
    }
  }

  // 中心标记
  grid[cy][cx] = "+";

  // 顶部/底部/左右标记参考点
  if (grid[0]) grid[0][cx] = grid[0][cx] === " " ? "." : grid[0][cx];

  for (let r = 0; r < size; r++) {
    console.log(grid[r].join(""));
  }
}

/**
 * 执行进度环动画
 * @param {number} target - 目标百分比 0-100
 * @param {number} duration - 总帧数
 * @param {Function} easing - 缓动函数 (t:number)=>number
 * @param {number} [renderEvery] - 每隔多少帧渲染一次环（默认按比例）
 */
function animateProgressRing(target, duration, easing, renderEvery) {
  const interval = renderEvery || Math.max(1, Math.ceil(duration / 5));
  console.log(
    `Animating progress ring: 0% -> ${target}% over ${duration} frames (${easing.name})\n`,
  );
  for (let frame = 0; frame <= duration; frame++) {
    const t = duration === 0 ? 1 : frame / duration;
    const eased = easing(t);
    const current = target * eased;
    console.log(
      `Frame ${String(frame).padStart(3)}/${duration} -> ${current.toFixed(2)}%`,
    );
    if (frame % interval === 0 || frame === duration) {
      console.log("");
      printRing(current, 8);
      console.log("");
    }
  }
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 目标 75%，easeOutCubic ############");
animateProgressRing(75, 20, easeOutCubic);

console.log("\n\n############ Test 2: 目标 100%，easeInOutQuad ############");
animateProgressRing(100, 16, easeInOutQuad, 4);

console.log("\n\n############ Test 3: 目标 33%，easeOutCubic ############");
animateProgressRing(33, 12, easeOutCubic, 3);
