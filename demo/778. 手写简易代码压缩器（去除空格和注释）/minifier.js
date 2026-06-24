/**
 * 手写简易代码压缩器（去除空格和注释）
 *
 * 功能：移除 JS 代码中的注释和多余空白
 * 实现思路：
 *   1. 逐字符扫描，跳过字符串字面量
 *   2. 移除单行注释 // 和多行注释
 *   3. 压缩连续空白为单个空格
 *   4. 移除符号两侧多余空白
 */

function minify(code) {
  let result = '', i = 0;
  const len = code.length;
  while (i < len) {
    // 跳过字符串
    if (code[i] === "'" || code[i] === '"' || code[i] === '`') {
      const q = code[i];
      result += code[i++];
      while (i < len && code[i] !== q) {
        if (code[i] === '\\') result += code[i++];
        result += code[i++];
      }
      if (i < len) result += code[i++];
      continue;
    }
    // 跳过单行注释
    if (code[i] === '/' && code[i+1] === '/') { i += 2; while (i < len && code[i] !== '\n') i++; continue; }
    // 跳过多行注释
    if (code[i] === '/' && code[i+1] === '*') { i += 2; while (i < len && !(code[i] === '*' && code[i+1] === '/')) i++; i += 2; continue; }
    result += code[i++];
  }
  // 压缩空白
  result = result
    .replace(/\s+/g, ' ')
    .replace(/\s*([;{}()=,<>+\-*/%&|!?:[\]])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
  return result;
}

// ===== 测试 =====
const code = `
// 单行注释
function add(a, b) {
  /* 多行注释 */
  return a + b; // 返回和
}
const result = add(1, 2);
`;
const minified = minify(code);
console.log('原始长度:', code.length);
console.log('压缩后长度:', minified.length);
console.log('压缩后:', minified);
// function add(a,b){return a+b}const result=add(1,2);
