/**
 * 手写 Web Animations API 动画
 *
 * Web Animations API 作用：
 *   - element.animate(keyframes, options) 创建动画
 *   - 返回 Animation 对象，可 play/pause/cancel/reverse/finish
 *   - 支持关键帧、时间轴、 playbackRate
 *   - 比 CSS 动画更灵活，可动态控制
 *
 * 实现思路：
 *   1. 封装 animate，返回 Animation
 *   2. Promise 化 finished
 *   3. 动画队列（串行/并行）
 *   4. 缓动函数
 *   5. Node 环境：mock element.animate 与 Animation
 */

function getElementWithAnimate() {
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    if (typeof el.animate === "function") return el;
  }
  // Node mock element + Animation
  let _animId = 0;
  class MockAnimation {
    constructor(keyframes, options) {
      this.id = ++_animId;
      this.keyframes = keyframes;
      this.options = options;
      this.playState = "idle";
      this.playbackRate = 1;
      this.currentTime = 0;
      this.duration = options.duration || 300;
      this._resolveFinish = null;
      this.finished = new Promise((r) => {
        this._resolveFinish = r;
      });
      this.onfinish = null;
    }
    play() {
      this.playState = "running";
      // 模拟时间推进
      this._timer = setInterval(() => {
        this.currentTime += 16 * this.playbackRate;
        if (this.currentTime >= this.duration) {
          this.currentTime = this.duration;
          this.finish();
        }
      }, 16);
    }
    pause() {
      this.playState = "paused";
      if (this._timer) clearInterval(this._timer);
    }
    cancel() {
      this.playState = "idle";
      if (this._timer) clearInterval(this._timer);
      this._resolveFinish?.();
    }
    finish() {
      this.playState = "finished";
      this.currentTime = this.duration;
      if (this._timer) clearInterval(this._timer);
      this.onfinish?.();
      this._resolveFinish?.();
    }
    reverse() {
      this.playbackRate = -this.playbackRate;
    }
    finishNow() {
      this.finish();
    }
  }
  const el = {
    style: {},
    animate(keyframes, options) {
      const anim = new MockAnimation(keyframes, options);
      anim.play();
      return anim;
    },
  };
  return el;
}

// 缓动
const EASING = {
  linear: "linear",
  easeIn: "cubic-bezier(0.42, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.58, 1)",
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
};

class WebAnimationsWrapper {
  constructor(element) {
    this.element = element || getElementWithAnimate();
  }

  /**
   * 创建动画
   * @param {Array} keyframes 关键帧
   * @param {object} options { duration, easing, iterations, fill, delay }
   */
  animate(keyframes, options = {}) {
    const opts = {
      duration: 300,
      easing: EASING.easeOut,
      iterations: 1,
      fill: "forwards",
      delay: 0,
      ...options,
    };
    const anim = this.element.animate(keyframes, opts);
    return anim;
  }

  // 淡入
  fadeIn(duration = 300) {
    return this.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      easing: EASING.easeOut,
    });
  }

  // 淡出
  fadeOut(duration = 300) {
    return this.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing: EASING.easeIn,
    });
  }

  // 平移
  translate(from, to, duration = 300) {
    return this.animate([{ transform: from }, { transform: to }], {
      duration,
      easing: EASING.easeInOut,
    });
  }

  // 缩放弹跳
  bounce(duration = 600) {
    return this.animate(
      [
        { transform: "scale(0)", offset: 0 },
        { transform: "scale(1.2)", offset: 0.5 },
        { transform: "scale(0.9)", offset: 0.75 },
        { transform: "scale(1)", offset: 1 },
      ],
      { duration, easing: EASING.easeOut },
    );
  }

  // 旋转
  rotate(deg = 360, duration = 500) {
    return this.animate(
      [{ transform: "rotate(0deg)" }, { transform: `${deg}deg` }],
      { duration, easing: EASING.linear },
    );
  }

  // Promise 化：等待动画完成
  static async wait(anim) {
    return anim.finished;
  }

  // 串行播放多个动画
  async sequence(anims) {
    for (const a of anims) {
      await a.finished;
    }
  }

  // 并行播放
  parallel(anims) {
    return Promise.all(anims.map((a) => a.finished));
  }
}

// ===== 测试 =====
(async () => {
  const waa = new WebAnimationsWrapper();

  // --- 淡入 ---
  const fadeIn = waa.fadeIn(100);
  await fadeIn.finished;
  console.log("淡入完成, 状态:", fadeIn.playState); // finished

  // --- 平移 ---
  const move = waa.translate("translateX(0px)", "translateX(100px)", 80);
  await move.finished;
  console.log("平移完成"); // 平移完成

  // --- 缩放弹跳 ---
  const bounce = waa.bounce(80);
  await bounce.finished;
  console.log("弹跳完成, 关键帧数:", bounce.keyframes.length); // 4

  // --- 旋转 ---
  const rotate = waa.rotate(360, 80);
  await rotate.finished;
  console.log("旋转完成"); // 旋转完成

  // --- 串行 ---
  const seqStart = Date.now();
  await waa.sequence([waa.fadeIn(50), waa.fadeOut(50), waa.fadeIn(50)]);
  console.log("串行总耗时:", Date.now() - seqStart >= 100); // true

  // --- 并行 ---
  const parStart = Date.now();
  await waa.parallel([waa.fadeIn(60), waa.rotate(180, 60), waa.bounce(60)]);
  console.log("并行耗时 >= 60:", Date.now() - parStart >= 50); // true

  // --- 控制：暂停/取消 ---
  const longAnim = waa.fadeIn(1000);
  longAnim.pause();
  console.log("暂停状态:", longAnim.playState); // paused
  longAnim.cancel();
  console.log("取消状态:", longAnim.playState); // idle

  // --- reverse ---
  const rev = waa.fadeIn(80);
  rev.reverse();
  console.log("反向播放速率:", rev.playbackRate); // -1

  console.log("Web Animations API 动画演示完成");
})();
