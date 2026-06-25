/**
 * 手写简易 INI 配置文件解析器
 *
 * 解析 INI 格式配置文件，支持：
 *   - 节 [section]
 *   - 键值对 key = value
 *   - 注释（; 或 # 开头）
 *   - 全局键值对（无节的键放在根对象）
 *   - 行内注释（可选，此处支持简单形式）
 *
 * 实现思路：
 * 1. 按行分割文本。
 * 2. 跳过空行和注释行。
 * 3. 遇到 [xxx] 切换当前 section。
 * 4. 遇到 key=value，写入当前 section（全局则写入根对象）。
 * 5. 值做类型推断：true/false/数字/字符串。
 *
 * @param {string} text - INI 文本
 * @returns {Object} 配置对象
 */
function inferValue(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "") return "";
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d*\.\d+$/.test(v)) return parseFloat(v);
  // 去掉引号
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function iniParser(text) {
  const result = {};
  let currentSection = result;

  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;

    // 节
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      if (!result[sectionName]) result[sectionName] = {};
      currentSection = result[sectionName];
      continue;
    }

    // 键值对
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let valueRaw = line.slice(eqIdx + 1).trim();
    // 去掉行内注释（; 或 # 前有空格且不在引号内）
    valueRaw = valueRaw.replace(/\s+[;#].*$/, "");
    currentSection[key] = inferValue(valueRaw);
  }

  return result;
}

// INI 序列化（反向操作）
function stringify(obj) {
  const lines = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      lines.push(`[${key}]`);
      for (const k of Object.keys(val)) {
        lines.push(`${k} = ${val[k]}`);
      }
      lines.push("");
    } else {
      lines.push(`${key} = ${val}`);
    }
  }
  return lines.join("\n");
}

// ===== 测试用例 =====
const iniText = `
; 全局配置
app_name = MyApp
version = 1.0
debug = true

[database]
host = localhost
port = 3306
password = secret

[server]
host = 0.0.0.0
port = 8080
`;
const config = iniParser(iniText);
console.log(JSON.stringify(config, null, 2));
// 期望输出:
// {
//   "app_name": "MyApp",
//   "version": 1,
//   "debug": true,
//   "database": { "host": "localhost", "port": 3306, "password": "secret" },
//   "server": { "host": "0.0.0.0", "port": 8080 }
// }

console.log(config.database.port); // 期望输出: 3306
console.log(config.debug); // 期望输出: true
