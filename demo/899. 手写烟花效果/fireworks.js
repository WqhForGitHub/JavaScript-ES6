/**
 * @file 899. 手写烟花效果
 * @description
 * 模拟烟花完整生命周期：
 *   1. 上升阶段（rising）：火箭以恒定速度向上飞
 *   2. 爆炸阶段（exploded）：到达目标高度后爆炸成大量粒子，
 *      粒子带随机速度四散，受重力下落，随生命淡出
 *   3. 结束（done）：所有粒子死亡
 *
 * 通过 update(dt) 推进，打印每帧状态。
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
 * 烟花粒子
 * @typedef {Object} Spark
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life
 * @property {number} maxLife
 * @property {number} alpha
 */

/**
 * 单个烟花
 */
class Firework {
  /**
   * @param {Object} cfg
   * @param {{x:number,y:number}} [cfg.start]     发射位置
   * @param {number} [cfg.targetY]                 爆炸目标高度（y 越小越高）
   * @param {number} [cfg.rocketSpeed]             火箭上升速度（px/s）
   * @param {number} [cfg.particleCount]           爆炸粒子数
   * @param {number} [cfg.particleLife]            粒子生命（秒）
   * @param {number} [cfg.particleSpeed]           爆炸初速度
   * @param {number} [cfg.gravity]                 重力（px/s^2）
   * @param {string} [cfg.color]                   颜色标签
   */
  constructor(cfg = {}) {
    this.start = cfg.start || { x: 0, y: 0 };
    this.targetY = cfg.targetY !== undefined ? cfg.targetY : 20;
    this.rocketSpeed = cfg.rocketSpeed || 80;
    this.particleCount = cfg.particleCount || 24;
    this.particleLife = cfg.particleLife || 1.2;
    this.particleSpeed = cfg.particleSpeed || 60;
    this.gravity = cfg.gravity || 30;
    this.color = cfg.color || "red";

    // 状态机：rising -> exploded -> done
    this.phase = "rising";
    this.rocket = {
      x: this.start.x,
      y: this.start.y,
      vx: 0,
      vy: -this.rocketSpeed,
    };
    /** @type {Spark[]} */
    this.particles = [];
    this.time = 0;
  }

  /**
   * 触发爆炸
   * @private
   */
  _explode() {
    this.phase = "exploded";
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      // 均匀分布 + 少量随机扰动
      const angle = (i / this.particleCount) * Math.PI * 2 + rand(-0.15, 0.15);
      const speed = this.particleSpeed * rand(0.6, 1.0);
      const life = this.particleLife * rand(0.7, 1.0);
      this.particles.push({
        x: this.rocket.x,
        y: this.rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        alpha: 1,
      });
    }
  }

  /**
   * 推进 dt 秒
   * @param {number} dt
   * @returns {string} 当前阶段
   */
  update(dt) {
    this.time += dt;
    if (this.phase === "rising") {
      this.rocket.y += this.rocket.vy * dt;
      this.rocket.x += this.rocket.vx * dt;
      if (this.rocket.y <= this.targetY) {
        this._explode();
      }
    } else if (this.phase === "exploded") {
      const alive = [];
      for (const p of this.particles) {
        p.life -= dt;
        if (p.life <= 0) continue;
        // 重力
        p.vy += this.gravity * dt;
        // 位置积分
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // 淡出
        p.alpha = Math.max(0, p.life / p.maxLife);
        alive.push(p);
      }
      this.particles = alive;
      if (this.particles.length === 0) this.phase = "done";
    }
    return this.phase;
  }

  /**
   * 状态快照
   * @returns {Object}
   */
  snapshot() {
    return {
      phase: this.phase,
      time: this.time,
      color: this.color,
      rocket: { ...this.rocket },
      particleCount: this.particles.length,
      particles: this.particles.map((p) => ({ ...p })),
    };
  }
}

/**
 * 烟花管理器：管理多个烟花
 */
class FireworkShow {
  constructor() {
    /** @type {Firework[]} */
    this.fireworks = [];
  }

  /**
   * 添加烟花
   * @param {Object} cfg
   */
  add(cfg) {
    const fw = new Firework(cfg);
    this.fireworks.push(fw);
    return fw;
  }

  /**
   * 推进所有烟花
   * @param {number} dt
   */
  update(dt) {
    for (const fw of this.fireworks) fw.update(dt);
  }

  /**
   * 是否全部结束
   * @returns {boolean}
   */
  get allDone() {
    return (
      this.fireworks.length > 0 &&
      this.fireworks.every((f) => f.phase === "done")
    );
  }
}

// ===================== 测试与演示 =====================

console.log("========== 899. 烟花效果 ==========\n");

// 测试 1：单个烟花完整生命周期
console.log("【测试 1】单个烟花（从 y=100 上升，y=20 爆炸）");
const fw1 = new Firework({
  start: { x: 50, y: 100 },
  targetY: 20,
  rocketSpeed: 90,
  particleCount: 16,
  particleLife: 1.0,
  particleSpeed: 50,
  gravity: 30,
  color: "gold",
});

const dt = 1 / 30; // 30fps
let frame = 0;
console.log("帧   阶段       火箭/粒子信息");
let phase = "rising";
while (phase !== "done") {
  phase = fw1.update(dt);
  frame++;
  const snap = fw1.snapshot();
  if (snap.phase === "rising") {
    console.log(
      `${String(frame).padStart(2)}   RISING     rocket=(${snap.rocket.x.toFixed(1)}, ${snap.rocket.y.toFixed(1)})`,
    );
  } else if (snap.phase === "exploded") {
    const sample = snap.particles[0];
    const sampleStr = sample
      ? `sample=(${sample.x.toFixed(1)},${sample.y.toFixed(1)}) v=(${sample.vx.toFixed(1)},${sample.vy.toFixed(1)}) a=${sample.alpha.toFixed(2)}`
      : "";
    console.log(
      `${String(frame).padStart(2)}   EXPLODED   粒子数=${snap.particleCount} ${sampleStr}`,
    );
  }
}
console.log(
  `${String(frame).padStart(2)}   DONE       烟花结束 (总时长 ${fw1.time.toFixed(2)}s)`,
);

// 测试 2：烟花秀（多个烟花错峰发射）
console.log("\n【测试 2】烟花秀：3 个烟花不同位置/颜色，同时模拟");
const show = new FireworkShow();
show.add({
  start: { x: 30, y: 100 },
  targetY: 25,
  rocketSpeed: 80,
  particleCount: 14,
  particleLife: 0.9,
  particleSpeed: 45,
  color: "red",
});
show.add({
  start: { x: 70, y: 100 },
  targetY: 15,
  rocketSpeed: 100,
  particleCount: 20,
  particleLife: 1.1,
  particleSpeed: 55,
  color: "blue",
});
show.add({
  start: { x: 50, y: 100 },
  targetY: 35,
  rocketSpeed: 70,
  particleCount: 12,
  particleLife: 0.8,
  particleSpeed: 40,
  color: "green",
});

console.log("帧   总粒子数   各烟花状态");
let sFrame = 0;
while (!show.allDone) {
  show.update(dt);
  sFrame++;
  if (sFrame % 3 === 0 || show.allDone) {
    const total = show.fireworks.reduce(
      (s, f) => s + f.snapshot().particleCount,
      0,
    );
    const states = show.fireworks.map((f) => {
      const ph = f.phase;
      if (ph === "rising") return `${f.color}:↑(${f.rocket.y.toFixed(0)})`;
      if (ph === "exploded") return `${f.color}:✦${f.particles.length}`;
      return `${f.color}:完`;
    });
    console.log(
      `${String(sFrame).padStart(2)}   ${String(total).padStart(6)}     ${states.join("  ")}`,
    );
  }
}
console.log(`烟花秀结束，共 ${sFrame} 帧 (${(sFrame * dt).toFixed(2)}s)`);

// 测试 3：爆炸粒子分布验证（角度均匀）
console.log("\n【测试 3】爆炸粒子角度分布（24 粒子应近似均匀）");
const fw3 = new Firework({
  start: { x: 0, y: 0 },
  targetY: 1,
  rocketSpeed: 1000, // 立即到达
  particleCount: 24,
  particleLife: 2,
  particleSpeed: 50,
});
fw3.update(0.01); // 触发爆炸
const angles = fw3.particles.map(
  (p) => (Math.atan2(p.vy, p.vx) * 180) / Math.PI + 180,
);
console.log(
  "前 8 个粒子角度（度）:",
  angles
    .slice(0, 8)
    .map((a) => a.toFixed(1))
    .join(", "),
);
console.log("粒子数:", fw3.particles.length, "（应 24）");

// 测试 4：粒子淡出验证
console.log("\n【测试 4】粒子淡出验证（爆炸后逐帧 alpha）");
const fw4 = new Firework({
  start: { x: 0, y: 100 },
  targetY: 90,
  rocketSpeed: 1000,
  particleCount: 5,
  particleLife: 1.0,
  particleSpeed: 30,
  gravity: 0,
});
fw4.update(0.01); // 爆炸
console.log("帧   粒子1 alpha   粒子1 位置");
for (let i = 0; i < 10; i++) {
  fw4.update(0.1);
  const p = fw4.particles[0];
  if (p) {
    console.log(
      `${String(i + 1).padStart(2)}   ${p.alpha.toFixed(3).padStart(8)}   (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`,
    );
  } else {
    console.log(`${String(i + 1).padStart(2)}   粒子已全部死亡`);
    break;
  }
}
