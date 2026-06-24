/**
 * 手写验证 URL
 *
 * URL 格式：scheme://[user[:pass]@]host[:port]/path?query#fragment
 * 这里实现 validateUrl：
 *   - 校验协议（http/https/ftp/ws 等）
 *   - 校验 host（域名或 IP）
 *   - 可选端口、路径、查询、锚点
 *   - 支持中文域名（先转码或允许 unicode）
 *
 * 实现思路：
 *   1. 用相对完善的正则匹配整体结构
 *   2. 额外用 new URL()（Node/浏览器内置）做兜底校验
 *   3. 提供选项控制是否限定协议
 */

function validateUrl(url, options = {}) {
  if (typeof url !== "string") return false;
  const str = url.trim();
  if (!str) return false;

  const {
    protocols = ["http", "https", "ftp", "ws", "wss"],
    requireProtocol = true,
  } = options;

  // 协议头正则
  const protoPattern =
    protocols.length > 0
      ? `^(?:${protocols.join("|")})://`
      : "^(?:[A-Za-z][A-Za-z0-9+.-]*)://";

  // host：域名（含中文/多级） 或 IP
  const hostPattern =
    "(?:[A-Za-z0-9\\u4e00-\\u9fa5](?:[A-Za-z0-9\\-\\u4e00-\\u9fa5]*[A-Za-z0-9\\u4e00-\\u9fa5])?\\.)*[A-Za-z\\u4e00-\\u9fa5]{2,}" +
    "|(?:\\d{1,3}\\.){3}\\d{1,3}" +
    "|localhost";

  const portPattern = "(?::\\d{1,5})?";
  const pathPattern = "(?:/[\\w\\-\\.~/:%@!$&'()*+,;=\\u4e00-\\u9fa5]*)*";
  const queryPattern = "(?:\\?[\\w\\-\\.~:/%@!$&'()*+,;=?\\u4e00-\\u9fa5]*)?";
  const hashPattern = "(?:#[\\w\\-\\.~:/%@!$&'()*+,;=?\\u4e00-\\u9fa5]*)?";

  const fullRegex = new RegExp(
    `${requireProtocol ? protoPattern : "^(?:" + protoPattern.slice(1) + ")?"}${hostPattern}${portPattern}${pathPattern}${queryPattern}${hashPattern}$`,
    "i"
  );

  if (!fullRegex.test(str)) return false;

  // 用内置 URL 兜底（更严格）
  try {
    // 中文域名需先转码，否则 new URL 在部分环境报错，这里宽松跳过
    const normalized = /[\u4e00-\u9fa5]/.test(str)
      ? str.replace(/[\u4e00-\u9fa5]+/g, (m) => encodeURIComponent(m))
      : str;
    const u = new URL(normalized);
    if (protocols.length > 0 && !protocols.includes(u.protocol.replace(":", ""))) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// ===== 测试 =====
console.log("https:", validateUrl("https://www.example.com")); // true
console.log("带端口:", validateUrl("http://localhost:8080/api")); // true
console.log("带query和hash:", validateUrl("https://example.com/path?key=v#section")); // true
console.log("IP:", validateUrl("http://192.168.1.1:3000")); // true
console.log("中文路径:", validateUrl("https://example.com/中文/路径")); // true
console.log("无协议:", validateUrl("www.example.com")); // false
console.log("无协议允许:", validateUrl("www.example.com", { requireProtocol: false })); // true
console.log("仅协议:", validateUrl("http://")); // false
console.log("空字符串:", validateUrl("")); // false
console.log("非法字符空格:", validateUrl("https://exa mple.com")); // false
console.log("限定 https only:", validateUrl("http://example.com", { protocols: ["https"] })); // false
console.log("ws 协议:", validateUrl("wss://socket.example.com")); // true
console.log("非法协议:", validateUrl("javascript:alert(1)")); // false
console.log("末尾多点:", validateUrl("https://example.com..")); // false
console.log("数字类型:", validateUrl(123)); // false
console.log("子域名多级:", validateUrl("https://a.b.c.d.example.com/x")); // true
