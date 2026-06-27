/**
 * 手写埃拉托斯特尼筛法（素数筛）
 *
 * 原理：从 2 开始，将每个素数的倍数标记为合数，未被标记的即为素数。
 * 优化：对于素数 i，只需从 i*i 开始标记（更小的倍数 i*2, i*3, ... i*(i-1)
 *       已被更小的素数筛掉），可显著减少标记次数。
 * 时间复杂度：O(n log log n)
 * 空间复杂度：O(n)
 */

/**
 * 埃拉托斯特尼筛法
 * @param {number} n - 筛选范围上限（包含 n）
 * @returns {number[]} 不超过 n 的所有素数（升序）
 */
function sieve(n) {
  if (n < 2) return [];
  // isPrime[i] 表示 i 是否为素数，初始假设全部为素数
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  // 只需枚举到 sqrt(n)：若 i*i > n，则 i 的倍数中 <= n 的都已被更小素数筛过
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      // 从 i*i 开始，步长为 i，标记 i 的所有倍数为合数
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }

  // 收集所有未被标记的数
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}

// ===== 测试 =====
console.log("primes up to 1:", sieve(1)); // []
console.log("primes up to 2:", sieve(2)); // [2]
console.log("primes up to 10:", sieve(10)); // [2, 3, 5, 7]
console.log("primes up to 30:", sieve(30)); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
console.log("primes up to 100:", sieve(100));
console.log("count up to 100:", sieve(100).length); // 25
console.log("count up to 1000:", sieve(1000).length); // 168
