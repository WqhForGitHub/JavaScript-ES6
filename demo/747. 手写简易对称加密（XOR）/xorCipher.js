/**
 * 手写简易对称加密（XOR）
 *
 * 功能：使用异或（XOR）运算实现最简单的对称加密
 *       相同的 key 加密与解密（XOR 的可逆性：a ^ k ^ k = a）
 *
 * 实现思路：
 *   1. 将明文与密钥转换为字节序列
 *   2. 对每个字节做 key[i % keyLen] 的异或
 *   3. 输出为十六进制/base64 便于传输
 *
 * 安全性提示：XOR 加密本身极不安全，仅用于教学演示
 *             真实场景请使用 AES 等标准算法
 */

// 字符串 -> 字节数组（UTF-8）
function strToBytes(str) {
  return Array.from(Buffer.from(str, "utf8"));
}

// 字节数组 -> 字符串（UTF-8）
function bytesToStr(bytes) {
  return Buffer.from(bytes).toString("utf8");
}

// XOR 加密/解密核心（同一函数）
function xorBytes(data, key) {
  if (!key || key.length === 0) throw new Error("key 不能为空");
  const out = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  return out;
}

// 加密：返回十六进制字符串
function encrypt(plaintext, key) {
  const data = strToBytes(plaintext);
  const keyBytes = strToBytes(key);
  const cipher = xorBytes(data, keyBytes);
  return Buffer.from(cipher).toString("hex");
}

// 解密：从十六进制字符串还原
function decrypt(hexCipher, key) {
  const data = Array.from(Buffer.from(hexCipher, "hex"));
  const keyBytes = strToBytes(key);
  const plain = xorBytes(data, keyBytes);
  return bytesToStr(plain);
}

// ===== 测试 =====
console.log("=== 手写简易对称加密（XOR） ===");

const key = "secret";
const plain = "Hello, XOR 加密!";

const cipher = encrypt(plain, key);
console.log("明文:", plain);
console.log("密文(hex):", cipher);
// 预期: 一段十六进制字符串

const decrypted = decrypt(cipher, key);
console.log("解密:", decrypted);
// 预期: Hello, XOR 加密!

console.log("加解密一致:", decrypted === plain); // 预期: true

// 演示 XOR 的特性：相同字符异或结果规律
// 当 key 较短时，密文会暴露明文的模式（不安全）
console.log("\n短密钥的安全性演示:");
console.log("key=a, plain=AAAA ->", encrypt("AAAA", "a"));
// 预期: 60606060 (相同明文字节产生相同密文字节，模式暴露)

// 错误密钥无法正确解密
console.log("错误密钥解密:", decrypt(cipher, "wrong"));
// 预期: 乱码字符串
