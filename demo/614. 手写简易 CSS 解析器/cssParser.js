/**
 * 手写简易 CSS 解析器
 *
 * 将 CSS 文本解析为规则数组，每条规则包含选择器和声明对象。
 * 支持：类型/类/id 选择器、属性声明、注释、@media（简单跳过）。
 *
 * 实现思路：
 * 1. 移除注释 /* ... *\/ 。
 * 2. 用正则匹配 `selector { declarations }` 块。
 * 3. 对每个块，用分号分割声明，冒号分割属性和值。
 *
 * @param {string} css - CSS 文本
 * @returns {Array<{selector: string, declarations: Object}>} 规则数组
 */
function cssParser(css) {
  // 移除注释
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");

  const rules = [];
  const ruleRegex = /([^{}]+)\{([^}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(cleaned)) !== null) {
    const selector = match[1].trim();
    const declBlock = match[2];

    // 跳过 at-rules（如 @media）的内容由内层规则处理
    if (selector.startsWith("@")) {
      continue;
    }

    const declarations = {};
    declBlock.split(";").forEach((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return;
      const prop = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      if (prop && value) {
        declarations[prop] = value;
      }
    });

    if (Object.keys(declarations).length > 0) {
      rules.push({ selector, declarations });
    }
  }

  return rules;
}

// ===== 测试用例 =====
const css = `
  /* 主样式 */
  body {
    margin: 0;
    font-family: Arial;
  }
  .container {
    width: 960px;
    margin: 0 auto;
  }
  #header h1 {
    color: #333;
    font-size: 24px;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const rules = cssParser(css);
console.log(JSON.stringify(rules, null, 2));
// 期望输出:
// [
//   { "selector": "body", "declarations": { "margin": "0", "font-family": "Arial" } },
//   { "selector": ".container", "declarations": { "width": "960px", "margin": "0 auto" } },
//   { "selector": "#header h1", "declarations": { "color": "#333", "font-size": "24px" } },
//   { "selector": "a:hover", "declarations": { "text-decoration": "underline" } }
// ]

console.log(rules.length); // 期望输出: 4
console.log(rules[2].declarations["color"]); // 期望输出: #333
