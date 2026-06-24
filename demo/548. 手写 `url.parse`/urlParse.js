/**
 * 手写 `url.parse`
 *
 * 作用：模拟 Node.js 遗留 url.parse(urlString, parseQueryString, slashesDenoteHost)。
 *       把 URL 字符串解析成包含各部分的对象：
 *         - protocol、slashes、auth（username/password）
 *         - host、hostname、port
 *         - path、pathname、search、query、hash
 *         - href（原始字符串）
 *
 *   注意：url.parse 已被 WHATWG URL 取代，但仍常见于老代码。
 *         它相对宽松，能解析不规范 URL。
 *
 * 实现思路（不依赖正则，逐步切片）：
 *   1. 提取 hash (#...)
 *   2. 提取 protocol (xxx: 形式)
 *   3. 处理 // 之后的 auth@host:port 部分
 *   4. 剩余部分为 path（含 search）
 *   5. 从 path 中分离 search (?...)
 *   6. parseQueryString=true 时把 query 字符串解析成对象
 */

function urlParse(urlString, parseQueryString = false, slashesDenoteHost = false) {
  if (typeof urlString !== 'string') {
    throw new TypeError(`Parameter "url" must be a string, not ${typeof urlString}`);
  }

  const result = {
    protocol: null,
    slashes: null,
    auth: null,
    host: null,
    port: null,
    hostname: null,
    hash: null,
    search: null,
    query: null,
    pathname: null,
    path: null,
    href: urlString,
  };

  let str = urlString;
  let hasHash = false;

  // 1. 提取 hash
  const hashIdx = str.indexOf('#');
  if (hashIdx !== -1) {
    result.hash = str.slice(hashIdx);
    str = str.slice(0, hashIdx);
    hasHash = true;
  }

  // 2. 提取 protocol（形如 xxx:）
  // 协议字符：字母数字 + . + -
  const protoMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(str);
  let rest = str;
  if (protoMatch) {
    result.protocol = protoMatch[1] + ':';
    rest = str.slice(protoMatch[0].length);
  }

  // 3. 判断 slashes（协议后跟 //）
  let slashes = false;
  if (rest.startsWith('//')) {
    slashes = true;
    rest = rest.slice(2);
  } else if (slashesDenoteHost && rest.startsWith('/')) {
    // 特殊：slashesDenoteHost=true 时，即使没有 protocol 也把 // 当作 host 标记
  }

  // 判断是否有 host 部分
  const hasHost = slashes || (result.protocol && rest[0] !== '/' && rest[0] !== '?');

  if (hasHost) {
    // host 部分在第一个 / 或 ? 之前
    let hostEnd = rest.length;
    const slashIdx = rest.indexOf('/');
    const qIdx = rest.indexOf('?');
    if (slashIdx !== -1) hostEnd = Math.min(hostEnd, slashIdx);
    if (qIdx !== -1) hostEnd = Math.min(hostEnd, qIdx);

    let hostPart = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // auth: user:pass@
    const atIdx = hostPart.lastIndexOf('@');
    if (atIdx !== -1) {
      result.auth = hostPart.slice(0, atIdx);
      hostPart = hostPart.slice(atIdx + 1);
    }

    // IPv6 [::1]:port
    if (hostPart[0] === '[') {
      const bracketEnd = hostPart.indexOf(']');
      if (bracketEnd !== -1) {
        result.hostname = hostPart.slice(0, bracketEnd + 1);
        const after = hostPart.slice(bracketEnd + 1);
        if (after.startsWith(':')) {
          result.port = after.slice(1);
        }
      } else {
        result.hostname = hostPart;
      }
    } else {
      const colonIdx = hostPart.indexOf(':');
      if (colonIdx !== -1) {
        result.hostname = hostPart.slice(0, colonIdx);
        result.port = hostPart.slice(colonIdx + 1);
      } else {
        result.hostname = hostPart;
      }
    }

    result.host = hostPart;
    if (result.port) result.host = result.hostname + ':' + result.port;
  }

  result.slashes = slashes;

  // 4. 处理 path 部分（pathname + search）
  // rest 现在以 / 或 ? 开头，或为空
  if (rest === '' && !result.host) {
    result.pathname = null;
    result.path = null;
  } else {
    const qIdx = rest.indexOf('?');
    if (qIdx === -1) {
      result.pathname = rest;
      result.search = null;
      result.query = null;
    } else {
      result.pathname = rest.slice(0, qIdx);
      result.search = rest.slice(qIdx);
      const queryString = rest.slice(qIdx + 1);
      result.query = parseQueryString ? parseQueryStringFn(queryString) : queryString;
    }
    result.path = rest;
  }

  // 补全默认值
  if (result.pathname === null) result.pathname = result.host ? '/' : null;

  return result;
}

function parseQueryStringFn(qs, sep = '&', eq = '=') {
  const obj = {};
  if (!qs) return obj;
  const pairs = qs.split(sep);
  for (const pair of pairs) {
    if (!pair) continue;
    const idx = pair.indexOf(eq);
    let key, value;
    if (idx === -1) {
      key = pair;
      value = '';
    } else {
      key = pair.slice(0, idx);
      value = pair.slice(idx + 1);
    }
    key = decodeURIComponent(key.replace(/\+/g, ' '));
    value = decodeURIComponent(value.replace(/\+/g, ' '));
    if (key in obj) {
      if (Array.isArray(obj[key])) obj[key].push(value);
      else obj[key] = [obj[key], value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

// ===== 测试 =====

console.log(urlParse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash'));
// { protocol: 'http:', slashes: true, auth: 'user:pass',
//   host: 'host.com:8080', hostname: 'host.com', port: '8080',
//   pathname: '/p/a/t/h', search: '?query=string', query: 'query=string',
//   path: '/p/a/t/h?query=string', hash: '#hash' }

console.log(urlParse('https://example.com/'));
// { protocol: 'https:', host: 'example.com', hostname: 'example.com', port: null,
//   pathname: '/', path: '/', search: null, query: null, hash: null }

console.log(urlParse('/local/path?q=1'));
// { protocol: null, host: null, pathname: '/local/path', search: '?q=1', query: 'q=1' }

console.log(urlParse('mailto:test@example.com'));
// { protocol: 'mailto:', pathname: 'test@example.com' }

// parseQueryString=true
const r = urlParse('http://host/?a=1&b=2&a=3', true);
console.log('parsed query:', r.query); // { a: ['1','3'], b: '2' }

// IPv6
console.log(urlParse('http://[::1]:3000/path'));
// hostname: '[::1]', port: '3000'

// 只有 hash
console.log(urlParse('#section'));
// { hash: '#section', pathname: null, ... }

// 与原生对比
if (typeof require === 'function') {
  try {
    const url = require('url');
    const cases = [
      'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
      'https://example.com/',
      '/local/path?q=1',
    ];
    for (const c of cases) {
      const mine = urlParse(c);
      const native = url.parse(c);
      console.log(`compare protocol host pathname:`, mine.protocol, mine.host, mine.pathname,
        '| native:', native.protocol, native.host, native.pathname);
    }
  } catch (e) {
    // 跳过
  }
}
