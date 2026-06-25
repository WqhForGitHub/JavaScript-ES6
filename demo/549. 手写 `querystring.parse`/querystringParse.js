/**
 * 手写 `querystring.parse`
 *
 * 作用：模拟 Node.js querystring.parse(str, sep, eq, options)。
 *       把查询字符串解析为对象。
 *       规则：
 *         - 默认 sep='&'，eq='='
 *         - 键和值都做 URL 解码（%xx）
 *         - '+' 解码为空格
 *         - 重复的键合并为数组
 *         - 没有 = 的键，值为空字符串 ''
 *         - options.maxKeys 限制最大键数（默认 1000，0 表示不限制）
 *         - options.decodeURIComponent 自定义解码函数
 *
 * 实现思路：
 *   1. 按 sep 分割成键值对
 *   2. 对每对按 eq 分割为 key/value（无 eq 则 value=''）
 *   3. 解码 key 和 value
 *   4. 同名 key 合并为数组
 *   5. 限制 maxKeys
 */

function querystringParse(str, sep = "&", eq = "=", options = {}) {
  const obj = Object.create(null);

  if (typeof str !== "string" || str.length === 0) {
    return obj;
  }

  const maxKeys = typeof options.maxKeys === "number" ? options.maxKeys : 1000;
  const decode = options.decodeURIComponent || defaultDecode;

  const pairs = str.split(sep);
  let count = 0;

  for (const pair of pairs) {
    if (pair === "") continue;
    if (maxKeys > 0 && count >= maxKeys) break;

    const idx = pair.indexOf(eq);
    let key, value;
    if (idx === -1) {
      key = pair;
      value = "";
    } else {
      key = pair.slice(0, idx);
      value = pair.slice(idx + 1);
    }

    try {
      key = decode(key);
    } catch (e) {
      key = unescape(key);
    }
    try {
      value = decode(value);
    } catch (e) {
      value = unescape(value);
    }

    // 同名合并为数组
    if (key in obj) {
      const existing = obj[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[key] = [existing, value];
      }
    } else {
      obj[key] = value;
    }
    count++;
  }

  return obj;
}

// 默认解码：+ -> 空格，%xx 解码
function defaultDecode(s) {
  return decodeURIComponent(s.replace(/\+/g, " "));
}

// ===== 测试 =====

console.log(querystringParse("foo=bar&baz=qux&baz=quux&corge"));
// { foo: 'bar', baz: ['qux', 'quux'], corge: '' }

console.log(querystringParse("a=1&b=2&c=3"));
// { a: '1', b: '2', c: '3' }

// 空字符串
console.log(querystringParse("")); // {}

// URL 编码
console.log(querystringParse("name=%E5%BC%A0%E4%B8%89&age=18"));
// { name: '张三', age: '18' }

// + 解码为空格
console.log(querystringParse("q=hello+world")); // { q: 'hello world' }

// 自定义分隔符
console.log(querystringParse("a=1;b=2;c=3", ";"));
// { a: '1', b: '2', c: '3' }

// 自定义等号
console.log(querystringParse("a:1|b:2", "|", ":"));
// { a: '1', b: '2' }

// 重复键合并数组
console.log(querystringParse("tag=js&tag=node&tag=css"));
// { tag: ['js', 'node', 'css'] }

// maxKeys 限制
console.log(querystringParse("a=1&b=2&c=3&d=4", "&", "=", { maxKeys: 2 }));
// { a: '1', b: '2' }

// maxKeys=0 表示不限制
console.log(
  Object.keys(querystringParse("a=1&b=2&c=3", "&", "=", { maxKeys: 0 })).length,
); // 3

// 自定义解码
console.log(
  querystringParse("x=A_B", "&", "=", {
    decodeURIComponent: (s) => s.replace(/_/g, " "),
  }),
);
// { x: 'A B' }

// 无值的键
console.log(querystringParse("checkbox1&checkbox2&checkbox3"));
// { checkbox1: '', checkbox2: '', checkbox3: '' }

// 与原生对比
if (typeof require === "function") {
  try {
    const qs = require("querystring");
    const cases = [
      "foo=bar&baz=qux&baz=quux&corge",
      "name=%E5%BC%A0%E4%B8%89&age=18",
      "q=hello+world",
    ];
    for (const c of cases) {
      const mine = querystringParse(c);
      const native = qs.parse(c);
      console.log(
        `compare [${c}]:`,
        JSON.stringify(mine) === JSON.stringify(native),
      );
    }
  } catch (e) {
    // 跳过
  }
}
