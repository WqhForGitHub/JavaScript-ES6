/**
 * 手写简易 Prettier 格式化（缩进）
 *
 * 功能：统一代码缩进，基于 {} / () / [] 嵌套深度
 * 实现思路：
 *   1. 按行分割
 *   2. 根据括号深度计算缩进层级
 *   3. 忽略字符串中的括号
 *   4. 用指定空格数 × 层级生成缩进
 */

function formatIndent(code, indentSize = 2) {
  const lines = code.split('\n');
  const result = [];
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.replace(/^[\t ]+/, '');
    if (trimmed === '') { result.push(''); continue; }
    // 行首是闭合括号，先减少深度
    if (/^[}\])\)]/.test(trimmed)) depth = Math.max(0, depth - 1);
    result.push(' '.repeat(depth * indentSize) + trimmed);
    // 统计括号变化（忽略字符串内）
    let d = 0, inStr = false, sc = '';
    for (let j = 0; j < trimmed.length; j++) {
      const ch = trimmed[j];
      if (inStr) { if (ch === sc && trimmed[j-1] !== '\\') inStr = false; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; sc = ch; continue; }
      if ('{(['.includes(ch)) d++;
      if ('})]'.includes(ch)) d--;
    }
    depth = Math.max(0, depth + d);
  }
  return result.join('\n');
}

// ===== 测试 =====
const code = "function add(a, b) {\n    return a + b;\n}\n\nconst obj = {\nx: 1,\n    y: {\n        z: 2\n    }\n};\n\nif (true) {\n  console.log('hello');\n}";
console.log('=== 原始 ===');
console.log(code);
console.log('\n=== 格式化后 ===');
console.log(formatIndent(code, 2));
