/**
 * 手写 String.prototype.padStart / padEnd（ES5 实现）
 *
 * padStart(targetLength, padString) 在字符串开头填充 padString 直到达到目标长度。
 * padEnd(targetLength, padString) 在字符串末尾填充。
 * 填充规则：
 * - 如果目标长度 <= 原长度，返回原字符串
 * - padString 默认为空格，会被截断以恰好填满
 * - padString 会被重复使用以填满所需长度
 */

// 手写 padStart
function padStart(str, targetLength, padString) {
  str = String(str);
  targetLength = targetLength >>> 0; // 转为无符号整数
  if (str.length >= targetLength) {
    return str;
  }
  padString = padString !== undefined ? String(padString) : " ";
  if (padString === "") {
    return str; // 空填充字符串无法填充
  }

  var padLen = targetLength - str.length;
  // 重复 padString 直到达到所需长度
  var filler = "";
  while (filler.length < padLen) {
    filler += padString;
  }
  // 截断到恰好所需长度
  filler = filler.slice(0, padLen);
  return filler + str;
}

// 手写 padEnd
function padEnd(str, targetLength, padString) {
  str = String(str);
  targetLength = targetLength >>> 0;
  if (str.length >= targetLength) {
    return str;
  }
  padString = padString !== undefined ? String(padString) : " ";
  if (padString === "") {
    return str;
  }

  var padLen = targetLength - str.length;
  var filler = "";
  while (filler.length < padLen) {
    filler += padString;
  }
  filler = filler.slice(0, padLen);
  return str + filler;
}

// 挂到 String.prototype（仅演示，不建议修改原生）
// String.prototype.padStart = function (targetLength, padString) {
//   return padStart(this, targetLength, padString);
// };

// 测试 1：padStart 基本功能
console.log("--- padStart basic ---");
console.log(padStart("abc", 6)); // '   abc'
console.log(padStart("abc", 6, "_")); // '___abc'
console.log(padStart("abc", 6, "xy")); // 'xyxabc'
console.log(padStart("abc", 2, "x")); // 'abc'（目标长度小于原长度）

// 测试 2：padEnd 基本功能
console.log("--- padEnd basic ---");
console.log(padEnd("abc", 6)); // 'abc   '
console.log(padEnd("abc", 6, "_")); // 'abc___'
console.log(padEnd("abc", 6, "xy")); // 'abcxyx'
console.log(padEnd("abc", 2, "x")); // 'abc'

// 测试 3：长填充字符串截断
console.log("--- Truncate pad string ---");
console.log(padStart("abc", 5, "1234567")); // '12abc'（截断填充）
console.log(padEnd("abc", 5, "1234567")); // 'abc12'

// 测试 4：数字对齐
console.log("--- Number alignment ---");
var numbers = [1, 23, 456, 7890];
numbers.forEach(function (n) {
  console.log(padStart(String(n), 6, "0")); // 000001, 000023, 000456, 007890
});

// 测试 5：表格对齐
console.log("--- Table alignment ---");
var rows = [
  ["Name", "Age", "City"],
  ["Alice", "25", "Beijing"],
  ["Bob", "30", "Shanghai"],
];
rows.forEach(function (row) {
  var line = row
    .map(function (cell) {
      return padEnd(cell, 10, " ");
    })
    .join(" | ");
  console.log(line);
});
// Name      | Age       | City
// Alice     | 25        | Beijing
// Bob       | 30        | Shanghai

// 测试 6：空字符串
console.log("--- Empty string ---");
console.log(JSON.stringify(padStart("", 3, "*"))); // '***'
console.log(JSON.stringify(padEnd("", 3, "*"))); // '***'

// 测试 7：与原生对比
console.log("--- Compare with native ---");
console.log(padStart("abc", 6, "xy") === "abc".padStart(6, "xy")); // true
console.log(padEnd("abc", 6, "xy") === "abc".padEnd(6, "xy")); // true
console.log(padStart("abc", 2, "x") === "abc".padStart(2, "x")); // true
