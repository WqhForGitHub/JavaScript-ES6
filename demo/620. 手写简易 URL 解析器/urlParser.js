/**
 * 手写简易 URL 解析器
 *
 * 解析 URL 字符串为结构化对象，包含：
 *   protocol、host、port、path、query（对象）、hash、username、password
 *
 * 实现思路：
 * 1. 先用正则匹配整体结构：protocol://[userinfo@]host[:port]/path?query#hash
 * 2. 分别提取各部分。
 * 3. query 字符串用 & 分割、= 分割键值，做 URL 解码。
 *
 * @param {string} url - URL 字符串
 * @returns {Object} 解析结果
 */
function urlParser(url) {
  const result = {
    protocol: null,
    username: null,
    password: null,
    host: null,
    port: null,
    path: "/",
    query: {},
    hash: null,
  };

  let rest = url;

  // 解析 hash
  const hashIdx = rest.indexOf("#");
  if (hashIdx !== -1) {
    result.hash = rest.slice(hashIdx + 1);
    rest = rest.slice(0, hashIdx);
  }

  // 解析 query
  const queryIdx = rest.indexOf("?");
  if (queryIdx !== -1) {
    const queryString = rest.slice(queryIdx + 1);
    rest = rest.slice(0, queryIdx);
    if (queryString) {
      for (const pair of queryString.split("&")) {
        const [key, val = ""] = pair.split("=");
        const decodedKey = decodeURIComponent(key);
        const decodedVal = decodeURIComponent(val.replace(/\+/g, " "));
        if (result.query[decodedKey] === undefined) {
          result.query[decodedKey] = decodedVal;
        } else if (Array.isArray(result.query[decodedKey])) {
          result.query[decodedKey].push(decodedVal);
        } else {
          result.query[decodedKey] = [result.query[decodedKey], decodedVal];
        }
      }
    }
  }

  // 解析 protocol
  const protoMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
  if (protoMatch) {
    result.protocol = protoMatch[1];
    rest = rest.slice(protoMatch[0].length);
  } else {
    // 可能是 mailto: 之类
    const colonIdx = rest.indexOf(":");
    if (colonIdx !== -1 && !rest.slice(0, colonIdx).includes("/")) {
      result.protocol = rest.slice(0, colonIdx);
      rest = rest.slice(colonIdx + 1);
    }
  }

  // 解析 userinfo
  const atIdx = rest.lastIndexOf("@");
  if (atIdx !== -1 && rest.slice(0, atIdx).indexOf("/") === -1) {
    const userinfo = rest.slice(0, atIdx);
    rest = rest.slice(atIdx + 1);
    const colonIdx = userinfo.indexOf(":");
    if (colonIdx !== -1) {
      result.username = userinfo.slice(0, colonIdx);
      result.password = userinfo.slice(colonIdx + 1);
    } else {
      result.username = userinfo;
    }
  }

  // 分离 host[:port] 和 path
  const slashIdx = rest.indexOf("/");
  const hostPort = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
  result.path = slashIdx === -1 ? "/" : rest.slice(slashIdx);

  // 解析 host 和 port（同时处理 IPv6 [::1]）
  if (hostPort.startsWith("[")) {
    const closeBracket = hostPort.indexOf("]");
    result.host = hostPort.slice(0, closeBracket + 1);
    const after = hostPort.slice(closeBracket + 1);
    if (after.startsWith(":")) result.port = after.slice(1);
  } else {
    const colonIdx = hostPort.indexOf(":");
    if (colonIdx !== -1) {
      result.host = hostPort.slice(0, colonIdx);
      result.port = hostPort.slice(colonIdx + 1);
    } else {
      result.host = hostPort || null;
    }
  }

  return result;
}

// ===== 测试用例 =====
console.log(
  JSON.stringify(
    urlParser(
      "https://www.example.com:8080/path/to/page?key1=value1&key2=value2#section",
    ),
    null,
    2,
  ),
);
// 期望输出:
// {
//   "protocol": "https",
//   "username": null, "password": null,
//   "host": "www.example.com", "port": "8080",
//   "path": "/path/to/page",
//   "query": { "key1": "value1", "key2": "value2" },
//   "hash": "section"
// }

console.log(urlParser("https://user:pass@api.site.io/users?id=1&id=2").query);
// 期望输出: { id: [ '1', '2' ] }

console.log(urlParser("mailto:test@example.com"));
// 期望输出 protocol: "mailto", path: "test@example.com"
