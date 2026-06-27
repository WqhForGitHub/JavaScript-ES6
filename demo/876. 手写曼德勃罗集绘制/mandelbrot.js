/**
 * 手写曼德勃罗集绘制
 *
 * 曼德勃罗集（Mandelbrot Set）是复平面上点集，定义为：
 * 对于复数 c，迭代 z_{n+1} = z_n^2 + c（z_0 = 0），
 * 若序列 |z_n| 始终有界（不超过 2），则 c 属于曼德勃罗集。
 *
 * 算法：
 * - 对每个点 c = x + yi，迭代 z = z^2 + c
 * - 若 |z| > 2，认为发散，记录迭代次数
 * - 若达到最大迭代次数仍未发散，认为属于集合
 *
 * 本实现：在控制台输出 ASCII 字符表示的曼德勃罗集
 */

/**
 * 计算点 c = (cx, cy) 属于曼德勃罗集的迭代次数
 *
 * @param {number} cx 实部
 * @param {number} cy 虚部
 * @param {number} maxIter 最大迭代次数
 * @returns {number} 发散时的迭代次数（若属于集合则返回 maxIter）
 */
function mandelbrotIter(cx, cy, maxIter) {
  let zx = 0;
  let zy = 0;
  let i = 0;
  while (i < maxIter && zx * zx + zy * zy < 4) {
    // z = z^2 + c
    // (zx + zy*i)^2 = zx^2 - zy^2 + 2*zx*zy*i
    const newZx = zx * zx - zy * zy + cx;
    const newZy = 2 * zx * zy + cy;
    zx = newZx;
    zy = newZy;
    i++;
  }
  return i;
}

/**
 * 生成曼德勃罗集的 ASCII 字符表示
 *
 * @param {object} options 选项
 * @param {number} options.width 字符宽度
 * @param {number} options.height 字符高度
 * @param {number} options.xMin 实部最小值
 * @param {number} options.xMax 实部最大值
 * @param {number} options.yMin 虚部最小值
 * @param {number} options.yMax 虚部最大值
 * @param {number} options.maxIter 最大迭代次数
 * @param {string} options.charset 字符集（从集合内到外）
 * @returns {string} ASCII 艺术
 */
function drawMandelbrot(options = {}) {
  const {
    width = 80,
    height = 40,
    xMin = -2.0,
    xMax = 1.0,
    yMin = -1.2,
    yMax = 1.2,
    maxIter = 100,
    charset = "@%#*+=-:. ",
  } = options;

  const lines = [];
  const dx = (xMax - xMin) / width;
  const dy = (yMax - yMin) / height;

  for (let row = 0; row < height; row++) {
    let line = "";
    const cy = yMin + row * dy;
    for (let col = 0; col < width; col++) {
      const cx = xMin + col * dx;
      const iter = mandelbrotIter(cx, cy, maxIter);
      if (iter === maxIter) {
        // 属于集合，用最"密"的字符
        line += charset[0];
      } else {
        // 根据迭代次数选择字符（发散越快字符越"疏"）
        const idx = Math.min(
          charset.length - 1,
          Math.floor((iter / maxIter) * (charset.length - 1)),
        );
        line += charset[idx];
      }
    }
    lines.push(line);
  }
  return lines.join("\n");
}

/**
 * 使用平滑着色生成更细腻的曼德勃罗集
 *
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {number} maxIter 最大迭代次数
 * @returns {string} ASCII 艺术
 */
function drawMandelbrotSmooth(width = 80, height = 40, maxIter = 256) {
  // 更细致的字符集
  const charset = " .:-=+*#%@";
  const xMin = -2.0;
  const xMax = 1.0;
  const yMin = -1.2;
  const yMax = 1.2;
  const dx = (xMax - xMin) / width;
  const dy = (yMax - yMin) / height;
  const lines = [];

  for (let row = 0; row < height; row++) {
    let line = "";
    const cy = yMin + row * dy;
    for (let col = 0; col < width; col++) {
      const cx = xMin + col * dx;
      const iter = mandelbrotIter(cx, cy, maxIter);
      if (iter === maxIter) {
        line += " "; // 集合内部留空
      } else {
        // 对数刻度，让边界更清晰
        const t = Math.log(iter + 1) / Math.log(maxIter);
        const idx = Math.min(
          charset.length - 1,
          Math.floor(t * charset.length),
        );
        line += charset[charset.length - 1 - idx];
      }
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// ===== 测试 =====
console.log("===== 手写曼德勃罗集绘制 =====\n");

// 测试 1：检测点是否属于曼德勃罗集
console.log("1. 点是否属于曼德勃罗集:");
console.log("  c = 0+0i（属于）:", mandelbrotIter(0, 0, 100), "/ 100");
console.log("  c = -1+0i（属于）:", mandelbrotIter(-1, 0, 100), "/ 100");
console.log("  c = 1+0i（不属于）:", mandelbrotIter(1, 0, 100), "/ 100");
console.log("  c = -0.5+0i（属于）:", mandelbrotIter(-0.5, 0, 100), "/ 100");
console.log("  c = 0.5+0i（不属于）:", mandelbrotIter(0.5, 0, 100), "/ 100");

// 测试 2：标准曼德勃罗集（小尺寸）
console.log("\n2. 标准曼德勃罗集（40x20）:");
console.log(drawMandelbrot({ width: 60, height: 24, maxIter: 80 }));

// 测试 3：放大主心形区域
console.log("\n3. 放大主心形区域:");
console.log(
  drawMandelbrot({
    width: 60,
    height: 24,
    xMin: -0.8,
    xMax: 0.4,
    yMin: -0.6,
    yMax: 0.6,
    maxIter: 100,
  }),
);

// 测试 4：高分辨率（大尺寸，终端较宽时效果更好）
console.log("\n4. 高分辨率曼德勃罗集（80x36）:");
console.log(drawMandelbrot({ width: 80, height: 36, maxIter: 150 }));

// 测试 5：平滑着色版
console.log("\n5. 平滑着色版（60x24）:");
console.log(drawMandelbrotSmooth(60, 24, 200));
