/**
 * @file 891. 手写弹簧动画（Spring Animation）
 * @description
 * 基于胡克定律（Hooke's Law）实现弹簧物理动画。
 *
 * 公式：F = -k*x - c*v
 *   - F: 弹簧合力
 *   - k: 刚度系数 stiffness（弹簧硬度，>0）
 *   - c: 阻尼系数 damping（消耗能量，>=0）
 *   - x: 当前位移（相对平衡点）
 *   - v: 当前速度
 *   - m: 质量 mass（>0）
 *
 * 加速度 a = F / m = -(k*x + c*v) / m
 *
 * 使用数值积分逐帧推进，提供两种方法：
 *   1. 半隐式 Euler 法（Symplectic Euler）：稳定、速度快
 *      v(t+dt) = v(t) + a * dt
 *      x(t+dt) = x(t) + v(t+dt) * dt
 *   2. RK4（四阶龙格-库塔）：精度更高
 *
 * 参数：stiffness, damping, mass, initialPosition
 * 每帧输出位置，并打印完整轨迹。
 *
 * 纯 JS 实现，无 DOM 依赖，可直接用 node 运行。
 */

"use strict";

/**
 * 弹簧动画类
 */
class SpringAnimation {
  /**
   * @param {Object} options
   * @param {number} options.stiffness        刚度系数 k（>0）
   * @param {number} options.damping          阻尼系数 c（>=0）
   * @param {number} options.mass             质量 m（>0）
   * @param {number} options.initialPosition  初始位移（相对平衡点）
   * @param {number} [options.initialVelocity=0] 初始速度
   * @param {number} [options.dt=1/60]        每帧时间步长（秒）
   */
  constructor(options) {
    if (!options || options.stiffness <= 0) {
      throw new Error("stiffness 必须为正数");
    }
    if (options.damping < 0) throw new Error("damping 不能为负");
    if (options.mass <= 0) throw new Error("mass 必须为正数");

    this.stiffness = options.stiffness;
    this.damping = options.damping;
    this.mass = options.mass;
    this.position = options.initialPosition;
    this.velocity = options.initialVelocity || 0;
    this.dt = options.dt || 1 / 60;
    this.time = 0;
    /** @type {Array<{time:number,position:number,velocity:number}>} */
    this.trajectory = [];
  }

  /**
   * 计算给定状态 (x, v) 下的加速度
   * @param {number} x 位移
   * @param {number} v 速度
   * @returns {number} 加速度
   */
  acceleration(x, v) {
    return -(this.stiffness * x + this.damping * v) / this.mass;
  }

  /**
   * 半隐式 Euler 积分，推进一帧
   * 先更新速度再更新位置，能量更稳定。
   */
  stepEuler() {
    const a = this.acceleration(this.position, this.velocity);
    this.velocity += a * this.dt;
    this.position += this.velocity * this.dt;
    this.time += this.dt;
  }

  /**
   * RK4 四阶龙格-库塔积分，推进一帧
   * 将二阶 ODE 拆为方程组：
   *   dx/dt = v
   *   dv/dt = -(k*x + c*v) / m
   */
  stepRK4() {
    const dt = this.dt;
    const x0 = this.position;
    const v0 = this.velocity;

    // k1
    const k1x = v0;
    const k1v = this.acceleration(x0, v0);
    // k2
    const k2x = v0 + (k1v * dt) / 2;
    const k2v = this.acceleration(x0 + (k1x * dt) / 2, v0 + (k1v * dt) / 2);
    // k3
    const k3x = v0 + (k2v * dt) / 2;
    const k3v = this.acceleration(x0 + (k2x * dt) / 2, v0 + (k2v * dt) / 2);
    // k4
    const k4x = v0 + k3v * dt;
    const k4v = this.acceleration(x0 + k3x * dt, v0 + k3v * dt);

    this.position += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    this.velocity += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    this.time += dt;
  }

  /**
   * 记录当前状态到轨迹
   */
  record() {
    this.trajectory.push({
      time: this.time,
      position: this.position,
      velocity: this.velocity,
    });
  }

  /**
   * 模拟指定帧数
   * @param {number} frames 总帧数
   * @param {'euler'|'rk4'} [method='euler'] 积分方法
   */
  simulate(frames, method = "euler") {
    this.record();
    for (let i = 0; i < frames; i++) {
      if (method === "rk4") this.stepRK4();
      else this.stepEuler();
      this.record();
    }
  }

  /**
   * 判断是否已静止
   * @param {number} [epsilon=1e-3] 判定阈值
   * @returns {boolean}
   */
  isAtRest(epsilon = 1e-3) {
    return (
      Math.abs(this.position) < epsilon && Math.abs(this.velocity) < epsilon
    );
  }
}

// ===================== 测试与演示 =====================

console.log("========== 891. 弹簧动画模拟 ==========\n");

// 测试 1：欠阻尼（会振荡），Euler 法
console.log("【测试 1】欠阻尼弹簧 (k=80, c=4, m=1)，初始位移=100，Euler 积分");
const spring1 = new SpringAnimation({
  stiffness: 80,
  damping: 4,
  mass: 1,
  initialPosition: 100,
});
spring1.simulate(120, "euler");
console.log("帧号   时间(s)    位移        速度");
spring1.trajectory.forEach((p, i) => {
  if (i % 10 === 0) {
    console.log(
      `${String(i).padStart(4)}   ${p.time.toFixed(3).padStart(7)}   ${p.position.toFixed(4).padStart(9)}   ${p.velocity.toFixed(4).padStart(9)}`,
    );
  }
});

// 测试 2：过阻尼（缓慢回归无振荡）
console.log(
  "\n【测试 2】过阻尼弹簧 (k=170, c=20, m=1)，初始位移=100，Euler 积分",
);
const spring2 = new SpringAnimation({
  stiffness: 170,
  damping: 20,
  mass: 1,
  initialPosition: 100,
});
spring2.simulate(120, "euler");
console.log("帧号   时间(s)    位移        速度");
spring2.trajectory.forEach((p, i) => {
  if (i % 10 === 0) {
    console.log(
      `${String(i).padStart(4)}   ${p.time.toFixed(3).padStart(7)}   ${p.position.toFixed(4).padStart(9)}   ${p.velocity.toFixed(4).padStart(9)}`,
    );
  }
});

// 测试 3：临界阻尼（最快无振荡回归），RK4 法
console.log(
  "\n【测试 3】临界阻尼弹簧 (k=100, c=20, m=1)，初始位移=100，RK4 积分",
);
const spring3 = new SpringAnimation({
  stiffness: 100,
  damping: 20,
  mass: 1,
  initialPosition: 100,
});
spring3.simulate(120, "rk4");
console.log("帧号   时间(s)    位移        速度");
spring3.trajectory.forEach((p, i) => {
  if (i % 10 === 0) {
    console.log(
      `${String(i).padStart(4)}   ${p.time.toFixed(3).padStart(7)}   ${p.position.toFixed(4).padStart(9)}   ${p.velocity.toFixed(4).padStart(9)}`,
    );
  }
});

// 测试 4：RK4 与 Euler 精度对比
console.log("\n【测试 4】RK4 vs Euler 精度对比（同参数 60 帧后）");
const springE = new SpringAnimation({
  stiffness: 200,
  damping: 10,
  mass: 1,
  initialPosition: 50,
});
const springR = new SpringAnimation({
  stiffness: 200,
  damping: 10,
  mass: 1,
  initialPosition: 50,
});
springE.simulate(60, "euler");
springR.simulate(60, "rk4");
console.log(
  `Euler 60帧后: 位移=${springE.position.toFixed(6)}, 速度=${springE.velocity.toFixed(6)}`,
);
console.log(
  `RK4   60帧后: 位移=${springR.position.toFixed(6)}, 速度=${springR.velocity.toFixed(6)}`,
);

// 测试 5：用文本图表直观展示振荡轨迹
console.log(
  "\n【测试 5】测试 1 前 25 帧位移可视化（* 为当前位置，| 为平衡点）",
);
spring1.trajectory.slice(0, 26).forEach((p) => {
  const scale = 40; // 100 位移 -> 40 字符
  const offset = Math.round((p.position / 100) * scale);
  const pos = 40 + offset; // 中心 40
  let line = "";
  for (let i = 0; i < 81; i++) {
    if (i === 40) line += "|";
    else if (i === pos) line += "*";
    else line += " ";
  }
  console.log(`t=${p.time.toFixed(3)} |${line}| pos=${p.position.toFixed(2)}`);
});

console.log("\n弹簧 1 是否静止:", spring1.isAtRest(0.5));
