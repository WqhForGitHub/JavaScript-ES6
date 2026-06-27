/**
 * @file 896. 手写 SVG 路径动画
 * @description
 * 纯 JS 模拟 SVG 路径动画（路径绘制 / stroke-dashoffset 动画）。
 *
 * 功能：
 *   1. 解析简单 SVG path 字符串（支持 M / L / C 命令）
 *   2. 计算路径总长度（C 用自适应采样近似）
 *   3. 模拟 stroke-dashoffset 从总长度递减到 0 的绘制动画
 *   4. 沿路径按弧长取点，保证匀速移动
 *
 * 在浏览器中，stroke-dasharray = L, stroke-dashoffset = L 时完全不可见；
 * dashoffset 从 L 减到 0 时路径被逐渐"画"出来。这里在纯 JS 中模拟该过程，
 * 输出每帧的进度、dashoffset 和当前绘制尖端坐标。
 *
 * 纯 JS 实现，无 DOM 依赖，可直接用 node 运行。
 */

"use strict";

/**
 * 线性插值
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
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
 * 计算三次贝塞尔曲线在参数 u∈[0,1] 处的点
 * @param {{x:number,y:number}} p0 起点
 * @param {{x:number,y:number}} p1 控制点1
 * @param {{x:number,y:number}} p2 控制点2
 * @param {{x:number,y:number}} p3 终点
 * @param {number} u 参数
 * @returns {{x:number,y:number}}
 */
function cubicPoint(p0, p1, p2, p3, u) {
  const mt = 1 - u;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * u;
  const c = 3 * mt * u * u;
  const d = u * u * u;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/**
 * 对三次贝塞尔曲线采样为折线，用于弧长计算与匀速取点
 * @param {{x:number,y:number}} p0
 * @param {{x:number,y:number}} p1
 * @param {{x:number,y:number}} p2
 * @param {{x:number,y:number}} p3
 * @param {number} [steps=40] 采样数
 * @returns {Array<{x:number,y:number}>}
 */
function sampleCubic(p0, p1, p2, p3, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++)
    pts.push(cubicPoint(p0, p1, p2, p3, i / steps));
  return pts;
}

/**
 * 解析 SVG path 字符串
 * 支持 M（moveto）、L（lineto）、C（cubic curveto）
 * @param {string} d path 字符串
 * @returns {{segments:Array, totalLength:number, start:{x:number,y:number}}}
 */
function parsePath(d) {
  const tokens = d.match(/[MLCmlc]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!tokens) return { segments: [], totalLength: 0, start: { x: 0, y: 0 } };

  const segments = [];
  let cursor = 0;
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };

  /** 读取下一个数字 */
  function readNum() {
    return parseFloat(tokens[cursor++]);
  }

  while (cursor < tokens.length) {
    const cmd = tokens[cursor++].toUpperCase();
    if (cmd === "M") {
      const x = readNum();
      const y = readNum();
      current = { x, y };
      start = { x, y };
    } else if (cmd === "L") {
      const x = readNum();
      const y = readNum();
      const poly = [current, { x, y }];
      const len = dist(current, { x, y });
      segments.push({ type: "L", poly, length: len });
      current = { x, y };
    } else if (cmd === "C") {
      const p1 = { x: readNum(), y: readNum() };
      const p2 = { x: readNum(), y: readNum() };
      const p3 = { x: readNum(), y: readNum() };
      const poly = sampleCubic(current, p1, p2, p3, 40);
      let len = 0;
      for (let i = 1; i < poly.length; i++) len += dist(poly[i - 1], poly[i]);
      segments.push({
        type: "C",
        control: [current, p1, p2, p3],
        poly,
        length: len,
      });
      current = p3;
    } else {
      throw new Error(`不支持的路径命令: ${cmd}`);
    }
  }

  const totalLength = segments.reduce((s, seg) => s + seg.length, 0);
  return { segments, totalLength, start };
}

/**
 * 沿路径按弧长距离取点（匀速）
 * @param {{segments:Array, totalLength:number}} parsed 解析后的路径
 * @param {number} distance 弧长距离
 * @returns {{x:number,y:number}}
 */
function getPointAtDistance(parsed, distance) {
  const { segments, totalLength } = parsed;
  if (totalLength === 0) return { x: 0, y: 0 };
  let d = Math.max(0, Math.min(distance, totalLength));

  for (const seg of segments) {
    if (d <= seg.length) {
      const poly = seg.poly;
      let acc = 0;
      for (let i = 1; i < poly.length; i++) {
        const segLen = dist(poly[i - 1], poly[i]);
        if (acc + segLen >= d) {
          const localT = segLen === 0 ? 0 : (d - acc) / segLen;
          return {
            x: lerp(poly[i - 1].x, poly[i].x, localT),
            y: lerp(poly[i - 1].y, poly[i].y, localT),
          };
        }
        acc += segLen;
      }
      return poly[poly.length - 1];
    }
    d -= seg.length;
  }
  const last = segments[segments.length - 1].poly;
  return last[last.length - 1];
}

/**
 * SVG 路径动画模拟器：模拟 stroke-dashoffset 从 totalLength 到 0
 */
class SvgPathAnimation {
  /**
   * @param {string} d path 字符串
   * @param {number} duration 动画时长（ms）
   */
  constructor(d, duration) {
    this.parsed = parsePath(d);
    this.duration = duration;
    this.totalLength = this.parsed.totalLength;
    this.elapsed = 0;
    this.progress = 0;
    this.dashOffset = this.totalLength;
    this.currentPoint = getPointAtDistance(this.parsed, 0);
  }

  /**
   * 推进 deltaTime 毫秒
   * @param {number} deltaTime
   * @returns {boolean} 是否完成
   */
  update(deltaTime) {
    this.elapsed += deltaTime;
    this.progress = Math.min(1, this.elapsed / this.duration);
    // dashoffset 从 totalLength 线性减到 0
    this.dashOffset = this.totalLength * (1 - this.progress);
    // 当前绘制尖端 = 已绘制弧长对应的点
    const drawnLength = this.totalLength * this.progress;
    this.currentPoint = getPointAtDistance(this.parsed, drawnLength);
    return this.progress >= 1;
  }

  /**
   * 获取当前状态快照
   * @returns {{progress:number, dashOffset:number, point:{x:number,y:number}, drawnLength:number}}
   */
  snapshot() {
    return {
      progress: this.progress,
      dashOffset: this.dashOffset,
      drawnLength: this.totalLength * this.progress,
      point: { ...this.currentPoint },
    };
  }
}

// ===================== 测试与演示 =====================

console.log("========== 896. SVG 路径动画 ==========\n");

// 测试 1：解析路径并打印段信息
console.log('【测试 1】解析路径 "M 0 0 L 100 0 C 150 0 150 100 200 100"');
const d1 = "M 0 0 L 100 0 C 150 0 150 100 200 100";
const parsed1 = parsePath(d1);
console.log(
  "段信息:",
  parsed1.segments
    .map((s) => `${s.type} len=${s.length.toFixed(2)}`)
    .join(", "),
);
console.log("总长度:", parsed1.totalLength.toFixed(2));

console.log("\n按弧长取点:");
for (const dd of [0, 25, 50, 75, 100, 150, parsed1.totalLength]) {
  const p = getPointAtDistance(parsed1, dd);
  console.log(
    `  d=${dd.toFixed(1).padStart(6)} -> (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`,
  );
}

// 测试 2：模拟 dashoffset 绘制动画
console.log("\n【测试 2】模拟绘制动画（时长 2000ms，每 250ms 采样）");
const anim = new SvgPathAnimation(d1, 2000);
console.log("帧   时间(ms)   进度    dashOffset   已绘制长度   当前点");
let done = false;
while (!done) {
  const snap = anim.snapshot();
  console.log(
    `     ${String(anim.elapsed).padStart(5)}   ${(snap.progress * 100).toFixed(0).padStart(3)}%   ${snap.dashOffset.toFixed(2).padStart(10)}   ${snap.drawnLength.toFixed(2).padStart(10)}   (${snap.point.x.toFixed(2)}, ${snap.point.y.toFixed(2)})`,
  );
  done = anim.update(250);
}
// 打印最终帧
const finalSnap = anim.snapshot();
console.log(
  `     ${String(anim.elapsed).padStart(5)}   ${(finalSnap.progress * 100).toFixed(0).padStart(3)}%   ${finalSnap.dashOffset.toFixed(2).padStart(10)}   ${finalSnap.drawnLength.toFixed(2).padStart(10)}   (${finalSnap.point.x.toFixed(2)}, ${finalSnap.point.y.toFixed(2)})`,
);

// 测试 3：纯折线路径
console.log(
  '\n【测试 3】折线路径 "M 0 0 L 100 0 L 100 100 L 0 100 L 0 0"（正方形）',
);
const d2 = "M 0 0 L 100 0 L 100 100 L 0 100 L 0 0";
const anim2 = new SvgPathAnimation(d2, 1600);
console.log("总长度:", anim2.totalLength.toFixed(2));
console.log("帧   时间(ms)   进度    dashOffset   当前点");
let done2 = false;
let frame = 0;
while (!done2) {
  if (frame % 2 === 0 || done2) {
    const snap = anim2.snapshot();
    console.log(
      `${String(frame).padStart(2)}   ${String(anim2.elapsed).padStart(5)}   ${(snap.progress * 100).toFixed(0).padStart(3)}%   ${snap.dashOffset.toFixed(1).padStart(9)}   (${snap.point.x.toFixed(1)}, ${snap.point.y.toFixed(1)})`,
    );
  }
  done2 = anim2.update(100);
  frame++;
}

// 测试 4：可视化绘制进度（用 # 表示已绘制长度比例）
console.log("\n【测试 4】绘制进度可视化（20 格）");
const anim3 = new SvgPathAnimation(d1, 1000);
console.log("进度条 (每帧 # 数 = 已绘制比例):");
let done3 = false;
let f3 = 0;
while (!done3) {
  const snap = anim3.snapshot();
  const bars = Math.round(snap.progress * 20);
  const bar = "#".repeat(bars) + "-".repeat(20 - bars);
  if (f3 % 2 === 0) {
    console.log(
      `  t=${String(anim3.elapsed).padStart(4)}ms [${bar}] ${(snap.progress * 100).toFixed(0)}%`,
    );
  }
  done3 = anim3.update(100);
  f3++;
}
