/**
 * @file numberScroll.js
 * @description 手写数字滚动动画：从起始值到结束值以缓动方式滚动，
 *              模拟里程表（odometer）效果，支持小数、自定义时长与缓动函数。
 *
 * 算法说明：
 *   - 在每一帧根据归一化时间 t (0..1) 经缓动函数得到 eased，
 *     当前值 = start + (end - start) * eased。
 *   - 支持小数位数格式化与千分位显示。
 *   - 通过逐帧打印数值即可看到滚动效果。
 */

/**
 * 线性缓动（匀速）
 * @param {number} t - 归一化时间 [0,1]
 * @returns {number}
 */
function linear(t) {
  return t;
}

/**
 * easeOutQuart 缓动（先快后慢，末段精细）
 * @param {number} t
 * @returns {number}
 */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * easeInOutCubic 缓动（先慢-快-慢）
 * @param {number} t
 * @returns {number}
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * easeOutBounce 缓动（弹跳效果，模拟里程表回弹）
 * @param {number} t
 * @returns {number}
 */
function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/**
 * 格式化数字显示，支持小数位数与千分位
 * @param {number} value - 数值
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
function formatNumber(value, decimals) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 数字滚动动画
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} duration - 总帧数
 * @param {Function} easing - 缓动函数
 * @param {number} [decimals=0] - 保留小数位数
 */
function animateNumberScroll(start, end, duration, easing, decimals = 0) {
  console.log(
    `Scrolling from ${formatNumber(start, decimals)} to ${formatNumber(
      end,
      decimals,
    )} over ${duration} frames (${easing.name}, ${decimals} decimals)\n`,
  );
  for (let frame = 0; frame <= duration; frame++) {
    const t = duration === 0 ? 1 : frame / duration;
    const eased = easing(t);
    const current = start + (end - start) * eased;
    console.log(
      `Frame ${String(frame).padStart(3)}: ${formatNumber(current, decimals)}`,
    );
  }
}

// ======================== 测试用例 ========================

console.log(
  "############ Test 1: 整数滚动 0 -> 1000, easeOutQuart ############",
);
animateNumberScroll(0, 1000, 15, easeOutQuart, 0);

console.log(
  "\n\n############ Test 2: 小数滚动 0.00 -> 99.99, easeInOutCubic ############",
);
animateNumberScroll(0, 99.99, 15, easeInOutCubic, 2);

console.log("\n\n############ Test 3: 倒计数 2024 -> 0, linear ############");
animateNumberScroll(2024, 0, 10, linear, 0);

console.log(
  "\n\n############ Test 4: 弹跳结束 0 -> 8888, easeOutBounce ############",
);
animateNumberScroll(0, 8888, 20, easeOutBounce, 0);
