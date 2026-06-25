/**
 * 手写 IP 黑名单过滤器
 *
 * 功能：维护 IP 黑名单，对请求 IP 进行匹配与过滤
 *       支持单 IP、CIDR 网段、IPv4/IPv6 检测
 *
 * 实现思路：
 *   1. 单 IP 直接 Set 匹配
 *   2. CIDR 表示法（如 192.168.1.0/24）需做网段匹配
 *   3. IPv4 -> 32 位整数，IPv6 -> 128 位 BigInt 比较
 *   4. 提供同步检查接口与中间件包装
 *   5. 支持带过期时间的临时封禁
 */

// === IP 解析工具 ===

// IPv4 字符串 -> 32 位无符号整数
function ipv4ToInt(ip) {
  const parts = ip.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)
  ) {
    throw new Error("无效 IPv4: " + ip);
  }
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

function intToIpv4(int) {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join(".");
}

// IPv6 字符串 -> BigInt（128 位）
function ipv6ToBigInt(ip) {
  // 简化处理：依赖 Node 的 dns.lookup 不合适，手动展开 ::
  let addr = ip;
  // 处理 IPv4-mapped 或压缩的 ::
  if (addr.includes("::")) {
    const [left, right] = addr.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missing = 8 - leftParts.length - rightParts.length;
    addr = [...leftParts, ...Array(missing).fill("0"), ...rightParts].join(":");
  }
  const parts = addr.split(":");
  if (parts.length !== 8) throw new Error("无效 IPv6: " + ip);
  let result = 0n;
  for (const p of parts) {
    const n = BigInt(parseInt(p || "0", 16));
    if (n < 0n || n > 0xffffn) throw new Error("无效 IPv6 段: " + p);
    result = (result << 16n) | n;
  }
  return result;
}

// 解析 CIDR
function parseCidr(cidr) {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = prefixStr
    ? parseInt(prefixStr, 10)
    : ip.includes(":")
      ? 128
      : 32;
  if (ip.includes(":")) {
    const base = ipv6ToBigInt(ip);
    const mask =
      prefix === 0
        ? 0n
        : (0xffffffffffffffffffffffffffffffffn << (128n - BigInt(prefix))) &
          0xffffffffffffffffffffffffffffffffn;
    return { version: 6, base: base & mask, mask, prefix };
  } else {
    const base = ipv4ToInt(ip);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return { version: 4, base: base & mask, mask: mask >>> 0, prefix };
  }
}

// === 黑名单过滤器 ===
class IpBlacklist {
  constructor() {
    this.singleV4 = new Set(); // 单 IP
    this.singleV6 = new Set();
    this.cidrV4 = []; // [{ base, mask, prefix, raw }]
    this.cidrV6 = [];
    this.tempBans = new Map(); // ip -> { until, reason }
  }

  // 添加黑名单项
  add(entry) {
    entry = entry.trim();
    if (entry.includes("/")) {
      const c = parseCidr(entry);
      if (c.version === 4) this.cidrV4.push({ ...c, raw: entry });
      else this.cidrV6.push({ ...c, raw: entry });
    } else if (entry.includes(":")) {
      this.singleV6.add(entry.toLowerCase());
    } else {
      this.singleV4.add(entry);
    }
  }

  // 批量添加
  addAll(entries) {
    entries.forEach((e) => this.add(e));
  }

  // 移除
  remove(entry) {
    entry = entry.trim();
    if (entry.includes(":")) {
      this.singleV6.delete(entry.toLowerCase());
      this.tempBans.delete(entry.toLowerCase());
    } else {
      this.singleV4.delete(entry);
      this.tempBans.delete(entry);
    }
  }

  // 临时封禁
  tempBan(ip, durationMs, reason = "") {
    this.tempBans.set(ip, { until: Date.now() + durationMs, reason });
  }

  // 主检查：是否在黑名单
  isBlacklisted(ip) {
    // 先查临时封禁
    const ban = this.tempBans.get(ip);
    if (ban) {
      if (ban.until > Date.now())
        return {
          blocked: true,
          reason: ban.reason || "临时封禁",
          source: "temp",
        };
      this.tempBans.delete(ip);
    }

    if (ip.includes(":")) {
      const lower = ip.toLowerCase();
      if (this.singleV6.has(lower))
        return { blocked: true, reason: "命中 IPv6 单 IP", source: lower };
      const ipInt = ipv6ToBigInt(ip);
      for (const c of this.cidrV6) {
        if ((ipInt & c.mask) === c.base)
          return { blocked: true, reason: "命中 CIDR", source: c.raw };
      }
    } else {
      if (this.singleV4.has(ip))
        return { blocked: true, reason: "命中 IPv4 单 IP", source: ip };
      const ipInt = ipv4ToInt(ip);
      for (const c of this.cidrV4) {
        if ((ipInt & c.mask) === c.base)
          return { blocked: true, reason: "命中 CIDR", source: c.raw };
      }
    }
    return { blocked: false };
  }

  // 列出所有规则
  list() {
    return {
      singleV4: [...this.singleV4],
      singleV6: [...this.singleV6],
      cidrV4: this.cidrV4.map((c) => c.raw),
      cidrV6: this.cidrV6.map((c) => c.raw),
      tempBans: [...this.tempBans.keys()].map((ip) => ({
        ip,
        ...this.tempBans.get(ip),
      })),
    };
  }
}

// 中间件包装
function ipBlacklistMiddleware(blacklist) {
  return function (req) {
    const ip = req.ip || req.connection?.remoteAddress || "0.0.0.0";
    const result = blacklist.isBlacklisted(ip);
    return {
      ip,
      allowed: !result.blocked,
      reason: result.reason,
      action: result.blocked ? "block" : "allow",
      statusCode: result.blocked ? 403 : 200,
    };
  };
}

// ===== 测试 =====
console.log("=== 手写 IP 黑名单过滤器 ===");

const bl = new IpBlacklist();

// 添加单 IP
bl.add("192.168.1.100");
bl.add("10.0.0.5");
bl.add("::1");

// 添加 CIDR
bl.add("172.16.0.0/12");
bl.add("203.0.113.0/24");
bl.add("2001:db8::/32");

console.log("规则列表:", JSON.stringify(bl.list(), null, 2));

// 测试单 IP
console.log("\n192.168.1.100:", bl.isBlacklisted("192.168.1.100").blocked); // 预期: true
console.log("192.168.1.101:", bl.isBlacklisted("192.168.1.101").blocked); // 预期: false

// 测试 CIDR
console.log(
  "172.16.5.10 (172.16/12):",
  bl.isBlacklisted("172.16.5.10").blocked,
); // 预期: true
console.log(
  "172.32.0.1 (172.16/12 外):",
  bl.isBlacklisted("172.32.0.1").blocked,
); // 预期: false
console.log("203.0.113.50 (/24):", bl.isBlacklisted("203.0.113.50").blocked); // 预期: true
console.log("203.0.114.1 (/24 外):", bl.isBlacklisted("203.0.114.1").blocked); // 预期: false

// 测试 IPv6
console.log("::1:", bl.isBlacklisted("::1").blocked); // 预期: true
console.log("2001:db8::1 (/32):", bl.isBlacklisted("2001:db8::1").blocked); // 预期: true
console.log("2001:db9::1 (/32 外):", bl.isBlacklisted("2001:db9::1").blocked); // 预期: false

// 临时封禁
bl.tempBan("8.8.8.8", 60000, "异常请求");
console.log("\n临时封禁 8.8.8.8:", bl.isBlacklisted("8.8.8.8")); // 预期: blocked true

// 中间件
console.log("\n--- 中间件演示 ---");
const mw = ipBlacklistMiddleware(bl);
console.log("黑名单 IP:", mw({ ip: "192.168.1.100" }).action); // 预期: block
console.log("正常 IP:", mw({ ip: "1.1.1.1" }).action); // 预期: allow

// CIDR 计算验证
console.log("\nIPv4 转换: 192.168.1.1 ->", ipv4ToInt("192.168.1.1")); // 预期: 3232235777
console.log("回转:", intToIpv4(3232235777)); // 预期: 192.168.1.1
