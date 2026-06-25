/**
 * 手写环境变量配置加载
 *
 * 功能：解析 .env 文件内容并加载到 process.env，支持引号、注释、变量展开
 * 实现思路：
 *   1. 逐行读取，跳过空行与 # 开头的注释
 *   2. 按 "=" 分割键值，去除首尾空白；支持 "export " 前缀
 *   3. 单引号：原样保留，不展开变量；双引号：展开 ${VAR} / $VAR
 *   4. 无引号值去掉行内注释( #)，并展开变量
 *   5. 写入 process.env（默认不覆盖已存在的变量，override=true 时覆盖）
 */
const fs = require("fs");

/** 变量展开：替换 ${VAR} 与 $VAR */
function expandValue(value, env) {
  return value.replace(/\$\{(\w+)\}|\$(\w+)/g, (match, a, b) => {
    const name = a || b;
    return env[name] !== undefined ? env[name] : "";
  });
}

/** 解析 .env 文本内容为对象 */
function parseEnv(content, existingEnv = {}) {
  const result = { ...existingEnv };
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    let key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();

    // 去掉 "export " 前缀
    key = key.replace(/^export\s+/, "");

    // 跳过非法 key
    if (!/^[A-Za-z_]\w*$/.test(key)) continue;

    // 处理引号
    if (val.length >= 2) {
      const first = val[0];
      const last = val[val.length - 1];
      if (first === '"' && last === '"') {
        // 双引号：展开变量，保留内部空白
        val = val.slice(1, -1);
        val = expandValue(val, result);
      } else if (first === "'" && last === "'") {
        // 单引号：原样保留，不展开
        val = val.slice(1, -1);
      } else {
        // 无引号：去掉行内注释后展开
        const hashIdx = val.indexOf(" #");
        if (hashIdx !== -1) val = val.slice(0, hashIdx).trim();
        val = expandValue(val, result);
      }
    } else {
      // 单字符或空值
      const hashIdx = val.indexOf(" #");
      if (hashIdx !== -1) val = val.slice(0, hashIdx).trim();
      val = expandValue(val, result);
    }

    result[key] = val;
  }

  return result;
}

/** 从文件加载 .env 到 process.env */
function loadEnv(filePath, options = {}) {
  const { override = false, encoding = "utf8" } = options;
  let content;
  try {
    content = fs.readFileSync(filePath, encoding);
  } catch (e) {
    return { ...process.env }; // 文件不存在则不处理
  }
  const parsed = parseEnv(content, process.env);
  for (const [k, v] of Object.entries(parsed)) {
    if (override || !(k in process.env)) {
      process.env[k] = v;
    }
  }
  return { ...process.env };
}

/** 仅解析不写入 process.env（便于测试与获取配置对象） */
function config(content, existingEnv = {}) {
  return parseEnv(content, existingEnv);
}

// ===== 测试 =====
console.log("=== 环境变量配置加载演示 ===");

const sample = `
# 这是一个注释行
APP_NAME=MyApp
APP_PORT=3000

# 带引号的值
GREETING="Hello World"
SINGLE='no expand \$HOME'

# export 前缀
export DATABASE_URL=postgres://localhost:5432/db

# 变量展开
BASE_DIR=/var/app
LOG_DIR=\${BASE_DIR}/logs
DATA_DIR=$BASE_DIR/data

# 行内注释
TIMEOUT=5000 # 超时时间(毫秒)

# 数字与布尔
DEBUG=true
MAX_CONN=100

# 空值
EMPTY=
`;

// 1) 解析演示
const cfg = config(sample, { HOME: "/root" });
console.log("APP_NAME:", cfg.APP_NAME); // MyApp
console.log("APP_PORT:", cfg.APP_PORT); // 3000
console.log("GREETING:", cfg.GREETING); // Hello World
console.log("SINGLE(不展开):", cfg.SINGLE); // no expand \$HOME
console.log("DATABASE_URL:", cfg.DATABASE_URL); // postgres://localhost:5432/db
console.log("LOG_DIR(展开):", cfg.LOG_DIR); // /var/app/logs
console.log("DATA_DIR(展开):", cfg.DATA_DIR); // /var/app/data
console.log("TIMEOUT(去注释):", cfg.TIMEOUT); // 5000
console.log("DEBUG:", cfg.DEBUG); // true
console.log("EMPTY:", JSON.stringify(cfg.EMPTY)); // ""

// 2) 不覆盖已有 process.env 演示
const before = { ...process.env };
process.env.PRE_EXISTING = "original";
loadEnvFromText("PRE_EXISTING=changed\nNEW_VAR=fresh");
console.log("不覆盖已有:", process.env.PRE_EXISTING); // original
console.log("新增变量:", process.env.NEW_VAR); // fresh
// 还原
for (const k of Object.keys(process.env)) {
  if (!(k in before)) delete process.env[k];
}
process.env.PRE_EXISTING = before.PRE_EXISTING;

// 3) override 模式
loadEnvFromText("PRE_EXISTING=changed", { override: true });
console.log("override 模式:", process.env.PRE_EXISTING); // changed

// 辅助：从字符串加载到 process.env（写临时文件再读）
function loadEnvFromText(text, opts = {}) {
  const os = require("os");
  const tmp = require("path").join(os.tmpdir(), ".env_test_" + Date.now());
  fs.writeFileSync(tmp, text, "utf8");
  loadEnv(tmp, opts);
  fs.unlinkSync(tmp);
}
