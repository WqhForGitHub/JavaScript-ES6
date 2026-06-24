/**
 * 手写 String.prototype.split
 *
 * 原生 split 的作用：
 *   - 用分隔符将字符串分割成数组
 *   - 语法：str.split(separator, limit)
 *   - separator 可以是字符串或正则
 *   - limit 限制返回数组的最大长度
 *
 * 分隔规则：
 *   - separator 为字符串：按字面分隔符分割
 *   - separator 为正则：按正则匹配分割（捕获组会包含在结果中）
 *   - separator 为空字符串 "：按字符分割
 *   - 省略 separator：返回包含原字符串的单元素数组
 *
 * 核心原理：
 *   - 字符串分隔符：逐位置查找分隔符，分割
 *   - 正则分隔符：利用 exec 找到所有匹配位置分割
 *   - 处理 limit 截断
 */

String.prototype.mySplit = function (separator, limit) {
  const str = String(this);
  const len = str.length;

  // limit 处理
  let lim = limit === undefined ? 0xFFFFFFFF : Number(limit);
  if (Number.isNaN(lim)) lim = 0;
  lim = Math.trunc(lim);
  if (lim < 0) lim = 0;

  // 省略 separator：返回单元素数组
  if (separator === undefined) {
    return [str];
  }

  // limit 为 0 返回空数组
  if (lim === 0) return [];

  const result = [];

  // 空字符串分隔符：按字符分割
  if (separator === "") {
    for (let i = 0; i < len && result.length < lim; i++) {
      result.push(str[i]);
    }
    return result;
  }

  // 正则分隔符
  if (separator instanceof RegExp) {
    let lastIndex = 0;
    let match;
    // 确保从头开始，并添加 g 标志
    const rx = new RegExp(
      separator.source,
      separator.flags.includes("g") ? separator.flags : separator.flags + "g"
    );
    rx.lastIndex = 0;

    while ((match = rx.exec(str)) !== null) {
      // 零宽匹配保护：如果匹配为空且位置未推进，跳过
      if (match[0] === "" && rx.lastIndex === lastIndex) {
        rx.lastIndex++;
        continue;
      }

      // 添加分隔符前的部分（包括空串情况）
      result.push(str.slice(lastIndex, match.index));
      if (result.length >= lim) return result.slice(0, lim);

      // 添加捕获组
      for (let g = 1; g < match.length; g++) {
        result.push(match[g] !== undefined ? match[g] : "");
        if (result.length >= lim) return result.slice(0, lim);
      }

      lastIndex = match.index + match[0].length;

      // 零宽匹配时推进 lastIndex
      if (match[0] === "") rx.lastIndex++;

      // 无 g 标志避免死循环
      if (!rx.global) break;
    }

    // 添加最后一部分
    result.push(str.slice(lastIndex));
    return result.slice(0, lim);
  }

  // 字符串分隔符
  const sep = String(separator);
  const sepLen = sep.length;

  if (sepLen === 0) {
    // 空字符串分隔符（前面已处理，这里防御）
    for (let i = 0; i < len && result.length < lim; i++) {
      result.push(str[i]);
    }
    return result;
  }

  let start = 0;
  let idx = str.indexOf(sep, start);

  while (idx !== -1) {
    result.push(str.slice(start, idx));
    if (result.length >= lim) return result.slice(0, lim);
    start = idx + sepLen;
    idx = str.indexOf(sep, start);
  }

  // 添加最后一部分
  result.push(str.slice(start));
  return result.slice(0, lim);
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.split ==========\n");

// --- 字符串分隔符 ---
console.log("hello world".mySplit(" ")); // ["hello", "world"]
console.log("a,b,c,d".mySplit(",")); // ["a", "b", "c", "d"]
console.log("2024-01-15".mySplit("-")); // ["2024", "01", "15"]

// --- 空字符串分隔符（按字符分割）---
console.log("hello".mySplit("")); // ["h", "e", "l", "l", "o"]

// --- 省略分隔符 ---
console.log("hello".mySplit()); // ["hello"]

// --- 使用 limit ---
console.log("a,b,c,d".mySplit(",", 2)); // ["a", "b"]
console.log("a,b,c,d".mySplit(",", 0)); // []
console.log("hello".mySplit("", 3)); // ["h", "e", "l"]

// --- 分隔符不存在 ---
console.log("hello".mySplit("xyz")); // ["hello"]

// --- 连续分隔符产生空串 ---
console.log("a,,b".mySplit(",")); // ["a", "", "b"]
console.log(" hello ".mySplit(" ")); // ["", "hello", ""]

// --- 正则分隔符 ---
console.log("hello world".mySplit(/\s+/)); // ["hello", "world"]
console.log("abc123def456".mySplit(/\d+/)); // ["abc", "def", ""]

// --- 正则带捕获组（捕获组包含在结果中）---
console.log("a1b2c".mySplit(/(\d)/)); // ["a", "1", "b", "2", "c"]

// --- 首尾分隔符 ---
console.log(",a,b,".mySplit(",")); // ["", "a", "b", ""]

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log(JSON.stringify("hello world".split(" ")) === JSON.stringify("hello world".mySplit(" "))); // true
console.log(JSON.stringify("a,b,c".split(",", 2)) === JSON.stringify("a,b,c".mySplit(",", 2))); // true
console.log(JSON.stringify("hello".split("")) === JSON.stringify("hello".mySplit(""))); // true
