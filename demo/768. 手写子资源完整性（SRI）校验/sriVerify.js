/**
 * 手写子资源完整性（SRI）校验
 *
 * 功能：校验外部资源（script/link）的哈希值
 *       防止 CDN 被篡改导致恶意脚本注入
 *
 * 实现思路：
 *   1. SRI 格式："<alg>-<base64>"
 *      如 "sha256-abc123...=="
 *   2. 计算资源内容的 SHA-256/384/512 摘要
 *   3. base64 编码后与 integrity 属性比对
 *   4. 使用恒定时间比较避免计时攻击
 *
 * 用法：
 *   <script src="https://cdn.example.com/lib.js"
 *           integrity="sha256-<base64hash>"
 *           crossorigin="anonymous"></script>
 */

const crypto = require("crypto");

// 支持的算法
const SUPPORTED_ALG = ["sha256", "sha384", "sha512"];

// 计算 SRI 哈希字符串
function computeSri(content, algorithm = "sha256") {
  if (!SUPPORTED_ALG.includes(algorithm)) {
    throw new Error(
      "不支持的算法: " + algorithm + "，支持: " + SUPPORTED_ALG.join(", "),
    );
  }
  const hash = crypto
    .createHash(algorithm)
    .update(content, "utf8")
    .digest("base64");
  return `${algorithm}-${hash}`;
}

// 解析 integrity 字符串
// 支持多个用空格分隔，每个可为 "<alg>-<hash>" 或 "<alg>-<hash>?<options>"
function parseIntegrity(integrity) {
  if (typeof integrity !== "string") return [];
  return integrity
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [main, options] = s.split("?");
      const idx = main.indexOf("-");
      if (idx === -1) return null;
      const algorithm = main.slice(0, idx).toLowerCase();
      const hash = main.slice(idx + 1);
      return { algorithm, hash, options: options || "" };
    })
    .filter(Boolean);
}

// 恒定时间比较
function safeEqualBuf(a, b) {
  if (!(a instanceof Buffer)) a = Buffer.from(a);
  if (!(b instanceof Buffer)) b = Buffer.from(b);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// 验证单个内容是否匹配 integrity
function verifySri(content, integrity) {
  const entries = parseIntegrity(integrity);
  if (entries.length === 0) {
    return { valid: false, reason: "integrity 为空或格式错误" };
  }
  for (const entry of entries) {
    if (!SUPPORTED_ALG.includes(entry.algorithm)) {
      // 浏览器遇到未知算法会跳过该条，继续下一条
      continue;
    }
    const actualHash = crypto
      .createHash(entry.algorithm)
      .update(content, "utf8")
      .digest("base64");
    if (safeEqualBuf(actualHash, entry.hash)) {
      return {
        valid: true,
        algorithm: entry.algorithm,
        matched: `${entry.algorithm}-${entry.hash}`,
      };
    }
  }
  return { valid: false, reason: "无任何算法匹配" };
}

// 为 HTML 资源生成完整 integrity 属性
function generateIntegrityAttr(content, algorithm = "sha256") {
  return `integrity="${computeSri(content, algorithm)}"`;
}

// 批量验证：模拟浏览器加载多个资源
function verifyResources(resources) {
  // resources: [{ url, content, integrity }]
  return resources.map(({ url, content, integrity }) => {
    const result = verifySri(content, integrity);
    return { url, ...result };
  });
}

// ===== 测试 =====
console.log("=== 手写子资源完整性（SRI）校验 ===");

// 1. 计算 SRI
const scriptContent = 'function hello(){console.log("hi");}';
const sri = computeSri(scriptContent, "sha256");
console.log("脚本内容:", scriptContent);
console.log("SHA-256 SRI:", sri);
// 预期: sha256-<base64>

// 2. 验证正确
const verifyOk = verifySri(scriptContent, sri);
console.log("\n验证正确 SRI:", verifyOk);
// 预期: { valid: true, algorithm: 'sha256' }

// 3. 验证篡改内容
const tampered = scriptContent + " ";
console.log("验证篡改内容:", verifySri(tampered, sri));
// 预期: { valid: false, reason: '无任何算法匹配' }

// 4. 多算法
const multiSri = `${computeSri(scriptContent, "sha256")} ${computeSri(scriptContent, "sha512")}`;
console.log("\n多算法 SRI:", multiSri.slice(0, 60) + "...");
console.log("多算法验证:", verifySri(scriptContent, multiSri).valid); // 预期: true

// 5. 生成 HTML 属性
console.log(
  '\n<script src="cdn.js" ' +
    generateIntegrityAttr(scriptContent) +
    ' crossorigin="anonymous"></script>',
);

// 6. 批量资源验证（模拟 CDN 资源加载）
console.log("\n--- 批量资源验证 ---");
const resources = [
  {
    url: "https://cdn.x.com/jquery.js",
    content: "jQuery v3.6.0",
    integrity: computeSri("jQuery v3.6.0", "sha256"),
  },
  {
    url: "https://cdn.x.com/react.js",
    content: "React v18",
    integrity: computeSri("React v18", "sha256"),
  },
  {
    url: "https://cdn.x.com/lodash.js",
    content: "lodash v4",
    integrity: computeSri("lodash v5", "sha256"),
  }, // 故意不匹配
];
const results = verifyResources(resources);
results.forEach((r) => {
  console.log(`[${r.valid ? "通过" : "失败"}] ${r.url}`);
});

// 7. 与 Node crypto 对比验证
const expected =
  "sha256-" +
  crypto.createHash("sha256").update(scriptContent).digest("base64");
console.log("\n与标准库一致:", sri === expected); // 预期: true

// 8. SRI 完整 HTML 模板生成
function buildScriptTag(url, content, algorithm = "sha256") {
  return `<script src="${url}" integrity="${computeSri(content, algorithm)}" crossorigin="anonymous"></script>`;
}
console.log("\n生成的 script 标签:");
console.log(buildScriptTag("https://cdn.example.com/lib.js", scriptContent));
