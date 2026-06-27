/**
 * @file 893. 手写动画时间线（Timeline）
 * @description
 * 实现一个 Timeline 类，管理多个动画。每个动画可在指定起始时间加入，
 * Timeline 负责跟踪当前时间并驱动所有动画的生命周期。
 *
 * 核心 API（类 Timeline）：
 *   - add(animation, startTime)  在指定起始时间注册动画
 *   - play()                     开始/恢复播放
 *   - pause()                    暂停
 *   - seek(time)                 跳转到指定时间
 *   - update(deltaTime)          推进 deltaTime 毫秒，触发各动画 update
 *
 * 动画对象约定：{ duration, update(progress, elapsed), onComplete? }
 *   - duration: 持续时间（ms）
 *   - update(progress, elapsed): 每帧回调，progress∈[0,1]，elapsed 为已过 ms
 *   - onComplete?: 完成回调
 *
 * 不依赖 requestAnimationFrame，通过 update(deltaTime) 驱动虚拟时钟。
 * 纯 JS 实现，可直接用 node 运行。
 */

"use strict";

/**
 * 动画时间线
 */
class Timeline {
  constructor() {
    /** @type {Array<{animation:Object, startTime:number, started:boolean, completed:boolean}>} */
    this.entries = [];
    /** 当前时间（ms） */
    this.currentTime = 0;
    /** 是否正在播放 */
    this.playing = false;
    /** 总时长（ms） */
    this.totalDuration = 0;
  }

  /**
   * 注册动画到时间线
   * @param {Object} animation 动画对象 { duration, update, onComplete? }
   * @param {number} startTime 起始时间（ms）
   * @returns {Timeline} this
   */
  add(animation, startTime = 0) {
    if (typeof animation.duration !== "number" || animation.duration < 0) {
      throw new Error("animation.duration 必须为非负数");
    }
    if (typeof animation.update !== "function") {
      throw new Error("animation.update 必须为函数");
    }
    this.entries.push({
      animation,
      startTime,
      started: false,
      completed: false,
    });
    this._recomputeDuration();
    return this;
  }

  /**
   * 重新计算总时长
   * @private
   */
  _recomputeDuration() {
    this.totalDuration = this.entries.reduce((max, e) => {
      return Math.max(max, e.startTime + e.animation.duration);
    }, 0);
  }

  /**
   * 开始或恢复播放
   */
  play() {
    this.playing = true;
  }

  /**
   * 暂停播放
   */
  pause() {
    this.playing = false;
  }

  /**
   * 跳转到指定时间，触发所有动画对应状态的 update
   * @param {number} time 目标时间（ms）
   */
  seek(time) {
    this.currentTime = time;
    for (const entry of this.entries) {
      const { animation, startTime } = entry;
      const endTime = startTime + animation.duration;
      entry.completed = time >= endTime;
      if (time < startTime) {
        // 还未开始
        entry.started = false;
        animation.update(0, 0);
      } else if (time >= endTime) {
        // 已结束
        entry.started = true;
        animation.update(1, animation.duration);
      } else {
        // 进行中
        entry.started = true;
        const progress = (time - startTime) / animation.duration;
        animation.update(progress, time - startTime);
      }
    }
  }

  /**
   * 推进 deltaTime 毫秒，驱动所有动画
   * @param {number} deltaTime 推进时间（ms）
   * @returns {number} 当前时间
   */
  update(deltaTime) {
    if (!this.playing) return this.currentTime;

    this.currentTime += deltaTime;

    for (const entry of this.entries) {
      if (entry.completed) continue;
      const { animation, startTime } = entry;
      const endTime = startTime + animation.duration;

      if (this.currentTime < startTime) continue; // 未到开始时间

      if (this.currentTime >= endTime) {
        // 完成：触发最后一帧
        animation.update(1, animation.duration);
        entry.completed = true;
        if (typeof animation.onComplete === "function") {
          animation.onComplete();
        }
      } else if (animation.duration > 0) {
        entry.started = true;
        const progress = (this.currentTime - startTime) / animation.duration;
        animation.update(progress, this.currentTime - startTime);
      }
    }

    // 全部完成则自动停止
    if (this.currentTime >= this.totalDuration) {
      this.playing = false;
    }
    return this.currentTime;
  }

  /**
   * 是否全部完成
   * @returns {boolean}
   */
  get isFinished() {
    return this.entries.length > 0 && this.entries.every((e) => e.completed);
  }
}

// ===================== 测试与演示 =====================

console.log("========== 893. 动画时间线（Timeline） ==========\n");

// 测试 1：基本播放——两个动画不同起始时间
console.log(
  "【测试 1】动画 A(0~1000ms, 立即开始) + 动画 B(400~1000ms, 延迟 400ms)",
);
const timeline1 = new Timeline();

let aVal = 0;
let bVal = 0;
timeline1.add(
  {
    duration: 1000,
    update: (p, e) => {
      aVal = p * 100;
    },
    onComplete: () => console.log("  >> [A] 完成"),
  },
  0,
);
timeline1.add(
  {
    duration: 600,
    update: (p, e) => {
      bVal = p;
    },
    onComplete: () => console.log("  >> [B] 完成"),
  },
  400,
);

console.log("总时长:", timeline1.totalDuration, "ms");

timeline1.play();
const step = 16; // ~60fps
let frame = 0;
console.log("帧号   时间(ms)   A值      B值");
while (timeline1.playing) {
  timeline1.update(step);
  frame++;
  if (frame % 16 === 0 || !timeline1.playing) {
    console.log(
      `f=${String(frame).padStart(3)}   t=${String(timeline1.currentTime).padStart(5)}   A=${aVal.toFixed(1).padStart(6)}   B=${(bVal * 100).toFixed(1).padStart(6)}`,
    );
  }
}
console.log("最终: A =", aVal.toFixed(2), " B =", bVal.toFixed(2));
console.log("是否全部完成:", timeline1.isFinished);

// 测试 2：暂停与恢复
console.log("\n【测试 2】暂停与恢复");
const timeline2 = new Timeline();
let val2 = 0;
timeline2.add(
  {
    duration: 500,
    update: (p) => {
      val2 = p * 10;
    },
  },
  0,
);
timeline2.play();
timeline2.update(200);
console.log(
  `播放 200ms 后: t=${timeline2.currentTime}ms, val=${val2.toFixed(2)}`,
);
timeline2.pause();
timeline2.update(1000); // 暂停时不应推进
console.log(
  `暂停后 update(1000): t=${timeline2.currentTime}ms (应仍为 200), val=${val2.toFixed(2)}`,
);
timeline2.play();
timeline2.update(300); // 再推进 300ms -> 500ms 完成
console.log(
  `恢复并 update(300): t=${timeline2.currentTime}ms, val=${val2.toFixed(2)}`,
);

// 测试 3：seek 跳转
console.log("\n【测试 3】seek 跳转到 700ms");
const timeline3 = new Timeline();
let xVal = 0;
let yVal = 0;
timeline3.add({ duration: 1000, update: (p) => (xVal = p * 100) }, 0);
timeline3.add({ duration: 500, update: (p) => (yVal = p * 50) }, 500);
timeline3.seek(700);
console.log(
  `seek(700): x=${xVal.toFixed(2)} (进度70%), y=${yVal.toFixed(2)} (进度40%)`,
);
timeline3.seek(1500);
console.log(
  `seek(1500): x=${xVal.toFixed(2)} (结束), y=${yVal.toFixed(2)} (结束)`,
);
console.log("是否全部完成:", timeline3.isFinished);

// 测试 4：多个动画错峰排列
console.log("\n【测试 4】三个动画错峰（0/200/400ms 开始，各 300ms）");
const timeline4 = new Timeline();
const states = [0, 0, 0];
[0, 200, 400].forEach((start, i) => {
  timeline4.add(
    {
      duration: 300,
      update: (p) => {
        states[i] = p;
      },
      onComplete: () =>
        console.log(`  >> 动画 ${i + 1} 完成 (t=${timeline4.currentTime}ms)`),
    },
    start,
  );
});
console.log("总时长:", timeline4.totalDuration, "ms");
timeline4.play();
let f4 = 0;
console.log("帧号   时间   s1     s2     s3");
while (timeline4.playing) {
  timeline4.update(50);
  f4++;
  console.log(
    `f=${String(f4).padStart(2)}   t=${String(timeline4.currentTime).padStart(4)}   ${states[0].toFixed(2)}   ${states[1].toFixed(2)}   ${states[2].toFixed(2)}`,
  );
}
