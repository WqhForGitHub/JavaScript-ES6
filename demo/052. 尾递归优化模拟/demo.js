// 52. 尾递归优化模拟

function factorialTail(n, acc = 1) {
  return n <= 1 ? acc : factorialTail(n - 1, n * acc);
}
console.log(factorialTail(5));
