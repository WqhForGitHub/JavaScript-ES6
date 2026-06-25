/**
 * 手写密码哈希生成（PBKDF2）
 *
 * 功能：使用 PBKDF2（Password-Based Key Derivation Function 2, RFC 2898）
 *       从用户密码派生密钥，配合 salt 抵抗彩虹表与暴力破解
 *
 * 实现思路：
 *   1. Web Crypto API 的 crypto.subtle.deriveBits 实现
 *   2. 流程：生成随机 salt -> importKey(password) -> deriveBits -> 存储 salt+hash
 *   3. 验证：用相同 salt 派生，恒定时间比较
 *   4. 推荐参数：iterations >= 100000，hash=SHA-256/512，输出 >= 256 位
 *
 * 安全提示：PBKDF2 已不如 argon2/bcrypt 抗 GPU 破解，但兼容性最好
 */

function getSubtle() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    globalThis.crypto.subtle
  ) {
    return globalThis.crypto.subtle;
  }
  try {
    return require("crypto").webcrypto.subtle;
  } catch (e) {
    throw new Error("当前环境不支持 Web Crypto API");
  }
}
function getRandomValues(arr) {
  if (globalThis.crypto && globalThis.crypto.getRandomValues)
    return globalThis.crypto.getRandomValues(arr);
  return require("crypto").webcrypto.getRandomValues(arr);
}

const strToBuf = (s) => Buffer.from(s, "utf8");
const bufToB64 = (b) => Buffer.from(new Uint8Array(b)).toString("base64");
const b64ToBuf = (s) => Buffer.from(s, "base64");

// 生成随机 salt
function generateSalt(byteLen = 16) {
  return getRandomValues(new Uint8Array(byteLen));
}

// 主派生函数：返回 base64 编码的派生密钥
async function pbkdf2Derive(
  password,
  saltB64,
  iterations = 100000,
  keyLenBits = 256,
) {
  const subtle = getSubtle();
  const salt = typeof saltB64 === "string" ? b64ToBuf(saltB64) : saltB64;

  // 1. 将密码作为原始密钥导入
  const baseKey = await subtle.importKey(
    "raw",
    strToBuf(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  // 2. 派生比特
  const params = {
    name: "PBKDF2",
    salt,
    iterations,
    hash: "SHA-256",
  };
  const bits = await subtle.deriveBits(params, baseKey, keyLenBits);
  return bufToB64(bits);
}

// 完整的「哈希密码」流程：生成 salt + 派生
async function hashPassword(password, iterations = 100000) {
  const salt = generateSalt(16);
  const hash = await pbkdf2Derive(password, salt, iterations, 256);
  // 存储格式：pbkdf2$iterations$saltB64$hashB64
  return `pbkdf2$${iterations}$${bufToB64(salt)}$${hash}`;
}

// 验证密码
async function verifyPassword(password, stored) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const expectedHash = parts[3];

  const actualHash = await pbkdf2Derive(password, salt, iterations, 256);

  // 恒定时间比较
  if (actualHash.length !== expectedHash.length) return false;
  const a = Buffer.from(actualHash, "base64");
  const b = Buffer.from(expectedHash, "base64");
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ===== 测试 =====
(async () => {
  console.log("=== 手写密码哈希生成（PBKDF2） ===");
  try {
    const password = "MySecretPass123!";

    // 1. 生成密码哈希
    console.log("原始密码:", password);
    const hashed = await hashPassword(password, 100000);
    console.log("存储格式:", hashed);
    // 预期: pbkdf2$100000$<salt-base64>$<hash-base64>

    // 2. 验证正确密码
    const ok = await verifyPassword(password, hashed);
    console.log("\n正确密码验证:", ok); // 预期: true

    // 3. 验证错误密码
    const wrong = await verifyPassword("wrongpass", hashed);
    console.log("错误密码验证:", wrong); // 预期: false

    // 4. 相同密码每次哈希结果不同（salt 随机）
    const hashed2 = await hashPassword(password, 100000);
    console.log("\n两次哈希结果不同（salt 随机）:", hashed !== hashed2); // 预期: true
    console.log("但都能验证通过:", await verifyPassword(password, hashed2)); // 预期: true

    // 5. 迭代次数影响耗时
    const t1 = Date.now();
    await hashPassword(password, 10000);
    const t2 = Date.now();
    await hashPassword(password, 200000);
    const t3 = Date.now();
    console.log(`\n10000 次迭代耗时: ${t2 - t1}ms`);
    console.log(`200000 次迭代耗时: ${t3 - t2}ms (更高迭代数 = 更抗暴力破解)`);

    // 6. 派生密钥长度可调
    const key512 = await pbkdf2Derive(password, generateSalt(), 50000, 512);
    console.log("\n512 位派生密钥长度:", b64ToBuf(key512).length, "字节"); // 预期: 64 字节
  } catch (e) {
    console.log("当前环境不支持 Web Crypto API:", e.message);
  }
})();
