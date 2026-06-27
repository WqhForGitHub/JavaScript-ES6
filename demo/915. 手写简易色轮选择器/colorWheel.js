/**
 * 手写简易色轮选择器
 *
 * 功能：
 * 1. 实现 HSL -> RGB 转换。
 * 2. 实现 HSV/HSB -> RGB 转换。
 * 3. 实现 RGB -> HSL、RGB -> HSV 反向转换。
 * 4. 生成色轮：对 0-360 度的色相(hue)采样，输出对应的 RGB 值表格。
 * 5. 用 ASCII 字符表示不同色相在色轮环上的分布。
 *
 * 色相环对应关系（H=0 红色, 120 绿色, 240 蓝色）：
 *   红 -> 黄 -> 绿 -> 青 -> 蓝 -> 品红 -> 红
 */

/**
 * 把 0-1 的浮点分量转换为 0-255 的整数。
 * @param {number} c - 0~1 浮点。
 * @returns {number} 0~255 整数。
 */
function to255(c) {
  return Math.round(c * 255);
}

/**
 * HSL 转 RGB。
 * @param {number} h - 色相 [0,360)。
 * @param {number} s - 饱和度 [0,1]。
 * @param {number} l - 亮度 [0,1]。
 * @returns {{r:number,g:number,b:number}} RGB 0-255。
 */
function hslToRgb(h, s, l) {
  // 把 h 归一化到 [0,1)
  const hue = (((h % 360) + 360) % 360) / 360;
  let r, g, b;
  if (s === 0) {
    // 灰度
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }
  return { r: to255(r), g: to255(g), b: to255(b) };
}

/**
 * 辅助：根据色相段计算单通道值。
 * @param {number} p
 * @param {number} q
 * @param {number} t
 * @returns {number}
 */
function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/**
 * HSV(HSB) 转 RGB。
 * @param {number} h - 色相 [0,360)。
 * @param {number} s - 饱和度 [0,1]。
 * @param {number} v - 明度 [0,1]。
 * @returns {{r:number,g:number,b:number}} RGB 0-255。
 */
function hsvToRgb(h, s, v) {
  const hue = (((h % 360) + 360) % 360) / 360;
  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return { r: to255(r), g: to255(g), b: to255(b) };
}

/**
 * RGB 转 HSL。
 * @param {number} r - 0-255。
 * @param {number} g - 0-255。
 * @param {number} b - 0-255。
 * @returns {{h:number,s:number,l:number}} h 单位为度，s/l 为 0-1。
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: round(s, 4), l: round(l, 4) };
}

/**
 * RGB 转 HSV。
 * @param {number} r - 0-255。
 * @param {number} g - 0-255。
 * @param {number} b - 0-255。
 * @returns {{h:number,s:number,v:number}} h 单位为度，s/v 为 0-1。
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: round(s, 4), v: round(v, 4) };
}

/**
 * 四舍五入到指定小数位。
 * @param {number} n
 * @param {number} digits
 * @returns {number}
 */
function round(n, digits) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

/**
 * 把 RGB 转为十六进制字符串，如 "#FF0000"。
 * @param {{r:number,g:number,b:number}} rgb
 * @returns {string}
 */
function rgbToHex(rgb) {
  const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 生成色轮表格：对 0-360 度色相采样，输出 HSL -> RGB。
 * @param {number} [step=30] - 采样步长（度）。
 * @param {number} [s=1] - 饱和度。
 * @param {number} [l=0.5] - 亮度。
 * @returns {string} 表格字符串。
 */
function generateColorWheelTable(step = 30, s = 1, l = 0.5) {
  const rows = [];
  rows.push("色相(H) | RGB           | HEX     | HSV->RGB          | 颜色名");
  rows.push("-".repeat(70));
  const colorNames = {
    0: "红",
    30: "橙",
    60: "黄",
    90: "黄绿",
    120: "绿",
    150: "青绿",
    180: "青",
    210: "青蓝",
    240: "蓝",
    270: "蓝紫",
    300: "品红",
    330: "玫红",
    360: "红",
  };
  for (let h = 0; h <= 360; h += step) {
    const rgb = hslToRgb(h, s, l);
    const hsvRgb = hsvToRgb(h, s, l); // 同样色相下的 HSV
    const hex = rgbToHex(rgb);
    const name = colorNames[h] || "";
    const rgbStr = `(${String(rgb.r).padStart(3)},${String(rgb.g).padStart(3)},${String(rgb.b).padStart(3)})`;
    const hsvStr = `(${String(hsvRgb.r).padStart(3)},${String(hsvRgb.g).padStart(3)},${String(hsvRgb.b).padStart(3)})`;
    rows.push(
      `${String(h).padStart(6)}° | ${rgbStr} | ${hex} | ${hsvStr} | ${name}`,
    );
  }
  return rows.join("\n");
}

/**
 * 用 ASCII 字符画一个色轮环（俯视图）。
 * 用字符密度表示色相位置；中心为白色。
 * @param {number} [radius=8] - 色轮半径（字符）。
 * @returns {string} ASCII 色轮字符串。
 */
function renderColorWheelAscii(radius = 8) {
  const size = radius * 2 + 1;
  const grid = Array.from({ length: size }, () => Array(size).fill(" "));
  // 用字符梯度表示色相亮度
  const chars = ["#", "*", "+", "=", "-", ".", " "];
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const dist = Math.sqrt(x * x + y * y);
      if (dist > radius) continue;
      if (dist < radius * 0.3) {
        // 中心：白色
        grid[y + radius][x + radius] = "o";
        continue;
      }
      // 计算色相角度（0-360）
      let angle = (Math.atan2(y, x) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      const rgb = hslToRgb(angle, 1, 0.5);
      // 用 RGB 平均亮度选择字符
      const avg = (rgb.r + rgb.g + rgb.b) / 3;
      const idx = Math.min(
        chars.length - 1,
        Math.floor((avg / 255) * chars.length),
      );
      grid[y + radius][x + radius] = chars[idx];
    }
  }
  return grid.map((row) => row.join("")).join("\n");
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：HSL 色轮表格（步长 30°） =====");
console.log(generateColorWheelTable(30, 1, 0.5));

console.log("\n===== 测试 2：关键色相验证 =====");
console.log(
  "HSL(0,100%,50%)   红   ->",
  hslToRgb(0, 1, 0.5),
  rgbToHex(hslToRgb(0, 1, 0.5)),
);
console.log(
  "HSL(120,100%,50%) 绿   ->",
  hslToRgb(120, 1, 0.5),
  rgbToHex(hslToRgb(120, 1, 0.5)),
);
console.log(
  "HSL(240,100%,50%) 蓝   ->",
  hslToRgb(240, 1, 0.5),
  rgbToHex(hslToRgb(240, 1, 0.5)),
);
console.log(
  "HSL(60,100%,50%)  黄   ->",
  hslToRgb(60, 1, 0.5),
  rgbToHex(hslToRgb(60, 1, 0.5)),
);

console.log("\n===== 测试 3：HSV 转 RGB =====");
console.log("HSV(0,100%,100%)   ->", hsvToRgb(0, 1, 1));
console.log("HSV(180,100%,100%) ->", hsvToRgb(180, 1, 1));
console.log("HSV(120,100%,100%) ->", hsvToRgb(120, 1, 1));

console.log("\n===== 测试 4：反向转换 RGB -> HSL/HSV =====");
console.log("RGB(255,0,0)   -> HSL:", rgbToHsl(255, 0, 0));
console.log("RGB(0,255,0)   -> HSL:", rgbToHsl(0, 255, 0));
console.log("RGB(128,128,128)-> HSL:", rgbToHsl(128, 128, 128));
console.log("RGB(255,0,0)   -> HSV:", rgbToHsv(255, 0, 0));

console.log("\n===== 测试 5：往返转换一致性 =====");
const orig = { h: 200, s: 0.8, l: 0.6 };
const rgb = hslToRgb(orig.h, orig.s, orig.l);
const back = rgbToHsl(rgb.r, rgb.g, rgb.b);
console.log(
  `HSL(${orig.h},${orig.s},${orig.l}) -> RGB${JSON.stringify(rgb)} -> HSL(${back.h},${back.s},${back.l})`,
);

console.log("\n===== 测试 6：ASCII 色轮（字符密度表示色相） =====");
console.log(renderColorWheelAscii(8));

console.log("\n说明：ASCII 色轮中 # 表示高亮色相区域，o 表示中心，");
console.log("字符密度按该色相在 HSL(s=1,l=0.5) 下的 RGB 亮度选择。");
