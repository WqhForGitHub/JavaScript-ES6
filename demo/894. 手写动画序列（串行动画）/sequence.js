/**
 * @file 894. 手写动画序列（串行动画）
 * @description
 * 实现串行动画播放器：按顺序依次执行多个动画，前一个完成后才启动下一个。
 *
 * 核心 API（类 Sequence）：
 *   - add(animation)         添加动画到队列末尾
 *   - play(onComplete)        开始播放，全部完成后回调 onComplete
 *
 * 动画对象约定：{ duration, update(progress, elapsed), onComplete? }
 *   - duration: 持续时间（ms）
 *   - update(progress, elapsed): 每帧回调
 *   - onComplete?: 该动画自身完成回调
 *
 * 通过 update(deltaTime) / tick 驱动虚拟时钟推进。纯 JS，无 DOM 依赖。
 */

"use strict";

/**
 * 串行动画播放器
 */
class Sequence {
  constructor() {
    /** @type {Array<{animation:Object, elapsed:number, done:boolean}>} */
    this.queue = [];
    /** 当前动画索引 */
    this.currentIndex = 0;
    /** 已累计时间（ms） */
    this.totalElapsed = 0;
    /** 是否已完成全部 */
    this.finished = false;
    /** 是否正在播放 */
    this.playing = false;
    /** 全部完成回调 */
    this._onAllComplete = null;
  }

  /**
   * 添加动画到序列末尾
   * @param {Object} animation { duration, update, onComplete? }
   * @returns {Sequence} this
   */
  add(animation) {
    if (typeof animation.duration !== "number" || animation.duration <= 0) {
      throw new Error("animation.duration 必须为正数");
    }
    if (typeof animation.update !== "function") {
      throw new Error("animation.update 必须为函数");
    }
    this.queue.push({
      animation,
      elapsed: 0,
      done: false,
    });
    return this;
  }

  /**
   * 总时长（所有动画 duration 之和）
   * @returns {number}
   */
  get totalDuration() {
    return this.queue.reduce((s, e) => s + e.animation.duration, 0);
  }

  /**
   * 开始播放
   * @param {() => void} [onComplete] 全部完成回调
   */
  play(onComplete) {
    if (this.queue.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this._onAllComplete = onComplete || null;
    this.playing = true;
    this.finished = false;
  }

  /**
   * 推进 deltaTime 毫秒
   * @param {number} deltaTime 推进时间（ms）
   * @returns {boolean} 是否全部完成
   */
  update(deltaTime) {
    if (!this.playing || this.finished) return this.finished;
    if (this.currentIndex >= this.queue.length) {
      this._finish();
      return true;
    }

    this.totalElapsed += deltaTime;
    const entry = this.queue[this.currentIndex];
    entry.elapsed += deltaTime;

    // 计算当前动画进度
    const progress = Math.min(1, entry.elapsed / entry.animation.duration);
    entry.animation.update(progress, entry.elapsed);

    // 当前动画完成
    if (entry.elapsed >= entry.animation.duration) {
      entry.done = true;
      if (typeof entry.animation.onComplete === "function") {
        entry.animation.onComplete();
      }
      this.currentIndex++;
      // 把多余时间带到下一个动画（不丢弃，保持连贯）
      if (this.currentIndex < this.queue.length) {
        const overflow = entry.elapsed - entry.animation.duration;
        if (overflow > 0) {
          // 递归处理溢出时间，避免一帧多动画时丢帧
          this.totalElapsed -= deltaTime;
          this.update(overflow);
        }
      } else {
        this._finish();
      }
    }
    return this.finished;
  }

  /**
   * 完成全部
   * @private
   */
  _finish() {
    this.finished = true;
    this.playing = false;
    if (this._onAllComplete) this._onAllComplete();
  }
}

// ===================== 测试与演示 =====================

console.log("========== 894. 串行动画（Sequence） ==========\n");

// 测试 1：三个动画依次执行
console.log(
  "【测试 1】三步串行：0->10 (500ms) -> 10->100 (600ms) -> 100->0 (400ms)",
);
let value = 0;
const seq1 = new Sequence();
seq1
  .add({
    duration: 500,
    update: (p) => {
      value = p * 10;
    },
    onComplete: () => console.log(`  >> 步骤1完成 value=${value.toFixed(2)}`),
  })
  .add({
    duration: 600,
    update: (p) => {
      value = 10 + p * 90;
    },
    onComplete: () => console.log(`  >> 步骤2完成 value=${value.toFixed(2)}`),
  })
  .add({
    duration: 400,
    update: (p) => {
      value = 100 - p * 100;
    },
    onComplete: () => console.log(`  >> 步骤3完成 value=${value.toFixed(2)}`),
  });

console.log("总时长:", seq1.totalDuration, "ms");

let allDone = false;
seq1.play(() => {
  allDone = true;
  console.log(`  >> 全部完成！总耗时 ${seq1.totalElapsed}ms`);
});

const step = 16;
let frame = 0;
console.log("帧号   时间(ms)   步骤   value");
while (!seq1.update(step)) {
  frame++;
  if (frame % 10 === 0) {
    console.log(
      `f=${String(frame).padStart(3)}   t=${String(seq1.totalElapsed).padStart(5)}   ${seq1.currentIndex + 1}     ${value.toFixed(2)}`,
    );
  }
}
console.log(
  `最终: t=${seq1.totalElapsed}ms, value=${value.toFixed(2)}, 完成=${allDone}`,
);

// 测试 2：单个动画
console.log("\n【测试 2】单个动画 (1000ms, 0->1)");
let v2 = 0;
const seq2 = new Sequence();
seq2.add({
  duration: 1000,
  update: (p) => {
    v2 = p;
  },
});
seq2.play();
let f2 = 0;
while (!seq2.update(50)) {
  f2++;
  if (f2 % 4 === 0)
    console.log(`  f=${f2} t=${seq2.totalElapsed}ms v=${v2.toFixed(2)}`);
}
console.log(`  最终 v=${v2.toFixed(2)}`);

// 测试 3：空序列
console.log("\n【测试 3】空序列直接完成");
const seq3 = new Sequence();
let emptyDone = false;
seq3.play(() => {
  emptyDone = true;
});
console.log("空序列 onComplete 是否触发:", emptyDone);

// 测试 4：大步长跨多个动画（验证溢出时间传递）
console.log("\n【测试 4】大步长(800ms)跨越两个 500ms 动画");
let va = 0;
let vb = 0;
const seq4 = new Sequence();
seq4
  .add({ duration: 500, update: (p) => (va = p * 100) })
  .add({ duration: 500, update: (p) => (vb = p * 100) });
seq4.play();
// 一次推进 800ms：应完成第一个(500)，并推进第二个 300ms
seq4.update(800);
console.log(
  `一次 update(800): 步骤=${seq4.currentIndex + 1}, va=${va.toFixed(1)}, vb=${vb.toFixed(1)}, t=${seq4.totalElapsed}ms`,
);
// 再推进剩余 200ms 完成第二个
seq4.update(200);
console.log(
  `再 update(200): 完成=${seq4.finished}, vb=${vb.toFixed(1)}, t=${seq4.totalElapsed}ms`,
);
