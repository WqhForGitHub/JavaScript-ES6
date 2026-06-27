/**
 * @file 895. 手写动画并行（并行动画）
 * @description
 * 实现并行动画播放器：多个动画同时启动，全部完成后回调。
 * 完成时间取决于最长那个动画。
 *
 * 核心 API（类 Parallel）：
 *   - add(animation)         添加动画
 *   - play(onComplete)        开始播放，全部完成后回调 onComplete
 *
 * 动画对象约定：{ duration, update(progress, elapsed), onComplete? }
 *
 * 通过 update(deltaTime) 驱动虚拟时钟。纯 JS，无 DOM 依赖。
 */

"use strict";

/**
 * 并行动画播放器
 */
class Parallel {
  constructor() {
    /** @type {Array<{animation:Object, elapsed:number, done:boolean}>} */
    this.items = [];
    /** 累计时间（ms） */
    this.totalElapsed = 0;
    /** 是否正在播放 */
    this.playing = false;
    /** 全部完成回调是否已触发 */
    this._fired = false;
    /** 全部完成回调 */
    this._onAllComplete = null;
  }

  /**
   * 添加动画
   * @param {Object} animation { duration, update, onComplete? }
   * @returns {Parallel} this
   */
  add(animation) {
    if (typeof animation.duration !== "number" || animation.duration <= 0) {
      throw new Error("animation.duration 必须为正数");
    }
    if (typeof animation.update !== "function") {
      throw new Error("animation.update 必须为函数");
    }
    this.items.push({
      animation,
      elapsed: 0,
      done: false,
    });
    return this;
  }

  /**
   * 最长动画时长（ms）
   * @returns {number}
   */
  get maxDuration() {
    return this.items.reduce((m, e) => Math.max(m, e.animation.duration), 0);
  }

  /**
   * 仍在运行的动画数量
   * @returns {number}
   */
  activeCount() {
    return this.items.filter((e) => !e.done).length;
  }

  /**
   * 是否全部完成
   * @returns {boolean}
   */
  get allDone() {
    return this.items.length > 0 && this.items.every((e) => e.done);
  }

  /**
   * 开始播放
   * @param {() => void} [onComplete] 全部完成回调
   */
  play(onComplete) {
    if (this.items.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this._onAllComplete = onComplete || null;
    this.playing = true;
    this._fired = false;
  }

  /**
   * 推进 deltaTime 毫秒，同时更新所有动画
   * @param {number} deltaTime 推进时间（ms）
   * @returns {boolean} 是否全部完成
   */
  update(deltaTime) {
    if (!this.playing) return this.allDone;

    this.totalElapsed += deltaTime;

    for (const item of this.items) {
      if (item.done) continue;
      item.elapsed += deltaTime;
      const progress = Math.min(1, item.elapsed / item.animation.duration);
      item.animation.update(progress, item.elapsed);

      if (item.elapsed >= item.animation.duration) {
        item.done = true;
        if (typeof item.animation.onComplete === "function") {
          item.animation.onComplete();
        }
      }
    }

    // 全部完成
    if (this.allDone && !this._fired) {
      this._fired = true;
      this.playing = false;
      if (this._onAllComplete) this._onAllComplete();
    }
    return this.allDone;
  }
}

// ===================== 测试与演示 =====================

console.log("========== 895. 并行动画（Parallel） ==========\n");

// 测试 1：三个不同时长动画并行
console.log("【测试 1】三动画并行：fast(300ms) / medium(600ms) / slow(900ms)");
let fast = 0;
let medium = 0;
let slow = 0;
const par1 = new Parallel();
par1
  .add({
    duration: 300,
    update: (p) => (fast = p),
    onComplete: () =>
      console.log(
        `  >> fast 完成 (t=${par1.totalElapsed}ms, fast=${fast.toFixed(2)})`,
      ),
  })
  .add({
    duration: 600,
    update: (p) => (medium = p),
    onComplete: () =>
      console.log(
        `  >> medium 完成 (t=${par1.totalElapsed}ms, medium=${medium.toFixed(2)})`,
      ),
  })
  .add({
    duration: 900,
    update: (p) => (slow = p),
    onComplete: () =>
      console.log(
        `  >> slow 完成 (t=${par1.totalElapsed}ms, slow=${slow.toFixed(2)})`,
      ),
  });

console.log("最长时长:", par1.maxDuration, "ms");

par1.play(() => console.log(`  >> 全部完成！(t=${par1.totalElapsed}ms)`));

const step = 30;
let frame = 0;
console.log("帧号   时间(ms)   活跃数   fast    medium  slow");
while (par1.playing) {
  par1.update(step);
  frame++;
  if (frame % 5 === 0 || !par1.playing) {
    console.log(
      `f=${String(frame).padStart(3)}   t=${String(par1.totalElapsed).padStart(5)}   ${par1.activeCount()}       ${fast.toFixed(2)}   ${medium.toFixed(2)}   ${slow.toFixed(2)}`,
    );
  }
}
console.log(
  `最终: fast=${fast.toFixed(2)}, medium=${medium.toFixed(2)}, slow=${slow.toFixed(2)}`,
);

// 测试 2：两个同时长动画
console.log("\n【测试 2】两个相同时长(500ms)动画并行，应同时完成");
let x = 0;
let y = 0;
const par2 = new Parallel();
par2
  .add({
    duration: 500,
    update: (p) => (x = p * 100),
    onComplete: () => console.log(`  x完成 t=${par2.totalElapsed}`),
  })
  .add({
    duration: 500,
    update: (p) => (y = p * 50),
    onComplete: () => console.log(`  y完成 t=${par2.totalElapsed}`),
  });
par2.play(() => console.log("  全部完成"));
let f2 = 0;
while (!par2.update(100)) {
  f2++;
  console.log(
    `  f=${f2} t=${par2.totalElapsed} x=${x.toFixed(1)} y=${y.toFixed(1)} 活跃=${par2.activeCount()}`,
  );
}

// 测试 3：单个动画
console.log("\n【测试 3】单个动画并行（退化为普通动画）");
let v3 = 0;
const par3 = new Parallel();
par3.add({ duration: 400, update: (p) => (v3 = p) });
par3.play();
let f3 = 0;
while (par3.playing) {
  par3.update(80);
  f3++;
  console.log(`  f=${f3} t=${par3.totalElapsed} v=${v3.toFixed(2)}`);
}

// 测试 4：空并行
console.log("\n【测试 4】空并行直接回调");
const par4 = new Parallel();
let emptyCalled = false;
par4.play(() => (emptyCalled = true));
console.log("空并行回调是否触发:", emptyCalled);

// 测试 5：maxDuration 与实际完成时间
console.log("\n【测试 5】maxDuration 验证");
const par5 = new Parallel();
par5
  .add({ duration: 100, update: () => {} })
  .add({ duration: 500, update: () => {} })
  .add({ duration: 250, update: () => {} });
console.log("maxDuration =", par5.maxDuration, "ms (应为 500)");
par5.play();
while (par5.playing) par5.update(50);
console.log("实际完成时间 =", par5.totalElapsed, "ms");
