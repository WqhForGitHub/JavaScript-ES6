/**
 * 手写函数记忆化 memoize
 *
 * 作用：
 *   - 缓存函数的计算结果，相同输入直接返回缓存值，避免重复计算
 *   - 适用于纯函数（相同输入必有相同输出）
 *
 * 实现思路：
 *   1. 用一个 Map/对象作为缓存，key 由参数序列化得到
 *   2. 调用时先查缓存，命中则返回；否则计算并存入缓存
 *   3. 支持自定义 resolver（当参数不易直接做 key 时）
 */

function memoize(fn, resolver) {
  const cache = new Map();
  const memoized = function (...args) {
    // 用 resolver 生成 key，默认用第一个参数或 JSON 序列化全部参数
    const key =
      typeof resolver === "function"
        ? resolver(...args)
        : args.length === 1
          ? args[0]
          : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };

  // 暴露缓存，便于调试
  memoized.cache = cache;
  return memoized;
}

// ===== 测试 =====

// 经典：斐波那契数列（记忆化前后性能差异巨大）
let computeCount = 0;
const fib = memoize(function (n) {
  computeCount++;
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
});
console.log(fib(40)); // 102334155
console.log("计算次数:", computeCount); // 41（无记忆化会爆炸式增长）
computeCount = 0;
console.log(fib(40)); // 102334155（命中缓存）
console.log("再次计算次数:", computeCount); // 0

// 多参数：用 JSON 序列化做 key
const sum = memoize(function (a, b) {
  return a + b;
});
console.log(sum(1, 2)); // 3
console.log(sum(1, 2)); // 3（缓存）
console.log(sum.cache.size); // 1

// 自定义 resolver：对象参数用 id 做 key
const queryUser = memoize(
  function (user) {
    return `data of ${user.id}`;
  },
  (user) => user.id,
);
const u1 = { id: "u1", name: "Tom" };
const u1Again = { id: "u1", name: "Tom" }; // 不同对象同 id
console.log(queryUser(u1)); // 'data of u1'
console.log(queryUser(u1Again)); // 'data of u1'（缓存命中）
console.log(queryUser.cache.size); // 1

// 应用：计算圆面积
const circleArea = memoize((r) => {
  console.log(`  [compute] r=${r}`);
  return Math.PI * r * r;
});
console.log(circleArea(5)); // 打印 compute，返回 78.539...
console.log(circleArea(5)); // 不打印 compute，直接返回缓存

// this 绑定
const obj = {
  factor: 100,
  scale(x) {
    return x * this.factor;
  },
};
const memoScale = memoize(obj.scale.bind(obj));
console.log(memoScale(3)); // 300
console.log(memoScale(3)); // 300（缓存）
