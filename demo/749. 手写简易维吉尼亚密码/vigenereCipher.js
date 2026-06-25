/**
 * 手写简易维吉尼亚密码
 *
 * 功能：实现维吉尼亚密码（Vigenere Cipher）
 *       使用关键词对明文做不同位移的多表替换密码
 *
 * 实现思路：
 *   1. 密钥循环使用，每个明文字母用对应密钥字母的位移
 *   2. 位移 = keyChar - 'A'（即密钥字母在字母表中的索引）
 *   3. 加密: C = (P + K) mod 26
 *      解密: P = (C - K + 26) mod 26
 *   4. 非字母字符原样保留，不消耗密钥
 */

// 处理单个字母的位移
function shiftChar(ch, keyShift) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    // 大写
    return String.fromCharCode(
      ((((code - 65 + keyShift) % 26) + 26) % 26) + 65,
    );
  }
  if (code >= 97 && code <= 122) {
    // 小写
    return String.fromCharCode(
      ((((code - 97 + keyShift) % 26) + 26) % 26) + 97,
    );
  }
  return ch;
}

// 规范化密钥：仅保留字母并转大写
function normalizeKey(key) {
  return key.toUpperCase().replace(/[^A-Z]/g, "");
}

function encrypt(plaintext, key) {
  const normKey = normalizeKey(key);
  if (!normKey) throw new Error("密钥必须包含字母");
  let keyIdx = 0;
  let result = "";
  for (const ch of plaintext) {
    // 仅字母消耗密钥
    if (/[A-Za-z]/.test(ch)) {
      const shift = normKey.charCodeAt(keyIdx % normKey.length) - 65;
      result += shiftChar(ch, shift);
      keyIdx++;
    } else {
      result += ch;
    }
  }
  return result;
}

function decrypt(ciphertext, key) {
  const normKey = normalizeKey(key);
  if (!normKey) throw new Error("密钥必须包含字母");
  let keyIdx = 0;
  let result = "";
  for (const ch of ciphertext) {
    if (/[A-Za-z]/.test(ch)) {
      const shift = normKey.charCodeAt(keyIdx % normKey.length) - 65;
      result += shiftChar(ch, -shift);
      keyIdx++;
    } else {
      result += ch;
    }
  }
  return result;
}

// ===== 测试 =====
console.log("=== 手写简易维吉尼亚密码 ===");

const plain = "Attack at dawn!";
const key = "LEMON";

const cipher = encrypt(plain, key);
console.log("明文:", plain);
console.log("密钥:", key);
console.log("密文:", cipher);
// 预期: Lxfopv ef rnhr! (经典示例)

const decrypted = decrypt(cipher, key);
console.log("解密:", decrypted);
// 预期: Attack at dawn!

console.log("加解密一致:", decrypted === plain); // 预期: true

// 大小写混合 + 密钥含非字母
console.log("\n大小写混合测试:");
const c2 = encrypt("Hello World", "KeY 123");
console.log("密文:", c2);
console.log("解密:", decrypt(c2, "KeY 123")); // 预期: Hello World

// 中文等非字母原样保留
console.log("\n非字母保留:");
console.log(encrypt("中文 Hello", "ABC")); // 预期: 中文 Hfnlp
