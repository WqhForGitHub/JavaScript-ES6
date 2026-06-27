/**
 * @file 892. 手写关键帧动画系统
 * @description
 * 实现一个关键帧动画系统。关键帧由 { time, value, easing? } 组成，按时间排序。
 * 系统在任意时间 t 通过两个相邻关键帧之间的插值计算属性值。
 * 支持多种缓动函数，支持同时动画化多个属性。
 *
 * 核心 API（类 KeyframeAnimation）：
 *   - addKeyframe(property, keyframe)  为某属性添加关键帧
 *   - update(time)                     根据时间更新所有属性当前值
 *   - getValues()                      获取当前各属性值
 *
 * 纯 JS 实现，无 DOM 依赖，可直接用 node 运行。
 */

"use strict";

/**
 * 缓动函数集合
 * @typedef {(t:number)=>number} EasingFn
 */
const Easing = {
  /** 线性 */
  linear: (t) => t,
  /** 二次缓入 */
  easeIn: (t) => t * t,
  /** 二次缓出 */
  easeOut: (t) => t * (2 - t),
  /** 二次缓入缓出 */
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  /** 三次缓入 */
  easeInCubic: (t) => t * t * t,
  /** 三次缓出 */
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  /** 弹性（会有轻微过冲） */
  elastic: (t) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return (
      Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
    );
  },
};

/**
 * 线性插值
 * @param {number} a 起始值
 * @param {number} b 结束值
 * @param {number} t 插值因子 [0,1]
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 单个属性的关键帧轨道
 */
class PropertyTrack {
  /**
   * @param {string} name 属性名
   */
  constructor(name) {
    this.name = name;
    /** @type {Array<{time:number, value:number, easing?:EasingFn}>} */
    this.keyframes = [];
  }

  /**
   * 添加关键帧
   * @param {Object} keyframe
   * @param {number} keyframe.time  时间点（秒）
   * @param {number} keyframe.value 属性值
   * @param {EasingFn} [keyframe.easing] 该段缓动函数（默认 linear）
   */
  addKeyframe(keyframe) {
    this.keyframes.push({
      time: keyframe.time,
      value: keyframe.value,
      easing: keyframe.easing || Easing.linear,
    });
    // 保持按时间排序
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  /**
   * 该轨道总时长（最后一个关键帧时间）
   * @returns {number}
   */
  get duration() {
    if (this.keyframes.length === 0) return 0;
    return this.keyframes[this.keyframes.length - 1].time;
  }

  /**
   * 计算时间 t 处的属性值
   * @param {number} t 时间
   * @returns {number}
   */
  evaluate(t) {
    const frames = this.keyframes;
    if (frames.length === 0) return 0;
    if (frames.length === 1) return frames[0].value;
    // 边界 clamp
    if (t <= frames[0].time) return frames[0].value;
    if (t >= frames[frames.length - 1].time) {
      return frames[frames.length - 1].value;
    }
    // 找到包含 t 的区间 [i, i+1]
    let i = 0;
    while (i < frames.length - 1 && frames[i + 1].time < t) i++;
    const k0 = frames[i];
    const k1 = frames[i + 1];
    const segDuration = k1.time - k0.time;
    const localT = segDuration === 0 ? 0 : (t - k0.time) / segDuration;
    const eased = k0.easing(localT);
    return lerp(k0.value, k1.value, eased);
  }
}

/**
 * 关键帧动画系统：管理多个属性的轨道
 */
class KeyframeAnimation {
  constructor() {
    /** @type {Map<string, PropertyTrack>} */
    this.tracks = new Map();
    /** 当前时间 */
    this.currentTime = 0;
    /** 当前各属性值 */
    this.values = {};
  }

  /**
   * 为指定属性添加关键帧
   * @param {string} property 属性名
   * @param {Object} keyframe { time, value, easing? }
   * @returns {KeyframeAnimation} this（链式调用）
   */
  addKeyframe(property, keyframe) {
    if (!this.tracks.has(property)) {
      this.tracks.set(property, new PropertyTrack(property));
    }
    this.tracks.get(property).addKeyframe(keyframe);
    return this;
  }

  /**
   * 总时长（所有轨道中最长的）
   * @returns {number}
   */
  get duration() {
    let max = 0;
    for (const track of this.tracks.values()) {
      if (track.duration > max) max = track.duration;
    }
    return max;
  }

  /**
   * 根据时间更新所有属性当前值
   * @param {number} time 时间（秒）
   * @returns {Object} 当前各属性值
   */
  update(time) {
    this.currentTime = time;
    for (const [name, track] of this.tracks) {
      this.values[name] = track.evaluate(time);
    }
    return this.values;
  }

  /**
   * 获取当前各属性值
   * @returns {Object}
   */
  getValues() {
    return { ...this.values };
  }
}

// ===================== 测试与演示 =====================

console.log("========== 892. 关键帧动画系统 ==========\n");

// 测试 1：单属性多关键帧，线性插值
console.log("【测试 1】单属性 x：0->100->50->200（线性），时长 3s");
const anim1 = new KeyframeAnimation();
anim1
  .addKeyframe("x", { time: 0, value: 0 })
  .addKeyframe("x", { time: 1, value: 100 })
  .addKeyframe("x", { time: 2, value: 50 })
  .addKeyframe("x", { time: 3, value: 200 });

console.log("总时长:", anim1.duration, "s");
console.log("时间    x值");
for (let t = 0; t <= 3.0001; t += 0.25) {
  const v = anim1.update(t);
  console.log(`t=${t.toFixed(2)}   x=${v.x.toFixed(2)}`);
}

// 测试 2：多属性同时动画
console.log("\n【测试 2】多属性：x(线性) + y(easeInOut) + opacity(easeOut)");
const anim2 = new KeyframeAnimation();
anim2
  .addKeyframe("x", { time: 0, value: 0, easing: Easing.linear })
  .addKeyframe("x", { time: 2, value: 100, easing: Easing.linear })
  .addKeyframe("y", { time: 0, value: 0, easing: Easing.easeInOut })
  .addKeyframe("y", { time: 2, value: 50, easing: Easing.easeInOut })
  .addKeyframe("opacity", { time: 0, value: 1, easing: Easing.easeOut })
  .addKeyframe("opacity", { time: 2, value: 0, easing: Easing.easeOut });

console.log("时间    x       y      opacity");
for (let t = 0; t <= 2.0001; t += 0.2) {
  const v = anim2.update(t);
  console.log(
    `t=${t.toFixed(2)}   ${v.x.toFixed(2).padStart(6)}   ${v.y.toFixed(2).padStart(6)}   ${v.opacity.toFixed(3).padStart(7)}`,
  );
}

// 测试 3：不同缓动函数对比（0->100，1s）
console.log("\n【测试 3】缓动函数对比（值 0->100，时长 1s）");
const easings = {
  linear: Easing.linear,
  easeIn: Easing.easeIn,
  easeOut: Easing.easeOut,
  easeInOut: Easing.easeInOut,
  elastic: Easing.elastic,
};
// 为每种缓动创建独立动画
const anims = {};
for (const [name, fn] of Object.entries(easings)) {
  anims[name] = new KeyframeAnimation();
  anims[name]
    .addKeyframe("v", { time: 0, value: 0, easing: fn })
    .addKeyframe("v", { time: 1, value: 100, easing: fn });
}
console.log(
  "时间   " +
    Object.keys(easings)
      .map((n) => n.padStart(10))
      .join(""),
);
for (let t = 0; t <= 1.0001; t += 0.1) {
  const vals = Object.keys(easings).map((n) => {
    const v = anims[n].update(t);
    return v.v.toFixed(2).padStart(10);
  });
  console.log(`t=${t.toFixed(2)}  ${vals.join("")}`);
}

// 测试 4：边界 clamp（超出范围）
console.log("\n【测试 4】超出时间范围 clamp");
anim1.update(-1);
console.log("t=-1  -> x =", anim1.getValues().x, "(应为 0)");
anim1.update(99);
console.log("t=99  -> x =", anim1.getValues().x, "(应为 200)");

// 测试 5：模拟逐帧播放并输出关键帧
console.log("\n【测试 5】模拟 60fps 播放测试 2 动画（每 0.2s 采样一帧）");
const anim3 = new KeyframeAnimation();
anim3
  .addKeyframe("x", { time: 0, value: 0 })
  .addKeyframe("x", { time: 1, value: 100, easing: Easing.easeOutCubic })
  .addKeyframe("x", { time: 2, value: 100 })
  .addKeyframe("x", { time: 3, value: 0, easing: Easing.easeInCubic });
const totalFrames = 60;
const dur = anim3.duration;
console.log(`总时长 ${dur}s，共 ${totalFrames} 帧`);
console.log("帧号   时间      x值");
for (let f = 0; f <= totalFrames; f++) {
  const t = (f / totalFrames) * dur;
  const v = anim3.update(t);
  if (f % 6 === 0) {
    console.log(
      `f=${String(f).padStart(3)}   t=${t.toFixed(3)}   x=${v.x.toFixed(2)}`,
    );
  }
}
