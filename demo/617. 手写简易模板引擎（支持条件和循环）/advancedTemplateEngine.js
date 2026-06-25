/**
 * 手写简易模板引擎（支持条件和循环）
 *
 * 在变量插值基础上增加：
 *   - 条件块 {{#if condition}} ... {{else}} ... {{/if}}
 *   - 循环块 {{#each list}} ... {{this}} ... {{/each}}
 *   - 嵌套支持（循环/条件内部可再包含块）
 *
 * 实现思路：
 * 1. 词法分析：将模板切分为 text、variable、blockStart、blockEnd token。
 * 2. 语法分析：基于 token 栈构建嵌套的 AST 节点（if/each/text/var）。
 * 3. 渲染：递归遍历 AST，if 节点根据条件真假选择分支，
 *    each 节点遍历数组并为每次迭代建立新作用域（this 指向当前项）。
 *
 * @param {string} template - 模板字符串
 * @param {Object} data - 数据对象
 * @returns {string} 渲染结果
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getValue(data, path) {
  if (path === "this") return data;
  const parts = path.split(".");
  let obj = data;
  let i = 0;
  // 以 this 开头时，跳过 this，从当前项开始访问剩余路径
  if (parts[0] === "this") i = 1;
  for (; i < parts.length; i++) {
    obj = obj == null ? undefined : obj[parts[i]];
  }
  return obj;
}

// 词法分析：切分文本与 {{ }} 标签
function tokenize(template) {
  const tokens = [];
  const regex = /(\{\{[^}]+\}\})/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: template.slice(lastIndex, match.index),
      });
    }
    tokens.push({ type: "tag", value: match[0].slice(2, -2).trim() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < template.length) {
    tokens.push({ type: "text", value: template.slice(lastIndex) });
  }
  return tokens;
}

// 语法分析：构建 AST
function parse(tokens) {
  const root = { type: "root", children: [] };
  const stack = [root];

  // 当前应追加子节点的列表（根据栈顶节点类型决定）
  function getCurrentList() {
    const top = stack[stack.length - 1];
    if (top.type === "if") return top.inElse ? top.else : top.then;
    if (top.type === "each") return top.body;
    return top.children;
  }

  for (const token of tokens) {
    if (token.type === "text") {
      getCurrentList().push({ type: "text", value: token.value });
      continue;
    }
    const v = token.value;
    if (v.startsWith("#if ")) {
      const node = {
        type: "if",
        condition: v.slice(4),
        then: [],
        else: [],
        inElse: false,
      };
      getCurrentList().push(node);
      stack.push(node);
    } else if (v === "else") {
      stack[stack.length - 1].inElse = true;
    } else if (v === "/if") {
      stack.pop();
    } else if (v.startsWith("#each ")) {
      const node = { type: "each", list: v.slice(6), body: [] };
      getCurrentList().push(node);
      stack.push(node);
    } else if (v === "/each") {
      stack.pop();
    } else {
      getCurrentList().push({ type: "var", value: v });
    }
  }
  return root;
}

// 渲染：递归遍历 AST
function renderAst(node, data) {
  switch (node.type) {
    case "root":
      return node.children.map((c) => renderAst(c, data)).join("");
    case "text":
      return node.value;
    case "var":
      return escapeHtml(getValue(data, node.value) ?? "");
    case "if": {
      const cond = getValue(data, node.condition);
      const branch = cond ? node.then : node.else;
      return branch.map((c) => renderAst(c, data)).join("");
    }
    case "each": {
      const list = getValue(data, node.list) || [];
      return list
        .map((item) => node.body.map((c) => renderAst(c, item)).join(""))
        .join("");
    }
  }
  return "";
}

function advancedTemplateEngine(template, data) {
  const tokens = tokenize(template);
  const ast = parse(tokens);
  return renderAst(ast, data);
}

// ===== 测试用例 =====
const tpl = [
  "{{#if user.isAdmin}}",
  "<p>欢迎管理员 {{user.name}}</p>",
  "{{#each users}}",
  "<li>{{this.name}} - {{this.role}}</li>",
  "{{/each}}",
  "{{else}}",
  "<p>普通用户 {{user.name}}</p>",
  "{{/if}}",
].join("");

const data = {
  user: { name: "root", isAdmin: true },
  users: [
    { name: "张三", role: "编辑" },
    { name: "李四", role: "查看" },
  ],
};
console.log(advancedTemplateEngine(tpl, data));
// 期望输出:
// <p>欢迎管理员 root</p><li>张三 - 编辑</li><li>李四 - 查看</li>

const data2 = { user: { name: "王五", isAdmin: false }, users: [] };
console.log(advancedTemplateEngine(tpl, data2));
// 期望输出:
// <p>普通用户 王五</p>
