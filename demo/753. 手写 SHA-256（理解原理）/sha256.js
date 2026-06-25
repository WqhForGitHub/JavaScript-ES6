/**
 * 手写 SHA-256（理解原理）
 *
 * 功能：实现 SHA-256 摘要算法（FIPS 180-4）
 *       输出 256 位（64 个十六进制字符）的指纹
 *
 * 实现思路：
 *   1. 按 512 位（64 字节）分组处理
 *   2. 每个分组扩展为 64 个 32 位字 W[0..63]
 *   3. 64 轮压缩运算，使用 8 个工作变量 a..h
 *   4. padding：0x80 + 0x00... + 64 位大端长度
 *   5. 输出大端字节序列
 */

// 常量：前 32 个素数的立方根小数部分 * 2^32
const K = [
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

// 初始哈希值：前 8 个素数的平方根小数部分 * 2^32
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
];

// 32 位操作（使用 >>> 强制无符号）
const rotr = (x, n) => (x >>> n) | (x << (32 - n));
const add32 = (...xs) => xs.reduce((a, b) => (a + b) >>> 0, 0);

// SHA-256 使用的逻辑函数
const Sigma0 = (x) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
const Sigma1 = (x) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
const sigma0 = (x) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
const sigma1 = (x) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
const Ch = (x, y, z) => (x & y) ^ (~x & z);
const Maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);

function sha256(message) {
  const bytes = Array.from(Buffer.from(message, "utf8"));
  const origLen = bytes.length;

  // padding
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0x00);
  // 64 位大端长度（位）
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
    // 准备 W[0..63]
    const W = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] =
        (bytes[off + t * 4] << 24) |
        (bytes[off + t * 4 + 1] << 16) |
        (bytes[off + t * 4 + 2] << 8) |
        bytes[off + t * 4 + 3];
      W[t] >>>= 0;
    }
    for (let t = 16; t < 64; t++) {
      W[t] = add32(sigma1(W[t - 2]), W[t - 7], sigma0(W[t - 15]), W[t - 16]);
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let t = 0; t < 64; t++) {
      const T1 = add32(h, Sigma1(e), Ch(e, f, g), K[t], W[t]);
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

    H[0] = add32(H[0], a);
    H[1] = add32(H[1], b);
    H[2] = add32(H[2], c);
    H[3] = add32(H[3], d);
    H[4] = add32(H[4], e);
    H[5] = add32(H[5], f);
    H[6] = add32(H[6], g);
    H[7] = add32(H[7], h);
  }

  // 输出大端十六进制
  return H.map((x) => x.toString(16).padStart(8, "0")).join("");
}

// ===== 测试 =====
console.log("=== 手写 SHA-256（理解原理） ===");

console.log('sha256("")      =', sha256(""));
// 预期: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

console.log('sha256("abc")   =', sha256("abc"));
// 预期: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

console.log('sha256("message digest") =', sha256("message digest"));
// 预期: f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650

console.log('sha256("The quick brown fox jumps over the lazy dog") =');
console.log("  ", sha256("The quick brown fox jumps over the lazy dog"));
// 预期: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592

// 长字符串测试（跨分组）
const longText = "a".repeat(56); // 触发 padding 边界
console.log('sha256("a"*56)  =', sha256(longText));
// 预期: 与标准库一致
