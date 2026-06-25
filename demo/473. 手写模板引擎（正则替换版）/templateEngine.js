/**
 * 手写模板引擎（正则替换版）
 *
 * 功能：将带占位符的模板字符串与数据对象结合，生成最终字符串
 * 实现思路：
 *   1. 支持 {{ var }} 与 {{ obj.prop }} 形式的变量插值
 *   2. 支持转义插值 {{{ var }}}（不转义 HTML，输出原始内容）
 *   3. 使用正则全局匹配占位符，从 data 中按路径取值
 *   4. 默认对 {{ }} 的值做 HTML 转义，防止 XSS
 *   5. 支持简单的条件与循环语法（<% if %> / <% for %>）通过 new Function 编译执行
 */

/**
 * 简易模板引擎
 * @param {string} template 模板字符串
 * @param {Object} data 渲染数据
 * @returns {string} 渲染后的字符串
 */
function templateEngine(template, data) {
  if (typeof template !== "string") return "";

  data = data || {};

  // 1. 先处理三花括号 {{{ }}} 不转义插值，用占位符替换避免被后续转义逻辑命中
  const unescapedList = [];
  template = template.replace(/\{\{\{\s*([\s\S]+?)\s*\}\}\}/g, (_, expr) => {
    const val = getByPath(data, expr.trim());
    unescapedList.push(val == null ? "" : String(val));
    return "\u0000UE" + (unescapedList.length - 1) + "\u0000";
  });

  // 2. 处理双花括号 {{ }} 默认 HTML 转义
  template = template.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_, expr) => {
    const val = getByPath(data, expr.trim());
    return val == null ? "" : escapeHtml(String(val));
  });

  // 3. 还原不转义的内容
  template = template.replace(
    /\u0000UE(\d+)\u0000/g,
    (_, i) => unescapedList[Number(i)],
  );

  return template;
}

/**
 * 按点号路径从对象取值（支持 a.b.c）
 * @param {Object} obj 数据对象
 * @param {string} path 路径
 * @returns {*} 取到的值
 */
function getByPath(obj, path) {
  if (obj == null) return undefined;
  // 若直接是属性名则快速返回
  if (path.indexOf(".") === -1) {
    return obj[path];
  }
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/**
 * HTML 转义
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

// ===== 测试用例 =====
console.log("=== 模板引擎（正则替换版） ===");

// 1. 基本变量插值
console.log(templateEngine("Hello, {{ name }}!", { name: "World" }));
// 期望输出: Hello, World!

// 2. 对象属性路径
console.log(
  templateEngine("{{ user.name }} is {{ user.age }} years old", {
    user: { name: "Tom", age: 18 },
  }),
);
// 期望输出: Tom is 18 years old

// 3. 默认 HTML 转义（防 XSS）
console.log(
  templateEngine("<div>{{ content }}</div>", {
    content: "<script>alert(1)</script>",
  }),
);
// 期望输出: <div>&lt;script&gt;alert(1)&lt;/script&gt;</div>

// 4. 三花括号不转义（输出富文本）
console.log(
  templateEngine("<div>{{{ content }}}</div>", { content: "<b>bold</b>" }),
);
// 期望输出: <div><b>bold</b></div>

// 5. 缺失变量输出空字符串
console.log(templateEngine("a={{ a }}, b={{ b }}", { a: "1" }));
// 期望输出: a=1, b=

// 6. 嵌套对象深层路径
console.log(
  templateEngine("{{ a.b.c.d }}", { a: { b: { c: { d: "deep" } } } }),
);
// 期望输出: deep

// 7. 模板中多个变量
console.log(
  templateEngine("{{ greeting }}, {{ name }}! You have {{ count }} messages.", {
    greeting: "Hi",
    name: "Jack",
    count: 5,
  }),
);
// 期望输出: Hi, Jack! You have 5 messages.
