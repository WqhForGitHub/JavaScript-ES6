/**
 * @file framePlayer.js
 * @description 手写 Canvas 帧动画播放器：按帧的持续时间顺序播放精灵图/帧序列，
 *              支持循环、暂停、停止、跳转等控制。在 Node.js 中模拟时间推进。
 *
 * 算法说明：
 *   - 每一帧包含 { data(帧内容), duration(持续时长 ms) }。
 *   - step(delta) 方法推进 delta 毫秒，累计 elapsed 时间，
 *     当 elapsed 超过当前帧 duration 时切换到下一帧（多余时间顺延）。
 *   - 循环模式：到末尾后回到第 0 帧；非循环模式：停在最后一帧并触发 onEnd。
 */

/**
 * 帧动画播放器
 */
class FramePlayer {
  /**
   * @param {Array<{data:string, duration:number}>} frames - 帧数组
   * @param {Object} [options] - 配置项
   * @param {boolean} [options.loop=true] - 是否循环
   * @param {number} [options.fps=60] - 期望帧率（仅参考）
   */
  constructor(frames, options = {}) {
    this.frames = frames;
    this.loop = options.loop !== undefined ? options.loop : true;
    this.fps = options.fps || 60;
    this.currentIndex = 0;
    this.elapsed = 0; // 当前帧已累计时间
    this.totalTime = 0; // 总累计时间
    this.playing = false;
    /** 帧切换回调 */
    this.onFrame = null;
    /** 非循环播放结束回调 */
    this.onEnd = null;
  }

  /**
   * 推进时间
   * @param {number} delta - 时间增量（ms）
   */
  step(delta) {
    if (!this.playing || this.frames.length === 0) return;
    this.elapsed += delta;
    this.totalTime += delta;

    let currentFrame = this.frames[this.currentIndex];
    // 可能一帧时长不够，需要连续跳过
    while (this.elapsed >= currentFrame.duration) {
      this.elapsed -= currentFrame.duration;
      this.currentIndex++;
      if (this.currentIndex >= this.frames.length) {
        if (this.loop) {
          this.currentIndex = 0;
        } else {
          this.currentIndex = this.frames.length - 1;
          this.playing = false;
          if (this.onEnd) this.onEnd();
          return;
        }
      }
      currentFrame = this.frames[this.currentIndex];
    }
    if (this.onFrame) {
      this.onFrame(this.currentIndex, currentFrame, this.totalTime);
    }
  }

  /** 开始/继续播放 */
  play() {
    this.playing = true;
  }

  /** 暂停 */
  pause() {
    this.playing = false;
  }

  /** 停止并重置到第 0 帧 */
  stop() {
    this.playing = false;
    this.currentIndex = 0;
    this.elapsed = 0;
    this.totalTime = 0;
  }

  /**
   * 跳转到指定帧
   * @param {number} index - 帧索引
   */
  goto(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.frames.length - 1));
    this.elapsed = 0;
  }

  /** 获取当前帧 */
  current() {
    return this.frames[this.currentIndex];
  }
}

/**
 * 模拟播放器在一段时间内的运行
 * @param {FramePlayer} player - 播放器实例
 * @param {number} totalDuration - 总时长 ms
 * @param {number} tickMs - 每个时间步 ms
 */
function simulate(player, totalDuration, tickMs) {
  player.play();
  let time = 0;
  let lastIdx = -1;
  while (time < totalDuration) {
    player.step(tickMs);
    time += tickMs;
    if (player.currentIndex !== lastIdx) {
      const frame = player.frames[player.currentIndex];
      console.log(
        `t=${String(time).padStart(4)}ms -> Frame[${player.currentIndex}] dur=${frame.duration}ms`,
      );
      console.log(
        frame.data
          .split("\n")
          .map((l) => "    " + l)
          .join("\n"),
      );
      lastIdx = player.currentIndex;
    }
  }
}

// ======================== 测试用例 ========================

// 行走动画（4 帧，每帧 200ms）
const walkFrames = [
  {
    data: "  o  \n /|\\ \n / \\ ",
    duration: 200,
  },
  {
    data: "  o  \n -|- \n / \\ ",
    duration: 200,
  },
  {
    data: "  o  \n \\|/ \n / \\ ",
    duration: 200,
  },
  {
    data: "  o  \n -|- \n  \\  ",
    duration: 200,
  },
];

console.log("############ Test 1: 循环播放行走动画（1s） ############");
const player1 = new FramePlayer(walkFrames, { loop: true });
simulate(player1, 1000, 50);

console.log("\n\n############ Test 2: 非循环播放（1.5s） ############");
const player2 = new FramePlayer(walkFrames, { loop: false });
player2.onEnd = () => console.log(">>> Animation ended (non-loop).");
simulate(player2, 1500, 50);

console.log("\n\n############ Test 3: 控制方法测试 ############");
const player3 = new FramePlayer(walkFrames, { loop: true });
player3.goto(2);
console.log(`After goto(2): currentIndex = ${player3.currentIndex}`);
player3.play();
player3.step(50);
console.log(
  `After step(50): currentIndex = ${player3.currentIndex}, elapsed = ${player3.elapsed}`,
);
player3.pause();
player3.step(1000);
console.log(
  `After pause + step(1000): currentIndex = ${player3.currentIndex} (unchanged, paused)`,
);
player3.play();
player3.step(200);
console.log(
  `After play + step(200): currentIndex = ${player3.currentIndex} (advanced from 2 to 3)`,
);
player3.stop();
console.log(
  `After stop: currentIndex = ${player3.currentIndex}, totalTime = ${player3.totalTime}`,
);
