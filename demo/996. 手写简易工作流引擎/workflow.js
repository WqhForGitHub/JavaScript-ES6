/**
 * 手写简易工作流引擎
 * ---------------------------------------------------------------
 * 实现一个基于有向图的工作流引擎：
 * 1. 工作流定义：节点（task）+ 边（transition）
 * 2. 节点类型：automatic（自动执行）、manual（人工审批）、conditional（条件分支）
 * 3. 工作流实例：跟踪当前状态、历史记录
 * 4. 并行分支：fork（一进多出）/ join（多进一出，等待所有分支到达）
 * 5. 转移条件：边可附带 condition 函数
 *
 * 演示：一个审批工作流（提交 -> 审核 -> 通过/驳回 -> 结束）
 *      以及带并行分支的示例。
 */

"use strict";

// ============================================================================
// 1. 节点定义
// ============================================================================

/**
 * 工作流节点
 * @property {string} id 节点唯一标识
 * @property {string} name 显示名称
 * @property {'start'|'end'|'automatic'|'manual'|'conditional'|'fork'|'join'} type 节点类型
 * @property {Function} handler 节点处理器，接收 context，返回结果
 */
class TaskNode {
  constructor({ id, name, type = "automatic", handler } = {}) {
    this.id = id;
    this.name = name || id;
    this.type = type;
    this.handler = handler || (() => ({}));
  }
}

/**
 * 工作流边（转移）
 * @property {string} from 源节点 id
 * @property {string} to 目标节点 id
 * @property {Function} condition 转移条件，接收 context，返回 boolean
 * @property {string} label 转移标签（如 'approve' / 'reject'）
 */
class Transition {
  constructor({ from, to, condition, label } = {}) {
    this.from = from;
    this.to = to;
    this.condition = condition || (() => true);
    this.label = label;
  }
}

// ============================================================================
// 2. 工作流定义
// ============================================================================

/**
 * WorkflowDefinition：工作流定义（静态结构）
 */
class WorkflowDefinition {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.nodes = new Map(); // id -> TaskNode
    this.transitions = []; // Transition[]
  }

  /** 添加节点 */
  addNode(node) {
    this.nodes.set(node.id, node);
    return this;
  }

  /** 添加转移 */
  addTransition(transition) {
    this.transitions.push(transition);
    return this;
  }

  /** 获取从某节点出发的所有转移 */
  getOutgoing(nodeId) {
    return this.transitions.filter((t) => t.from === nodeId);
  }

  /** 获取节点 */
  getNode(id) {
    return this.nodes.get(id);
  }

  /** 获取起始节点 */
  getStartNode() {
    return [...this.nodes.values()].find((n) => n.type === "start");
  }

  /** 校验定义完整性 */
  validate() {
    const errors = [];
    const start = this.getStartNode();
    if (!start) errors.push("缺少 start 节点");
    if (![...this.nodes.values()].some((n) => n.type === "end")) {
      errors.push("缺少 end 节点");
    }
    // 检查转移引用的节点是否存在
    for (const t of this.transitions) {
      if (!this.nodes.has(t.from)) errors.push(`转移 from "${t.from}" 不存在`);
      if (!this.nodes.has(t.to)) errors.push(`转移 to "${t.to}" 不存在`);
    }
    return errors;
  }
}

// ============================================================================
// 3. 工作流实例
// ============================================================================

/**
 * 历史记录条目
 */
class HistoryEntry {
  constructor(nodeId, action, result, timestamp = Date.now()) {
    this.nodeId = nodeId;
    this.action = action; // 'enter' | 'execute' | 'complete' | 'leave' | 'wait' | 'reject'
    this.result = result; // 执行结果或备注
    this.timestamp = timestamp;
  }
}

/**
 * WorkflowInstance：一个正在运行的工作流实例
 * 跟踪：当前所处节点集合（支持并行）、上下文、历史
 */
class WorkflowInstance {
  /**
   * @param {string} instanceId
   * @param {WorkflowDefinition} definition
   * @param {Object} initialContext 初始上下文
   */
  constructor(instanceId, definition, initialContext = {}) {
    this.instanceId = instanceId;
    this.definition = definition;
    this.context = { ...initialContext };
    this.status = "running"; // running | waiting | completed | terminated
    this.currentNodes = new Set(); // 当前激活的节点 id 集合
    this.history = [];
    // join 节点等待计数：joinId -> 已到达的来源数
    this._joinArrivals = new Map();
  }

  /** 记录历史 */
  _log(nodeId, action, result = "") {
    this.history.push(new HistoryEntry(nodeId, action, result));
  }

  /** 获取当前状态摘要 */
  getStatus() {
    return {
      instanceId: this.instanceId,
      status: this.status,
      currentNodes: [...this.currentNodes],
      historyLength: this.history.length,
      context: this.context,
    };
  }
}

// ============================================================================
// 4. 工作流引擎
// ============================================================================

/**
 * WorkflowEngine：执行工作流定义，驱动实例流转
 */
class WorkflowEngine {
  constructor() {
    this.definitions = new Map(); // defId -> WorkflowDefinition
    this.instances = new Map(); // instanceId -> WorkflowInstance
    this._instanceCounter = 0;
  }

  /** 注册工作流定义 */
  registerDefinition(def) {
    const errors = def.validate();
    if (errors.length > 0) {
      throw new Error(`工作流定义校验失败: ${errors.join("; ")}`);
    }
    this.definitions.set(def.id, def);
    return def;
  }

  /**
   * 启动一个工作流实例
   * @param {string} defId 工作流定义 id
   * @param {Object} context 初始上下文
   */
  start(defId, context = {}) {
    const def = this.definitions.get(defId);
    if (!def) throw new Error(`工作流定义 ${defId} 不存在`);
    const start = def.getStartNode();
    if (!start) throw new Error("工作流没有起始节点");

    const instanceId = `${defId}-inst-${++this._instanceCounter}`;
    const instance = new WorkflowInstance(instanceId, def, context);
    this.instances.set(instanceId, instance);

    // 进入起始节点并执行
    instance.currentNodes.add(start.id);
    instance._log(start.id, "enter");
    this._processNode(instance, start.id);
    return instanceId;
  }

  /**
   * 处理一个节点：根据类型执行相应逻辑
   */
  _processNode(instance, nodeId) {
    const def = instance.definition;
    const node = def.getNode(nodeId);
    if (!node) return;

    switch (node.type) {
      case "start":
        instance._log(nodeId, "complete", "起始节点自动通过");
        instance.currentNodes.delete(nodeId);
        this._advance(instance, nodeId);
        break;
      case "automatic":
        this._executeAutomatic(instance, node);
        break;
      case "manual":
        this._waitManual(instance, node);
        break;
      case "conditional":
        this._executeConditional(instance, node);
        break;
      case "fork":
        this._executeFork(instance, node);
        break;
      case "join":
        this._executeJoin(instance, node);
        break;
      case "end":
        instance._log(nodeId, "complete", "工作流结束");
        instance.currentNodes.delete(nodeId);
        // 若没有其他激活节点，则标记完成
        if (instance.currentNodes.size === 0) {
          instance.status = "completed";
        }
        break;
    }
  }

  /** 自动节点：执行 handler 后流转（同步；handler 须为同步函数） */
  _executeAutomatic(instance, node) {
    instance._log(node.id, "execute");
    try {
      const result = node.handler(instance.context);
      // 合并结果到上下文
      if (result && typeof result === "object") {
        Object.assign(instance.context, result);
      }
      instance._log(node.id, "complete", JSON.stringify(result));
      instance.currentNodes.delete(node.id);
      this._advance(instance, node.id);
    } catch (err) {
      instance._log(node.id, "error", err.message);
      instance.status = "terminated";
    }
  }

  /** 人工节点：暂停等待外部 approve / reject */
  _waitManual(instance, node) {
    instance._log(node.id, "wait", "等待人工审批");
    instance.status = "waiting";
  }

  /** 条件节点：根据 handler 返回的 label 选择转移（同步） */
  _executeConditional(instance, node) {
    instance._log(node.id, "execute");
    const decision = node.handler(instance.context);
    instance._log(node.id, "complete", `决策: ${decision}`);
    instance.currentNodes.delete(node.id);
    // 选择 label 匹配的转移
    const outgoing = instance.definition.getOutgoing(node.id);
    const chosen = outgoing.find((t) => t.label === decision);
    if (chosen) {
      instance.currentNodes.add(chosen.to);
      instance._log(chosen.to, "enter");
      this._processNode(instance, chosen.to);
    } else {
      // 无匹配则走默认（无条件）转移
      this._advance(instance, node.id);
    }
  }

  /** fork：同时激活所有出边目标 */
  _executeFork(instance, node) {
    instance._log(node.id, "complete", "并行分支开启");
    const outgoing = instance.definition.getOutgoing(node.id);
    instance.currentNodes.delete(node.id);
    for (const t of outgoing) {
      instance.currentNodes.add(t.to);
      instance._log(t.to, "enter");
    }
    // 递归处理所有新激活节点
    for (const t of outgoing) {
      this._processNode(instance, t.to);
    }
  }

  /** join：等待所有入边来源都到达后合并 */
  _executeJoin(instance, node) {
    const incoming = instance.definition.transitions.filter(
      (t) => t.to === node.id,
    );
    const arrived = (instance._joinArrivals.get(node.id) || 0) + 1;
    instance._joinArrivals.set(node.id, arrived);
    instance._log(node.id, "wait", `join 到达 ${arrived}/${incoming.length}`);
    if (arrived >= incoming.length) {
      // 所有分支到达，合并：从 currentNodes 移除各来源，激活 join 出边
      instance._joinArrivals.delete(node.id);
      // 移除所有指向 join 的来源节点
      for (const t of incoming) {
        instance.currentNodes.delete(t.from);
      }
      instance.currentNodes.delete(node.id);
      instance._log(node.id, "complete", "join 合并完成");
      this._advance(instance, node.id);
    }
  }

  /** 推进：从某节点出发，选择所有满足条件的出边 */
  _advance(instance, fromNodeId) {
    const outgoing = instance.definition.getOutgoing(fromNodeId);
    if (outgoing.length === 0) {
      // 无出边，若当前没有激活节点，则结束
      if (instance.currentNodes.size === 0 && instance.status === "running") {
        instance.status = "completed";
      }
      return;
    }
    const eligible = outgoing.filter((t) => {
      try {
        return t.condition(instance.context);
      } catch {
        return false;
      }
    });
    if (eligible.length === 0) {
      instance._log(fromNodeId, "stuck", "无满足条件的出边");
      return;
    }
    for (const t of eligible) {
      if (!instance.currentNodes.has(t.to)) {
        instance.currentNodes.add(t.to);
        instance._log(t.to, "enter");
      }
      this._processNode(instance, t.to);
    }
  }

  /**
   * 对处于等待状态的人工节点执行审批动作
   * @param {string} instanceId
   * @param {string} action 'approve' | 'reject'
   * @param {Object} extra 额外上下文（如审批意见）
   */
  approve(instanceId, action, extra = {}) {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error("实例不存在");
    if (instance.status !== "waiting")
      throw new Error(`实例状态为 ${instance.status}，无法审批`);

    // 找到当前处于 waiting 的 manual 节点
    const manualNodeIds = [...instance.currentNodes].filter(
      (id) => instance.definition.getNode(id).type === "manual",
    );
    if (manualNodeIds.length === 0) throw new Error("没有待审批节点");

    Object.assign(instance.context, extra, { _lastAction: action });
    for (const nodeId of manualNodeIds) {
      instance._log(
        nodeId,
        action,
        action === "approve" ? "审批通过" : "审批驳回",
      );
      instance.currentNodes.delete(nodeId);
      instance.status = "running";
      // 优先走与 action 标签匹配的转移；这样 approve/reject 不会同时触发
      const outgoing = instance.definition.getOutgoing(nodeId);
      const labeled = outgoing.find((t) => t.label === action);
      if (labeled) {
        if (!instance.currentNodes.has(labeled.to)) {
          instance.currentNodes.add(labeled.to);
          instance._log(labeled.to, "enter");
        }
        this._processNode(instance, labeled.to);
      } else {
        // 无匹配标签：走默认（无条件）转移；若也没有则终止
        const hasDefault = outgoing.some((t) => !t.label);
        if (hasDefault) {
          this._advance(instance, nodeId);
        } else {
          instance.status = "terminated";
          instance._log(nodeId, "terminate", `无 ${action} 分支，终止`);
        }
      }
    }
  }

  /** 获取实例 */
  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  /** 打印实例历史 */
  printHistory(instanceId) {
    const inst = this.instances.get(instanceId);
    if (!inst) return;
    console.log(`\n--- 工作流实例 ${instanceId} 历史 ---`);
    inst.history.forEach((h, i) => {
      console.log(
        `  ${i + 1}. [${new Date(h.timestamp).toISOString().slice(11, 19)}] ${h.nodeId} -> ${h.action}: ${h.result}`,
      );
    });
    console.log(`最终状态: ${inst.status}`);
    console.log(`当前节点: [${[...inst.currentNodes].join(", ")}]`);
    console.log(`上下文:`, inst.context);
  }
}

// ============================================================================
// 5. 测试用例 1：审批工作流
// ============================================================================

function testApprovalWorkflow() {
  console.log(
    "================================================================",
  );
  console.log("测试 1：审批工作流（提交 -> 审核 -> 通过/驳回 -> 结束）");
  console.log(
    "================================================================",
  );

  const engine = new WorkflowEngine();

  const def = new WorkflowDefinition("leave-request", "请假审批流程");
  def.addNode(new TaskNode({ id: "start", name: "开始", type: "start" }));
  def.addNode(
    new TaskNode({
      id: "submit",
      name: "提交申请",
      type: "automatic",
      handler: (ctx) => {
        console.log(
          `  [自动] ${ctx.applicant} 提交了请假申请，天数: ${ctx.days}`,
        );
        return { submittedAt: Date.now() };
      },
    }),
  );
  def.addNode(
    new TaskNode({
      id: "managerReview",
      name: "经理审批",
      type: "manual",
    }),
  );
  def.addNode(
    new TaskNode({
      id: "notify",
      name: "通知申请人",
      type: "automatic",
      handler: (ctx) => {
        console.log(
          `  [自动] 通知 ${ctx.applicant}：申请已${ctx._lastAction === "approve" ? "通过" : "驳回"}`,
        );
        return { notifiedAt: Date.now() };
      },
    }),
  );
  def.addNode(new TaskNode({ id: "end", name: "结束", type: "end" }));

  def.addTransition(new Transition({ from: "start", to: "submit" }));
  def.addTransition(new Transition({ from: "submit", to: "managerReview" }));
  def.addTransition(
    new Transition({ from: "managerReview", to: "notify", label: "approve" }),
  );
  def.addTransition(
    new Transition({ from: "managerReview", to: "notify", label: "reject" }),
  );
  def.addTransition(new Transition({ from: "notify", to: "end" }));

  engine.registerDefinition(def);

  console.log("\n--- 场景 A：经理批准 ---");
  const instA = engine.start("leave-request", { applicant: "张三", days: 3 });
  console.log("启动后状态:", engine.getInstance(instA).getStatus().status);
  console.log("当前节点:", [...engine.getInstance(instA).currentNodes]);
  engine.approve(instA, "approve", { approver: "李经理", comment: "同意" });
  engine.printHistory(instA);

  console.log("\n--- 场景 B：经理驳回 ---");
  const instB = engine.start("leave-request", { applicant: "王五", days: 10 });
  engine.approve(instB, "reject", { approver: "李经理", comment: "天数过多" });
  engine.printHistory(instB);
}

// ============================================================================
// 6. 测试用例 2：条件分支
// ============================================================================

function testConditionalWorkflow() {
  console.log(
    "\n================================================================",
  );
  console.log("测试 2：条件分支（请假天数 <= 3 直批，否则需总监审批）");
  console.log(
    "================================================================",
  );

  const engine = new WorkflowEngine();

  const def = new WorkflowDefinition("conditional-leave", "条件审批流程");
  def.addNode(new TaskNode({ id: "start", name: "开始", type: "start" }));
  def.addNode(
    new TaskNode({
      id: "submit",
      name: "提交",
      type: "automatic",
      handler: (ctx) => {
        console.log(`  [自动] ${ctx.applicant} 申请 ${ctx.days} 天`);
        return {};
      },
    }),
  );
  def.addNode(
    new TaskNode({
      id: "route",
      name: "路由判断",
      type: "conditional",
      handler: (ctx) => (ctx.days <= 3 ? "direct" : "director"),
    }),
  );
  def.addNode(
    new TaskNode({
      id: "autoApprove",
      name: "自动批准",
      type: "automatic",
      handler: () => {
        console.log("  [自动] 短假自动批准");
        return { approvedBy: "system" };
      },
    }),
  );
  def.addNode(
    new TaskNode({ id: "directorReview", name: "总监审批", type: "manual" }),
  );
  def.addNode(new TaskNode({ id: "end", name: "结束", type: "end" }));

  def.addTransition(new Transition({ from: "start", to: "submit" }));
  def.addTransition(new Transition({ from: "submit", to: "route" }));
  def.addTransition(
    new Transition({ from: "route", to: "autoApprove", label: "direct" }),
  );
  def.addTransition(
    new Transition({ from: "route", to: "directorReview", label: "director" }),
  );
  def.addTransition(new Transition({ from: "autoApprove", to: "end" }));
  def.addTransition(
    new Transition({ from: "directorReview", to: "end", label: "approve" }),
  );

  engine.registerDefinition(def);

  console.log("\n--- 场景 A：2 天（自动批准） ---");
  const instA = engine.start("conditional-leave", {
    applicant: "赵六",
    days: 2,
  });
  console.log("最终状态:", engine.getInstance(instA).status);

  console.log("\n--- 场景 B：5 天（需总监审批） ---");
  const instB = engine.start("conditional-leave", {
    applicant: "钱七",
    days: 5,
  });
  console.log("提交后状态:", engine.getInstance(instB).status, "当前节点:", [
    ...engine.getInstance(instB).currentNodes,
  ]);
  engine.approve(instB, "approve", { approver: "孙总监" });
  console.log("审批后最终状态:", engine.getInstance(instB).status);
  engine.printHistory(instB);
}

// ============================================================================
// 7. 测试用例 3：并行分支（fork / join）
// ============================================================================

function testParallelWorkflow() {
  console.log(
    "\n================================================================",
  );
  console.log("测试 3：并行分支（fork -> 多个并行任务 -> join -> 结束）");
  console.log(
    "================================================================",
  );

  const engine = new WorkflowEngine();

  const def = new WorkflowDefinition("parallel-build", "并行构建流程");
  def.addNode(new TaskNode({ id: "start", name: "开始", type: "start" }));
  def.addNode(
    new TaskNode({
      id: "prepare",
      name: "准备",
      type: "automatic",
      handler: () => {
        console.log("  [自动] 准备构建环境");
        return { ready: true };
      },
    }),
  );
  def.addNode(new TaskNode({ id: "fork", name: "并行分支", type: "fork" }));
  def.addNode(
    new TaskNode({
      id: "buildWeb",
      name: "构建 Web",
      type: "automatic",
      handler: () => {
        console.log("  [自动] 构建 Web 包");
        return { webBuilt: true };
      },
    }),
  );
  def.addNode(
    new TaskNode({
      id: "buildMobile",
      name: "构建 Mobile",
      type: "automatic",
      handler: () => {
        console.log("  [自动] 构建 Mobile 包");
        return { mobileBuilt: true };
      },
    }),
  );
  def.addNode(
    new TaskNode({
      id: "runTests",
      name: "运行测试",
      type: "automatic",
      handler: () => {
        console.log("  [自动] 运行单元测试");
        return { testsPassed: true };
      },
    }),
  );
  def.addNode(new TaskNode({ id: "join", name: "汇总", type: "join" }));
  def.addNode(
    new TaskNode({
      id: "deploy",
      name: "部署",
      type: "automatic",
      handler: (ctx) => {
        console.log("  [自动] 部署，测试通过:", ctx.testsPassed);
        return { deployed: true };
      },
    }),
  );
  def.addNode(new TaskNode({ id: "end", name: "结束", type: "end" }));

  def.addTransition(new Transition({ from: "start", to: "prepare" }));
  def.addTransition(new Transition({ from: "prepare", to: "fork" }));
  def.addTransition(new Transition({ from: "fork", to: "buildWeb" }));
  def.addTransition(new Transition({ from: "fork", to: "buildMobile" }));
  def.addTransition(new Transition({ from: "fork", to: "runTests" }));
  def.addTransition(new Transition({ from: "buildWeb", to: "join" }));
  def.addTransition(new Transition({ from: "buildMobile", to: "join" }));
  def.addTransition(new Transition({ from: "runTests", to: "join" }));
  def.addTransition(new Transition({ from: "join", to: "deploy" }));
  def.addTransition(new Transition({ from: "deploy", to: "end" }));

  engine.registerDefinition(def);

  const inst = engine.start("parallel-build", { project: "my-app" });
  engine.printHistory(inst);
  console.log("\n最终上下文:", engine.getInstance(inst).context);
}

// ============================================================================
// 8. 运行所有测试
// ============================================================================

(async () => {
  testApprovalWorkflow();
  testConditionalWorkflow();
  testParallelWorkflow();
})();
