/**
 * 简易词法分析器（Tokenizer）
 *
 * 将源代码字符串（Lisp 风格）转换为 Token 数组。
 * Lisp 风格的代码形如：(add 2 (subtract 4 2))
 *
 * 实现思路：
 * 1. 维护一个指针 current，逐字符遍历输入字符串。
 * 2. 跳过空白字符。
 * 3. 遇到 '(' 或 ')' 时，产生一个 paren 类型的 token。
 * 4. 遇到数字时，连续读取所有数字字符，组成 number token。
 * 5. 遇到字母时，连续读取所有字母字符，组成 name token。
 * 6. 遇到字符串字面量时（双引号包裹），读取到结束引号。
 *
 * @param {string} input - 源代码字符串
 * @returns {Array<{type: string, value: string}>} Token 数组
 */
function tokenizer(input) {
  const tokens = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];

    // 跳过空白字符
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // 处理括号
    if (char === "(") {
      tokens.push({ type: "paren", value: "(" });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "paren", value: ")" });
      current++;
      continue;
    }

    // 处理数字
    if (/[0-9]/.test(char)) {
      let value = "";
      while (/[0-9]/.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "number", value });
      continue;
    }

    // 处理字符串字面量
    if (char === '"') {
      let value = "";
      char = input[++current]; // 跳过开头引号
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current]; // 跳过结尾引号
      tokens.push({ type: "string", value });
      continue;
    }

    // 处理名称（字母）
    if (/[a-z]/i.test(char)) {
      let value = "";
      while (/[a-z]/i.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "name", value });
      continue;
    }

    throw new TypeError(`无法识别的字符: ${char}`);
  }

  return tokens;
}

// ===== 测试用例 =====
const tokens = tokenizer("(add 2 (subtract 4 2))");
console.log(JSON.stringify(tokens, null, 2));
// 期望输出:
// [
//   { "type": "paren", "value": "(" },
//   { "type": "name", "value": "add" },
//   { "type": "number", "value": "2" },
//   { "type": "paren", "value": "(" },
//   { "type": "name", "value": "subtract" },
//   { "type": "number", "value": "4" },
//   { "type": "number", "value": "2" },
//   { "type": "paren", "value": ")" },
//   { "type": "paren", "value": ")" }
// ]

const tokensWithStr = tokenizer('(concat "hello" "world")');
console.log(JSON.stringify(tokensWithStr, null, 2));
// 期望输出:
// [
//   { "type": "paren", "value": "(" },
//   { "type": "name", "value": "concat" },
//   { "type": "string", "value": "hello" },
//   { "type": "string", "value": "world" },
//   { "type": "paren", "value": ")" }
// ]
