/**
 * 手写斐波那契数列（递归）
 *
 * 斐波那契数列：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。
 * 朴素递归直接按定义实现，但存在大量重复计算，时间 O(2^n)，空间 O(n)（递归栈）。
 * 仅适合 n 较小的情况，用于演示递归思想。
 * 本实现同时提供带记忆化的递归优化版（时间 O(n)）。
 */

// 朴素递归
function fibonacciRecursive(n) {
  if (n < 0) throw new Error("n must be non-negative");
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// 带记忆化的递归（自顶向下）
function fibonacciMemo(n) {
  const memo = new Map();
  const fib = (k) => {
    if (k <= 1) return k;
    if (memo.has(k)) return memo.get(k);
    const result = fib(k - 1) + fib(k - 2);
    memo.set(k, result);
    return result;
  };
  return fib(n);
}

// 测试
console.log(fibonacciRecursive(0)); // 0
console.log(fibonacciRecursive(1)); // 1
console.log(fibonacciRecursive(2)); // 1
console.log(fibonacciRecursive(5)); // 5
console.log(fibonacciRecursive(10)); // 55
console.log(fibonacciRecursive(15)); // 610

// 记忆化版本可以处理更大的 n
console.log(fibonacciMemo(50)); // 12586269025
console.log(fibonacciMemo(100)); // 354224848179261915075

// 生成前 n 项
function fibonacciSequence(n) {
  const seq = [];
  for (let i = 0; i < n; i++) {
    seq.push(fibonacciMemo(i));
  }
  return seq;
}

console.log(fibonacciSequence(10)); // [0,1,1,2,3,5,8,13,21,34]
