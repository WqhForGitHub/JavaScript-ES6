# 001 - 斐波那契数列

> 斐波那契数列：1、1、2、3、5、8、13、21、34…… 从第三项开始，每一项等于前两项之和。

## 方式一：递归

```js
function fibonacci(n) {
  if (n === 1 || n === 2) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

> 缺点：存在大量重复计算，时间复杂度为 O(2^n)。

## 方式二：递归 + 缓存（记忆化）

```js
function fibonacci(n, memo = {}) {
  if (n === 1 || n === 2) return 1;
  if (memo[n]) return memo[n];
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log(fibonacci(50)); // 12586269025
```

## 方式三：动态规划（迭代，推荐）

```js
function fibonacci(n) {
  if (n === 1 || n === 2) return 1;
  let prev = 1;
  let curr = 1;
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(fibonacci(100)); // 354224848179262000000（超出安全整数范围，仅演示）
```

## 方式四：Generator 生成器

```js
function* fibonacciGenerator() {
  let prev = 1;
  let curr = 1;
  yield prev;
  yield curr;
  while (true) {
    [prev, curr] = [curr, prev + curr];
    yield curr;
  }
}

const gen = fibonacciGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
console.log(gen.next().value); // 5
```
