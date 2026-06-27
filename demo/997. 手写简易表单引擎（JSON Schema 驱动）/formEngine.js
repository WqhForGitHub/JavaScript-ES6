/**
 * 手写简易表单引擎（JSON Schema 驱动）
 * ---------------------------------------------------------------
 * 实现一个由 JSON Schema 驱动的表单引擎：
 * 1. 表单 schema：字段定义（type / label / 校验规则 / 依赖关系）
 * 2. 渲染：把 schema 转换为可渲染的字段配置对象
 * 3. 校验：required / min / max / minLength / maxLength / pattern / enum / custom
 * 4. 条件字段：根据其它字段值决定显示/隐藏（dependencies + showWhen）
 * 5. 字段联动：某字段值变化时触发其它字段校验
 *
 * 演示：渲染并校验一个注册表单。
 */

"use strict";

// ============================================================================
// 1. 内置类型与默认值
// ============================================================================

/**
 * 支持的字段类型及其默认值
 */
const TYPE_DEFAULTS = {
  string: "",
  number: 0,
  boolean: false,
  date: "",
  email: "",
  select: "",
  multiselect: [],
  textarea: "",
  password: "",
};

// ============================================================================
// 2. 内置校验器
// ============================================================================

/**
 * Validators：内置校验器集合
 * 每个校验器签名：(value, rule, allValues, field) => string | null
 * 返回错误信息字符串，或 null 表示通过
 */
const builtinValidators = {
  required(value, rule, allValues, field) {
    if (rule === false) return null;
    if (value === undefined || value === null) return `${field.label}为必填项`;
    if (typeof value === "string" && value.trim() === "")
      return `${field.label}为必填项`;
    if (Array.isArray(value) && value.length === 0)
      return `${field.label}为必填项`;
    return null;
  },

  min(value, rule) {
    if (value === "" || value === null || value === undefined) return null;
    if (typeof value === "number" && value < rule) return `不能小于 ${rule}`;
    return null;
  },

  max(value, rule) {
    if (value === "" || value === null || value === undefined) return null;
    if (typeof value === "number" && value > rule) return `不能大于 ${rule}`;
    return null;
  },

  minLength(value, rule) {
    if (!value || typeof value !== "string") return null;
    if (value.length < rule) return `至少需要 ${rule} 个字符`;
    return null;
  },

  maxLength(value, rule) {
    if (!value || typeof value !== "string") return null;
    if (value.length > rule) return `不能超过 ${rule} 个字符`;
    return null;
  },

  pattern(value, rule) {
    if (!value || typeof value !== "string") return null;
    const regex = rule instanceof RegExp ? rule : new RegExp(rule);
    if (!regex.test(value)) return `格式不正确`;
    return null;
  },

  enum(value, rule) {
    if (value === "" || value === null || value === undefined) return null;
    if (!rule.includes(value)) return `必须是以下值之一: ${rule.join(", ")}`;
    return null;
  },

  email(value) {
    if (!value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return `邮箱格式不正确`;
    return null;
  },
};

// ============================================================================
// 3. 表单引擎核心
// ============================================================================

/**
 * FormEngine：表单引擎
 * 负责：渲染 schema、维护表单数据、执行校验、处理字段联动
 */
class FormEngine {
  /**
   * @param {Object} schema 表单 schema
   * @param {Object} options
   * @param {Object} options.validators 自定义校验器（合并到内置之上）
   */
  constructor(schema, options = {}) {
    this.schema = schema;
    this.validators = { ...builtinValidators, ...(options.validators || {}) };
    // 字段定义索引
    this.fields = new Map();
    for (const field of schema.fields || []) {
      this.fields.set(field.name, field);
    }
    // 表单数据
    this.values = this._initValues();
    // 错误信息：fieldName -> error string
    this.errors = {};
    // 字段可见性：fieldName -> boolean
    this.visibility = {};
    this._initVisibility();
  }

  /** 初始化表单数据：使用 schema 默认值或类型默认值 */
  _initValues() {
    const values = {};
    for (const field of this.schema.fields || []) {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      } else {
        values[field.name] = TYPE_DEFAULTS[field.type] ?? "";
      }
    }
    return values;
  }

  /** 初始化可见性：默认全部可见，再根据 dependencies 计算 */
  _initVisibility() {
    for (const field of this.schema.fields || []) {
      this.visibility[field.name] = true;
    }
    this._updateVisibility();
  }

  /**
   * 根据字段依赖更新可见性
   * 字段定义中可通过 showWhen 指定显示条件：
   *   showWhen: { field: 'age', op: '>=', value: 18 }
   *   showWhen: { field: 'country', op: '==', value: 'CN' }
   *   showWhen: (values) => boolean   // 函数形式
   */
  _updateVisibility() {
    for (const field of this.schema.fields || []) {
      if (!field.showWhen) {
        this.visibility[field.name] = true;
        continue;
      }
      this.visibility[field.name] = this._evaluateCondition(
        field.showWhen,
        this.values,
      );
    }
  }

  /** 求值一个条件 */
  _evaluateCondition(condition, values) {
    if (typeof condition === "function") {
      try {
        return !!condition(values);
      } catch {
        return false;
      }
    }
    if (typeof condition === "object") {
      const { field, op, value } = condition;
      const actual = values[field];
      switch (op) {
        case "==":
          return actual == value; // eslint-disable-line eqeqeq
        case "!=":
          return actual != value; // eslint-disable-line eqeqeq
        case ">":
          return actual > value;
        case ">=":
          return actual >= value;
        case "<":
          return actual < value;
        case "<=":
          return actual <= value;
        case "in":
          return Array.isArray(value) && value.includes(actual);
        case "notIn":
          return Array.isArray(value) && !value.includes(actual);
        default:
          return false;
      }
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // 渲染
  // --------------------------------------------------------------------------

  /**
   * 渲染表单：把 schema 转换为可渲染的字段配置数组
   * 输出每个字段的：name / label / type / value / error / visible / options / props
   */
  render() {
    return (this.schema.fields || []).map((field) => {
      const visible = this.visibility[field.name];
      return {
        name: field.name,
        label: field.label,
        type: field.type,
        value: this.values[field.name],
        error: this.errors[field.name] || null,
        visible,
        required: !!field.rules?.required,
        placeholder: field.placeholder || "",
        options: field.options || null,
        props: field.props || {},
        description: field.description || "",
      };
    });
  }

  /** 渲染为可读字符串（ASCII 预览） */
  renderAscii() {
    const rendered = this.render();
    const lines = [];
    lines.push(`=== 表单: ${this.schema.title || "未命名"} ===`);
    for (const f of rendered) {
      if (!f.visible) continue;
      const req = f.required ? " *" : " ";
      const val = Array.isArray(f.value) ? f.value.join(", ") : f.value;
      const err = f.error ? `   [错误: ${f.error}]` : "";
      lines.push(`${f.label}${req}: ${val}${err}`);
    }
    return lines.join("\n");
  }

  // --------------------------------------------------------------------------
  // 数据操作
  // --------------------------------------------------------------------------

  /**
   * 设置某个字段的值
   * @param {string} name 字段名
   * @param {*} value 值
   * @param {boolean} validate 是否立即校验该字段
   */
  setValue(name, value, validate = true) {
    if (!this.fields.has(name)) return;
    this.values[name] = value;
    // 字段联动：值变化后重新计算可见性
    this._updateVisibility();
    // 隐藏的字段清空错误
    for (const fname of Object.keys(this.errors)) {
      if (!this.visibility[fname]) delete this.errors[fname];
    }
    if (validate) this.validateField(name);
    // 触发依赖此字段的其他字段重新校验
    this._validateDependents(name);
  }

  /** 批量设置值 */
  setValues(values, validate = true) {
    for (const [k, v] of Object.entries(values)) {
      if (this.fields.has(k)) this.values[k] = v;
    }
    this._updateVisibility();
    if (validate) this.validate();
  }

  /** 获取全部值 */
  getValues() {
    // 隐藏字段不返回
    const result = {};
    for (const name of this.fields.keys()) {
      if (this.visibility[name]) result[name] = this.values[name];
    }
    return result;
  }

  /** 获取错误 */
  getErrors() {
    return { ...this.errors };
  }

  // --------------------------------------------------------------------------
  // 校验
  // --------------------------------------------------------------------------

  /**
   * 校验单个字段
   */
  validateField(name) {
    const field = this.fields.get(name);
    if (!field) return true;
    // 不可见字段不校验
    if (!this.visibility[name]) {
      delete this.errors[name];
      return true;
    }
    const value = this.values[name];
    const rules = field.rules || {};
    for (const ruleName of Object.keys(rules)) {
      // custom 是特殊规则：函数
      if (ruleName === "custom") {
        const customFn = rules.custom;
        if (typeof customFn === "function") {
          const err = customFn(value, this.values, field);
          if (err) {
            this.errors[name] = err;
            return false;
          }
        }
        continue;
      }
      const validator = this.validators[ruleName];
      if (!validator) continue;
      const err = validator(value, rules[ruleName], this.values, field);
      if (err) {
        this.errors[name] = err;
        return false;
      }
    }
    delete this.errors[name];
    return true;
  }

  /**
   * 重新校验依赖某字段的其他字段
   * 当 A 的值变化可能影响 B 的可见性/校验时调用
   */
  _validateDependents(changedName) {
    for (const field of this.fields.values()) {
      if (field.name === changedName) continue;
      // 检查 showWhen 是否引用了 changedName
      const cond = field.showWhen;
      let depends = false;
      if (typeof cond === "object" && cond && cond.field === changedName)
        depends = true;
      else if (typeof cond === "function") depends = true; // 保守起见函数都视为可能依赖
      if (depends && this.visibility[field.name]) {
        this.validateField(field.name);
      }
    }
  }

  /**
   * 校验整个表单
   * @returns {boolean} 是否全部通过
   */
  validate() {
    this._updateVisibility();
    let allValid = true;
    for (const name of this.fields.keys()) {
      const ok = this.validateField(name);
      if (!ok) allValid = false;
    }
    return allValid;
  }

  /** 是否有错误 */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

// ============================================================================
// 4. Schema 构建器（可选的链式 API）
// ============================================================================

/**
 * FormSchemaBuilder：方便地构建 schema
 */
class FormSchemaBuilder {
  constructor() {
    this.schema = { title: "", fields: [] };
  }

  title(t) {
    this.schema.title = t;
    return this;
  }

  field(field) {
    this.schema.fields.push(field);
    return this;
  }

  build() {
    return this.schema;
  }
}

// ============================================================================
// 5. 测试用例：注册表单
// ============================================================================

function runTests() {
  console.log("================ 1. 定义注册表单 schema ================");
  const schema = {
    title: "用户注册",
    fields: [
      {
        name: "username",
        label: "用户名",
        type: "string",
        rules: { required: true, minLength: 3, maxLength: 20 },
        description: "3-20 个字符",
      },
      {
        name: "email",
        label: "邮箱",
        type: "email",
        rules: { required: true, email: true },
      },
      {
        name: "password",
        label: "密码",
        type: "password",
        rules: {
          required: true,
          minLength: 8,
          pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
          custom: (v) =>
            v && v.toLowerCase().includes("password")
              ? "密码不能包含 password"
              : null,
        },
        description: "至少 8 位，包含字母和数字",
      },
      {
        name: "confirmPassword",
        label: "确认密码",
        type: "password",
        rules: {
          required: true,
          custom: (v, all) => (v !== all.password ? "两次密码不一致" : null),
        },
      },
      {
        name: "age",
        label: "年龄",
        type: "number",
        rules: { required: true, min: 0, max: 150 },
      },
      {
        name: "country",
        label: "国家",
        type: "select",
        options: [
          { label: "中国", value: "CN" },
          { label: "美国", value: "US" },
          { label: "其他", value: "OTHER" },
        ],
        rules: { required: true },
      },
      {
        name: "province",
        label: "省份",
        type: "string",
        // 仅当国家为中国时显示
        showWhen: { field: "country", op: "==", value: "CN" },
        rules: { required: true },
      },
      {
        name: "isAdult",
        label: "是否成年",
        type: "boolean",
        rules: { required: true },
      },
      {
        name: "guardianName",
        label: "监护人姓名",
        type: "string",
        // 仅当未成年时显示
        showWhen: { field: "isAdult", op: "==", value: false },
        rules: { required: true },
      },
      {
        name: "subscribe",
        label: "订阅 newsletter",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "interests",
        label: "兴趣爱好",
        type: "multiselect",
        options: [
          { label: "编程", value: "coding" },
          { label: "音乐", value: "music" },
          { label: "运动", value: "sports" },
        ],
        // 仅当订阅时显示
        showWhen: { field: "subscribe", op: "==", value: true },
      },
    ],
  };

  console.log("================ 2. 渲染初始表单 ================");
  const engine = new FormEngine(schema);
  console.log(engine.renderAscii());
  console.log("\n字段可见性:", engine.visibility);

  console.log(
    "\n================ 3. 校验空表单（应全部失败） ================",
  );
  const valid1 = engine.validate();
  console.log("校验结果:", valid1 ? "通过" : "失败");
  console.log("错误:", engine.getErrors());

  console.log("\n================ 4. 填写合法数据并校验 ================");
  engine.setValues({
    username: "alice_dev",
    email: "alice@example.com",
    password: "Secret123",
    confirmPassword: "Secret123",
    age: 25,
    country: "CN",
    province: "广东",
    isAdult: true,
  });
  const valid2 = engine.validate();
  console.log("校验结果:", valid2 ? "通过" : "失败");
  console.log("错误:", engine.getErrors());
  console.log("\n渲染:");
  console.log(engine.renderAscii());

  console.log(
    "\n================ 5. 条件字段：选中国 -> 显示省份 ================",
  );
  engine.setValue("country", "US", false);
  console.log("省份可见性:", engine.visibility.province, "(应 false)");
  console.log("省份字段错误:", engine.errors.province || "无");
  engine.setValue("country", "CN", false);
  console.log("省份可见性:", engine.visibility.province, "(应 true)");

  console.log(
    "\n================ 6. 条件字段：未成年 -> 显示监护人 ================",
  );
  engine.setValue("isAdult", false);
  console.log("监护人姓名可见性:", engine.visibility.guardianName, "(应 true)");
  const valid3 = engine.validate();
  console.log("校验结果(监护人未填):", valid3 ? "通过" : "失败");
  console.log("错误:", engine.getErrors());
  engine.setValue("guardianName", "张父");
  console.log("填写监护人后校验:", engine.validate() ? "通过" : "失败");

  console.log(
    "\n================ 7. 条件字段：订阅 -> 显示兴趣 ================",
  );
  engine.setValue("subscribe", true);
  console.log("兴趣可见性:", engine.visibility.interests, "(应 true)");
  engine.setValue("interests", ["coding", "music"]);
  console.log("渲染:");
  console.log(engine.renderAscii());

  console.log("\n================ 8. 各种校验失败场景 ================");
  const e2 = new FormEngine(schema);
  e2.setValue("username", "ab"); // 太短
  e2.setValue("email", "not-an-email"); // 邮箱格式
  e2.setValue("password", "short"); // 太短
  e2.setValue("password", "password123"); // 包含 password
  e2.setValue("confirmPassword", "mismatch"); // 不一致
  e2.setValue("age", -5); // 太小
  e2.setValue("age", 200); // 太大
  e2.validate();
  console.log("错误集合:", e2.getErrors());

  console.log(
    "\n================ 9. getValues 只返回可见字段 ================",
  );
  const e3 = new FormEngine(schema);
  e3.setValues({
    username: "bob",
    country: "US",
    isAdult: true,
    subscribe: false,
  });
  e3.validate();
  console.log("返回值:", e3.getValues());
  console.log("(province / guardianName / interests 不可见，应被排除)");

  console.log(
    "\n================ 10. 使用 Schema Builder 构建 ================",
  );
  const builtSchema = new FormSchemaBuilder()
    .title("联系反馈")
    .field({
      name: "name",
      label: "姓名",
      type: "string",
      rules: { required: true },
    })
    .field({
      name: "message",
      label: "留言",
      type: "textarea",
      rules: { required: true, minLength: 10 },
    })
    .field({
      name: "rating",
      label: "评分",
      type: "number",
      rules: { required: true, min: 1, max: 5 },
    })
    .build();
  const e4 = new FormEngine(builtSchema);
  console.log(e4.renderAscii());
  e4.setValue("name", "Tom");
  e4.setValue("message", "太短");
  console.log("校验:", e4.validate() ? "通过" : "失败");
  console.log("错误:", e4.getErrors());
}

runTests();
