/**
 * 手写简易正则表达式引擎
 *
 * 实现一个支持基本语法的小型正则引擎，包括：
 *   - 字面字符
 *   - . （匹配任意字符）
 *   - * （0 次或多次）
 *   - + （1 次或多次）
 *   - ? （0 次或 1 次）
 *   - 字符类 [abc] / [a-z]
 *
 * 实现思路（NFA / 回溯匹配）：
 * 1. parse：将正则字符串编译为 token 数组，每个 token 含 char 和量词。
 * 2. match：使用回溯，对每个 token 尝试匹配，遇到量词时递归尝试不同重复次数。
 * 3. matchHere：从给定位置开始尝试匹配整条 pattern，返回是否成功。
 *
 * @param {string} pattern - 正则模式字符串
 * @param {string} text - 待匹配文本
 * @returns {boolean} 是否匹配（从某处开始能匹配）
 */
function parseRegex(pattern) {
  const tokens = [];
  let i = 0;
  while (i < pattern.length) {
    let char;
    if (pattern[i] === "[") {
      // 字符类
      const end = pattern.indexOf("]", i);
      const cls = pattern.slice(i + 1, end);
      const chars = [];
      for (let j = 0; j < cls.length; j++) {
        if (cls[j + 1] === "-" && j + 2 < cls.length) {
          const startCode = cls.charCodeAt(j);
          const endCode = cls.charCodeAt(j + 2);
          for (let c = startCode; c <= endCode; c++)
            chars.push(String.fromCharCode(c));
          j += 2;
        } else {
          chars.push(cls[j]);
        }
      }
      char = { class: chars };
      i = end + 1;
    } else if (pattern[i] === ".") {
      char = { any: true };
      i++;
    } else {
      char = { ch: pattern[i] };
      i++;
    }

    // 量词
    let quantifier = null;
    if (i < pattern.length && "*+?".includes(pattern[i])) {
      quantifier = pattern[i];
      i++;
    }
    tokens.push({ char, quantifier });
  }
  return tokens;
}

function matchChar(token, ch) {
  if (token.char.any) return true;
  if (token.char.class) return token.char.class.includes(ch);
  return token.char.ch === ch;
}

// 从 text[pos] 开始，用 tokens[tokenIdx..] 尝试匹配
function matchHere(tokens, tokenIdx, text, pos) {
  if (tokenIdx >= tokens.length) return true; // pattern 耗尽，匹配成功

  const token = tokens[tokenIdx];
  const q = token.quantifier;

  if (q === "*") {
    // 贪婪匹配 + 回溯：先尽可能多匹配，失败再回退
    let count = 0;
    while (pos + count < text.length && matchChar(token, text[pos + count]))
      count++;
    for (let k = count; k >= 0; k--) {
      if (matchHere(tokens, tokenIdx + 1, text, pos + k)) return true;
    }
    return false;
  }

  if (q === "+") {
    if (pos >= text.length || !matchChar(token, text[pos])) return false;
    // 贪婪匹配
    let count = 1;
    while (pos + count < text.length && matchChar(token, text[pos + count]))
      count++;
    for (let k = count; k >= 1; k--) {
      if (matchHere(tokens, tokenIdx + 1, text, pos + k)) return true;
    }
    return false;
  }

  if (q === "?") {
    // 匹配 0 次
    if (matchHere(tokens, tokenIdx + 1, text, pos)) return true;
    // 匹配 1 次
    if (
      pos < text.length &&
      matchChar(token, text[pos]) &&
      matchHere(tokens, tokenIdx + 1, text, pos + 1)
    ) {
      return true;
    }
    return false;
  }

  // 无量词：精确匹配一次
  if (pos < text.length && matchChar(token, text[pos])) {
    return matchHere(tokens, tokenIdx + 1, text, pos + 1);
  }
  return false;
}

function regexEngine(pattern, text) {
  const tokens = parseRegex(pattern);
  // 从 text 的每个位置尝试匹配
  for (let start = 0; start <= text.length; start++) {
    if (matchHere(tokens, 0, text, start)) return true;
  }
  return false;
}

// ===== 测试用例 =====
console.log(regexEngine("abc", "xabcx")); // 期望输出: true
console.log(regexEngine("a.c", "abc")); // 期望输出: true
console.log(regexEngine("a.c", "ac")); // 期望输出: false
console.log(regexEngine("a*", "aaaa")); // 期望输出: true
console.log(regexEngine("a+", "")); // 期望输出: false
console.log(regexEngine("a+", "aaa")); // 期望输出: true
console.log(regexEngine("colou?r", "color")); // 期望输出: true
console.log(regexEngine("colou?r", "colour")); // 期望输出: true
console.log(regexEngine("[0-9]+", "abc123")); // 期望输出: true
console.log(regexEngine("[aeiou]", "xyz")); // 期望输出: false
