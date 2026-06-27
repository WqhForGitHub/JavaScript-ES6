/**
 * 手写简易国际化（i18n）方案
 * ---------------------------------------------------------------
 * 实现：
 * 1. 多语言字典（按 locale 组织）
 * 2. t(key, params) 翻译，支持 {name} 插值
 * 3. 复数规则（one / few / many，按斯拉夫语系式规则简化）
 * 4. locale 切换 + 响应式（订阅者收到通知）
 * 5. fallback locale（缺失翻译时回退）
 * 6. 嵌套 key（a.b.c）
 * 7. 日期 / 数字格式化（按 locale）
 *
 * 演示：中英文翻译切换。
 */

"use strict";

// ============================================================================
// 1. 复数规则
// ============================================================================

/**
 * 简化版复数规则选择器
 * English：one (===1) / other
 * 中文：不区分，统一 other
 * 俄语等斯拉夫语系：one / few / many（这里给出规则演示）
 *
 * 规则函数签名：(n) => 'one' | 'few' | 'many' | 'other'
 */
const pluralRules = {
  // 英语：1 是 one，其余 other
  en(n) {
    return n === 1 ? "one" : "other";
  },
  // 中文：没有复数形态变化
  zh(n) {
    return "other";
  },
  // 俄语规则（演示用）
  ru(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "few";
    return "many";
  },
};

/**
 * 根据语言获取复数类别
 */
function getPluralCategory(locale, n) {
  const lang = locale.split("-")[0];
  const rule = pluralRules[lang] || pluralRules.en;
  return rule(n);
}

// ============================================================================
// 2. 国际化核心：I18n
// ============================================================================

/**
 * I18n：国际化方案核心
 */
class I18n {
  /**
   * @param {Object} options
   * @param {string} options.locale 初始 locale
   * @param {string} options.fallbackLocale 回退 locale
   * @param {Object} options.messages 各 locale 的字典
   */
  constructor(options = {}) {
    this.locale = options.locale || "en";
    this.fallbackLocale = options.fallbackLocale || "en";
    this.messages = options.messages || {}; // { en: {...}, zh: {...} }
    this._subscribers = new Set();
    // 缺失翻译记录（便于调试）
    this._missingKeys = new Set();
  }

  // --------------------------------------------------------------------------
  // 字典管理
  // --------------------------------------------------------------------------

  /** 设置某个 locale 的字典（合并） */
  setLocaleMessages(locale, dict) {
    this.messages[locale] = { ...(this.messages[locale] || {}), ...dict };
    this._notify();
  }

  /** 合并多条 locale 字典 */
  addMessages(messages) {
    for (const [locale, dict] of Object.entries(messages)) {
      this.messages[locale] = { ...(this.messages[locale] || {}), ...dict };
    }
    this._notify();
  }

  // --------------------------------------------------------------------------
  // locale 切换 + 响应式
  // --------------------------------------------------------------------------

  /** 切换 locale，通知订阅者 */
  setLocale(locale) {
    if (this.locale === locale) return;
    this.locale = locale;
    this._notify();
  }

  /** 订阅 locale / 字典变化 */
  subscribe(listener) {
    this._subscribers.add(listener);
    return () => this._subscribers.delete(listener); // 取消订阅
  }

  _notify() {
    for (const fn of this._subscribers) {
      try {
        fn(this.locale);
      } catch (e) {
        console.error("[i18n] subscriber error:", e.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 翻译核心
  // --------------------------------------------------------------------------

  /**
   * 在一个字典中按点分路径取值
   * 支持 'a.b.c' 嵌套 key，也支持数组 key
   */
  _resolveKey(dict, key) {
    if (!dict) return undefined;
    if (key in dict) return dict[key];
    const parts = key.split(".");
    let cur = dict;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = cur[p];
    }
    return cur;
  }

  /**
   * 主翻译函数
   * @param {string} key 翻译键，支持 'a.b.c'
   * @param {Object} params 插值参数，如 { name: 'Alice', count: 3 }
   * @returns {string}
   */
  t(key, params = {}) {
    let template = this._lookup(key);

    // 复数处理：若 params 中有 count 且模板是对象 {one, other, ...}
    if (
      template &&
      typeof template === "object" &&
      params.count !== undefined
    ) {
      const category = getPluralCategory(this.locale, params.count);
      template =
        template[category] ?? template.other ?? template.one ?? template.many;
    }

    if (template === undefined || template === null) {
      this._missingKeys.add(`${this.locale}:${key}`);
      return key; // 找不到则返回 key 本身
    }

    if (typeof template !== "string") return String(template);

    // 插值 {name} -> params.name
    return this._interpolate(template, params);
  }

  /** 在当前 locale + fallback 中查找 */
  _lookup(key) {
    // 1. 当前 locale
    let val = this._resolveKey(this.messages[this.locale], key);
    if (val !== undefined) return val;
    // 2. fallback locale
    if (this.fallbackLocale !== this.locale) {
      val = this._resolveKey(this.messages[this.fallbackLocale], key);
      if (val !== undefined) return val;
    }
    return undefined;
  }

  /** 插值：{name} -> params.name */
  _interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, name) => {
      if (params[name] === undefined || params[name] === null) return match;
      return String(params[name]);
    });
  }

  // --------------------------------------------------------------------------
  // 日期 / 数字格式化
  // --------------------------------------------------------------------------

  /**
   * 格式化日期
   * 使用 Intl.DateTimeFormat（Node / 浏览器内置）
   */
  formatDate(date, options = {}) {
    const d = date instanceof Date ? date : new Date(date);
    try {
      return new Intl.DateTimeFormat(this.locale, options).format(d);
    } catch {
      return d.toISOString();
    }
  }

  /**
   * 格式化数字
   * 使用 Intl.NumberFormat
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.locale, options).format(number);
    } catch {
      return String(number);
    }
  }

  /**
   * 格式化货币
   */
  formatCurrency(number, currency = "USD") {
    return this.formatNumber(number, { style: "currency", currency });
  }

  /**
   * 格式化相对时间（简化版）
   * 例如 "3 days ago"
   */
  formatRelativeTime(seconds, options = {}) {
    try {
      return new Intl.RelativeTimeFormat(this.locale, {
        numeric: "auto",
        ...options,
      }).format(Math.round(seconds), this._relativeUnit(seconds));
    } catch {
      return `${seconds}s`;
    }
  }

  /** 根据秒数选择合适的单位 */
  _relativeUnit(seconds) {
    const abs = Math.abs(seconds);
    if (abs < 60) return "second";
    if (abs < 3600) return "minute";
    if (abs < 86400) return "hour";
    if (abs < 2592000) return "day";
    if (abs < 31536000) return "month";
    return "year";
  }

  // --------------------------------------------------------------------------
  // 工具
  // --------------------------------------------------------------------------

  /** 判断某 key 是否存在翻译 */
  exists(key) {
    return this._lookup(key) !== undefined;
  }

  /** 获取所有缺失 key */
  getMissingKeys() {
    return [...this._missingKeys];
  }
}

// ============================================================================
// 3. 响应式翻译函数：t 函数自动绑定当前实例
// ============================================================================

/**
 * 创建一个绑定的 t 函数，便于直接调用
 * 例如：const t = i18n.createT();  t('hello', { name })
 */
I18n.prototype.createT = function () {
  return (key, params) => this.t(key, params);
};

// ============================================================================
// 4. 测试用例：中英文翻译
// ============================================================================

function runTests() {
  console.log("================ 1. 初始化字典 ================");
  const messages = {
    en: {
      app: {
        title: "My App",
        welcome: "Welcome, {name}!",
      },
      greeting: "Hello",
      items: {
        one: "{count} item",
        other: "{count} items",
      },
      messages: {
        unread: {
          one: "You have {count} unread message",
          other: "You have {count} unread messages",
        },
      },
      actions: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
      },
    },
    zh: {
      app: {
        title: "我的应用",
        welcome: "欢迎，{name}！",
      },
      greeting: "你好",
      items: "{count} 个项目",
      messages: {
        unread: "你有 {count} 条未读消息",
      },
      actions: {
        save: "保存",
        cancel: "取消",
        delete: "删除",
      },
    },
  };

  const i18n = new I18n({ locale: "en", fallbackLocale: "en", messages });

  console.log("当前 locale:", i18n.locale);
  console.log("app.title:", i18n.t("app.title"));
  console.log("app.welcome:", i18n.t("app.welcome", { name: "Alice" }));
  console.log("greeting:", i18n.t("greeting"));

  console.log("\n================ 2. 嵌套 key ================");
  console.log("app.title (en):", i18n.t("app.title"));
  console.log("messages.unread (en):", i18n.t("messages.unread", { count: 5 }));

  console.log("\n================ 3. 插值 ================");
  console.log("app.welcome:", i18n.t("app.welcome", { name: "Bob" }));
  console.log("缺失参数:", i18n.t("app.welcome")); // {name} 保留

  console.log("\n================ 4. 复数（英语 one/other） ================");
  console.log("1 item:", i18n.t("items", { count: 1 }));
  console.log("5 items:", i18n.t("items", { count: 5 }));
  console.log("0 items:", i18n.t("items", { count: 0 }));
  console.log("1 unread:", i18n.t("messages.unread", { count: 1 }));
  console.log("3 unread:", i18n.t("messages.unread", { count: 3 }));

  console.log("\n================ 5. 切换到中文 ================");
  i18n.setLocale("zh");
  console.log("app.title:", i18n.t("app.title"));
  console.log("app.welcome:", i18n.t("app.welcome", { name: "张三" }));
  console.log("items (中文不分复数):", i18n.t("items", { count: 5 }));
  console.log("messages.unread:", i18n.t("messages.unread", { count: 3 }));
  console.log("actions.save:", i18n.t("actions.save"));

  console.log("\n================ 6. fallback 机制 ================");
  // 中文缺少某 key，应回退到英文
  const i18n2 = new I18n({ locale: "zh", fallbackLocale: "en", messages });
  console.log("存在的 key (app.title):", i18n2.t("app.title"));
  console.log("中文缺失、英文存在的 key 测试:");
  // 临时构造一个英文独有 key
  i18n2.setLocaleMessages("en", { onlyInEnglish: "This is English only" });
  console.log("onlyInEnglish (zh 应回退到 en):", i18n2.t("onlyInEnglish"));

  console.log("\n================ 7. 完全缺失的 key ================");
  console.log("nonexistent:", i18n2.t("nonexistent.key"));
  console.log("缺失 key 列表:", i18n2.getMissingKeys());

  console.log(
    "\n================ 8. 响应式：订阅 locale 变化 ================",
  );
  const i18n3 = new I18n({ locale: "en", messages });
  const log = [];
  const unsubscribe = i18n3.subscribe((locale) => {
    log.push(
      `locale 变更为: ${locale}, 当前 greeting = ${i18n3.t("greeting")}`,
    );
  });
  i18n3.setLocale("zh");
  i18n3.setLocale("en");
  i18n3.setLocale("zh");
  console.log("订阅日志:");
  log.forEach((l) => console.log("  " + l));
  unsubscribe();
  i18n3.setLocale("en"); // 取消订阅后不再记录
  console.log("取消订阅后再切换，日志条数:", log.length);

  console.log("\n================ 9. 日期格式化 ================");
  const date = new Date("2024-06-15T10:30:00Z");
  const i18nDate = new I18n({ locale: "en-US", messages });
  console.log(
    "en-US 长格式:",
    i18nDate.formatDate(date, { dateStyle: "full", timeStyle: "short" }),
  );
  i18nDate.setLocale("zh-CN");
  console.log(
    "zh-CN 长格式:",
    i18nDate.formatDate(date, { dateStyle: "full", timeStyle: "short" }),
  );
  i18nDate.setLocale("en-GB");
  console.log(
    "en-GB 短格式:",
    i18nDate.formatDate(date, { dateStyle: "short" }),
  );

  console.log("\n================ 10. 数字 / 货币格式化 ================");
  const i18nNum = new I18n({ locale: "en-US", messages });
  console.log("en-US 数字:", i18nNum.formatNumber(1234567.89));
  console.log("en-US 货币 USD:", i18nNum.formatCurrency(1234.5, "USD"));
  i18nNum.setLocale("zh-CN");
  console.log("zh-CN 数字:", i18nNum.formatNumber(1234567.89));
  console.log("zh-CN 货币 CNY:", i18nNum.formatCurrency(1234.5, "CNY"));
  i18nNum.setLocale("de-DE");
  console.log("de-DE 数字:", i18nNum.formatNumber(1234567.89));
  console.log("de-DE 货币 EUR:", i18nNum.formatCurrency(1234.5, "EUR"));

  console.log("\n================ 11. 相对时间 ================");
  const i18nRel = new I18n({ locale: "en", messages });
  console.log("en -3600s (1小时前):", i18nRel.formatRelativeTime(-3600));
  console.log("en -86400s (1天前):", i18nRel.formatRelativeTime(-86400));
  i18nRel.setLocale("zh");
  console.log("zh -3600s:", i18nRel.formatRelativeTime(-3600));
  console.log("zh -86400s:", i18nRel.formatRelativeTime(-86400));

  console.log("\n================ 12. 复数规则（俄语演示） ================");
  const ruMessages = {
    ru: {
      guests: {
        one: "{count} гость",
        few: "{count} гостя",
        many: "{count} гостей",
      },
    },
  };
  const i18nRu = new I18n({
    locale: "ru",
    fallbackLocale: "en",
    messages: ruMessages,
  });
  [1, 2, 5, 11, 21, 22, 25].forEach((n) => {
    console.log(`ru ${n} 位客人:`, i18nRu.t("guests", { count: n }));
  });

  console.log("\n================ 13. createT 便捷函数 ================");
  const t = i18n.createT();
  i18n.setLocale("en");
  console.log('t("greeting"):', t("greeting"));
  console.log('t("items", {count:3}):', t("items", { count: 3 }));
}

runTests();
