/**
 * 手写请求限流（Rate Limiting）
 *
 * 功能：实现多种限流算法，控制客户端请求频率
 *       防止暴力破解、API 滥用、DDoS 等
 *
 * 实现思路：
 *   1. 固定窗口计数器：每个时间窗口内计数，超阈值拒绝
 *   2. 滑动窗口日志：记录每次请求时间戳，移除过期请求
 *   3. 令牌桶（Token Bucket）：以恒定速率补充令牌，请求消耗令牌
 *   4. 漏桶（Leaky Bucket）：以恒定速率处理请求，溢出则拒绝
 *
 * 用法：作为中间件，对 req.ip 或 req.userId 维护状态
 */

// === 1. 固定窗口计数器 ===
class FixedWindowLimiter {
  constructor({ windowMs, maxRequests }) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.windows = new Map(); // key -> { count, start }
  }
  check(key) {
    const now = Date.now();
    let w = this.windows.get(key);
    if (!w || now - w.start >= this.windowMs) {
      w = { start: now, count: 0 };
      this.windows.set(key, w);
    }
    w.count++;
    const allowed = w.count <= this.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - w.count),
      resetAt: w.start + this.windowMs,
    };
  }
}

// === 2. 滑动窗口日志 ===
class SlidingWindowLimiter {
  constructor({ windowMs, maxRequests }) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.logs = new Map(); // key -> [timestamps]
  }
  check(key) {
    const now = Date.now();
    const arr = this.logs.get(key) || [];
    // 移除窗口外的时间戳
    while (arr.length && arr[0] <= now - this.windowMs) arr.shift();
    arr.push(now);
    this.logs.set(key, arr);
    const allowed = arr.length <= this.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - arr.length),
      resetAt: arr.length ? arr[0] + this.windowMs : now + this.windowMs,
    };
  }
}

// === 3. 令牌桶 ===
class TokenBucketLimiter {
  constructor({ capacity, refillRatePerSec }) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec / 1000; // tokens per ms
    this.buckets = new Map(); // key -> { tokens, lastRefill }
  }
  check(key, cost = 1) {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, b);
    }
    // 按时间补充令牌
    const elapsed = now - b.lastRefill;
    b.tokens = Math.min(this.capacity, b.tokens + elapsed * this.refillRate);
    b.lastRefill = now;
    const allowed = b.tokens >= cost;
    if (allowed) b.tokens -= cost;
    return {
      allowed,
      remaining: Math.floor(b.tokens),
      resetAt: now + Math.max(0, (cost - b.tokens) / this.refillRate),
    };
  }
}

// === 4. 漏桶 ===
class LeakyBucketLimiter {
  constructor({ capacity, leakRatePerSec }) {
    this.capacity = capacity;
    this.leakRate = leakRatePerSec / 1000; // 漏出速率 per ms
    this.buckets = new Map(); // key -> { water, lastLeak }
  }
  check(key) {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { water: 0, lastLeak: now };
      this.buckets.set(key, b);
    }
    // 漏出
    const elapsed = now - b.lastLeak;
    b.water = Math.max(0, b.water - elapsed * this.leakRate);
    b.lastLeak = now;
    // 尝试加水（一个请求一单位水）
    const allowed = b.water < this.capacity;
    if (allowed) b.water += 1;
    return {
      allowed,
      remaining: Math.max(0, this.capacity - Math.ceil(b.water)),
      resetAt: now + b.water / this.leakRate,
    };
  }
}

// === 通用中间件工厂 ===
function createRateLimitMiddleware(
  limiter,
  keyFn = (req) => req.ip || req.userId || "anonymous",
) {
  return function middleware(req) {
    const key = keyFn(req);
    const result = limiter.check(key);
    return {
      ...result,
      headers: {
        "X-RateLimit-Limit": limiter.maxRequests || limiter.capacity,
        "X-RateLimit-Remaining": result.remaining,
        "X-RateLimit-Reset": Math.floor(result.resetAt / 1000),
      },
      action: result.allowed ? "allow" : "reject",
    };
  };
}

// ===== 测试 =====
console.log("=== 手写请求限流（Rate Limiting） ===");

// 1. 固定窗口测试
console.log("\n--- 固定窗口（5 次/1 秒） ---");
const fw = new FixedWindowLimiter({ windowMs: 1000, maxRequests: 5 });
for (let i = 1; i <= 7; i++) {
  const r = fw.check("user-1");
  console.log(`请求 ${i}: ${r.allowed ? "允许" : "拒绝"}, 剩余 ${r.remaining}`);
}
// 预期: 1-5 允许，6-7 拒绝

// 2. 滑动窗口测试
console.log("\n--- 滑动窗口（3 次/500ms） ---");
const sw = new SlidingWindowLimiter({ windowMs: 500, maxRequests: 3 });
for (let i = 1; i <= 5; i++) {
  const r = sw.check("user-2");
  console.log(`请求 ${i}: ${r.allowed ? "允许" : "拒绝"}, 剩余 ${r.remaining}`);
}
// 预期: 1-3 允许，4-5 拒绝

// 等待窗口过后再次允许
setTimeout(() => {
  console.log("500ms 后再次请求:");
  const r = sw.check("user-2");
  console.log(`请求 6: ${r.allowed ? "允许" : "拒绝"}`); // 预期: 允许
}, 600);

// 3. 令牌桶测试
console.log("\n--- 令牌桶（容量 5，补充 1/秒） ---");
const tb = new TokenBucketLimiter({ capacity: 5, refillRatePerSec: 2 });
for (let i = 1; i <= 7; i++) {
  const r = tb.check("user-3");
  console.log(
    `请求 ${i}: ${r.allowed ? "允许" : "拒绝"}, 令牌剩余 ${r.remaining}`,
  );
}
// 预期: 1-5 允许（初始满桶），6-7 拒绝

// 4. 漏桶测试
console.log("\n--- 漏桶（容量 3，漏出 2/秒） ---");
const lb = new LeakyBucketLimiter({ capacity: 3, leakRatePerSec: 2 });
for (let i = 1; i <= 5; i++) {
  const r = lb.check("user-4");
  console.log(
    `请求 ${i}: ${r.allowed ? "允许" : "拒绝"}, 剩余容量 ${r.remaining}`,
  );
}
// 预期: 1-3 允许，4-5 拒绝

// 5. 中间件演示
console.log("\n--- 中间件演示 ---");
const mw = createRateLimitMiddleware(
  new FixedWindowLimiter({ windowMs: 60000, maxRequests: 10 }),
);
const mockReq = { ip: "192.168.1.1" };
const result = mw(mockReq);
console.log("响应头:", result.headers);
console.log("动作:", result.action); // 预期: allow
