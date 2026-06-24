/**
 * 手写 String.prototype.replace
 *
 * 原生 replace 的作用：
 *   - 替换字符串中匹配的部分，返回新字符串
 *   - 语法：str.replace(pattern, replacement)
 *   - pattern 可以是字符串或正则表达式
 *   - replacement 可以是字符串或函数
 *
 * 替换规则：
 *   - 字符串 pattern：只替换第一个匹配
 *   - 正则 pattern 带 g：替换所有匹配
 *   - 正则 pattern 不带 g：只替换第一个匹配
 *
 * replacement 特殊替换模式：
 *   - $$ → $
 *   - $& → 匹配的子串
 *   - $` → 匹配项左边的部分
 *   - $' → 匹配项右边的部分
 *   - $n → 第 n 个捕获组
 *   - 函数：参数为 (match, p1, p2, ..., offset, string)
 *
 * 核心原理：
 *   - 使用正则 exec 逐个找到匹配
 *   - 对每个匹配用 replacement 计算替换文本
 *   - 拼接未匹配部分和替换文本
 */

String.prototype.myReplace = function (pattern, replacement) {
  const str = String(this);

  // 字符串 pattern：构造只匹配第一个的正则（转义特殊字符）
  let rx;
  let isStringPattern = false;
  if (pattern instanceof RegExp) {
    rx = pattern;
  } else {
    isStringPattern = true;
    rx = new RegExp(escapeRegExp(String(pattern)));
  }

  const result = [];
  let lastIndex = 0;
  let match;
  // 字符串 pattern 或无 g 标志只替换一次
  rx.lastIndex = 0;

  while ((match = rx.exec(str)) !== null) {
    const matchStr = match[0];
    const matchIndex = match.index;

    // 拼接匹配前的部分
    result.push(str.slice(lastIndex, matchIndex));

    // 计算替换文本
    const replaced = computeReplacement(
      replacement,
      match,
      str,
      matchIndex
    );
    result.push(replaced);

    lastIndex = matchIndex + matchStr.length;

    // 字符串 pattern 只替换第一次
    if (isStringPattern) break;
    // 无 g 标志只替换一次
    if (!rx.global) break;
    // 零宽匹配保护
    if (matchStr === "") {
      rx.lastIndex++;
    }
  }

  // 拼接剩余部分
  result.push(str.slice(lastIndex));

  return result.join("");

  // 转义正则特殊字符
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // 计算替换文本
  function computeReplacement(replacement, match, fullStr, offset) {
    if (typeof replacement === "function") {
      // 函数参数：match, p1, p2, ..., offset, string
      const args = match.slice(); // [完整匹配, 捕获组...]
      args.push(offset);
      args.push(fullStr);
      return String(replacement.apply(null, args));
    }

    // 字符串 replacement：处理特殊模式
    let rep = String(replacement);
    rep = rep
      .replace(/\$\$/g, "\x00") // 临时占位 $$
      .replace(/\$&/g, match[0])
      .replace(/\$`/g, fullStr.slice(0, offset))
      .replace(/\$'/g, fullStr.slice(offset + match[0].length));

    // 处理 $n 捕获组
    rep = rep.replace(/\$(\d+)/g, (m, n) => {
      const idx = parseInt(n, 10);
      if (idx >= 1 && idx < match.length) {
        return match[idx] !== undefined ? match[idx] : "";
      }
      return m;
    });

    // 还原 $$
    rep = rep.replace(/\x00/g, "$");

    return rep;
  }
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.replace ==========\n");

// --- 字符串替换（只替换第一个）---
console.log("hello world".myReplace("world", "JS")); // "hello JS"
console.log("aaa".myReplace("a", "b")); // "baa"
console.log("hello".myReplace("xyz", "123")); // "hello"（无匹配）

// --- 正则替换（无 g，只替换第一个）---
console.log("hello world".myReplace(/o/, "0")); // "hell0 world"
console.log("2024-01-15".myReplace(/-/, "/")); // "2024/01-15"

// --- 正则替换（有 g，替换全部）---
console.log("hello world".myReplace(/o/g, "0")); // "hell0 w0rld"
console.log("2024-01-15".myReplace(/-/g, "/")); // "2024/01/15"

// --- 使用捕获组 $1, $2 ---
console.log("John Smith".myReplace(/(\w+) (\w+)/, "$2, $1")); // "Smith, John"
console.log("2024-01-15".myReplace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1")); // "15/01/2024"

// --- 使用 $& （匹配的子串）---
console.log("hello".myReplace(/l/g, "[$&]")); // "he[l][l]o"

// --- 使用 $` 和 $' ---
console.log("hello".myReplace(/l/, "[$`]")); // "he[he]lo"
console.log("hello".myReplace(/l/, "[$']")); // "he[lo]lo"

// --- 使用函数作为替换值 ---
console.log(
  "hello world".myReplace(/\w+/g, (word) => word.toUpperCase())
); // "HELLO WORLD"
console.log(
  "hello".myReplace(/l/g, (m, offset) => `${m}@${offset}`)
); // "hel@2l@3o"

// --- 特殊字符转义 ---
console.log("a.b.c".myReplace(".", "x")); // "axb.c"（只替换第一个 .）

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".replace(/o/g, "0") === "hello world".myReplace(/o/g, "0")); // true
console.log("John Smith".replace(/(\w+) (\w+)/, "$2, $1") === "John Smith".myReplace(/(\w+) (\w+)/, "$2, $1")); // true
