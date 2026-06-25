/**
 * 手写 HMAC 生成
 *
 * 功能：实现 HMAC（Hash-based Message Authentication Code，RFC 2104）
 *       使用密钥对消息生成认证码，验证消息完整性与真实性
 *
 * 实现思路：
 *   1. 若密钥长度 > 块大小，先做一次哈希
 *   2. 密钥 padding 到块大小（B 字节）
 *   3. 计算 ipad = K ^ 0x36, opad = K ^ 0x5c
 *   4. HMAC = H(opad || H(ipad || message))
 *   5. 这里以 SHA-256 作为底层哈希（B=64），从同目录 sha256.js 借用算法
 *
 * 安全提示：常用于 API 签名、JWT 等，需配合恒定时间比较
 */

// 复用上一题的 SHA-256 实现（独立内置避免依赖文件加载）
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
];
const rotr = (x, n) => (x >>> n) | (x << (32 - n));
const add32 = (...xs) => xs.reduce((a, b) => (a + b) >>> 0, 0);
const Sigma0 = (x) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
const Sigma1 = (x) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
const sigma0 = (x) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
const sigma1 = (x) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
const Ch = (x, y, z) => (x & y) ^ (~x & z);
const Maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);

function sha256Bytes(inputBytes) {
  const bytes = inputBytes.slice();
  const origLen = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0x00);
  const bitLen = origLen * 8;
  const high = Math.floor(bitLen / 0x100000000);
  bytes.push(
    (high >>> 24) & 0xff,
    (high >>> 16) & 0xff,
    (high >>> 8) & 0xff,
    high & 0xff,
    (bitLen >>> 24) & 0xff,
    (bitLen >>> 16) & 0xff,
    (bitLen >>> 8) & 0xff,
    bitLen & 0xff,
  );
  let H = H0.slice();
  for (let off = 0; off < bytes.length; off += 64) {
    const W = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] =
        ((bytes[off + t * 4] << 24) |
          (bytes[off + t * 4 + 1] << 16) |
          (bytes[off + t * 4 + 2] << 8) |
          bytes[off + t * 4 + 3]) >>>
        0;
    }
    for (let t = 16; t < 64; t++)
      W[t] = add32(sigma1(W[t - 2]), W[t - 7], sigma0(W[t - 15]), W[t - 16]);
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const T1 = add32(h, Sigma1(e), Ch(e, f, g), K256[t], W[t]);
      const T2 = add32(Sigma0(a), Maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = add32(d, T1);
      d = c;
      c = b;
      b = a;
      a = add32(T1, T2);
    }
    for (let i = 0; i < 8; i++) H[i] = add32(H[i], [a, b, c, d, e, f, g, h][i]);
  }
  const out = [];
  for (const x of H) {
    out.push((x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff);
  }
  return out;
}

function bytesToHex(bytes) {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// HMAC-SHA256
const BLOCK_SIZE = 64; // SHA-256 块大小

function hmacSha256(key, message) {
  // 1. 规范化 key
  let keyBytes = Array.from(Buffer.from(String(key), "utf8"));
  if (keyBytes.length > BLOCK_SIZE) {
    keyBytes = sha256Bytes(keyBytes);
  }
  // padding 到 BLOCK_SIZE
  while (keyBytes.length < BLOCK_SIZE) keyBytes.push(0x00);

  // 2. 计算 ipad / opad
  const ipad = keyBytes.map((b) => b ^ 0x36);
  const opad = keyBytes.map((b) => b ^ 0x5c);

  // 3. inner = H(ipad || message)
  const msgBytes = Array.from(Buffer.from(String(message), "utf8"));
  const inner = sha256Bytes(ipad.concat(msgBytes));

  // 4. outer = H(opad || inner)
  const outer = sha256Bytes(opad.concat(inner));
  return bytesToHex(outer);
}

// 恒定时间比较
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length)
    return false;
  let result = 0;
  for (let i = 0; i < a.length; i++)
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// ===== 测试 =====
console.log("=== 手写 HMAC 生成 ===");

// RFC 4231 测试向量 (Test Case 1)
const key1 = "\x0b".repeat(20);
const data1 = "Hi There";
console.log('HMAC-SHA256(0x0b*20, "Hi There") =');
console.log("  ", hmacSha256(key1, data1));
// 预期: b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7

// RFC 4231 Test Case 2
console.log('HMAC-SHA256("Jefe", "what do ya want for nothing?") =');
console.log("  ", hmacSha256("Jefe", "what do ya want for nothing?"));
// 预期: 5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843

// 长密钥（>64 字节，触发先哈希）
const longKey = "a".repeat(100);
console.log("HMAC 长密钥长度:", hmacSha256(longKey, "msg").length, "hex 字符");
// 预期: 64 hex 字符

// 验证场景
const sig = hmacSha256("secret", "payload");
console.log("验证一致:", safeEqual(sig, hmacSha256("secret", "payload"))); // 预期: true
console.log("验证失败:", safeEqual(sig, hmacSha256("wrong", "payload"))); // 预期: false
console.log("篡改检测:", safeEqual(sig, hmacSha256("secret", "payload!"))); // 预期: false
