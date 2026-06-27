/**
 * @file 897. 手写路径绘制动画
 * @description
 * 给定一组点（折线 polyline），逐步"绘制"路径。
 *
 * 原理：
 *   1. 预计算折线累积弧长
 *   2. 根据进度 progress∈[0,1] 计算应绘制到的目标弧长 = progress * 总长度
 *   3. 沿折线行走，整段已覆盖的顶点全部保留，最后一段做线性插值得到当前绘制尖端
 *
 * 每帧打印当前已绘制的线段顶点列表，直观展示绘制过程。
 *
 * 纯 JS 实现，无 DOM 依赖，可直接用 node 运行。
 */

"use strict";

/**
 * 两点线性插值
 * @param {{x:number,y:number}} a
 * @param {{x:number,y:number}} b
 * @param {number} t
 * @returns {{x:number,y:number}}
 */
function lerpPoint(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * 两点距离
 * @param {{x:number,y:number}} a
 * @param {{x:number,y:number}} b
 * @returns {number}
 */
function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * 计算折线累积弧长
 * @param {Array<{x:number,y:number}>} points
 * @returns {number[]} lengths[i] 为到第 i 个点的累积弧长
 */
function cumulativeLengths(points) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + dist(points[i - 1], points[i]));
  }
  return lengths;
}

/**
 * 计算折线总长度
 * @param {Array<{x:number,y:number}>} points
 * @returns {number}
 */
function totalLength(points) {
  if (points.length === 0) return 0;
  return cumulativeLengths(points).pop();
}

/**
 * 根据进度 progress 返回部分折线（已绘制部分）
 * @param {Array<{x:number,y:number}>} points 完整折线
 * @param {number} progress 进度 [0,1]
 * @returns {Array<{x:number,y:number}>} 已绘制的折线顶点（含插值尖端）
 */
function getPartialPath(points, progress) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) return progress <= 0 ? [] : [{ ...points[0] }];

  const clamped = Math.max(0, Math.min(1, progress));
  const lengths = cumulativeLengths(points);
  const total = lengths[lengths.length - 1];
  if (total === 0) return clamped <= 0 ? [] : [{ ...points[0] }];

  const target = clamped * total;
  if (target <= 0) return [];

  const result = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const segStart = lengths[i - 1];
    const segEnd = lengths[i];
    if (segEnd <= target) {
      // 整段已绘制
      result.push({ ...points[i] });
    } else {
      // 部分段：插值到精确尖端
      const segLen = segEnd - segStart;
      const localT = segLen === 0 ? 0 : (target - segStart) / segLen;
      result.push(lerpPoint(points[i - 1], points[i], localT));
      break;
    }
  }
  return result;
}

/**
 * 路径绘制动画模拟器
 */
class PathDrawAnimation {
  /**
   * @param {Array<{x:number,y:number}>} points 折线顶点
   * @param {number} duration 动画时长（ms）
   */
  constructor(points, duration) {
    this.points = points;
    this.duration = duration;
    this.totalLength = totalLength(points);
    this.elapsed = 0;
    this.progress = 0;
  }

  /**
   * 推进 deltaTime 毫秒
   * @param {number} deltaTime
   * @returns {boolean} 是否完成
   */
  update(deltaTime) {
    this.elapsed += deltaTime;
    this.progress = Math.min(1, this.elapsed / this.duration);
    return this.progress >= 1;
  }

  /**
   * 获取当前已绘制折线
   * @returns {Array<{x:number,y:number}>}
   */
  getDrawnPath() {
    return getPartialPath(this.points, this.progress);
  }

  /**
   * 获取当前绘制尖端
   * @returns {{x:number,y:number}|null}
   */
  getTip() {
    const path = this.getDrawnPath();
    if (path.length === 0) return null;
    return path[path.length - 1];
  }
}

/**
 * 格式化折线顶点为字符串
 * @param {Array<{x:number,y:number}>} path
 * @returns {string}
 */
function formatPath(path) {
  return path.map((p) => `(${p.x.toFixed(0)},${p.y.toFixed(0)})`).join(" -> ");
}

// ===================== 测试与演示 =====================

console.log("========== 897. 路径绘制动画 ==========\n");

// 测试 1：之字形折线
console.log("【测试 1】之字形折线绘制（时长 1000ms）");
const points1 = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
  { x: 0, y: 200 },
];
console.log("完整折线:", formatPath(points1));
console.log("总长度:", totalLength(points1).toFixed(2));

const anim1 = new PathDrawAnimation(points1, 1000);
console.log("\n帧   时间(ms)   进度    已绘制长度   绘制尖端   已绘制顶点");
let done1 = false;
let f1 = 0;
while (!done1) {
  if (f1 % 2 === 0 || done1) {
    const drawn = anim1.getDrawnPath();
    const tip = anim1.getTip();
    const drawnLen = totalLength(drawn);
    console.log(
      `${String(f1).padStart(2)}   ${String(anim1.elapsed).padStart(5)}   ${(anim1.progress * 100).toFixed(0).padStart(3)}%   ${drawnLen.toFixed(1).padStart(9)}   (${tip ? tip.x.toFixed(1) + "," + tip.y.toFixed(1) : "none"})`,
    );
    console.log(`     已绘制顶点: ${formatPath(drawn)}`);
  }
  done1 = anim1.update(100);
  f1++;
}

// 测试 2：星形折线
console.log("\n【测试 2】五角星折线绘制（时长 1500ms）");
// 五角星顶点（外圈5个 + 内圈5个交替）
const star = [];
const cx = 100,
  cy = 100,
  R = 80,
  r = 32;
for (let i = 0; i < 10; i++) {
  const radius = i % 2 === 0 ? R : r;
  const angle = -Math.PI / 2 + (i * Math.PI) / 5;
  star.push({
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  });
}
star.push({ ...star[0] }); // 闭合
console.log(
  "完整折线顶点数:",
  star.length,
  "总长度:",
  totalLength(star).toFixed(2),
);

const anim2 = new PathDrawAnimation(star, 1500);
console.log("帧   时间(ms)   进度    尖端坐标");
let done2 = false;
let f2 = 0;
while (!done2) {
  if (f2 % 3 === 0 || done2) {
    const tip = anim2.getTip();
    console.log(
      `${String(f2).padStart(2)}   ${String(anim2.elapsed).padStart(5)}   ${(anim2.progress * 100).toFixed(0).padStart(3)}%   (${tip ? tip.x.toFixed(1) + ", " + tip.y.toFixed(1) : "none"})`,
    );
  }
  done2 = anim2.update(150);
  f2++;
}

// 测试 3：进度采样（验证不同进度下的部分路径）
console.log("\n【测试 3】不同进度下的部分路径");
const points3 = [
  { x: 0, y: 0 },
  { x: 40, y: 0 },
  { x: 40, y: 30 },
  { x: 0, y: 30 },
  { x: 0, y: 60 },
];
console.log(
  "折线:",
  formatPath(points3),
  "总长:",
  totalLength(points3).toFixed(2),
);
for (const p of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
  const partial = getPartialPath(points3, p);
  const drawn = partial.length > 1 ? totalLength(partial).toFixed(2) : "0.00";
  console.log(
    `\n  progress=${p.toFixed(2)}  (${partial.length} 个顶点, 已绘制 ${drawn})`,
  );
  partial.forEach((pt, i) => {
    console.log(`    [${i}] (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
  });
}

// 测试 4：单点 / 空数组边界
console.log("\n【测试 4】边界情况");
console.log("空数组 progress=0.5:", getPartialPath([], 0.5));
console.log("单点 progress=0:", getPartialPath([{ x: 5, y: 5 }], 0));
console.log(
  "单点 progress=1:",
  JSON.stringify(getPartialPath([{ x: 5, y: 5 }], 1)),
);

// 测试 5：可视化绘制（用文本图）
console.log("\n【测试 5】绘制进度可视化（30 格，# 已绘制）");
const anim5 = new PathDrawAnimation(points1, 1000);
let done5 = false;
while (!done5) {
  const bars = Math.round(anim5.progress * 30);
  console.log(
    `  t=${String(anim5.elapsed).padStart(4)}ms [${"#".repeat(bars)}${".".repeat(30 - bars)}] ${(anim5.progress * 100).toFixed(0)}%`,
  );
  done5 = anim5.update(100);
}
