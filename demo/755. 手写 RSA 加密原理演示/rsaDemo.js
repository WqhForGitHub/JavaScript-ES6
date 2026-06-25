/**
 * 手写 RSA 加密原理演示
 *
 * 功能：用小素数演示 RSA 公钥加密算法的完整流程
 *       仅供理解原理，真实场景需用大素数（2048+ 位）与标准库
 *
 * 实现思路：
 *   1. 选两个素数 p, q，计算 n = p * q
 *   2. 欧拉函数 φ(n) = (p-1)(q-1)
 *   3. 选 e 满足 1 < e < φ(n) 且 gcd(e, φ(n)) = 1
 *   4. 计算 d = e^(-1) mod φ(n) （模反元素，用扩展欧几里得）
 *   5. 公钥 (e, n)，私钥 (d, n)
 *   6. 加密: c = m^e mod n；解密: m = c^d mod n
 *   7. 签名: s = m^d mod n；验签: m = s^e mod n
 *
 * 限制：JS Number 只能精确表示 2^53 以内的整数，故仅用小数据演示
 */

// 模幂运算（避免溢出，使用 BigInt）
function modPow(base, exp, mod) {
  base = BigInt(base);
  exp = BigInt(exp);
  mod = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

// 最大公约数
function gcd(a, b) {
  a = BigInt(a);
  b = BigInt(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// 扩展欧几里得算法求模反元素 d = e^(-1) mod φ
function modInverse(e, phi) {
  e = BigInt(e);
  phi = BigInt(phi);
  let [oldR, r] = [e, phi];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error("模反元素不存在");
  return ((oldS % phi) + phi) % phi;
}

// 生成密钥对
function generateKeyPair(p, q, e) {
  p = BigInt(p);
  q = BigInt(q);
  e = BigInt(e);
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  if (gcd(e, phi) !== 1n) throw new Error("e 与 φ(n) 不互素");
  const d = modInverse(e, phi);
  return {
    publicKey: { e: e.toString(), n: n.toString() },
    privateKey: { d: d.toString(), n: n.toString() },
    n: n.toString(),
    phi: phi.toString(),
  };
}

// 加密单个数值
function encryptInt(m, pub) {
  const c = modPow(BigInt(m), BigInt(pub.e), BigInt(pub.n));
  return c.toString();
}

// 解密单个数值
function decryptInt(c, priv) {
  const m = modPow(BigInt(c), BigInt(priv.d), BigInt(priv.n));
  return m.toString();
}

// 字符串加解密（逐字符）
function encryptStr(plain, pub) {
  return [...plain].map((ch) => encryptInt(ch.codePointAt(0), pub)).join(",");
}
function decryptStr(cipher, priv) {
  return cipher
    .split(",")
    .map((c) => String.fromCodePoint(Number(decryptInt(c, priv))))
    .join("");
}

// 签名/验签
function signInt(m, priv) {
  return modPow(BigInt(m), BigInt(priv.d), BigInt(priv.n)).toString();
}
function verifyInt(s, pub) {
  return modPow(BigInt(s), BigInt(pub.e), BigInt(pub.n)).toString();
}

// ===== 测试 =====
console.log("=== 手写 RSA 加密原理演示 ===");

// 经典教学示例：p=61, q=53, e=17
const { publicKey, privateKey, n, phi } = generateKeyPair(61, 53, 17);
console.log("n =", n, "(预期 3233)");
console.log("φ(n) =", phi, "(预期 3120)");
console.log("公钥 (e, n) =", `(${publicKey.e}, ${publicKey.n})`);
console.log("私钥 (d, n) =", `(${privateKey.d}, ${privateKey.n})`);
// 预期: d = 2753

// 数值加解密
const m = 65; // 'A'
const c = encryptInt(m, publicKey);
console.log(`\n加密 m=${m} -> c=${c}`);
// 预期: c = 2790
console.log(`解密 c=${c} -> m=${decryptInt(c, privateKey)}`); // 预期: 65

// 字符串加解密
const plain = "HELLO";
const cipher = encryptStr(plain, publicKey);
console.log(`\n加密字符串 "${plain}":`);
console.log("密文:", cipher);
console.log("解密:", decryptStr(cipher, privateKey)); // 预期: HELLO

// 签名与验签
const msg = 123;
const sig = signInt(msg, privateKey);
console.log(`\n签名 m=${msg} -> s=${sig}`);
console.log(`验签 s=${sig} -> m=${verifyInt(sig, publicKey)}`); // 预期: 123
console.log("验签一致:", verifyInt(sig, publicKey) === String(msg)); // 预期: true
