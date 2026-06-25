/**
 * 手写函数结果缓存（带过期时间）
 *
 * 作用：
 *   - 在 memoize 基础上为缓存增加 TTL（存活时间）
 *   - 缓存项过期后下次访问重新计算
 *   - 典型场景：接口数据缓存、配置缓存、避免短时间内重复计算
 *
 * 实现思路：
 *   1. 缓存项存为 { value, expireAt }
 *   2. 访问时检查 expireAt，过期则删除并重新计算
 *   3. 可选：定期清理过期项、最大缓存条数限制
 */

function cacheWithExpire(fn, ttl = 60000, resolver) {
  const cache = new Map();

  const wrapped = function (...args) {
    const key =
      typeof resolver === "function"
        ? resolver(...args)
        : args.length === 1
          ? args[0]
          : JSON.stringify(args);

    const entry = cache.get(key);
    const now = Date.now();

    // 命中且未过期
    if (entry && entry.expireAt > now) {
      return entry.value;
    }

    // 未命中或已过期：重新计算
    const value = fn.apply(this, args);
    cache.set(key, { value, expireAt: now + ttl });
    return value;
  };

  // 主动获取缓存（不触发计算），返回 { value } 或 undefined
  wrapped.peek = function (key) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expireAt <= Date.now()) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  };

  // 删除指定缓存
  wrapped.delete = function (key) {
    return cache.delete(key);
  };

  // 清空全部缓存
  wrapped.clear = function () {
    cache.clear();
  };

  // 当前缓存条数
  wrapped.size = function () {
    return cache.size;
  };

  return wrapped;
}

// ===== 测试 =====

// 基本缓存与过期
let computeCount = 0;
const getValue = cacheWithExpire(
  (key) => {
    computeCount++;
    return `computed-${key}`;
  },
  100, // 100ms 过期
);

console.log(getValue("a")); // 'computed-a'（计算）
console.log(getValue("a")); // 'computed-a'（缓存命中）
console.log("计算次数:", computeCount); // 1

setTimeout(() => {
  console.log(getValue("a")); // 'computed-a'（仍缓存）
  console.log("100ms 内计算次数:", computeCount); // 1
}, 80);

setTimeout(() => {
  console.log(getValue("a")); // 'computed-a'（过期重新计算）
  console.log("过期后计算次数:", computeCount); // 2
}, 150);

// 多参数缓存
let sumCount = 0;
const sum = cacheWithExpire((a, b) => {
  sumCount++;
  return a + b;
}, 500);
console.log(sum(1, 2)); // 3
console.log(sum(1, 2)); // 3（缓存）
console.log(sum(2, 1)); // 3（key 不同，重新计算）
console.log("sum 计算次数:", sumCount); // 2

// 自定义 resolver
let userCount = 0;
const getUser = cacheWithExpire(
  (user) => {
    userCount++;
    return `data-${user.id}`;
  },
  500,
  (user) => user.id,
);
console.log(getUser({ id: "u1", name: "Tom" })); // 'data-u1'
console.log(getUser({ id: "u1", name: "Tom" })); // 'data-u1'（同 id 命中）
console.log("user 计算次数:", userCount); // 1

// peek / delete / clear / size
let c = 0;
const cached = cacheWithExpire((x) => ++c, 1000);
cached(1);
cached(2);
console.log("size:", cached.size()); // 2
console.log("peek 1:", cached.peek(1)); // 1
cached.delete(1);
console.log("delete 后 size:", cached.size()); // 1
cached.clear();
console.log("clear 后 size:", cached.size()); // 0

// 过期项 peek 返回 undefined
const fast = cacheWithExpire((x) => x, 50);
fast("k");
setTimeout(() => {
  console.log("过期 peek:", fast.peek("k")); // undefined
}, 60);

// 应用：接口缓存（5 秒内不重复请求）
const fetchUser = cacheWithExpire((id) => `userData-${id}`, 5000);
console.log(fetchUser(1)); // 'userData-1'
console.log(fetchUser(1)); // 'userData-1'（缓存）
