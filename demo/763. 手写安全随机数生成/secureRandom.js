/**
 * 手写安全随机数生成
 *
 * 功能：提供密码学安全的随机数生成函数
 *       取代 Math.random() 用于 token、密钥、salt 等安全场景
 *
 * 实现思路：
 *   1. Node 端使用 crypto.randomBytes / crypto.randomInt / crypto.randomFillSync
 *   2. 浏览器端使用 crypto.getRandomValues
 *   3. 提供整数、浮点、字节、hex/base64、指定字符集字符串等多种接口
 *   4. 关键：避免模偏置（modulo bias），用 rejection sampling
 */

const crypto = require("crypto");

// === 基础：随机字节 ===
function randomBytes(len) {
  return crypto.randomBytes(len);
}

// === 安全随机整数 [min, max]（无模偏置） ===
function randomInt(min, max) {
  // crypto.randomInt 的 max 是 exclusive
  if (max === undefined) {
    max = min;
    min = 0;
  }
  if (min > max) throw new Error("min 不能大于 max");
  return crypto.randomInt(min, max + 1); // 含 max
}

// === 安全随机浮点 [0, 1) ===
function randomFloat() {
  // 用 53 位随机数构造，精度等同于 Math.random
  const bytes = crypto.randomBytes(7);
  // 取 53 位作为尾数
  const val = (bytes.readUIntBE(0, 7) >>> 0) / 0x100000000000000;
  // 修正：用更直接的方式
  const high = crypto.randomInt(0, 0x100000000) / 0x100000000;
  const low = crypto.randomInt(0, 0x100000000) / 0x100000000 / 0x100000000;
  return (high + low) % 1;
}

// === 从字符集随机选取（无模偏置） ===
function randomString(length, charset) {
  charset =
    charset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const result = [];
  const charsetLen = charset.length;
  // rejection sampling 避免模偏置
  const maxValid = Math.floor(0x100 / charsetLen) * charsetLen - 1;
  const bytes = crypto.randomBytes(length * 2); // 多取一些以备拒绝
  let bi = 0;
  while (result.length < length) {
    if (bi >= bytes.length) {
      // 字节不够再生成
      bytes.set(crypto.randomBytes(bytes.length), 0);
      bi = 0;
    }
    const b = bytes[bi++];
    if (b > maxValid) continue;
    result.push(charset[b % charsetLen]);
  }
  return result.join("");
}

// === 随机 hex 字符串 ===
function randomHex(len) {
  return crypto.randomBytes(len).toString("hex");
}

// === 随机 base64/base64url ===
function randomBase64(len, urlSafe = false) {
  const b64 = crypto
    .randomBytes(len)
    .toString(urlSafe ? "base64url" : "base64");
  return b64;
}

// === 随机 UUID v4 ===
function randomUuid() {
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// === 随机布尔值 ===
function randomBool() {
  return crypto.randomBytes(1)[0] < 128;
}

// === 数组随机洗牌（Fisher-Yates，安全随机源） ===
function secureShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// === 从数组中随机选取一个元素 ===
function randomChoice(arr) {
  if (!arr.length) return undefined;
  return arr[randomInt(0, arr.length - 1)];
}

// ===== 测试 =====
console.log("=== 手写安全随机数生成 ===");

console.log("randomBytes(8):", randomBytes(8).toString("hex")); // 预期: 16 位 hex
console.log("randomInt(1, 100):", randomInt(1, 100)); // 预期: 1-100 含两端
console.log("randomFloat():", randomFloat()); // 预期: 0~1
console.log("randomString(16):", randomString(16)); // 预期: 16 字符
console.log("randomHex(8):", randomHex(8)); // 预期: 16 hex 字符
console.log("randomBase64(12):", randomBase64(12)); // 预期: 16 字符 base64
console.log("randomBase64url(12, true):", randomBase64(12, true)); // 预期: 无 + / =
console.log("randomUuid():", randomUuid()); // 预期: UUID v4 格式
console.log("randomBool():", randomBool()); // 预期: true/false
console.log(
  "secureShuffle([1..10]):",
  secureShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
);
console.log('randomChoice(["a","b","c"]):', randomChoice(["a", "b", "c"]));

// 自定义字符集（如仅数字 PIN 码）
console.log("\n6 位 PIN:", randomString(6, "0123456789"));
// 自定义字符集（仅小写）
console.log("8 位小写:", randomString(8, "abcdefghijklmnopqrstuvwxyz"));

// 统计分布测试（验证无偏置）
console.log("\n分布测试 (randomInt 0-9 各 10000 次):");
const dist = new Array(10).fill(0);
for (let i = 0; i < 10000; i++) dist[randomInt(0, 9)]++;
console.log(dist.map((c, i) => `${i}:${c}`).join(" "));
// 预期: 各数字大致均匀 1000 左右

// 与 Math.random 对比安全性
console.log("\n安全提示：Math.random 非密码学安全，不应生成 token/密钥");
console.log("Math.random:", Math.random(), "(仅演示，勿用于安全场景)");
