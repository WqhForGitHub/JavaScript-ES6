/**
 * 手写数字签名验证（Web Crypto API）
 *
 * 功能：使用 Web Crypto API 完成 RSA-PSS / ECDSA 数字签名与验证
       验证消息的真实性、完整性与不可否认性
 *
 * 实现思路：
 *   1. crypto.subtle.generateKey 生成 RSA-PSS 密钥对（2048 位）
 *   2. crypto.subtle.sign 用私钥对消息摘要签名
 *   3. crypto.subtle.verify 用公钥验证签名
 *   4. 同时演示 SHA-256 摘要作为对比
 *
 * 运行环境：Node >= 15 或现代浏览器
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

const strToBuf = (s) => Buffer.from(s, "utf8");
const bufToB64 = (buf) => Buffer.from(new Uint8Array(buf)).toString("base64");
const b64ToBuf = (s) => Buffer.from(s, "base64");

// 1. 生成 RSA-PSS 密钥对
async function generateRsaKeyPair() {
  const subtle = getSubtle();
  return subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
}

// 2. 签名
async function signMessage(privateKey, message) {
  const subtle = getSubtle();
  const sig = await subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    strToBuf(message),
  );
  return bufToB64(sig);
}

// 3. 验证
async function verifySignature(publicKey, message, signatureB64) {
  const subtle = getSubtle();
  return subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    b64ToBuf(signatureB64),
    strToBuf(message),
  );
}

// 4. 导出/导入公钥（用于分发）
async function exportPublicKey(publicKey) {
  const subtle = getSubtle();
  const spki = await subtle.exportKey("spki", publicKey);
  return (
    "-----BEGIN PUBLIC KEY-----\n" +
    bufToB64(spki)
      .match(/.{1,64}/g)
      .join("\n") +
    "\n-----END PUBLIC KEY-----"
  );
}
async function importPublicKey(pem) {
  const subtle = getSubtle();
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  return subtle.importKey(
    "spki",
    b64ToBuf(b64),
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["verify"],
  );
}

// ===== 测试 =====
(async () => {
  console.log("=== 手写数字签名验证（Web Crypto API） ===");
  try {
    // 生成密钥对
    const { privateKey, publicKey } = await generateRsaKeyPair();
    console.log("RSA-PSS 2048 密钥对已生成");

    // 签名
    const message = "这是一份需要签名的合同，金额：¥1,000,000";
    const signature = await signMessage(privateKey, message);
    console.log("\n消息:", message);
    console.log("签名(base64, 前 60 字符):", signature.slice(0, 60) + "...");
    console.log("签名长度:", b64ToBuf(signature).length, "字节 (预期 256)");

    // 验证 - 正确消息
    const valid = await verifySignature(publicKey, message, signature);
    console.log("\n正确消息验证:", valid); // 预期: true

    // 验证 - 篡改消息
    const tampered = await verifySignature(publicKey, message + "!", signature);
    console.log("篡改消息验证:", tampered); // 预期: false

    // 验证 - 错误签名
    const badSig = signature.slice(0, -4) + "AAAA";
    const badResult = await verifySignature(publicKey, message, badSig);
    console.log("错误签名验证:", badResult); // 预期: false

    // 公钥导出/导入
    const pem = await exportPublicKey(publicKey);
    console.log("\n导出的公钥 PEM:");
    console.log(pem);
    const importedPub = await importPublicKey(pem);
    const reVerified = await verifySignature(importedPub, message, signature);
    console.log("导入公钥后验证:", reVerified); // 预期: true
  } catch (e) {
    console.log("当前环境不支持 Web Crypto API:", e.message);
  }
})();
