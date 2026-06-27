/**
 * 手写简易低代码引擎 (Minimal Low-Code Engine)
 * ============================================
 *
 * 概念说明:
 * 低代码引擎 (Low-Code Engine) 通过 JSON Schema 描述 UI 结构, 由渲染器 (renderer)
 * 把 schema 转换为实际可交互的界面. 配合属性系统 (绑定 / 表达式) 与事件系统,
 * 让非开发者也能通过配置搭建应用. 阿里 lowcode-engine 是典型实现.
 *
 * 核心组成:
 * 1. 组件 Schema (Component Schema):
 *    { type, props, children, events }
 *    - type:    组件类型 (Container / Text / Button / Input ...)
 *    - props:   属性 (可为静态值, 也可为表达式绑定字符串 "{{expr}}")
 *    - children: 子节点 (数组, 或字符串文本)
 *    - events:  事件配置 { onClick: { action, params } }
 *
 * 2. 渲染器 (Renderer):
 *    遍历 schema 树, 解析属性绑定, 调用组件实现生成输出.
 *    本实现输出 HTML 字串 (真实环境可输出 React/Vue 虚拟 DOM).
 *
 * 3. 属性系统 (Property System):
 *    - 绑定 (binding): props 中的 "{{state.field}}" 从上下文 state 取值
 *    - 表达式 (expression): "{{count > 5 ? '多' : '少'}}" 求值
 *    - 双向绑定: Input 的 value 绑定到 state, change 事件回写 state
 *
 * 4. 事件系统 (Event System):
 *    事件触发时执行 action (内置: setState / navigate / alert / custom)
 *    action 可引用 state, 也可调用 methods
 *
 * 5. 状态管理 (State):
 *    引擎维护一个 state 对象, 组件可读可写, 修改后触发重新渲染
 *
 * 本实现要点:
 * - LowCodeEngine 类: 注册组件, 管理 state, render -> HTML, handleEvent
 * - 组件以 render(ctx, props, children) -> html 形式实现
 * - 表达式求值用 new Function (受限上下文, 仅演示)
 */

"use strict";

// ------------------------------------------------------------
// 表达式解析与求值
// ------------------------------------------------------------

/**
 * 判断字符串是否为绑定表达式 "{{ ... }}"
 */
function isExpression(value) {
  return (
    typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")
  );
}

/**
 * 提取表达式内容
 */
function extractExpression(value) {
  return value.slice(2, -2).trim();
}

/**
 * 在上下文中求值表达式
 * @param {string} expr
 * @param {object} ctx - 上下文 { state, methods, ... }
 * @returns {*}
 */
function evalExpression(expr, ctx) {
  try {
    // 把上下文的所有键展开为独立变量 (state / methods / event 等),
    // 这样表达式中可直接写 state.title / event.value 等
    const keys = Object.keys(ctx);
    const values = keys.map((k) => ctx[k]);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return (${expr});`);
    return fn(...values);
  } catch (e) {
    console.warn(`[Engine] 表达式求值失败: "${expr}" -> ${e.message}`);
    return undefined;
  }
}

/**
 * 解析属性值: 若是绑定表达式则求值, 否则原样返回
 * - 纯表达式 {{...}}: 返回原始值 (可能是 number/object)
 * - 混合模板 "...{{a}}...{{b}}...": 返回插值后的字符串
 */
function resolveProp(value, ctx) {
  if (typeof value === "string" && value.includes("{{")) {
    if (isPureExpression(value)) {
      return evalExpression(extractExpression(value), ctx);
    }
    return interpolate(value, ctx);
  }
  return value;
}

/**
 * 判断字符串是否为 "纯表达式": 整串只有一个 {{...}} (无中间插值)
 */
function isPureExpression(value) {
  return /^{{[\s\S]*}}$/.test(value) && value.indexOf("{{", 2) === -1;
}

/**
 * 模板插值: 把字符串中所有 {{...}} 替换为求值结果, 返回字符串
 */
function interpolate(template, ctx) {
  return template.replace(/\{\{([\s\S]*?)\}\}/g, (match, expr) => {
    const val = evalExpression(expr.trim(), ctx);
    return val == null ? "" : String(val);
  });
}

/**
 * 递归解析 props 中所有绑定
 */
function resolveProps(props, ctx) {
  if (!props || typeof props !== "object") return props;
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && v.includes("{{")) {
      out[k] = resolveProp(v, ctx);
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) => resolveProps(item, ctx));
    } else if (v && typeof v === "object") {
      out[k] = resolveProps(v, ctx);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ------------------------------------------------------------
// 内置组件
// ------------------------------------------------------------

/**
 * 组件实现: 接收 (ctx, resolvedProps, childrenHtml) 返回 HTML 字符串
 * childrenHtml 已是渲染好的子节点 HTML
 */

const builtinComponents = {
  /**
   * Container: 容器, 渲染为 div
   */
  Container: {
    name: "Container",
    render(ctx, props, childrenHtml) {
      const style = props.style ? ` style="${toStyle(props.style)}"` : "";
      const cls = props.className ? ` class="${props.className}"` : "";
      return `<div${cls}${style}>${childrenHtml}</div>`;
    },
  },

  /**
   * Text: 文本节点
   */
  Text: {
    name: "Text",
    render(ctx, props, childrenHtml) {
      const tag = props.tag || "span";
      const style = props.style ? ` style="${toStyle(props.style)}"` : "";
      // 文本内容: 优先 props.text, 否则 childrenHtml
      const content =
        props.text != null ? escapeHtml(String(props.text)) : childrenHtml;
      return `<${tag}${style}>${content}</${tag}>`;
    },
  },

  /**
   * Button: 按钮, 支持 onClick 事件
   * 用 data-event-id 标记事件, 引擎通过事件总线派发
   */
  Button: {
    name: "Button",
    render(ctx, props, childrenHtml) {
      const label =
        props.label != null ? escapeHtml(String(props.label)) : childrenHtml;
      const disabled = props.disabled ? " disabled" : "";
      const eventId = props.__eventId || "";
      const eventIdAttr = eventId ? ` data-event-id="${eventId}"` : "";
      return `<button${eventIdAttr}${disabled}>${label}</button>`;
    },
  },

  /**
   * Input: 输入框, 支持 value 双向绑定 (通过 change 事件)
   */
  Input: {
    name: "Input",
    render(ctx, props, childrenHtml) {
      const value =
        props.value != null
          ? ` value="${escapeAttr(String(props.value))}"`
          : "";
      const placeholder = props.placeholder
        ? ` placeholder="${escapeAttr(props.placeholder)}"`
        : "";
      const eventId = props.__eventId || "";
      const eventIdAttr = eventId ? ` data-event-id="${eventId}"` : "";
      return `<input type="text"${value}${placeholder}${eventIdAttr} />`;
    },
  },

  /**
   * Image: 图片
   */
  Image: {
    name: "Image",
    render(ctx, props) {
      const src = props.src ? ` src="${escapeAttr(props.src)}"` : "";
      const alt = props.alt ? ` alt="${escapeAttr(props.alt)}"` : "";
      const style = props.style ? ` style="${toStyle(props.style)}"` : "";
      return `<img${src}${alt}${style} />`;
    },
  },
};

// ------------------------------------------------------------
// 工具函数
// ------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

/** 把 style 对象转为内联样式字符串 */
function toStyle(styleObj) {
  if (typeof styleObj === "string") return styleObj;
  return Object.entries(styleObj)
    .map(([k, v]) => `${kebab(k)}:${v}`)
    .join(";");
}

function kebab(s) {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

// ------------------------------------------------------------
// 低代码引擎
// ------------------------------------------------------------

/**
 * 低代码引擎
 */
class LowCodeEngine {
  constructor() {
    /** @type {Map<string, object>} 已注册组件 */
    this.components = new Map(
      Object.entries(builtinComponents).map(([k, v]) => [k.toLowerCase(), v]),
    );
    /** 引擎状态 */
    this.state = {};
    /** 自定义方法 */
    this.methods = {};
    /** 事件处理器: eventId -> eventConfig */
    this.eventMap = new Map();
    /** 全局事件 id 计数器 */
    this._eventId = 0;
    /** 渲染监听器 */
    this.renderListeners = [];
  }

  /**
   * 注册自定义组件
   */
  registerComponent(name, impl) {
    this.components.set(name.toLowerCase(), impl);
  }

  /**
   * 注册自定义方法
   */
  registerMethod(name, fn) {
    this.methods[name] = fn;
  }

  /**
   * 设置初始 state
   */
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this._notifyRender();
  }

  /**
   * 更新部分 state
   */
  patchState(patch) {
    Object.assign(this.state, patch);
    this._notifyRender();
  }

  /**
   * 渲染 schema 为 HTML 字符串
   * @param {object} schema
   * @returns {string}
   */
  render(schema) {
    this.eventMap.clear();
    this._eventId = 0;
    return this.renderNode(schema);
  }

  /**
   * 递归渲染单个节点
   */
  renderNode(node) {
    if (node == null) return "";
    // 字符串节点
    if (typeof node === "string") {
      if (node.includes("{{")) {
        // 字符串节点统一用插值 (输出为 HTML 文本)
        return escapeHtml(interpolate(node, this._ctx()));
      }
      return escapeHtml(node);
    }
    // 数组
    if (Array.isArray(node)) {
      return node.map((n) => this.renderNode(n)).join("");
    }

    const type = String(node.type).toLowerCase();
    const component = this.components.get(type);
    if (!component) {
      console.warn(`[Engine] 未知组件类型: ${node.type}`);
      return `<!-- 未知组件: ${node.type} -->`;
    }

    // 解析 props 绑定
    let resolvedProps = resolveProps(node.props || {}, this._ctx());

    // 处理事件: 给组件分配 eventId, 记录到 eventMap
    if (node.events) {
      const eventId = `evt-${++this._eventId}`;
      resolvedProps.__eventId = eventId;
      this.eventMap.set(eventId, node.events);
    }

    // 渲染子节点
    const childrenHtml = this.renderChildren(node.children);

    // 调用组件 render
    return component.render(this._ctx(), resolvedProps, childrenHtml);
  }

  renderChildren(children) {
    if (children == null) return "";
    if (Array.isArray(children))
      return children.map((c) => this.renderNode(c)).join("");
    return this.renderNode(children);
  }

  _ctx() {
    return { state: this.state, methods: this.methods };
  }

  /**
   * 派发事件
   * @param {string} eventId
   * @param {string} eventName - 如 'onClick'
   * @param {object} [payload] - 事件附加数据 (如 input 的 value)
   */
  handleEvent(eventId, eventName, payload = {}) {
    const events = this.eventMap.get(eventId);
    if (!events || !events[eventName]) {
      console.warn(`[Engine] 未找到事件: ${eventId}.${eventName}`);
      return;
    }
    const action = events[eventName];
    this.executeAction(action, payload);
  }

  /**
   * 执行一个 action
   * @param {object} action - { type, params }
   */
  executeAction(action, payload = {}) {
    // 把 payload (如 event) 注入上下文, 使参数绑定表达式可引用 event.value
    const actionCtx = { state: this.state, methods: this.methods, ...payload };
    const params = resolveProps(action.params || {}, actionCtx);
    const ctx = {
      ...payload,
      ...params,
      state: this.state,
      methods: this.methods,
    };

    switch (action.type) {
      case "setState":
        console.log(`[Engine] 执行 setState:`, params);
        this.patchState(params);
        break;
      case "callMethod": {
        const fn = this.methods[params.name];
        if (fn) {
          console.log(
            `[Engine] 调用方法 ${params.name}(${JSON.stringify(params.args || [])})`,
          );
          fn(...(params.args || []), ctx);
        }
        break;
      }
      case "alert":
        console.log(`[Engine] 弹窗: ${params.message}`);
        break;
      case "custom": {
        // 执行表达式
        if (params.expr) {
          evalExpression(params.expr, actionCtx);
        }
        break;
      }
      default:
        console.warn(`[Engine] 未知 action 类型: ${action.type}`);
    }
  }

  /**
   * 监听 state 变更导致的重渲染
   */
  onRender(fn) {
    this.renderListeners.push(fn);
  }

  _notifyRender() {
    for (const fn of this.renderListeners) fn(this.state);
  }
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 低代码引擎演示 ==========\n");

const engine = new LowCodeEngine();

// 1. 初始化 state
engine.setState({
  title: "我的低代码页面",
  count: 0,
  userName: "Alice",
  items: ["苹果", "香蕉", "橙子"],
});

// 注册一个自定义方法
engine.registerMethod("increment", function (step) {
  console.log("  [method] increment 被调用, step =", step);
  engine.patchState({ count: engine.state.count + (step || 1) });
});

engine.registerMethod("greet", function () {
  console.log("  [method] greet:", `Hello, ${engine.state.userName}!`);
});

// 2. 定义 schema
const schema = {
  type: "Container",
  props: {
    className: "page",
    style: { padding: "20px", fontFamily: "sans-serif" },
  },
  children: [
    {
      type: "Text",
      props: { tag: "h1", text: "{{state.title}}" },
    },
    {
      type: "Text",
      props: {
        tag: "p",
        text: '{{state.count > 5 ? "数量较多" : "数量较少"}} (当前: {{state.count}})',
      },
    },
    {
      type: "Container",
      props: { style: { display: "flex", gap: "8px" } },
      children: [
        {
          type: "Button",
          props: { label: "+1" },
          events: {
            onClick: {
              type: "callMethod",
              params: { name: "increment", args: [1] },
            },
          },
        },
        {
          type: "Button",
          props: { label: "+10" },
          events: {
            onClick: {
              type: "callMethod",
              params: { name: "increment", args: [10] },
            },
          },
        },
        {
          type: "Button",
          props: { label: "打招呼" },
          events: {
            onClick: { type: "callMethod", params: { name: "greet" } },
          },
        },
      ],
    },
    {
      type: "Container",
      props: { style: { marginTop: "12px" } },
      children: [
        { type: "Text", props: { tag: "label", text: "姓名: " } },
        {
          type: "Input",
          props: { value: "{{state.userName}}", placeholder: "请输入姓名" },
        },
      ],
    },
    {
      type: "Container",
      props: { style: { marginTop: "12px" } },
      children: [
        { type: "Text", props: { tag: "h3", text: "商品列表" } },
        {
          type: "Container",
          props: { style: { border: "1px solid #ccc" } },
          children:
            '{{state.items.map(function(item, i){ return i + ". " + item; }).join(", ")}}',
        },
      ],
    },
  ],
};

// 3. 首次渲染
console.log("--- 1. 首次渲染 schema ---");
let html = engine.render(schema);
console.log(html);
console.log("\n渲染后事件映射:");
for (const [eid, ev] of engine.eventMap) {
  console.log(`  ${eid}:`, JSON.stringify(ev));
}

// 4. 模拟点击按钮 (派发事件)
console.log('\n--- 2. 模拟点击 "+1" 按钮 ---');
// 找到第一个按钮的 eventId
const btn1Id = [...engine.eventMap.keys()][0];
engine.handleEvent(btn1Id, "onClick");

console.log('\n--- 3. 模拟点击 "+10" 按钮 ---');
const btn2Id = [...engine.eventMap.keys()][1];
engine.handleEvent(btn2Id, "onClick");

console.log('\n--- 4. 模拟点击 "打招呼" 按钮 ---');
const btn3Id = [...engine.eventMap.keys()][2];
engine.handleEvent(btn3Id, "onClick");

// 5. 重新渲染, 反映 state 变化
console.log("\n--- 5. state 变化后重新渲染 ---");
console.log("当前 state:", JSON.stringify(engine.state));
html = engine.render(schema);
// 只打印描述性文本来验证 state 已生效
const textLine = html.match(/<p[^>]*>([^<]*)<\/p>/);
console.log("描述段落:", textLine ? textLine[1] : "(未找到)");

// 6. 双向绑定: 模拟 Input change 事件回写 state
console.log("\n--- 6. 双向绑定 (Input change) ---");
// 为 Input 添加 onChange 事件 (setState userName)
// 演示用: 直接在 schema 上动态加事件并重新渲染
schema.children[3].children[1].events = {
  onChange: { type: "setState", params: { userName: "{{event.value}}" } },
};
engine.render(schema);
const inputEventId = [...engine.eventMap.keys()].find(
  (id) => engine.eventMap.get(id).onChange,
);
// 模拟用户输入 "Bob"
engine.handleEvent(inputEventId, "onChange", { event: { value: "Bob" } });
console.log("输入后 state.userName:", engine.state.userName);

// 7. 监听渲染
console.log("\n--- 7. 监听 state 变化自动重渲染 ---");
let renderCount = 0;
engine.onRender((state) => {
  renderCount++;
  console.log(
    `  [监听器] 检测到 state 变化, count=${state.count}, userName=${state.userName}`,
  );
});
engine.patchState({ count: 100 });
console.log("总渲染通知次数:", renderCount);

// 8. 注册自定义组件
console.log("\n--- 8. 注册自定义组件 (Card) ---");
engine.registerComponent("Card", {
  render(ctx, props, childrenHtml) {
    const title = props.title
      ? `<div class="card-title">${escapeHtml(props.title)}</div>`
      : "";
    return `<div class="card" style="border:1px solid #999;padding:8px;border-radius:4px">${title}<div class="card-body">${childrenHtml}</div></div>`;
  },
});

const cardSchema = {
  type: "Card",
  props: { title: "{{state.title}}" },
  children: [
    { type: "Text", props: { text: "这是卡片内容" } },
    { type: "Button", props: { label: "卡片内按钮" } },
  ],
};
console.log(engine.render(cardSchema));

console.log("\n[低代码引擎演示完成]");
