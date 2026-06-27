/**
 * 手写状态图（Statechart / HSM）
 * ==============================
 * 状态图（Harel Statechart / Hierarchical State Machine, HSM）
 * 在扁平 FSM 基础上扩展：
 *   1. 状态可嵌套（parent / child）
 *   2. 父状态有 initial 子状态
 *   3. 子状态未处理的事件会向父状态冒泡（event propagation）
 *   4. 进入/退出复合状态时会按从外到内 / 从内到外顺序执行 entry/exit
 *   5. 同状态内的兄弟转移照常工作
 *
 * 本实现要点：
 *   - 用配置树描述 states，每个 state 含 initial、on、entry、exit
 *   - 维护"激活状态栈"（从根到叶节点的路径）
 *   - send(event) 时从叶到根查找第一个能处理事件的 on 转移
 *   - 转移时计算 exit 链（旧叶到 LCA 不含）和 entry 链（LCA 不含到新叶）
 *
 * 配置示例：
 *   {
 *     initial: 'loading',
 *     states: {
 *       loading: { on: { SUCCESS: 'success', ERROR: 'error' } },
 *       success: {
 *         initial: 'view',
 *         states: {
 *           view: { on: { EDIT: 'edit' } },
 *           edit: { on: { SAVE: 'view' } },
 *         }
 *       },
 *       error: { ... }
 *     }
 *   }
 */

class Statechart {
  /**
   * @param {object} config - 状态图配置
   * @param {object} [context] - 外部上下文（传给 entry/exit/action）
   */
  constructor(config, context = {}) {
    this.config = config;
    this.context = context;
    /** 当前激活状态路径（从根到叶） */
    this.activePath = [];
    /** 平铺的 state 节点：key -> { name, parent, path, initial, on, entry, exit } */
    this.stateMap = new Map();
    this._buildMap(config.states, "", null);
  }

  /**
   * 递归构建 stateMap，并为每个 state 计算"路径"（点号分隔）
   * @param {object} states - 当前层 states 配置
   * @param {string} prefix - 父级路径前缀
   * @param {string|null} parent - 父级完整路径
   */
  _buildMap(states, prefix, parent) {
    for (const name of Object.keys(states)) {
      const node = states[name];
      // 路径：父路径 + '.' + name；顶层无前缀
      const path = parent ? `${parent}.${name}` : name;
      const entry = {
        name,
        path,
        parent, // 父节点 path（顶层为 null）
        initial: node.initial || null, // 复合状态的初始子状态名
        on: node.on || {}, // 事件 -> { target, action?, guard? } | target 字符串
        entry: node.entry || null,
        exit: node.exit || null,
        children: {}, // 子状态名 -> path
      };
      this.stateMap.set(path, entry);
      if (parent) {
        this.stateMap.get(parent).children[name] = path;
      }
      // 递归处理子状态
      if (node.states) {
        this._buildMap(node.states, path, path);
      }
    }
  }

  /**
   * 启动状态图：进入初始状态（递归进入子状态直到叶子）
   */
  start() {
    this.activePath = [];
    this._enterComposite(this.config.initial);
    return this;
  }

  /**
   * 进入某个状态：若它有 initial 子状态，则继续向下进入
   * @param {string} path - 要进入的状态路径
   * @param {Array} [entryChain] - 累计的 entry 链（外 -> 内）
   */
  _enterComposite(targetPath, entryChain = []) {
    // 解析 targetPath：可能是相对路径（如 'edit'）或绝对路径（如 'success.view'）
    const resolved = this._resolvePath(targetPath);
    // 构造从根到该节点的链
    const chain = this._pathChain(resolved);
    for (const p of chain) {
      entryChain.push(p);
    }
    // 继续向下找到第一个叶子（如果目标本身是复合状态，则进入其 initial）
    let node = this.stateMap.get(resolved);
    while (node && node.initial) {
      const childPath = node.children[node.initial];
      entryChain.push(childPath);
      node = this.stateMap.get(childPath);
    }
    // 更新 activePath 为完整路径（到叶节点）
    this.activePath = entryChain.slice();
    // 按外 -> 内顺序执行 entry
    for (const p of entryChain) {
      this._runEntry(p);
    }
  }

  /**
   * 发送事件
   * @param {string} event
   * @param {*} [payload]
   * @returns {string[]} 新的 activePath
   */
  send(event, payload) {
    // 从叶到根查找能处理 event 的状态
    for (let i = this.activePath.length - 1; i >= 0; i--) {
      const currentPath = this.activePath[i];
      const stateNode = this.stateMap.get(currentPath);
      const transition = stateNode.on[event];
      if (!transition) continue;

      // 标准化转移配置
      const target =
        typeof transition === "string" ? transition : transition.target;
      const action = typeof transition === "object" ? transition.action : null;
      const guard = typeof transition === "object" ? transition.guard : null;

      // guard 检查
      if (typeof guard === "function" && !guard(payload, this.context)) {
        console.warn(`[HSM] 事件 "${event}" 的 guard 未通过，保持当前状态`);
        return this.activePath.slice();
      }

      // 计算退出/进入链
      const targetResolved = this._resolvePath(target, currentPath);
      const exitChain = this._computeExitChain(currentPath, targetResolved);
      const entryChain = this._computeEntryChain(currentPath, targetResolved);

      // 1. 从内到外执行 exit
      for (const p of exitChain) {
        this._runExit(p, event, payload);
      }
      // 2. 执行转移 action
      if (typeof action === "function") {
        action(payload, this.context);
      }
      // 3. 更新 activePath（保留未退出的祖先部分 + entryChain）
      // entryChain 已是从 LCA 之后到目标；需把 LCA 之上的祖先保留
      const lca = this._lca(currentPath, targetResolved);
      const ancestorChain = lca ? this._pathChain(lca) : [];
      this.activePath = ancestorChain.concat(entryChain);

      // 4. 若目标本身是复合状态，继续向下进入 initial
      let node = this.stateMap.get(targetResolved);
      const further = [];
      while (node && node.initial) {
        const childPath = node.children[node.initial];
        further.push(childPath);
        node = this.stateMap.get(childPath);
      }
      for (const p of further) {
        this.activePath.push(p);
      }
      // 执行 entryChain 的 entry（外 -> 内）
      for (const p of entryChain.concat(further)) {
        this._runEntry(p, event, payload);
      }

      return this.activePath.slice();
    }

    // 没有任何状态能处理
    console.warn(
      `[HSM] 当前状态链 ${JSON.stringify(this.activePath)} 不接受事件 "${event}"`,
    );
    return this.activePath.slice();
  }

  /** 执行状态 entry */
  _runEntry(path, event, payload) {
    const node = this.stateMap.get(path);
    if (node && typeof node.entry === "function") {
      node.entry(this.context, event, payload);
    }
  }

  /** 执行状态 exit */
  _runExit(path, event, payload) {
    const node = this.stateMap.get(path);
    if (node && typeof node.exit === "function") {
      node.exit(this.context, event, payload);
    }
  }

  /**
   * 解析 path（支持相对路径，如 'edit' 相对当前状态）
   * @param {string} target - 目标（可能是 'success' / 'view' / 'success.view'）
   * @param {string} [currentPath] - 当前状态路径（用于相对解析）
   */
  _resolvePath(target, currentPath) {
    // 绝对路径（包含点号或在根层）
    if (this.stateMap.has(target)) return target;
    // 尝试在 currentPath 的祖先链中查找
    if (currentPath) {
      const ancestors = this._pathChain(currentPath);
      // 从内到外尝试 target 作为子节点
      for (let i = ancestors.length - 1; i >= 0; i--) {
        const candidate = `${ancestors[i]}.${target}`;
        if (this.stateMap.has(candidate)) return candidate;
      }
    }
    // 兜底：直接当作根级名字
    if (this.stateMap.has(target)) return target;
    throw new Error(`无法解析目标状态: ${target}`);
  }

  /** 返回从根到某 path 的链（不含 path 自身则切片使用） */
  _pathChain(path) {
    const parts = path.split(".");
    const chain = [];
    for (let i = 1; i <= parts.length; i++) {
      chain.push(parts.slice(0, i).join("."));
    }
    return chain;
  }

  /**
   * 计算两个 path 的最近公共祖先（LCA）path
   * @returns {string|null}
   */
  _lca(a, b) {
    const pa = a.split(".");
    const pb = b.split(".");
    let i = 0;
    let lca = null;
    while (i < pa.length && i < pb.length && pa[i] === pb[i]) {
      lca = pa.slice(0, i + 1).join(".");
      i++;
    }
    return lca;
  }

  /**
   * 退出链：从 currentPath（叶）逐级向上到 LCA（不含 LCA）
   * @returns {string[]} 从内到外的顺序
   */
  _computeExitChain(currentPath, targetPath) {
    const lca = this._lca(currentPath, targetPath);
    const chain = this._pathChain(currentPath);
    // 从内到外，去掉 LCA 及其以上
    const exitChain = [];
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i] === lca) break;
      exitChain.push(chain[i]);
    }
    return exitChain;
  }

  /**
   * 进入链：从 LCA 之下到 targetPath（含）
   * @returns {string[]} 从外到内的顺序
   */
  _computeEntryChain(currentPath, targetPath) {
    const lca = this._lca(currentPath, targetPath);
    const targetChain = this._pathChain(targetPath);
    if (!lca) return targetChain; // 无公共祖先，全部进入
    const lcaDepth = lca.split(".").length;
    return targetChain.slice(lcaDepth); // 跳过 LCA 及其之上的祖先
  }

  /** 获取当前叶状态路径 */
  getCurrentState() {
    return this.activePath[this.activePath.length - 1] || null;
  }

  /** 获取完整激活路径 */
  getActivePath() {
    return this.activePath.slice();
  }
}

// ============================================================
// 测试用例：UI 加载状态层级状态图
// 结构：
//   loading
//   success (composite)
//     ├ view (default initial)
//     └ edit
//   error (composite)
//     ├ retrying (default initial)
//     └ fatal
// ============================================================
console.log("===== 955. 手写状态图（Statechart）=====");

const uiConfig = {
  initial: "loading",
  states: {
    loading: {
      entry: (ctx) => console.log("  [entry] loading: 开始请求数据"),
      exit: (ctx) => console.log("  [exit] loading: 请求结束"),
      on: {
        SUCCESS: {
          target: "success",
          action: (p) =>
            console.log(`  [action] 收到数据，共 ${p?.data?.length ?? 0} 条`),
        },
        ERROR: {
          target: "error",
          action: (p) =>
            console.log(`  [action] 请求失败: ${p?.message ?? ""}`),
        },
      },
    },
    success: {
      entry: (ctx) => console.log("  [entry] success: 进入成功状态（复合）"),
      exit: (ctx) => console.log("  [exit] success: 退出成功状态"),
      initial: "view",
      states: {
        view: {
          entry: () => console.log("  [entry] success.view: 显示只读视图"),
          exit: () => console.log("  [exit] success.view"),
          on: { EDIT: "edit" },
        },
        edit: {
          entry: () => console.log("  [entry] success.edit: 进入编辑模式"),
          exit: () => console.log("  [exit] success.edit"),
          on: {
            SAVE: {
              target: "view",
              action: () => console.log("  [action] 保存数据"),
            },
            CANCEL: "view",
          },
        },
      },
    },
    error: {
      entry: (ctx) => console.log("  [entry] error: 进入错误状态（复合）"),
      exit: (ctx) => console.log("  [exit] error"),
      initial: "retrying",
      states: {
        retrying: {
          entry: () => console.log("  [entry] error.retrying: 准备重试"),
          exit: () => console.log("  [exit] error.retrying"),
          on: {
            SUCCESS: "success", // 跨层级转移
            FAIL: "fatal",
          },
        },
        fatal: {
          entry: () =>
            console.log("  [entry] error.fatal: 无法恢复，请联系管理员"),
          on: { RESET: "loading" },
        },
      },
    },
  },
};

const hsm = new Statechart(uiConfig, {});
hsm.start();
console.log("当前叶状态:", hsm.getCurrentState());
console.log("激活路径:", hsm.getActivePath());

console.log("\n--- 触发 SUCCESS（loading -> success.view，子状态自动进入）---");
hsm.send("SUCCESS", { data: [1, 2, 3] });
console.log("当前叶状态:", hsm.getCurrentState());

console.log("\n--- 触发 EDIT（success.view -> success.edit）---");
hsm.send("EDIT");
console.log("当前叶状态:", hsm.getCurrentState());

console.log("\n--- 触发 SAVE（success.edit -> success.view）---");
hsm.send("SAVE");
console.log("当前叶状态:", hsm.getCurrentState());

console.log("\n--- 重新回到 loading，然后走 error 分支 ---");
// 模拟重新开始
const hsm2 = new Statechart(uiConfig, {});
hsm2.start();
console.log("\n--- 触发 ERROR（loading -> error.retrying）---");
hsm2.send("ERROR", { message: "网络超时" });
console.log("当前叶状态:", hsm2.getCurrentState());

console.log("\n--- 触发 FAIL（error.retrying -> error.fatal）---");
hsm2.send("FAIL");
console.log("当前叶状态:", hsm2.getCurrentState());

console.log("\n--- 触发 RESET（error.fatal -> loading，跨复合状态退出）---");
hsm2.send("RESET");
console.log("当前叶状态:", hsm2.getCurrentState());

console.log("\n--- 事件冒泡测试：在子状态发送未定义事件，应被父状态处理 ---");
// 让我们再演示一次事件冒泡：在 success.edit 内发送一个只有 success 复合状态定义的事件
const uiConfig2 = {
  initial: "loading",
  states: {
    loading: { on: { GO: "success" } },
    success: {
      initial: "view",
      // 父级定义 LOGOUT，子状态未定义时应冒泡到父级处理
      on: { LOGOUT: "loading" },
      states: {
        view: { on: { EDIT: "edit" } },
        edit: { on: { SAVE: "view" } },
      },
    },
  },
};
console.log("--- 事件冒泡 ---");
const hsm3 = new Statechart(uiConfig2, {});
hsm3.start();
hsm3.send("GO");
console.log("当前叶状态:", hsm3.getCurrentState());
hsm3.send("EDIT");
console.log("当前叶状态:", hsm3.getCurrentState(), "（应在 success.edit）");
// 在 success.edit 内发送 LOGOUT：edit 未处理，应冒泡到 success 处理 -> loading
hsm3.send("LOGOUT");
console.log("当前叶状态:", hsm3.getCurrentState(), "（应回到 loading）");
