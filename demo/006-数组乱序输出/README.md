# 006 - 数组的乱序输出（洗牌算法）

## 方式一：Fisher-Yates 洗牌算法（推荐）

> 从后往前遍历，每次从「未处理部分」随机取一个元素与当前元素交换。
> 时间复杂度 O(n)，每种排列出现的概率完全相等（均匀分布）。

```js
function shuffle(arr) {
  const result = arr.slice(); // 不修改原数组
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // [0, i] 内随机下标
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

console.log(shuffle([1, 2, 3, 4, 5, 6, 7, 8]));
```

## 方式二：sort + Math.random（不推荐，仅了解）

```js
function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

console.log(shuffle([1, 2, 3, 4, 5]));
```

> 缺点：`sort` 的比较函数要求返回值一致、可传递，随机返回违反了排序约定，
> 导致乱序**不均匀**（某些排列出现的概率明显偏高），面试中需指出该问题。

## 简单概率验证

```js
// 统计 [1,2,3] 各种排列出现的次数，验证是否均匀
function testShuffle(shuffleFn, times = 100000) {
  const count = {};
  for (let i = 0; i < times; i++) {
    const key = shuffleFn([1, 2, 3]).join('');
    count[key] = (count[key] || 0) + 1;
  }
  return count;
}

console.log(testShuffle(shuffle));
// 理想情况下 6 种排列各约 16666 次
```
