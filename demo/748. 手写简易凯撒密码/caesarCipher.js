/**
 * 手写简易凯撒密码
 *
 * 功能：实现凯撒密码（Caesar Cipher），对字母做固定位移的替换
 *       历史上由古罗马凯撒使用，位移通常为 3
 *
 * 实现思路：
 *   1. 对每个字母按 shift 位移，绕回字母表（mod 26）
 *   2. 保留大小写，非字母字符原样保留
 *   3. 加密用 +shift，解密用 -shift（或 26-shift）
 */

function caesarShift(ch, shift) {
  const code = ch.charCodeAt(0);
  // 大写 A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((((code - 65 + shift) % 26) + 26) % 26) + 65);
  }
  // 小写 a-z
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((((code - 97 + shift) % 26) + 26) % 26) + 97);
  }
  return ch;
}

function encrypt(plaintext, shift = 3) {
  return [...plaintext].map((ch) => caesarShift(ch, shift)).join("");
}

function decrypt(ciphertext, shift = 3) {
  return encrypt(ciphertext, -shift);
}

// 暴力破解：列出所有 25 种可能的位移
function bruteForce(ciphertext) {
  const results = [];
  for (let s = 1; s < 26; s++) {
    results.push({ shift: s, text: decrypt(ciphertext, s) });
  }
  return results;
}

// ===== 测试 =====
console.log("=== 手写简易凯撒密码 ===");

const plain = "Hello, World! CAESAR";
const shift = 3;

const cipher = encrypt(plain, shift);
console.log("明文:", plain);
console.log("密文 (shift=3):", cipher);
// 预期: Khoor, Zruog! FDHVDU

const decrypted = decrypt(cipher, shift);
console.log("解密:", decrypted);
// 预期: Hello, World! CAESAR

console.log("加解密一致:", decrypted === plain); // 预期: true

// 不同位移
console.log("shift=13 (ROT13):", encrypt("Hello", 13)); // 预期: Uryyb
console.log("ROT13 自反:", encrypt(encrypt("Hello", 13), 13)); // 预期: Hello

// 处理负位移与大于 26 的位移
console.log(
  "shift=29 等价于 shift=3:",
  encrypt("ABC", 29) === encrypt("ABC", 3),
); // 预期: true

// 暴力破解演示
console.log('\n暴力破解 "Khoor":');
bruteForce("Khoor")
  .slice(0, 5)
  .forEach((r) => console.log(`  shift=${r.shift}: ${r.text}`));
// 预期: shift=3 时为 "Hello"
