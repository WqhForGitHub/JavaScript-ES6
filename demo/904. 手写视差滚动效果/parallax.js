/**
 * @file parallax.js
 * @description 手写视差滚动效果：多层背景根据滚动位置以不同速度移动。
 *              speed < 1 表示远景（移动慢），speed > 1 表示近景（移动快）。
 *              在一系列滚动位置下打印每层的偏移量与 ASCII 可视化。
 *
 * 算法说明：
 *   - 每层的视觉偏移 = -scrollY * speed（负号表示内容随滚动反向移动）。
 *   - 将每层的内容字符串按偏移量循环平移，再裁剪到视口宽度。
 */

/**
 * 计算各层在给定滚动位置下的偏移量
 * @param {Array<{name:string, speed:number, content:string}>} layers - 图层配置
 * @param {number} scrollY - 滚动位置
 * @returns {Array<{name:string, speed:number, offset:number, content:string}>}
 */
function computeOffsets(layers, scrollY) {
  return layers.map((layer) => ({
    name: layer.name,
    speed: layer.speed,
    offset: -scrollY * layer.speed,
    content: layer.content,
  }));
}

/**
 * 渲染某一滚动位置下所有图层的 ASCII 可视化
 * @param {Array<{name:string, speed:number, content:string}>} layers - 图层数组
 * @param {number} scrollY - 滚动位置
 * @param {number} viewportWidth - 视口宽度（字符数）
 */
function renderParallax(layers, scrollY, viewportWidth) {
  console.log(`\n=== ScrollY = ${scrollY} ===`);
  const offsets = computeOffsets(layers, scrollY);

  for (const layer of offsets) {
    const len = layer.content.length;
    // 计算循环平移量（取模保证非负，取整保证索引有效）
    const shift = Math.round(((layer.offset % len) + len) % len);
    let line = "";
    for (let i = 0; i < viewportWidth; i++) {
      line += layer.content[(i + shift) % len];
    }
    console.log(
      `[${layer.name} speed=${layer.speed}] offset=${layer.offset.toFixed(1)}\n  ${line}`,
    );
  }
}

/**
 * 模拟一系列滚动位置下的视差效果
 * @param {Array<{name:string, speed:number, content:string}>} layers - 图层数组
 * @param {number[]} scrollPositions - 滚动位置序列
 * @param {number} viewportWidth - 视口宽度
 */
function simulateParallax(layers, scrollPositions, viewportWidth) {
  console.log("Parallax scrolling simulation:");
  console.log("Layers:");
  layers.forEach((l) =>
    console.log(`  - ${l.name}: speed=${l.speed} (远景<1, 近景>1)`),
  );
  for (const scrollY of scrollPositions) {
    renderParallax(layers, scrollY, viewportWidth);
  }
}

// ======================== 测试用例 ========================

const layers = [
  {
    name: "Sky     ",
    speed: 0.2,
    content: ".-^-.-^-.-^-.-^-.-^-.-^-.-^-.-^-.-^-.-^-",
  },
  {
    name: "Mountain",
    speed: 0.5,
    content: "/\\___/\\___/\\___/\\___/\\___/\\___/\\___/\\___",
  },
  {
    name: "Tree    ",
    speed: 0.8,
    content: "T  T  T  T  T  T  T  T  T  T  T  T  T  ",
  },
  {
    name: "Ground  ",
    speed: 1.2,
    content: "#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=",
  },
];

console.log("############ Test 1: 逐步滚动 0 -> 25 ############");
simulateParallax(layers, [0, 5, 10, 15, 20, 25], 38);

console.log("\n\n############ Test 2: 单层对比（不同 speed） ############");
const singleLayers = [
  { name: "Far  ", speed: 0.3, content: "0123456789012345678901234567890123" },
  { name: "Mid  ", speed: 1.0, content: "0123456789012345678901234567890123" },
  { name: "Near ", speed: 2.0, content: "0123456789012345678901234567890123" },
];
simulateParallax(singleLayers, [0, 3, 6, 9], 34);
