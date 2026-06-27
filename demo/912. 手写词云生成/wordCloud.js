/**
 * 手写词云生成
 *
 * 词云算法思路：
 * 1. 输入：单词-频率数组 [{word, count}]。
 * 2. 根据频率计算每个词的字体大小（count 越大，显示越长）。
 * 3. 使用贪心放置策略：词按频率从高到低排序，从画布中心开始螺旋搜索可放置位置。
 * 4. 碰撞检测：维护已放置词的矩形区域，新词不能与已有词重叠。
 * 5. 渲染为 ASCII：用词本身作为内容，重复字符以模拟不同字号（这里用词的可见长度表示大小）。
 */

/**
 * @typedef {Object} WordItem
 * @property {string} word - 单词文本。
 * @property {number} count - 出现频次。
 */

/**
 * @typedef {Object} PlacedWord
 * @property {string} word - 单词文本。
 * @property {number} x - 左上角 x 坐标。
 * @property {number} y - 左上角 y 坐标。
 * @property {number} w - 占据宽度（字符数）。
 * @property {number} h - 占据高度（行数）。
 * @property {number} size - 字号等级。
 */

/**
 * 根据频次范围把每个词映射到字号等级。
 * @param {WordItem[]} items - 输入词频数组。
 * @param {number} [minSize=1] - 最小字号（行数）。
 * @param {number} [maxSize=4] - 最大字号（行数）。
 * @returns {{word:string,size:number,count:number}[]} 带字号等级的词列表。
 */
function computeSizes(items, minSize = 1, maxSize = 4) {
  if (items.length === 0) return [];
  const counts = items.map((i) => i.count);
  const cMin = Math.min(...counts);
  const cMax = Math.max(...counts);
  const range = cMax - cMin || 1;
  return items.map((i) => {
    const ratio = (i.count - cMin) / range;
    const size = Math.round(minSize + ratio * (maxSize - minSize));
    return { word: i.word, count: i.count, size };
  });
}

/**
 * 判断两个矩形是否相交。
 * @param {{x:number,y:number,w:number,h:number}} a - 矩形 a。
 * @param {{x:number,y:number,w:number,h:number}} b - 矩形 b。
 * @returns {boolean} 是否相交。
 */
function intersects(a, b) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

/**
 * 阿基米德螺旋生成器：从中心向外螺旋搜索可用位置。
 * @param {number} cx - 中心 x。
 * @param {number} cy - 中心 y。
 * @returns {Function} 调用一次返回下一个候选坐标 {x,y}。
 */
function spiralGenerator(cx, cy) {
  let theta = 0;
  const step = 0.3; // 角度步长
  const b = 0.6; // 螺旋扩张速率
  return () => {
    const r = b * theta;
    const x = Math.round(cx + r * Math.cos(theta));
    const y = Math.round(cy + r * Math.sin(theta) * 0.5); // y 方向压缩使布局更紧凑
    theta += step;
    return { x, y };
  };
}

/**
 * 把一个词放置到画布中（贪心螺旋搜索）。
 * @param {PlacedWord[]} placed - 已放置的词列表。
 * @param {{word:string,size:number}} item - 当前词。
 * @param {number} cx - 中心 x。
 * @param {number} cy - 中心 y。
 * @param {number} maxIter - 最大搜索次数。
 * @returns {PlacedWord|null} 放置结果或 null（放不下）。
 */
function placeWord(placed, item, cx, cy, maxIter = 500) {
  // 字号越大，占用的宽高越大
  const w = item.word.length * item.size;
  const h = item.size;

  const next = spiralGenerator(cx, cy);
  for (let i = 0; i < maxIter; i++) {
    const p = next();
    const rect = {
      x: p.x - Math.floor(w / 2),
      y: p.y - Math.floor(h / 2),
      w,
      h,
    };
    let ok = true;
    for (const ex of placed) {
      if (intersects(rect, ex)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      return { word: item.word, x: rect.x, y: rect.y, w, h, size: item.size };
    }
  }
  return null;
}

/**
 * 生成词云布局。
 * @param {WordItem[]} items - 词频数据。
 * @param {number} [width=60] - 画布宽度。
 * @param {number} [height=20] - 画布高度。
 * @returns {PlacedWord[]} 已放置的词列表。
 */
function generateWordCloud(items, width = 60, height = 20) {
  // 按频次降序排序，先放大词
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const sized = computeSizes(sorted, 1, 4);

  const placed = [];
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  for (const item of sized) {
    const p = placeWord(placed, item, cx, cy);
    if (p) placed.push(p);
  }
  return placed;
}

/**
 * 把词云渲染成 ASCII 图。
 * 用不同字符密度表示字号：size 越大，字符越“粗”。
 * 这里简化为：词显示自身文本，字号大的词重复显示（高度按 size 行数铺满）。
 * @param {PlacedWord[]} placed - 已放置的词。
 * @param {number} width - 画布宽度。
 * @param {number} height - 画布高度。
 * @returns {string} ASCII 词云字符串。
 */
function renderWordCloud(placed, width, height) {
  const grid = Array.from({ length: height }, () => Array(width).fill(" "));

  for (const p of placed) {
    // 把词写到对应位置；字号大的词每行都写一遍（模拟大字）
    for (let row = 0; row < p.h; row++) {
      const y = p.y + row;
      if (y < 0 || y >= height) continue;
      for (let i = 0; i < p.word.length; i++) {
        const x = p.x + i * p.size;
        if (x >= 0 && x < width) {
          // 大字号用大写字母，小字号用小写
          grid[y][x] = p.size >= 3 ? p.word[i].toUpperCase() : p.word[i];
        }
      }
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：英文词云 =====");
const englishWords = [
  { word: "JavaScript", count: 50 },
  { word: "React", count: 40 },
  { word: "Vue", count: 35 },
  { word: "Node", count: 30 },
  { word: "CSS", count: 25 },
  { word: "HTML", count: 22 },
  { word: "Webpack", count: 18 },
  { word: "TypeScript", count: 15 },
  { word: "Git", count: 12 },
  { word: "Docker", count: 10 },
  { word: "Python", count: 8 },
  { word: "Rust", count: 5 },
];
const placed1 = generateWordCloud(englishWords, 70, 24);
console.log(renderWordCloud(placed1, 70, 24));

console.log("\n===== 测试 2：词频统计后生成词云 =====");
// 模拟一段文本统计词频
const text = "apple apple apple banana banana cherry cherry cherry cherry date";
const freq = {};
for (const w of text.split(" ")) {
  freq[w] = (freq[w] || 0) + 1;
}
const items = Object.entries(freq).map(([word, count]) => ({ word, count }));
console.log("词频：", items);
const placed2 = generateWordCloud(items, 40, 12);
console.log(renderWordCloud(placed2, 40, 12));

console.log("\n===== 测试 3：空输入 =====");
console.log("已放置词数量：", generateWordCloud([], 40, 10).length);

console.log("\n===== 测试 4：放置结果坐标 =====");
for (const p of placed1) {
  console.log(
    `${p.word.padEnd(12)} size=${p.size}  位置=(${p.x},${p.y})  尺寸=${p.w}x${p.h}`,
  );
}
