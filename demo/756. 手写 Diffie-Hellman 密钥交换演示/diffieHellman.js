/**
 * 手写 Diffie-Hellman 密钥交换演示
 *
 * 功能：演示 Diffie-Hellman 密钥交换协议
 *       两方在公开信道协商出共享密钥，第三方无法推算
 *
 * 实现原理：
 *   1. 公开参数：大素数 p 与原根 g
 *   2. Alice 选私钥 a，公钥 A = g^a mod p
 *   3. Bob   选私钥 b，公钥 B = g^b mod p
 *   4. 双方交换公钥，分别计算
 *        Alice: s = B^a mod p
 *        Bob:   s = A^b mod p
 *   5. 由于 (g^b)^a = (g^a)^b = g^(ab) mod p，双方得到相同 s
 *
 * 安全性基于离散对数难题（已知 g, p, g^x mod p 求 x 困难）
 * 此处用小素数演示，生产环境需 2048+ 位
 */

// 模幂（BigInt）
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

// 检测是否为素数（小素数演示用）
function isPrime(n) {
  n = BigInt(n);
  if (n < 2n) return false;
  for (let i = 2n; i * i <= n; i++) {
    if (n % i === 0n) return false;
  }
  return true;
}

// 寻找原根（模 p 的最小原根，演示用）
function findPrimitiveRoot(p) {
  p = BigInt(p);
  if (!isPrime(p)) throw new Error("p 必须为素数");
  const phi = p - 1n;
  // 列出 phi 的所有素因子
  const factors = [];
  let n = phi;
  for (let i = 2n; i * i <= n; i++) {
    if (n % i === 0n) {
      factors.push(i);
      while (n % i === 0n) n /= i;
    }
  }
  if (n > 1n) factors.push(n);
  // 测试每个 g
  for (let g = 2n; g < p; g++) {
    let ok = true;
    for (const f of factors) {
      if (modPow(g, phi / f, p) === 1n) {
        ok = false;
        break;
      }
    }
    if (ok) return g.toString();
  }
  throw new Error("未找到原根");
}

// 一方参与者
class DHParty {
  constructor(name, p, g) {
    this.name = name;
    this.p = BigInt(p);
    this.g = BigInt(g);
    // 随机私钥（演示用小随机数）
    this.privateKey = BigInt(Math.floor(Math.random() * 1000) + 2);
    // 公钥 A = g^a mod p
    this.publicKey = modPow(this.g, this.privateKey, this.p);
  }
  // 接收对方公钥，计算共享密钥
  computeSharedSecret(otherPub) {
    this.sharedSecret = modPow(BigInt(otherPub), this.privateKey, this.p);
    return this.sharedSecret.toString();
  }
}

// ===== 测试 =====
console.log("=== 手写 Diffie-Hellman 密钥交换演示 ===");

// 公开参数：经典教学用 p=23, g=5
const p = 23;
const g = 5;
console.log(`公开参数: p=${p}, g=${g}`);
console.log(`g 是否为 p 的原根: ${findPrimitiveRoot(p) === String(g)}`);

// 模拟固定私钥便于核对（实际应随机）
// Alice: a=6, Bob: b=15
const alice = new DHParty("Alice", p, g);
alice.privateKey = 6n;
alice.publicKey = modPow(g, 6, p);

const bob = new DHParty("Bob", p, g);
bob.privateKey = 15n;
bob.publicKey = modPow(g, 15, p);

console.log(`\nAlice 私钥 a=${alice.privateKey}, 公钥 A=${alice.publicKey}`);
// 预期: A = 5^6 mod 23 = 8
console.log(`Bob   私钥 b=${bob.privateKey}, 公钥 B=${bob.publicKey}`);
// 预期: B = 5^15 mod 23 = 19

// 交换公钥并计算共享密钥
const aliceSecret = alice.computeSharedSecret(bob.publicKey);
const bobSecret = bob.computeSharedSecret(alice.publicKey);

console.log(`\nAlice 计算共享密钥: s = B^a mod p = ${aliceSecret}`);
console.log(`Bob   计算共享密钥: s = A^b mod p = ${bobSecret}`);
console.log(`\n共享密钥一致: ${aliceSecret === bobSecret}`); // 预期: true
// 预期: 共享密钥 = 5^(6*15) mod 23 = 2

// 攻击者视角：仅知 p, g, A, B，无法直接计算 s（需解离散对数）
console.log(
  "\n攻击者仅知 p, g, A, B，需解离散对数 a = log_g(A) mod p 才能获得 s",
);
console.log("大素数下该问题计算上不可行");
