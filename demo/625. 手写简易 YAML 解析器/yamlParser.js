/**
 * 手写简易 YAML 解析器
 *
 * 解析 YAML 格式子集，支持：
 *   - 键值对 key: value
 *   - 嵌套映射（缩进）
 *   - 序列 - item
 *   - 字符串（可带引号）、整数、浮点、布尔、null
 *   - 注释 #
 *   - 行内流式 [a, b] 和 {a: b}
 *
 * 实现思路：
 * 1. 按行分析缩进级别，构建基于缩进的树。
 * 2. parseBlock 递归：根据当前行是映射还是序列分别处理。
 * 3. 值用 parseScalar 推断类型。
 *
 * 注意：这是简化实现，不支持复杂 YAML 特性（锚点、多文档、折叠块等）。
 *
 * @param {string} text - YAML 文本
 * @returns {Object} 解析结果
 */
function getIndent(line) {
  const match = line.match(/^(\s*)/);
  return match[1].length;
}

function stripComment(line) {
  let inStr = false;
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (!inStr && (ch === '"' || ch === "'")) {
      inStr = true;
      quote = ch;
    } else if (inStr && ch === quote) inStr = false;
    else if (!inStr && ch === "#") return line.slice(0, i);
  }
  return line;
}

function parseScalar(raw) {
  raw = raw.trim();
  if (raw === "") return null;
  if (raw === "null" || raw === "~") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw.startsWith('"') && raw.endsWith('"')) return JSON.parse(raw);
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1);
  if (raw.startsWith("[")) {
    const inner = raw.slice(1, -1).trim();
    if (inner === "") return [];
    return inner.split(",").map((s) => parseScalar(s));
  }
  if (raw.startsWith("{")) {
    const inner = raw.slice(1, -1).trim();
    if (inner === "") return {};
    const obj = {};
    for (const pair of inner.split(",")) {
      const [k, v] = pair.split(":");
      obj[k.trim()] = parseScalar(v);
    }
    return obj;
  }
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d*\.\d+$/.test(raw)) return parseFloat(raw);
  return raw;
}

function yamlParser(text) {
  // 预处理：去掉注释、空行，保留缩进
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  for (let line of rawLines) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    lines.push(stripComment(line).replace(/\s+$/, ""));
  }

  let pos = 0;

  function parseBlock(parentIndent) {
    let result = null;
    const isSeq = lines[pos] && lines[pos].trim().startsWith("-");

    if (isSeq) {
      result = [];
      while (
        pos < lines.length &&
        getIndent(lines[pos]) >= parentIndent &&
        lines[pos].trim().startsWith("-")
      ) {
        const indent = getIndent(lines[pos]);
        if (indent < parentIndent) break;
        const itemRaw = lines[pos].trim().slice(1).trim();
        pos++;
        if (itemRaw === "") {
          // 嵌套块
          if (pos < lines.length && getIndent(lines[pos]) > indent) {
            result.push(parseBlock(getIndent(lines[pos])));
          } else {
            result.push(null);
          }
        } else if (itemRaw.includes(":")) {
          // - key: value 形式，视为映射
          const sub = {};
          const [k, ...rest] = itemRaw.split(":");
          const v = rest.join(":").trim();
          if (v === "") {
            // 嵌套
            const childIndent = pos < lines.length ? getIndent(lines[pos]) : -1;
            if (childIndent > indent) {
              sub[k.trim()] = parseBlock(childIndent);
            } else {
              sub[k.trim()] = null;
            }
          } else {
            sub[k.trim()] = parseScalar(v);
          }
          // 检查后续同缩进的 key: value
          while (
            pos < lines.length &&
            getIndent(lines[pos]) > indent &&
            !lines[pos].trim().startsWith("-")
          ) {
            const [k2, ...rest2] = lines[pos].trim().split(":");
            const v2 = rest2.join(":").trim();
            pos++;
            if (v2 === "") {
              const ci = pos < lines.length ? getIndent(lines[pos]) : -1;
              sub[k2.trim()] =
                ci > getIndent(lines[pos - 1]) ? parseBlock(ci) : null;
            } else {
              sub[k2.trim()] = parseScalar(v2);
            }
          }
          result.push(sub);
        } else {
          result.push(parseScalar(itemRaw));
        }
      }
    } else {
      result = {};
      while (pos < lines.length) {
        const indent = getIndent(lines[pos]);
        if (indent < parentIndent) break;
        if (indent > parentIndent) {
          pos++;
          continue;
        }
        const [k, ...rest] = lines[pos].trim().split(":");
        const v = rest.join(":").trim();
        pos++;
        if (v === "") {
          // 嵌套块
          if (pos < lines.length && getIndent(lines[pos]) > indent) {
            result[k.trim()] = parseBlock(getIndent(lines[pos]));
          } else {
            result[k.trim()] = null;
          }
        } else {
          result[k.trim()] = parseScalar(v);
        }
      }
    }
    return result;
  }

  return parseBlock(0);
}

// ===== 测试用例 =====
const yamlText = `
name: MyApp
version: 2.5
enabled: true
database:
  host: localhost
  port: 3306
tags:
  - web
  - api
  - db
servers:
  - name: primary
    port: 8080
  - name: replica
    port: 8081
`;
const config = yamlParser(yamlText);
console.log(JSON.stringify(config, null, 2));
// 期望输出:
// {
//   "name": "MyApp",
//   "version": 2.5,
//   "enabled": true,
//   "database": { "host": "localhost", "port": 3306 },
//   "tags": ["web", "api", "db"],
//   "servers": [ { "name": "primary", "port": 8080 }, { "name": "replica", "port": 8081 } ]
// }

console.log(config.database.port); // 期望输出: 3306
console.log(config.tags[1]); // 期望输出: api
console.log(config.servers[0].name); // 期望输出: primary
