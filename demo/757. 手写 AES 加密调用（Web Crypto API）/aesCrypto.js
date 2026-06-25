/**
 * 手写 AES 加密调用（Web Crypto API）
 *
 * 功能：使用浏览器/Node 的 Web Crypto API 进行 AES-GCM 加密解密
 *       提供密钥生成、加密、解密、密钥导出/导入完整流程
 *
 * 实现思路：
 *   1. crypto.subtle.generateKey 生成 AES-GCM 256 位密钥
 *   2. crypto.getRandomValues 生成 12 字节 IV（GCM 推荐 96 位）
 *   3. crypto.subtle.encrypt 加密，输出包含认证标签的密文
 *   4. crypto.subtle.decrypt 解密并验证认证标签
 *   5. crypto.subtle.exportKey/importKey 实现密钥持久化
 *
 * 运行环境：Node >= 15 或现代浏览器（需支持 crypto.subtle 全局）
 *          Node 中通过 globalThis.crypto 或 require('crypto').webcrypto
 */

// 兼容获取 subtle
function getSubtle() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    globalThis.crypto.subtle
  ) {
    return globalThis.crypto.subtle;
  }
  // Node 15+
  try {
    return require("crypto").webcrypto.subtle;
  } catch (e) {
    throw new Error("当前环境不支持 Web Crypto API");
  }
}

function getRandomValues(arr) {
  if (globalThis.crypto && globalThis.crypto.getRandomValues) {
    return globalThis.crypto.getRandomValues(arr);
  }
  return require("crypto").webcrypto.getRandomValues(arr);
}

// 工具：Buffer 与 base64 转换
function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  return Buffer.from(bytes).toString("base64");
}
function b64ToBuf(b64) {
  return Buffer.from(b64, "base64");
}
function strToBuf(str) {
  return Buffer.from(str, "utf8");
}
function bufToStr(buf) {
  return Buffer.from(new Uint8Array(buf)).toString("utf8");
}

// 1. 生成 AES-GCM 密钥（256 位）
async function generateAesKey(extractable = true) {
  const subtle = getSubtle();
  return subtle.generateKey({ name: "AES-GCM", length: 256 }, extractable, [
    "encrypt",
    "decrypt",
  ]);
}

// 2. 加密
async function aesEncrypt(key, plaintext, additionalData = null) {
  const iv = getRandomValues(new Uint8Array(12)); // 96 位 IV
  const subtle = getSubtle();
  const params = { name: "AES-GCM", iv };
  if (additionalData) params.additionalData = strToBuf(additionalData);
  const cipherBuf = await subtle.encrypt(params, key, strToBuf(plaintext));
  return { cipher: bufToB64(cipherBuf), iv: bufToB64(iv) };
}

// 3. 解密
async function aesDecrypt(key, payload, additionalData = null) {
  const subtle = getSubtle();
  const params = { name: "AES-GCM", iv: b64ToBuf(payload.iv) };
  if (additionalData) params.additionalData = strToBuf(additionalData);
  const plainBuf = await subtle.decrypt(params, key, b64ToBuf(payload.cipher));
  return bufToStr(plainBuf);
}

// 4. 导出/导入密钥（用于持久化）
async function exportKey(key) {
  const subtle = getSubtle();
  const raw = await subtle.exportKey("raw", key);
  return bufToB64(raw);
}
async function importKey(b64Key) {
  const subtle = getSubtle();
  return subtle.importKey("raw", b64ToBuf(b64Key), { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

// ===== 测试 =====
(async () => {
  console.log("=== 手写 AES 加密调用（Web Crypto API） ===");

  try {
    // 生成密钥
    const key = await generateAesKey();
    const rawKey = await exportKey(key);
    console.log("AES-256 密钥(base64):", rawKey);
    console.log("密钥长度:", b64ToBuf(rawKey).length, "字节"); // 预期: 32 字节

    // 加密
    const plain = "Hello, AES-GCM 加密! 这是一段秘密消息。";
    const payload = await aesEncrypt(key, plain);
    console.log("\n明文:", plain);
    console.log("IV(base64):", payload.iv);
    console.log("密文(base64):", payload.cipher);

    // 解密
    const decrypted = await aesDecrypt(key, payload);
    console.log("解密:", decrypted);
    console.log("加解密一致:", decrypted === plain); // 预期: true

    // 通过导入的密钥也能解密
    const importedKey = await importKey(rawKey);
    const decrypted2 = await aesDecrypt(importedKey, payload);
    console.log("导入密钥解密一致:", decrypted2 === plain); // 预期: true

    // 关联数据（AAD）测试
    const aadPayload = await aesEncrypt(key, "secret", "user-id-123");
    console.log("\n带 AAD 加密成功");
    const aadOk = await aesDecrypt(key, aadPayload, "user-id-123").catch(
      () => null,
    );
    const aadFail = await aesDecrypt(key, aadPayload, "wrong-user").catch(
      () => null,
    );
    console.log("正确 AAD 解密:", aadOk === "secret"); // 预期: true
    console.log("错误 AAD 解密失败:", aadFail === null); // 预期: true

    // 篡改密文应失败
    const tampered = {
      cipher: payload.cipher.slice(0, -2) + "AA",
      iv: payload.iv,
    };
    const tamperedResult = await aesDecrypt(key, tampered).catch(() => null);
    console.log("篡改密文解密失败:", tamperedResult === null); // 预期: true
  } catch (e) {
    console.log("当前环境不支持 Web Crypto API:", e.message);
    console.log("请在 Node >= 15 或现代浏览器中运行");
  }
})();
