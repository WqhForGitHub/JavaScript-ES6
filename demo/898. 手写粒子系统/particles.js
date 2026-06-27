/**
 * @file 898. 手写粒子系统
 * @description
 * 实现一个粒子系统：
 *   - 发射粒子：每个粒子有位置、速度、生命周期
 *   - 受重力影响（向下加速度）
 *   - 随生命周期淡出（alpha 从 1 衰减到 0）
 *   - 每帧更新位置，移除已死亡粒子
 *
 * 模拟 60 帧并打印每帧粒子数量与采样位置。
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
 * 单个粒子
 * @typedef {Object} Particle
 * @property {number} id
 * @property {number} x  位置 x
 * @property {number} y  位置 y
 * @property {number} vx 速度 x
 * @property {number} vy 速度 y
 * @property {number} life      剩余生命（秒）
 * @property {number} maxLife   最大生命（秒）
 * @property {number} size      粒子大小
 * @property {number} alpha     透明度 [0,1]
 */

/**
 * 粒子系统
 */
class ParticleSystem {
  /**
   * @param {Object} [options]
   * @param {{x:number,y:number}} [options.origin] 默认发射原点
   * @param {number} [options.gravity] 重力加速度（px/s^2，正方向向下）
   * @param {number} [options.drag]    速度阻尼（每秒衰减系数）
   * @param {number} [options.fade]    是否随生命淡出
   */
  constructor(options = {}) {
    this.origin = options.origin || { x: 0, y: 0 };
    this.gravity = options.gravity || 0;
    this.drag = options.drag || 0;
    this.fade = options.fade !== false;
    /** @type {Particle[]} */
    this.particles = [];
    this._nextId = 1;
  }

  /**
   * 发射粒子
   * @param {Object} [cfg]
   * @param {number} [cfg.count=1]        粒子数
   * @param {{x:number,y:number}} [cfg.position] 发射位置（默认 origin）
   * @param {number} [cfg.speed=0]        初速度大小
   * @param {number} [cfg.life=1]         生命周期（秒）
   * @param {number} [cfg.angle]          方向弧度（不传则随机）
   * @param {number} [cfg.spread=Math.PI*2] 角度散布
   * @param {number} [cfg.size]           粒子大小
   */
  emit(cfg = {}) {
    const count = cfg.count || 1;
    const pos = cfg.position || this.origin;
    const speed = cfg.speed || 0;
    const life = cfg.life || 1;
    const spread = cfg.spread !== undefined ? cfg.spread : Math.PI * 2;

    for (let i = 0; i < count; i++) {
      const angle =
        cfg.angle !== undefined
          ? cfg.angle + (Math.random() - 0.5) * spread
          : Math.random() * Math.PI * 2;
      const v = speed * (0.6 + Math.random() * 0.8);
      const particleLife = life * (0.8 + Math.random() * 0.4);
      this.particles.push({
        id: this._nextId++,
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: particleLife,
        maxLife: particleLife,
        size: cfg.size || 1 + Math.random() * 2,
        alpha: 1,
      });
    }
  }

  /**
   * 推进 dt 秒
   * @param {number} dt
   */
  update(dt) {
    const next = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue; // 死亡，移除

      // 重力
      p.vy += this.gravity * dt;
      // 阻尼（指数衰减）
      if (this.drag > 0) {
        const factor = Math.exp(-this.drag * dt);
        p.vx *= factor;
        p.vy *= factor;
      }
      // 位置积分
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // 淡出
      if (this.fade) {
        p.alpha = Math.max(0, p.life / p.maxLife);
      }

      next.push(p);
    }
    this.particles = next;
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.particles = [];
  }

  /**
   * 当前粒子数
   * @returns {number}
   */
  get count() {
    return this.particles.length;
  }
}

// ===================== 测试与演示 =====================

console.log("========== 898. 粒子系统 ==========\n");

// 测试 1：向上喷射的粒子，受重力下落
console.log("【测试 1】向上喷射 20 粒子，重力下落，模拟 60 帧");
const sys1 = new ParticleSystem({
  origin: { x: 50, y: 50 },
  gravity: 80,
  drag: 0.3,
  fade: true,
});
sys1.emit({
  count: 20,
  speed: 50,
  life: 1.5,
  angle: -Math.PI / 2, // 向上
  spread: Math.PI / 2, // ±45°
});

console.log(`发射后粒子数: ${sys1.count}`);
console.log("帧   粒子数   平均生命   平均alpha   采样粒子位置");
const dt = 1 / 60;
for (let frame = 1; frame <= 60; frame++) {
  sys1.update(dt);
  if (frame % 6 === 0 || frame === 1) {
    let avgLife = 0;
    let avgAlpha = 0;
    sys1.particles.forEach((p) => {
      avgLife += p.life;
      avgAlpha += p.alpha;
    });
    avgLife = sys1.count > 0 ? avgLife / sys1.count : 0;
    avgAlpha = sys1.count > 0 ? avgAlpha / sys1.count : 0;
    // 采样第一个粒子
    const sample = sys1.particles[0];
    const sampleStr = sample
      ? `#${sample.id} (${sample.x.toFixed(1)},${sample.y.toFixed(1)}) alpha=${sample.alpha.toFixed(2)}`
      : "无";
    console.log(
      `${String(frame).padStart(2)}   ${String(sys1.count).padStart(5)}   ${avgLife.toFixed(3).padStart(7)}   ${avgAlpha.toFixed(3).padStart(8)}   ${sampleStr}`,
    );
  }
}
console.log(`\n60 帧后剩余粒子数: ${sys1.count}`);

// 测试 2：持续发射（每帧发射少量粒子）
console.log("\n【测试 2】持续发射（每帧 2 粒子，模拟 60 帧）");
const sys2 = new ParticleSystem({
  origin: { x: 100, y: 100 },
  gravity: 50,
  drag: 0.5,
});
let maxCount = 0;
console.log("帧   粒子数   最大数");
for (let frame = 1; frame <= 60; frame++) {
  sys2.emit({ count: 2, speed: 30, life: 1.0, spread: Math.PI * 2 });
  sys2.update(dt);
  if (sys2.count > maxCount) maxCount = sys2.count;
  if (frame % 10 === 0 || frame === 1) {
    console.log(
      `${String(frame).padStart(2)}   ${String(sys2.count).padStart(5)}   ${String(maxCount).padStart(5)}`,
    );
  }
}
console.log(`峰值粒子数: ${maxCount}，最终: ${sys2.count}`);

// 测试 3：无重力四面扩散
console.log("\n【测试 3】无重力全方向扩散 15 粒子，5 帧后位置");
const sys3 = new ParticleSystem({
  origin: { x: 0, y: 0 },
  gravity: 0,
  fade: true,
});
sys3.emit({ count: 15, speed: 20, life: 2.0, spread: Math.PI * 2 });
for (let i = 1; i <= 5; i++) sys3.update(dt);
console.log("5 帧后粒子采样（前 6 个）:");
sys3.particles.slice(0, 6).forEach((p) => {
  console.log(
    `  #${p.id} pos=(${p.x.toFixed(2)}, ${p.y.toFixed(2)}) v=(${p.vx.toFixed(2)}, ${p.vy.toFixed(2)}) life=${p.life.toFixed(3)} alpha=${p.alpha.toFixed(3)}`,
  );
});

// 测试 4：粒子全部死亡验证
console.log("\n【测试 4】短生命粒子全部死亡验证");
const sys4 = new ParticleSystem({ origin: { x: 0, y: 0 } });
sys4.emit({ count: 10, speed: 10, life: 0.2 });
console.log("发射后:", sys4.count, "个");
for (let i = 0; i < 30; i++) sys4.update(dt); // 0.5s 后应全死
console.log("0.5s 后:", sys4.count, "个（应为 0）");
