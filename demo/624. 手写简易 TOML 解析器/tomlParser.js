/**
 * 手写简易 TOML 解析器
 *
 * 解析 TOML 格式子集，支持：
 *   - 键值对 key = value（字符串、整数、浮点、布尔、数组）
 *   - 表 [section] 与子表 [section.sub]
 *   - 数组（含跨行数组）
 *   - 行内注释 #
 *   - 基本字符串 "..." 和字面字符串 '...'
 *
 * 实现思路：
 * 1. 按行处理，跳过空行与注释。
 * 2. [a.b.c] 通过点号路径在结果对象上创建嵌套结构。
 * 3. key = value 用正则分离，值用 parseValue 推断类型。
 * 4. 数组支持跨行（累积方括号内容后统一解析）。
 *
 * @param {string} text - TOML 文本
 * @returns {Object} 解析结果
 */
function parseValue(raw) {
  raw = raw.trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return raw
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1);
  }
  if (raw.startsWith("[")) {
    const inner = raw.slice(1, -1).trim();
    if (inner === "") return [];
    return inner
      .split(",")
      .map((s) => parseValue(s))
      .filter((v) => v !== "");
  }
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d*\.\d+$/.test(raw)) return parseFloat(raw);
  return raw;
}

function getPath(obj, path) {
  const keys = path.split(".");
  let cur = obj;
  for (const k of keys) {
    if (!cur[k]) cur[k] = {};
    cur = cur[k];
  }
  return cur;
}

function stripInlineComment(s) {
  let inStr = false;
  let quote = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (!inStr && (ch === '"' || ch === "'")) {
      inStr = true;
      quote = ch;
    } else if (inStr && ch === quote) inStr = false;
    else if (!inStr && ch === "#") return s.slice(0, i).trim();
  }
  return s.trim();
}

function tomlParser(text) {
  const result = {};
  let currentTable = result;
  let currentPath = "";
  let pendingArray = null; // { key, content }

  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (pendingArray) {
      pendingArray.content += " " + line;
      if (line.includes("]")) {
        currentTable[pendingArray.key] = parseValue(pendingArray.content);
        pendingArray = null;
      }
      continue;
    }
    if (line === "" || line.startsWith("#")) continue;

    // 表头
    const tableMatch = line.match(/^\[([^\]]+)\]$/);
    if (tableMatch) {
      currentPath = tableMatch[1].trim();
      currentTable = getPath(result, currentPath);
      continue;
    }

    // 键值对
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let valueRaw = stripInlineComment(line.slice(eqIdx + 1));

    // 跨行数组
    if (valueRaw.startsWith("[") && !valueRaw.includes("]")) {
      pendingArray = { key, content: valueRaw };
      continue;
    }

    currentTable[key] = parseValue(valueRaw);
  }

  return result;
}

// ===== 测试用例 =====
const tomlText = `
title = "TOML Example"
port = 8080
enabled = true

[database]
host = "localhost"
ports = [8001, 8002, 8003]

[server]
name = "main"
tags = ["web", "api"]
`;
const config = tomlParser(tomlText);
console.log(JSON.stringify(config, null, 2));
// 期望输出:
// {
//   "title": "TOML Example",
//   "port": 8080,
//   "enabled": true,
//   "database": { "host": "localhost", "ports": [8001, 8002, 8003] },
//   "server": { "name": "main", "tags": ["web", "api"] }
// }

console.log(config.database.ports[1]); // 期望输出: 8002
console.log(config.server.tags); // 期望输出: [ 'web', 'api' ]
