// 51. 递归斐波那契实现

function fibonacci(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}
for (let i = 0; i < 8; i++) console.log(i, fibonacci(i));
