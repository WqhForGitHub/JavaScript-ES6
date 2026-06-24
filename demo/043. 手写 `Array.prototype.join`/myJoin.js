/**
 * 手写 Array.prototype.join
 *
 * 作用：把数组所有元素用分隔符连接成一个字符串并返回。
 *       separator 缺省为逗号 ','；若为 undefined 也按逗号处理。null 和 undefined 元素贡献空字符串。
 *
 * 实现思路：
 *   1. 空数组返回 ''
 *   2. 规范化 separator：undefined 用 ','，其余转为字符串
 *   3. for 循环遍历每个元素，从第二个元素开始先拼上分隔符
 *   4. 元素为 null/undefined 时拼空字符串，否则拼 String(元素)
 */

Array.prototype.myJoin = function (separator) {
  const len = this.length;
  if (len === 0) return '';

  const sep = separator === undefined ? ',' : String(separator);

  let result = '';
  for (let i = 0; i < len; i++) {
    if (i > 0) {
      result += sep;
    }
    const el = this[i];
    if (el !== null && el !== undefined) {
      result += el;
    }
    // null / undefined 贡献空字符串
  }

  return result;
};

// ===== 测试 =====

// --- 默认逗号分隔 ---
console.log([1, 2, 3].myJoin()); // '1,2,3'

// --- 自定义分隔符 ---
console.log([1, 2, 3].myJoin('-')); // '1-2-3'
console.log([1, 2, 3].myJoin('')); // '123'
console.log(['a', 'b', 'c'].myJoin(' ')); // 'a b c'

// --- null 和 undefined 贡献空字符串 ---
console.log([1, null, 3].myJoin('-')); // '1--3'
console.log([1, undefined, 3].myJoin(',')); // '1,,3'
console.log([null, 1].myJoin('-')); // '-1'
console.log([1, null].myJoin('-')); // '1-'

// --- separator 为 undefined 显式传入 ---
console.log([1, 2, 3].myJoin(undefined)); // '1,2,3'

// --- separator 为对象（会转为字符串）---
console.log([1, 2].myJoin({})); // '1[object Object]2'

// --- 空数组 ---
console.log([].myJoin('-')); // ''

// --- 字符串数组 ---
console.log(['h', 'e', 'l', 'l', 'o'].myJoin('')); // 'hello'
