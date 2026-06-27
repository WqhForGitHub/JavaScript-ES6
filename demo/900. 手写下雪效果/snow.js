/**
 * @file 900. 手写下雪效果
 * @description
 * 模拟下雪效果：大量雪花随机分布，每片雪花有随机 x、y、大小、漂移速度。
 * 风力影响水平移动；雪花飘出底部后从顶部循环出现（wrap around）。
 *
 * 每片雪花属性：
 *   - x, y: 当前位置
 *   - size: 雪花大小
 *   - fallSpeed: 下落速度
 *   - drift: 自身水平漂移速度
 *   - sway: 左右摆动（用正弦模拟自然飘动）
 *
 * 风力 wind 为全局水平加速度，影响所有雪花 x 方向。
 *
 * 模拟 60 帧并打印采样雪花位置。
 *
 * 纯 JS 实现，无 DOM 依赖，可直接用 node 运行。
 */

"use strict";

/**
 * [min, max) 区间随机数
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * 单片雪花
 * @typedef {Object} Snowflake
 * @property {number} x
 * @property {number} y
 * @property {number} size
 * @property {number} fallSpeed 下落速度（px/s）
 * @property {number} drift     自身水平漂移速度（px/s）
 * @property {number} swayAmp   摆动幅度（px）
 * @property {number} swayFreq  摆动频率（Hz）
 * @property {number} phase     摆动相位
 * @property {number} baseX     水平基准位置（用于摆动叠加）
 */

/**
 * 雪花系统
 */
class SnowSystem {
  /**
   * @param {Object} cfg
   * @param {number} [cfg.count=50]    雪花数量
   * @param {number} [cfg.width=100]   场景宽度
   * @param {number} [cfg.height=100]  场景高度
   * @param {number} [cfg.wind=0]      风力（水平加速度 px/s^2，正向右）
   */
  constructor(cfg = {}) {
    this.width = cfg.width || 100;
    this.height = cfg.height || 100;
    this.count = cfg.count || 50;
    this.wind = cfg.wind || 0; // 风力加速度
    this.time = 0;
    /** @type {Snowflake[]} */
    this.flakes = [];
    this._init();
  }

  /**
   * 创建单片雪花
   * @param {boolean} [atTop=false] 是否从顶部生成
   * @returns {Snowflake}
   * @private
   */
  _createFlake(atTop = false) {
    return {
      x: rand(0, this.width),
      y: atTop ? rand(-this.height * 0.2, -2) : rand(-this.height, this.height),
      size: rand(1, 3),
      fallSpeed: rand(15, 50), // 下落速度
      drift: rand(-5, 5), // 自身漂移
      swayAmp: rand(3, 12),
      swayFreq: rand(0.3, 1.0),
      phase: rand(0, Math.PI * 2),
      baseX: rand(0, this.width),
    };
  }

  /**
   * 初始化所有雪花
   * @private
   */
  _init() {
    this.flakes = [];
    for (let i = 0; i < this.count; i++) {
      this.flakes.push(this._createFlake(false));
    }
  }

  /**
   * 推进 dt 秒
   * @param {number} dt
   */
  update(dt) {
    this.time += dt;
    for (const f of this.flakes) {
      // 下落
      f.y += f.fallSpeed * dt;
      // 风力 + 自身漂移影响水平基准
      f.baseX += (this.wind + f.drift) * dt;
      // 水平摆动（正弦）叠加在 baseX 上
      f.x =
        f.baseX +
        Math.sin(this.time * f.swayFreq * Math.PI * 2 + f.phase) * f.swayAmp;

      // 水平边界 wrap（飘出左右则从另一侧进入）
      if (f.x < -5) {
        f.baseX += this.width + 10;
      } else if (f.x > this.width + 5) {
        f.baseX -= this.width + 10;
      }

      // 飘出底部 -> 从顶部重生
      if (f.y > this.height + f.size) {
        Object.assign(f, this._createFlake(true));
      }
    }
  }

  /**
   * 获取所有雪花当前位置快照
   * @returns {Array<{x:number,y:number,size:number}>}
   */
  snapshot() {
    return this.flakes.map((f) => ({
      x: f.x,
      y: f.y,
      size: f.size,
    }));
  }
}

// ===================== 测试与演示 =====================

console.log("========== 900. 下雪效果 ==========\n");

// 测试 1：基本下雪模拟 60 帧
console.log("【测试 1】下雪模拟（场景 100x80，30 片雪花，无风，60 帧）");
const snow1 = new SnowSystem({ count: 30, width: 100, height: 80, wind: 0 });
const dt = 1 / 30; // 30fps
console.log("帧   时间(s)   采样雪花 1~5 位置");
for (let frame = 0; frame < 60; frame++) {
  if (frame % 10 === 0 || frame === 59) {
    const snap = snow1.snapshot();
    const samples = snap
      .slice(0, 5)
      .map((f) => `(${f.x.toFixed(1)},${f.y.toFixed(1)})`);
    console.log(
      `${String(frame).padStart(2)}   ${snow1.time.toFixed(2).padStart(5)}   ${samples.join("  ")}`,
    );
  }
  snow1.update(dt);
}

// 测试 2：有风情况
console.log("\n【测试 2】有风下雪（风力 20 px/s^2 向右，对比无风）");
const snowNoWind = new SnowSystem({
  count: 20,
  width: 100,
  height: 80,
  wind: 0,
});
const snowWind = new SnowSystem({
  count: 20,
  width: 100,
  height: 80,
  wind: 20,
});
// 记录初始平均 x
const initAvgX = snowWind.snapshot().reduce((s, f) => s + f.x, 0) / 20;
for (let i = 0; i < 60; i++) {
  snowNoWind.update(dt);
  snowWind.update(dt);
}
const noWindAvgX = snowNoWind.snapshot().reduce((s, f) => s + f.x, 0) / 20;
const windAvgX = snowWind.snapshot().reduce((s, f) => s + f.x, 0) / 20;
console.log(`初始平均 x: ${initAvgX.toFixed(2)}`);
console.log(`无风 60 帧后平均 x: ${noWindAvgX.toFixed(2)}`);
console.log(`有风 60 帧后平均 x: ${windAvgX.toFixed(2)}（应明显右移）`);

// 测试 3：雪花从底部循环到顶部
console.log("\n【测试 3】雪花底部循环验证");
const snow3 = new SnowSystem({ count: 5, width: 50, height: 30, wind: 0 });
// 强制把雪花放到接近底部
snow3.flakes.forEach((f) => {
  f.y = 28;
  f.fallSpeed = 20;
});
console.log(
  "初始 5 片雪花 y:",
  snow3
    .snapshot()
    .map((f) => f.y.toFixed(1))
    .join(", "),
);
// 推进若干帧让其落到底部并重生
for (let i = 0; i < 10; i++) snow3.update(0.5);
console.log(
  "5s 后 5 片雪花 y:",
  snow3
    .snapshot()
    .map((f) => f.y.toFixed(1))
    .join(", "),
);
console.log("（应为负值，表示从顶部重生）");

// 测试 4：雪花大小分布
console.log("\n【测试 4】雪花大小分布（应 1~3 之间）");
const snow4 = new SnowSystem({ count: 100, width: 100, height: 100 });
const sizes = snow4.snapshot().map((f) => f.size);
const minSize = Math.min(...sizes);
const maxSize = Math.max(...sizes);
const avgSize = sizes.reduce((s, v) => s + v, 0) / sizes.length;
console.log(
  `最小: ${minSize.toFixed(2)}, 最大: ${maxSize.toFixed(2)}, 平均: ${avgSize.toFixed(2)}`,
);

// 测试 5：可视化（用文本模拟场景中雪花位置）
console.log("\n【测试 5】场景可视化（20x10 网格，* 为雪花）");
const snow5 = new SnowSystem({ count: 25, width: 20, height: 10, wind: 5 });
console.log("初始场景:");
function renderScene(snow, w, h) {
  const grid = [];
  for (let r = 0; r < h; r++) grid.push(new Array(w).fill(" "));
  for (const f of snow.snapshot()) {
    const col = Math.floor(f.x);
    const row = Math.floor(f.y);
    if (row >= 0 && row < h && col >= 0 && col < w) {
      grid[row][col] = "*";
    }
  }
  return grid.map((row) => "|" + row.join("") + "|").join("\n");
}
console.log(renderScene(snow5, 20, 10));
for (let i = 0; i < 30; i++) snow5.update(0.2);
console.log("\n6 秒后场景（有风，雪花下落+右移）:");
console.log(renderScene(snow5, 20, 10));

// 测试 6：60 帧完整轨迹追踪（单雪花）
console.log("\n【测试 6】追踪单片雪花 60 帧轨迹");
const snow6 = new SnowSystem({ count: 1, width: 100, height: 100, wind: 10 });
snow6.flakes[0].x = 50;
snow6.flakes[0].baseX = 50;
snow6.flakes[0].y = 0;
snow6.flakes[0].fallSpeed = 30;
snow6.flakes[0].swayAmp = 5;
snow6.flakes[0].swayFreq = 0.5;
console.log("帧   x       y       baseX");
for (let frame = 0; frame < 60; frame++) {
  if (frame % 10 === 0) {
    const f = snow6.flakes[0];
    console.log(
      `${String(frame).padStart(2)}   ${f.x.toFixed(2).padStart(6)}   ${f.y.toFixed(2).padStart(6)}   ${f.baseX.toFixed(2).padStart(6)}`,
    );
  }
  snow6.update(dt);
}
