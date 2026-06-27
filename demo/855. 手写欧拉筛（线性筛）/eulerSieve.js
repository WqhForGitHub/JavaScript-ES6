/**
 * 手写欧拉筛（线性筛）
 * 核心思想：每个合数只被它的「最小质因子」筛掉一次，因此总时间复杂度为 O(n)。
 * 做法：
 *   从 2 到 n 枚举 i：
 *     若 i 未被标记，则 i 是素数，加入素数列表。
 *     对每个已记录的素数 p（按从小到大）：
 *       - 若 p * i > n，跳出；
 *       - 标记 isPrime[p * i] = false；
 *       - 若 i % p === 0，则 p 是 i 的最小质因子，break（保证每个合数只被最小质因子筛一次）。
 */

function eulerSieve(n) {
  if (n < 2) return [];
  const isPrime = new Array(n + 1).fill(true);
  const primes = [];
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
    for (let j = 0; j < primes.length; j++) {
      const p = primes[j];
      const m = p * i;
      if (m > n) break;
      isPrime[m] = false;
      if (i % p === 0) break; // 关键：保证线性复杂度
    }
  }
  return primes;
}

// 同时返回素数列表与标记数组
function eulerSieveFull(n) {
  if (n < 2)
    return { primes: [], isPrime: new Array(Math.max(n + 1, 0)).fill(false) };
  const isPrime = new Array(n + 1).fill(true);
  const primes = [];
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
    for (let j = 0; j < primes.length; j++) {
      const p = primes[j];
      const m = p * i;
      if (m > n) break;
      isPrime[m] = false;
      if (i % p === 0) break;
    }
  }
  return { primes, isPrime };
}

// ===== 测试 =====
console.log("n=30 的素数:", eulerSieve(30));
// [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

console.log("n=2:", eulerSieve(2)); // [2]
console.log("n=1:", eulerSieve(1)); // []

const full = eulerSieveFull(20);
console.log("n=20 素数个数:", full.primes.length); // 8
console.log("n=20 isPrime[15]:", full.isPrime[15]); // false
console.log("n=20 isPrime[17]:", full.isPrime[17]); // true

console.log("n=100 素数个数:", eulerSieve(100).length); // 25
console.log("n=1000000 素数个数:", eulerSieve(1000000).length); // 78498（验证线性复杂度可承受）
