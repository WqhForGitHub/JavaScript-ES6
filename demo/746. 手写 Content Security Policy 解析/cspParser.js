/**
 * 手写 Content Security Policy 解析
 *
 * 功能：解析 HTTP Content-Security-Policy 头部字符串
 *       转换为结构化对象，便于查询策略与规则
 *
 * 实现思路：
 *   1. CSP 由多个 directive 用分号分隔
 *   2. 每个 directive 形如 "directive-name source1 source2 ..."
 *   3. 解析为 { directiveName: [sources], ... } 的对象
 *   4. 提供查询方法：是否允许某 source、是否开启 nonce 等
 */

function parseCsp(cspString) {
  const policy = Object.create(null);
  if (typeof cspString !== "string" || cspString.trim() === "") return policy;

  const directives = cspString
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const directive of directives) {
    const tokens = directive.split(/\s+/);
    if (tokens.length === 0) continue;
    const name = tokens[0].toLowerCase();
    const sources = tokens.slice(1);
    // 一些 directive 不带 source（如 upgrade-insecure-requests）
    policy[name] = sources.length > 0 ? sources : [true];
  }
  return policy;
}

// 序列化回 CSP 字符串
function serializeCsp(policy) {
  return Object.keys(policy)
    .map((name) => {
      const v = policy[name];
      if (v === true || (Array.isArray(v) && v.length === 1 && v[0] === true)) {
        return name;
      }
      return `${name} ${v.join(" ")}`;
    })
    .join("; ");
}

// 查询某 source 是否被 directive 允许
function isAllowed(policy, directive, source) {
  const list = policy[directive];
  if (!list) return false;
  if (list.includes("*")) return true;
  if (list.includes("'none'") && list.length === 1) return false;
  if (list.includes("'self'") && source === "'self'") return true;
  return list.some((s) => s === source || sourceMatches(s, source));
}

// 简单 source 通配匹配（如 *.example.com）
function sourceMatches(pattern, source) {
  if (pattern === source) return true;
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1); // .example.com
    return source.endsWith(suffix) || source === pattern.slice(2);
  }
  return false;
}

// 是否使用了 nonce 或 hash
function hasNonce(policy) {
  return Object.values(policy).some(
    (list) => Array.isArray(list) && list.some((s) => s.startsWith("'nonce-")),
  );
}

// 提取所有 nonce
function getNonces(policy) {
  const nonces = [];
  for (const list of Object.values(policy)) {
    if (!Array.isArray(list)) continue;
    for (const s of list) {
      const m = s.match(/^'nonce-([^']+)'$/);
      if (m) nonces.push(m[1]);
    }
  }
  return nonces;
}

// ===== 测试 =====
console.log("=== 手写 Content Security Policy 解析 ===");

const csp =
  "default-src 'self'; script-src 'self' 'nonce-abc123' https://cdn.example.com *.google.com; img-src 'self' data:; upgrade-insecure-requests; report-uri /csp-report";
const policy = parseCsp(csp);

console.log("解析结果:");
console.log(JSON.stringify(policy, null, 2));
// 预期: 结构化对象，包含 default-src, script-src, img-src, upgrade-insecure-requests, report-uri

console.log("\nscript-src 列表:", policy["script-src"]);
// 预期: [ "'self'", "'nonce-abc123'", "https://cdn.example.com", "*.google.com" ]

console.log(
  "upgrade-insecure-requests 是否存在:",
  !!policy["upgrade-insecure-requests"],
); // 预期: true
console.log("是否有 nonce:", hasNonce(policy)); // 预期: true
console.log("提取的 nonce:", getNonces(policy)); // 预期: [ 'abc123' ]
console.log(
  "script-src 允许 cdn:",
  isAllowed(policy, "script-src", "https://cdn.example.com"),
); // 预期: true
console.log(
  "script-src 允许 maps.google.com:",
  isAllowed(policy, "script-src", "maps.google.com"),
); // 预期: true (通配)

// 序列化回字符串
console.log("\n重新序列化:");
console.log(serializeCsp(policy));
// 预期: 与原 csp 等价（顺序保留）
