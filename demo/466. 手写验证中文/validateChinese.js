/**
 * 手写验证中文
 *
 * 校验字符串是否全部为中文（含中文标点可选）。
 * 中文 Unicode 范围（常用）：
 *   - 基本汉字：\u4e00-\u9fa5
 *   - 扩展 A/B 等：\u3400-\u4dbf、\u20000-\u2a6df（需代理对）
 *   - 中文标点：\u3000-\u303f、\uff00-\uffef（全角符号）
 *
 * 这里实现：
 *   - validateChinese(str)：全部为基本中文
 *   - validateChineseAllowPunct(str)：允许中文 + 中文标点
 *   - containsChinese(str)：是否包含中文
 *
 * 实现思路：用正则 + 范围匹配。
 */

function validateChinese(str) {
  if (typeof str !== "string") return false;
  if (str.length === 0) return false;
  // 基本汉字 + 扩展A
  return /^[\u4e00-\u9fa5\u3400-\u4dbf]+$/.test(str);
}

function validateChineseAllowPunct(str) {
  if (typeof str !== "string") return false;
  if (str.length === 0) return false;
  // 汉字 + 中文标点 + 全角符号
  return /^[\u4e00-\u9fa5\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]+$/.test(str);
}

function containsChinese(str) {
  if (typeof str !== "string") return false;
  return /[\u4e00-\u9fa5\u3400-\u4dbf]/.test(str);
}

// 统计中文字符个数
function countChinese(str) {
  if (typeof str !== "string") return 0;
  const matches = str.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g);
  return matches ? matches.length : 0;
}

// ===== 测试 =====
console.log("你好世界:", validateChinese("你好世界")); // true
console.log("你好 world:", validateChinese("你好 world")); // false
console.log("纯英文:", validateChinese("hello")); // false
console.log("含数字:", validateChinese("你好123")); // false
console.log("空串:", validateChinese("")); // false
console.log("含中文标点:", validateChinese("你好，世界")); // false（逗号是全角标点）
console.log("允许标点 你好，世界:", validateChineseAllowPunct("你好，世界")); // true
console.log("允许标点 你好。:", validateChineseAllowPunct("你好。")); // true
console.log("允许标点但含英文:", validateChineseAllowPunct("你好a")); // false
console.log("包含中文 hello你:", containsChinese("hello你")); // true
console.log("不含中文 hello:", containsChinese("hello")); // false
console.log("统计中文个数:", countChinese("你好world世界")); // 4
console.log("统计中文个数2:", countChinese("abc")); // 0
console.log("繁体字 龍鳳:", validateChinese("龍鳳")); // true
console.log("生僻字 𠀀(扩展B):", validateChinese("𠀀")); // false（扩展B在代理对范围，本实现不覆盖）
console.log("中文标点单测:", validateChineseAllowPunct("《》「」")); // true
