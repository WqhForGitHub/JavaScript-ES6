/**
 * 手写 MD5（简易版）
 *
 * 功能：实现 MD5 消息摘要算法（Ronald Rivest, 1992）
 *       输出 128 位（32 个十六进制字符）的指纹
 *
 * 实现思路：
 *   1. 按 512 位（64 字节）分组处理，每组做 4 轮共 64 次运算
 *   2. 每轮使用不同的非线性函数 F/G/H/I
 *   3. 使用预计算的正弦表 K 与左移量表 S
 *   4. 添加 padding：0x80 + 0x00... + 64 位小端长度
 *
 * 安全提示：MD5 已不再具备抗碰撞能力，仅用于教学与校验和非安全场景
 */

// 32 位无符号循环左移
function rotl(x, c) {
  return (x << c) | (x >>> (32 - c));
}

// 加法取模 2^32
function add32(...xs) {
  let sum = 0;
  for (const x of xs) sum = (sum + x) >>> 0;
  return sum;
}

// 预计算 K 表（floor(2^32 * |sin(i)|), i=1..64）
const K = [];
for (let i = 1; i <= 64; i++) {
  K.push(Math.floor(Math.abs(Math.sin(i)) * 0x100000000) >>> 0);
}

// 每轮左移量
const S = [
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22, // F
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20, // G
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23, // H
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21, // I
];

// 4 个非线性函数
const F = (x, y, z) => (x & y) | (~x & z);
const G = (x, y, z) => (x & z) | (y & ~z);
const H = (x, y, z) => x ^ y ^ z;
const I = (x, y, z) => y ^ (x | ~z);

function md5(message) {
  // 初始化向量 A B C D
  let a0 = 0x67452301,
    b0 = 0xefcdab89,
    c0 = 0x98badcfe,
    d0 = 0x10325476;

  // 转 byte 数组（UTF-8）
  const bytes = Array.from(Buffer.from(message, "utf8"));
  const origLen = bytes.length;

  // padding
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0x00);
  // 64 位小端长度（位）
  const bitLen = origLen * 8;
  // 低 32 位
  bytes.push(
    bitLen & 0xff,
    (bitLen >>> 8) & 0xff,
    (bitLen >>> 16) & 0xff,
    (bitLen >>> 24) & 0xff,
  );
  // 高 32 位（JS 中超过 2^32 的长度需处理，这里假设 < 2^32 字节）
  const high = Math.floor(bitLen / 0x100000000);
  bytes.push(
    high & 0xff,
    (high >>> 8) & 0xff,
    (high >>> 16) & 0xff,
    (high >>> 24) & 0xff,
  );

  // 每个分组 512 位
  for (let off = 0; off < bytes.length; off += 64) {
    // 16 个 32 位小端字
    const M = [];
    for (let j = 0; j < 16; j++) {
      M.push(
        bytes[off + j * 4] |
          (bytes[off + j * 4 + 1] << 8) |
          (bytes[off + j * 4 + 2] << 16) |
          (bytes[off + j * 4 + 3] << 24),
      );
    }

    let A = a0,
      B = b0,
      C = c0,
      D = d0;

    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = F(B, C, D);
        g = i;
      } else if (i < 32) {
        f = G(B, C, D);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = H(B, C, D);
        g = (3 * i + 5) % 16;
      } else {
        f = I(B, C, D);
        g = (7 * i) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      B = add32(B, rotl(add32(A, f, K[i], M[g]) >>> 0, S[i]));
      A = temp;
    }

    a0 = add32(a0, A);
    b0 = add32(b0, B);
    c0 = add32(c0, C);
    d0 = add32(d0, D);
  }

  // 输出小端十六进制
  const toHex = (x) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += ((x >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return s;
  };
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

// ===== 测试 =====
console.log("=== 手写 MD5（简易版） ===");

console.log('md5("")      =', md5(""));
// 预期: d41d8cd98f00b204e9800998ecf8427e

console.log('md5("a")     =', md5("a"));
// 预期: 0cc175b9c0f1b6a831c399e269772661

console.log('md5("abc")   =', md5("abc"));
// 预期: 900150983cd24fb0d6963f7d28e17f72

console.log('md5("message digest") =', md5("message digest"));
// 预期: f96b697d7cb7938d525a2f31aaf161d0

console.log('md5("The quick brown fox jumps over the lazy dog") =');
console.log("  ", md5("The quick brown fox jumps over the lazy dog"));
// 预期: 9e107d9d372bb6826bd81d3542a419d6

// 中文测试
console.log('md5("中文") =', md5("中文"));
// 预期: a7bac2239fcdcb3a067903d8077c4a7b
