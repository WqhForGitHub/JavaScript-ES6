/**
 * 手写 String.prototype.replaceAll
 *
 * 原生 replaceAll 的作用：
 *   - 替换字符串中所有匹配的子串，返回新字符串
 *   - 语法：str.replaceAll(pattern, replacement)
 *   - pattern 可以是字符串或带 g 标志的正则
 *   - 如果 pattern 是正则但无 g 标志，会抛出 TypeError
 *
 * 与 replace 的区别：
 *   - replace 字符串 pattern 只替换第一个
 *   - replaceAll 字符串 pattern 替换全部
 *   - replaceAll 要求正则必须有 g 标志
 *
 * 核心原理：
 *   - 字符串 pattern：转义后构造带 g 的正则
 *   - 正则 pattern：必须有 g 标志，否则报错
 *   - 复用 replace 的逻辑进行全局替换
 */

String.prototype.myReplaceAll = function (pattern, replacement) {
  const str = String(this);

  let rx;

  if (pattern instanceof RegExp) {
    // 正则必须带 g 标志，否则报错
    if (!pattern.global) {
      throw new TypeError(
        "String.prototype.replaceAll called with a non-global RegExp argument"
      );
    }
    rx = pattern;
  } else {
    // 字符串 pattern：转义特殊字符后构造带 g 的正则
    const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rx = new RegExp(escaped, "g");
  }

  // 使用 myReplace 的逻辑（带 g 标志会全局替换）
  // 这里直接内联实现，避免依赖 myReplace
  const result = [];
  let lastIndex = 0;
  let match;
  rx.lastIndex = 0;

  while ((match = rx.exec(str)) !== null) {
    const matchStr = match[0];
    const matchIndex = match.index;

    result.push(str.slice(lastIndex, matchIndex));

    // 计算替换文本
    let rep;
    if (typeof replacement === "function") {
      const args = match.slice();
      args.push(matchIndex);
      args.push(str);
      rep = String(replacement.apply(null, args));
    } else {
      rep = String(replacement)
        .replace(/\$\$/g, "\x00")
        .replace(/\$&/g, matchStr)
        .replace(/\$`/g, str.slice(0, matchIndex))
        .replace(/\$'/g, str.slice(matchIndex + matchStr.length))
        .replace(/\$(\d+)/g, (m, n) => {
          const idx = parseInt(n, 10);
          return idx >= 1 && idx < match.length && match[idx] !== undefined
            ? match[idx]
            : m;
        })
        .replace(/\x00/g, "$");
    }

    result.push(rep);
    lastIndex = matchIndex + matchStr.length;

    // 零宽匹配保护
    if (matchStr === "") {
      rx.lastIndex++;
    }
  }

  result.push(str.slice(lastIndex));
  return result.join("");
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.replaceAll ==========\n");

// --- 字符串 pattern：替换全部 ---
console.log("aaa".myReplaceAll("a", "b")); // "bbb"
console.log("hello world".myReplaceAll("o", "0")); // "hell0 w0rld"
console.log("a.b.c.d".myReplaceAll(".", "-")); // "a-b-c-d"
console.log("hello".myReplaceAll("xyz", "123")); // "hello"（无匹配）

// --- 正则 pattern（必须带 g）---
console.log("hello world".myReplaceAll(/o/g, "0")); // "hell0 w0rld"
console.log("2024-01-15".myReplaceAll(/-/g, "/")); // "2024/01/15"
console.log("abc123".myReplaceAll(/\d/g, "#")); // "abc###"

// --- 正则无 g 标志会报错 ---
try {
  "hello".myReplaceAll(/o/, "0");
} catch (e) {
  console.log(e.message); // String.prototype.replaceAll called with a non-global RegExp argument
}

// --- 使用捕获组 ---
console.log("John Smith".myReplaceAll(/(\w+) (\w+)/g, "$2, $1")); // "Smith, John"

// --- 使用函数 ---
console.log(
  "hello world".myReplaceAll(/\w+/g, (w) => w.toUpperCase())
); // "HELLO WORLD"
console.log("a1b2c3".myReplaceAll(/\d/g, (d) => `[${d}]`)); // "a[1]b[2]c[3]"

// --- 原字符串不被修改 ---
const original = "aaa";
console.log(original.myReplaceAll("a", "b")); // "bbb"
console.log(original); // "aaa"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".replaceAll("o", "0") === "hello world".myReplaceAll("o", "0")); // true
console.log("2024-01-15".replaceAll(/-/g, "/") === "2024-01-15".myReplaceAll(/-/g, "/")); // true
