/**
 * 手写有限状态机（FSM）
 * =====================
 * 有限状态机（Finite State Machine）的核心模型：
 *   五元组 (Q, Σ, δ, q0, F)
 *   - Q: 有限状态集合
 *   - Σ: 有限事件（输入）集合
 *   - δ: 状态转移函数 (state, event) -> state
 *   - q0: 初始状态
 *   - F: 终止状态集合（可选，本实现不强求）
 *
 * 本实现是一个面向对象的 FSM 类，支持：
 *   - addState(name, { onEntry, onExit })
 *   - addTransition(from, event, to, { guard, action })
 *   - start(initialState)   —— 启动并执行初始状态的 onEntry
 *   - send(event, payload)  —— 触发事件，执行 onExit -> action -> onEntry
 *
 * 关键点：
 *   1. 进入新状态前先执行旧状态 onExit
 *   2. 执行转移本身的 action
 *   3. 进入新状态后执行新状态 onEntry
 *   4. guard 不通过时不转移，不触发任何 action
 *   5. 非法事件（无转移）时保持当前状态
 */

class FiniteStateMachine {
  /**
   * @param {string} [name] - FSM 名称（用于调试）
   */
  constructor(name = "fsm") {
    this.name = name;
    /** @type {Map<string, {onEntry?: Function, onExit?: Function}>} */
    this.states = new Map();
    /** @type {Array<{from: string, event: string, to: string, guard?: Function, action?: Function}>} */
    this.transitions = [];
    this.currentState = null;
    this.started = false;
  }

  /**
   * 添加状态
   * @param {string} name - 状态名
   * @param {{onEntry?: Function, onExit?: Function}} [hooks]
   * @returns {this} 链式调用
   */
  addState(name, hooks = {}) {
    this.states.set(name, hooks);
    return this;
  }

  /**
   * 添加转移
   * @param {string} from - 起始状态
   * @param {string} event - 触发事件
   * @param {string} to - 目标状态
   * @param {{guard?: Function, action?: Function}} [opts]
   * @returns {this} 链式调用
   */
  addTransition(from, event, to, opts = {}) {
    this.transitions.push({
      from,
      event,
      to,
      guard: opts.guard,
      action: opts.action,
    });
    return this;
  }

  /**
   * 启动状态机，进入初始状态并执行其 onEntry
   * @param {string} initialState
   * @returns {this}
   */
  start(initialState) {
    if (!this.states.has(initialState)) {
      throw new Error(`未知初始状态: ${initialState}`);
    }
    this.started = true;
    this.currentState = initialState;
    this._runEntry(initialState, null, null);
    return this;
  }

  /**
   * 发送事件
   * @param {string} event - 事件名
   * @param {*} [payload] - 事件附带数据，会传给 guard / action / onEntry
   * @returns {string} 转移后的当前状态（便于测试）
   */
  send(event, payload) {
    if (!this.started) {
      throw new Error("状态机尚未启动，请先调用 start()");
    }

    // 查找从当前状态出发、匹配 event 的转移
    const candidate = this.transitions.find(
      (t) => t.from === this.currentState && t.event === event,
    );

    if (!candidate) {
      console.warn(
        `[FSM:${this.name}] 当前状态 "${this.currentState}" 不接受事件 "${event}"，忽略`,
      );
      return this.currentState;
    }

    // guard 检查
    if (
      typeof candidate.guard === "function" &&
      !candidate.guard(payload, this.currentState)
    ) {
      console.warn(
        `[FSM:${this.name}] 事件 "${event}" 的 guard 未通过，保持状态 "${this.currentState}"`,
      );
      return this.currentState;
    }

    const fromState = this.currentState;
    const toState = candidate.to;

    // 1. 执行旧状态 onExit
    this._runExit(fromState, event, payload);
    // 2. 更新当前状态
    this.currentState = toState;
    // 3. 执行转移 action
    if (typeof candidate.action === "function") {
      candidate.action(payload, fromState, toState);
    }
    // 4. 执行新状态 onEntry
    this._runEntry(toState, event, payload);

    return this.currentState;
  }

  /** 内部：执行状态 onEntry */
  _runEntry(state, event, payload) {
    const hooks = this.states.get(state);
    if (hooks && typeof hooks.onEntry === "function") {
      hooks.onEntry(event, payload, state);
    }
  }

  /** 内部：执行状态 onExit */
  _runExit(state, event, payload) {
    const hooks = this.states.get(state);
    if (hooks && typeof hooks.onExit === "function") {
      hooks.onExit(event, payload, state);
    }
  }

  /** 获取当前状态 */
  getCurrentState() {
    return this.currentState;
  }

  /** 是否处于某状态 */
  is(state) {
    return this.currentState === state;
  }
}

// ============================================================
// 测试用例：旋转门（Turnstile）FSM
// 经典 FSM 示例：
//   状态：locked（锁定） / unlocked（解锁）
//   事件：coin（投币） / push（推门）
//   转移：
//     locked   + coin  -> unlocked （开门）
//     locked   + push  -> locked   （推不开，报警）
//     unlocked + coin  -> unlocked （重复投币无效果）
//     unlocked + push  -> locked   （推门通过后再次锁定）
// ============================================================
console.log("===== 954. 手写有限状态机（FSM）=====");

const turnstile = new FiniteStateMachine("turnstile");

turnstile
  .addState("locked", {
    onEntry: () => console.log("  [进入 locked] 门已锁定"),
    onExit: () => console.log("  [离开 locked] 锁打开"),
  })
  .addState("unlocked", {
    onEntry: () => console.log("  [进入 unlocked] 门已解锁，请通过"),
    onExit: () => console.log("  [离开 unlocked] 门将通过后自动锁定"),
  })
  .addTransition("locked", "coin", "unlocked", {
    action: () => console.log("  [action] 收到投币，开门"),
  })
  .addTransition("locked", "push", "locked", {
    action: () => console.log("  [action] 推门失败，发出报警声"),
  })
  .addTransition("unlocked", "coin", "unlocked", {
    action: () => console.log("  [action] 已解锁，再投币无效（退还）"),
  })
  .addTransition("unlocked", "push", "locked", {
    action: () => console.log("  [action] 通过！门关闭"),
  });

console.log("\n--- 启动状态机（初始 locked）---");
turnstile.start("locked");

console.log("\n--- push（推不开）---");
turnstile.send("push");

console.log("\n--- coin（投币）---");
turnstile.send("coin");
console.log("当前状态:", turnstile.getCurrentState());

console.log("\n--- 再 coin（已解锁，应保持 unlocked）---");
turnstile.send("coin");

console.log("\n--- push（通过后锁定）---");
turnstile.send("push");
console.log("当前状态:", turnstile.getCurrentState());

// ============================================================
// 测试用例 2：带 guard 的简单订单 FSM
// ============================================================
console.log("\n--- 订单 FSM（带 guard）---");
const order = new FiniteStateMachine("order");

order
  .addState("pending")
  .addState("paid")
  .addState("cancelled")
  .addTransition("pending", "pay", "paid", {
    guard: (payload) => {
      const ok = payload && payload.amount > 0;
      console.log(
        `  [guard] 支付金额需 > 0，当前: ${payload?.amount ?? 0} -> ${ok}`,
      );
      return ok;
    },
    action: (payload) =>
      console.log(`  [action] 支付成功，金额 ${payload.amount}`),
  })
  .addTransition("pending", "cancel", "cancelled")
  .addTransition("paid", "refund", "cancelled");

order.start("pending");
console.log("状态:", order.getCurrentState());

console.log("\n尝试支付 -100（应被 guard 拦截）：");
order.send("pay", { amount: -100 });
console.log("状态:", order.getCurrentState());

console.log("\n支付 200：");
order.send("pay", { amount: 200 });
console.log("状态:", order.getCurrentState());

console.log("\n退款：");
order.send("refund");
console.log("状态:", order.getCurrentState());

console.log("\npaid 状态下尝试 pay（应被忽略，无此转移）：");
order.start("pending");
order.send("pay", { amount: 100 });
order.send("pay", { amount: 50 }); // 此时应处于 paid，无 pay 转移
