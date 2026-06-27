/**
 * @file gradient.js
 * @description 手写渐变背景动画：线性渐变的多个色块随时间循环偏移，
 *              在相邻色块之间进行 RGB 线性插值，输出每一步的渐变颜色。
 *
 * 算法说明：
 *   - 色块（stops）按时间 t 循环偏移：offset = t * stops.length，
 *     取整部分决定起始色块索引，小数部分用于在两个相邻色块间插值。
 *   - 渐变方向上（横向），每个位置 pos 映射到色块索引 idx + frac，
 *     在 stops[idx] 与 stops[idx+1] 之间做 RGB 线性插值。
 *   - 输出每行用空格分隔的 hex 颜色串，模拟一维渐变带。
 */

/**
 * 将十六进制颜色转为 RGB 对象
 * @param {string} hex - 如 '#ff8800'
 * @returns {{r:number, g:number, b:number}}
 */
function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return {
    r: parseInt(v.substring(0, 2), 16),
    g: parseInt(v.substring(2, 4), 16),
    b: parseInt(v.substring(4, 6), 16),
  };
}

/**
 * 将 RGB 对象转为十六进制颜色字符串
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} 如 '#ff8800'
 */
function rgbToHex(r, g, b) {
  const h = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * 在两个 RGB 颜色之间做线性插值
 * @param {{r:number,g:number,b:number}} c1 - 起始颜色
 * @param {{r:number,g:number,b:number}} c2 - 结束颜色
 * @param {number} t - 插值因子 [0,1]
 * @returns {{r:number,g:number,b:number}}
 */
function lerpColor(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

/**
 * 按时间 t 对色块进行循环偏移并插值，模拟动画
 * @param {string[]} stops - 颜色停止点（hex 数组）
 * @param {number} t - 时间，0..1 表示一个完整循环
 * @returns {string[]} 偏移并插值后的色块顺序
 */
function shiftStops(stops, t) {
  const n = stops.length;
  const offset = t * n;
  const intOffset = Math.floor(offset);
  const frac = offset - intOffset;
  const result = [];
  for (let i = 0; i < n; i++) {
    const c1 = hexToRgb(stops[(i + intOffset) % n]);
    const c2 = hexToRgb(stops[(i + intOffset + 1) % n]);
    const c = lerpColor(c1, c2, frac);
    result.push(rgbToHex(c.r, c.g, c.b));
  }
  return result;
}

/**
 * 根据当前色块生成渐变颜色数组
 * @param {string[]} stops - 当前色块（hex 数组）
 * @param {number} width - 输出宽度（采样点数）
 * @returns {string[]} hex 颜色数组
 */
function renderGradient(stops, width) {
  const line = [];
  for (let i = 0; i < width; i++) {
    const pos = (i / (width - 1)) * (stops.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const c1 = hexToRgb(stops[idx]);
    const c2 = hexToRgb(stops[Math.min(idx + 1, stops.length - 1)]);
    const c = lerpColor(c1, c2, frac);
    line.push(rgbToHex(c.r, c.g, c.b));
  }
  return line;
}

/**
 * 用字符块表示颜色明暗（辅助可视化）
 * @param {string} hex
 * @returns {string}
 */
function brightnessChar(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const chars = " .:-=+*#%@";
  return chars[Math.min(chars.length - 1, Math.floor(lum * chars.length))];
}

/**
 * 模拟渐变动画
 * @param {string[]} stops - 初始色块
 * @param {number} width - 输出宽度
 * @param {number} steps - 时间步数
 */
function animateGradient(stops, width, steps) {
  console.log(
    `Gradient animation: ${stops.length} stops, ${width} samples, ${steps} steps`,
  );
  console.log(`Initial stops: ${stops.join(" -> ")}\n`);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const currentStops = shiftStops(stops, t);
    const gradient = renderGradient(currentStops, width);
    const ascii = gradient.map(brightnessChar).join("");
    console.log(
      `t=${t.toFixed(2)}: ${ascii}  [${gradient[0]} .. ${gradient[gradient.length - 1]}]`,
    );
  }
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 彩虹渐变 5 色块 ############");
const rainbow = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff"];
animateGradient(rainbow, 40, 12);

console.log("\n\n############ Test 2: 日落渐变 3 色块 ############");
const sunset = ["#001544", "#ff6e40", "#ffd166"];
animateGradient(sunset, 40, 10);

console.log("\n\n############ Test 3: 单色明暗（黑灰白） ############");
const mono = ["#000000", "#808080", "#ffffff", "#808080"];
animateGradient(mono, 30, 8);
