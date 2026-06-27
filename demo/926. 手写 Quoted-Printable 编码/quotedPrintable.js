/**
 * 手写 Quoted-Printable 编码与解码（RFC 2045）
 *
 * 编码规则：
 * 1. 可打印 ASCII 字符（33-126），除 '=' 外，直接输出
 * 2. '=' 字符编码为 '=3D'
 * 3. 制表符(0x09)和空格(0x20)：正常输出，但不能出现在行尾（行尾需编码）
 * 4. 其他字节（0-8, 10-31, 127-255）编码为 '=XX'（大写十六进制）
 * 5. 行长度限制 76 字符（不含末尾的 CRLF），超出时用软换行 '=' 断行
 * 6. 软换行：行尾的 '=' 表示该行被折断，解码时与下一行连接
 * 7. 行结束符为 CRLF (\r\n)
 *
 * 应用场景：MIME 邮件编码，用于传输包含非 ASCII 字符的文本。
 */

const HEX = "0123456789ABCDEF";

/**
 * 将字符串进行 UTF-8 编码，返回字节数组
 * @param {string} str - 输入字符串
 * @returns {number[]} UTF-8 字节数组
 */
function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/**
 * 将 UTF-8 字节数组解码为字符串
 * @param {number[]} bytes - UTF-8 字节数组
 * @returns {string} 解码后的字符串
 */
function utf8Decode(bytes) {
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i];
    let code;
    if (b1 < 0x80) {
      code = b1;
      i++;
    } else if (b1 < 0xe0) {
      code = ((b1 & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
      i += 2;
    } else if (b1 < 0xf0) {
      code =
        ((b1 & 0x0f) << 12) |
        ((bytes[i + 1] & 0x3f) << 6) |
        (bytes[i + 2] & 0x3f);
      i += 3;
    } else {
      code =
        ((b1 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      i += 4;
    }
    if (code < 0x10000) result += String.fromCharCode(code);
    else {
      code -= 0x10000;
      result += String.fromCharCode(
        0xd800 + (code >> 10),
        0xdc00 + (code & 0x3ff),
      );
    }
  }
  return result;
}

/**
 * 将十六进制字符转换为数值
 * @param {string} c - 十六进制字符
 * @returns {number} 0-15，无效返回 -1
 */
function hexValue(c) {
  const code = c.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  if (code >= 0x41 && code <= 0x46) return code - 0x41 + 10;
  if (code >= 0x61 && code <= 0x66) return code - 0x61 + 10;
  return -1;
}

/**
 * 判断字节是否需要编码
 * 可打印 ASCII（33-126）除 '=' 外不编码
 * @param {number} b - 字节值
 * @returns {boolean}
 */
function needsQuoting(b) {
  return b === 61 || b < 33 || b > 126;
}

/**
 * Quoted-Printable 编码
 * @param {string} str - 要编码的字符串
 * @param {number} [lineLength=76] - 每行最大长度（不含软换行符）
 * @returns {string} QP 编码字符串（行间以 =\r\n 分隔）
 */
function quotedPrintableEncode(str, lineLength = 76) {
  const bytes = utf8Encode(str);
  const lines = [];
  let currentLine = "";

  function flushLine() {
    lines.push(currentLine);
    currentLine = "";
  }

  for (const b of bytes) {
    // 将字节转换为编码形式
    let encoded;
    if (needsQuoting(b)) {
      encoded = "=" + HEX[b >> 4] + HEX[b & 0x0f];
    } else {
      encoded = String.fromCharCode(b);
    }

    // 检查加入后是否会超长，预留 1 字符给软换行 '='
    if (currentLine.length + encoded.length > lineLength - 1) {
      flushLine();
    }
    currentLine += encoded;
  }
  if (currentLine.length > 0) flushLine();

  // 软换行用 '=\r\n' 连接各行
  return lines.join("=\r\n");
}

/**
 * Quoted-Printable 解码
 * @param {string} str - QP 编码字符串
 * @returns {string} 解码后的字符串
 */
function quotedPrintableDecode(str) {
  // 标准化换行符
  const normalized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const bytes = [];

  for (let li = 0; li < lines.length; li++) {
    let line = lines[li];
    // 行尾 '=' 表示软换行（该行被折断）
    let softBreak = false;
    if (line.endsWith("=")) {
      softBreak = true;
      line = line.slice(0, -1);
    }
    // 去除行尾空白（QP 规则：行尾空格/Tab 应被忽略）
    line = line.replace(/[ \t]+$/, "");

    let i = 0;
    while (i < line.length) {
      if (line[i] === "=") {
        const h1 = i + 1 < line.length ? hexValue(line[i + 1]) : -1;
        const h2 = i + 2 < line.length ? hexValue(line[i + 2]) : -1;
        if (h1 >= 0 && h2 >= 0) {
          bytes.push((h1 << 4) | h2);
          i += 3;
        } else {
          // 无效转义序列，按字面 '=' 处理
          bytes.push(61);
          i++;
        }
      } else {
        bytes.push(line.charCodeAt(i));
        i++;
      }
    }
    // 非软换行且不是最后一行时，添加 CRLF
    if (!softBreak && li < lines.length - 1) {
      bytes.push(13, 10);
    }
  }

  return utf8Decode(bytes);
}

// ===================== 测试用例 =====================
console.log("===== Quoted-Printable 编码/解码 测试 =====");

const testCases = [
  "Hello, World!",
  "This is a test = simple",
  "中文测试 Quoted-Printable",
  "Line1\nLine2\nLine3",
  "Tab\there\tand there",
  "🎉 Emoji 表情符号",
  "A".repeat(80) + " end of long line",
  "Special: ©®™ ñ é ü",
];

for (const tc of testCases) {
  const encoded = quotedPrintableEncode(tc);
  const decoded = quotedPrintableDecode(encoded);
  console.log(`原文: ${JSON.stringify(tc)}`);
  console.log(`编码: ${JSON.stringify(encoded)}`);
  console.log(`解码: ${JSON.stringify(decoded)}`);
  console.log(`往返一致: ${decoded === tc}`);
  console.log("---");
}
