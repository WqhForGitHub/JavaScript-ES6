/**
 * 手写 XState 简易状态机
 * ======================
 * XState 是基于状态图（Statecharts）的库，最小可用版本支持：
 * 1. createMachine(config) 创建状态机
 * 2. 状态机有 initial 初始状态和 states 节点
 * 3. 每个状态有 on: { EVENT: targetState | { target, guard } }
 * 4. transition(currentState, event) 返回下一状态（无匹配则保持原状态）
 * 5. 支持 guard（条件守卫）：满足条件才转移
 *
 * 本实现是"扁平"状态机（不含层级嵌套，层级见 955），
 * 并提供 transition / canTransition / getInitialStates 等 API。
 */

/**
 * 创建状态机
 * @param {object} config - { id?, initial, states, context? }
 * @param {string} config.initial - 初始状态名
 * @param {object} config.states - 状态节点映射
 * @returns {object} machine 对象
 */
function createMachine(config) {
  const { initial, states, context = {} } = config;

  return {
    initial,
    states,
    context,

    /**
     * 获取初始状态
     * @returns {string}
     */
    getInitialState() {
      return initial;
    },

    /**
     * 状态转移：从 currentState 接收 event，返回下一状态
     * @param {string} currentState - 当前状态
     * @param {string} eventType - 事件类型
     * @param {object} [extState] - 外部上下文（用于 guard）
     * @returns {string} 下一状态；无转移则返回原状态
     */
    transition(currentState, eventType, extState = {}) {
      const stateNode = states[currentState];
      if (!stateNode || !stateNode.on) {
        return currentState; // 当前状态无定义或无 on 转移
      }
      const transitionConfig = stateNode.on[eventType];
      if (!transitionConfig) {
        return currentState; // 当前状态不接受此事件
      }

      // 支持两种形式：
      //   'EVENT': 'targetState'                           —— 简写
      //   'EVENT': { target: 'targetState', guard: fn }    —— 带守卫
      if (typeof transitionConfig === "string") {
        return transitionConfig;
      }

      const { target, guard } = transitionConfig;
      // 若有 guard，则需满足 guard 才转移
      if (typeof guard === "function") {
        if (!guard(extState, eventType)) {
          return currentState; // 守卫不通过，保持原状态
        }
      } else if (
        typeof guard === "string" &&
        typeof config.guards?.[guard] === "function"
      ) {
        if (!config.guards[guard](extState, eventType)) {
          return currentState;
        }
      }
      return target;
    },

    /**
     * 判断当前状态在给定事件下是否可转移
     * @param {string} currentState
     * @param {string} eventType
     * @param {object} [extState]
     * @returns {boolean}
     */
    canTransition(currentState, eventType, extState = {}) {
      return (
        this.transition(currentState, eventType, extState) !== currentState
      );
    },
  };
}

// ============================================================
// 测试用例 1：红绿灯状态机
// ============================================================
console.log("===== 953. 手写 XState 简易状态机 =====");

const trafficLight = createMachine({
  id: "trafficLight",
  initial: "green",
  states: {
    green: { on: { TIMER: "yellow" } },
    yellow: { on: { TIMER: "red" } },
    red: { on: { TIMER: "green" } },
  },
});

console.log("\n--- 红绿灯 ---");
let light = trafficLight.getInitialState();
console.log("初始:", light);
light = trafficLight.transition(light, "TIMER");
console.log("TIMER ->", light);
light = trafficLight.transition(light, "TIMER");
console.log("TIMER ->", light);
light = trafficLight.transition(light, "TIMER");
console.log("TIMER ->", light);
// 非法事件：保持原状态
light = trafficLight.transition(light, "UNKNOWN");
console.log("UNKNOWN ->", light);

// ============================================================
// 测试用例 2：开关 toggle 状态机
// ============================================================
const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } },
  },
});

console.log("\n--- 开关 toggle ---");
let tog = toggleMachine.getInitialState();
console.log("初始:", tog);
for (let i = 0; i < 4; i++) {
  tog = toggleMachine.transition(tog, "TOGGLE");
  console.log(`第 ${i + 1} 次 TOGGLE ->`, tog);
}

// ============================================================
// 测试用例 3：带 guard 的取款机
// 状态：idle -> authenticating -> { authenticated(可取款) / rejected(回到idle) }
// 取款事件需要余额 >= 金额才能转移到 dispensing
// ============================================================
const atmMachine = createMachine({
  id: "atm",
  initial: "idle",
  guards: {
    hasBalance: (ctx) => ctx.balance > 0,
  },
  states: {
    idle: {
      on: { INSERT_CARD: "authenticating" },
    },
    authenticating: {
      on: {
        VALID_PIN: "authenticated",
        INVALID_PIN: "rejected",
      },
    },
    authenticated: {
      on: {
        WITHDRAW: {
          target: "dispensing",
          guard: (ctx) => ctx.balance >= ctx.amount,
        },
        CANCEL: "idle",
      },
    },
    rejected: {
      on: { RETRY: "authenticating" },
    },
    dispensing: {
      on: { COMPLETE: "idle" },
    },
  },
});

console.log("\n--- 取款机（带 guard）---");
let atm = atmMachine.getInitialState();
console.log("初始:", atm);

atm = atmMachine.transition(atm, "INSERT_CARD");
console.log("INSERT_CARD ->", atm);

atm = atmMachine.transition(atm, "VALID_PIN");
console.log("VALID_PIN ->", atm);

// 余额不足，WITHDRAW 应被 guard 拦截，保持 authenticated
console.log("尝试取款 100，余额 50:");
atm = atmMachine.transition(atm, "WITHDRAW", { balance: 50, amount: 100 });
console.log("WITHDRAW (余额不足) ->", atm);

// 余额充足，转移成功
console.log("尝试取款 100，余额 200:");
atm = atmMachine.transition(atm, "WITHDRAW", { balance: 200, amount: 100 });
console.log("WITHDRAW (余额充足) ->", atm);

atm = atmMachine.transition(atm, "COMPLETE");
console.log("COMPLETE ->", atm);

// canTransition 测试
console.log("\n--- canTransition ---");
console.log(
  "idle 可否 INSERT_CARD:",
  atmMachine.canTransition("idle", "INSERT_CARD"),
);
console.log(
  "idle 可否 WITHDRAW:",
  atmMachine.canTransition("idle", "WITHDRAW"),
);
