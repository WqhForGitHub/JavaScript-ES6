/**
 * 手写简易模板引擎（{{ }} 语法）
 *
 * 实现 Mustache 风格的模板引擎，支持：
 *   - 变量插值 {{ name }}
 *   - 点号路径访问 {{ user.name }}
 *   - HTML 转义输出（默认）与非转义输出 {{{ html }}}
 *   - 注释 {{! comment }}
 *
 * 实现思路：
 * 1. 使用正则匹配 {{ ... }} 占位符。
 * 2. 三花括号 {{{ }}} 输出原始 HTML；两花括号做 HTML 转义。
 * 3. 对占位符中的路径（如 user.name），用 reduce 逐层访问属性。
 * 4. 支持预编译：先解析模板得到 token，再用数据渲染，提升多次渲染性能。
 *
 * @param {string} template - 模板字符串
 * @param {Object} data - 数据对象
 * @returns {string} 渲染结果
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getValueByPath(data, path) {
  return path.split(".").reduce((obj, key) => {
    return obj == null ? undefined : obj[key];
  }, data);
}

// 预编译模板为 token 数组
function compile(template) {
  const tokens = [];
  const regex = /(\{\{\{[^}]*\}\}\}|\{\{[^}]*\}\})/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: template.slice(lastIndex, match.index),
      });
    }
    const raw = match[0];
    if (raw.startsWith("{{{")) {
      tokens.push({ type: "raw", value: raw.slice(3, -3).trim() });
    } else {
      const inner = raw.slice(2, -2).trim();
      if (inner.startsWith("!")) {
        tokens.push({ type: "comment" });
      } else {
        tokens.push({ type: "var", value: inner });
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < template.length) {
    tokens.push({ type: "text", value: template.slice(lastIndex) });
  }
  return tokens;
}

function renderTokens(tokens, data) {
  let result = "";
  for (const token of tokens) {
    switch (token.type) {
      case "text":
        result += token.value;
        break;
      case "var": {
        const v = getValueByPath(data, token.value);
        result += v == null ? "" : escapeHtml(v);
        break;
      }
      case "raw": {
        const v = getValueByPath(data, token.value);
        result += v == null ? "" : String(v);
        break;
      }
      case "comment":
        break;
    }
  }
  return result;
}

function mustacheTemplateEngine(template, data) {
  const tokens = compile(template);
  return renderTokens(tokens, data);
}

// ===== 测试用例 =====
const tpl =
  "<h1>{{title}}</h1><p>你好，{{user.name}}！{{! 注释 }}</p><div>{{{content}}}</div>";
const data = {
  title: "<脚本>",
  user: { name: "张三" },
  content: "<b>加粗内容</b>",
};
console.log(mustacheTemplateEngine(tpl, data));
// 期望输出:
// <h1>&lt;脚本&gt;</h1><p>你好，张三！</p><div><b>加粗内容</b></div>

const tpl2 = "{{a.b.c}}";
console.log(mustacheTemplateEngine(tpl2, { a: { b: { c: "深层数据" } } }));
// 期望输出: 深层数据

console.log(mustacheTemplateEngine("{{missing}}", {}));
// 期望输出: (空字符串)
