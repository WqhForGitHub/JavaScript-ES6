/**
 * 手写 `querystring.stringify`
 *
 * 作用：模拟 Node.js querystring.stringify(obj, sep, eq, options)。
 *       把对象序列化为查询字符串。
 *       规则：
 *         - 默认 sep='&'，eq='='
 *         - key 和 value 都做 URL 编码（空格 -> %20，特殊字符 -> %xx）
 *         - 数组值：同一个 key 重复出现多次
 *         - 嵌套对象：用 encodeURIComponent 的 key（可选，这里简化为 a[b]=v 形式）
 *         - 空对象返回 ''
 *         - 值为 null/undefined 时只输出 key（或 key=，根据实现）
 *
 * 实现思路：
 *   1. 遍历对象的所有 key
 *   2. 对每个 key，取出 value：
 *        - 数组：每个元素生成一对
 *        - 对象：递归生成 key[subkey]
 *        - 其他：encodeURIComponent
 *   3. 用 sep 拼接所有对
 */

function querystringStringify(obj, sep = '&', eq = '=', options = {}) {
  if (obj === null || typeof obj !== 'object') return '';

  const encode = options.encodeURIComponent || defaultEncode;
  const pairs = [];

  function serialize(prefix, value) {
    if (value === null || value === undefined) {
      pairs.push(encode(prefix));
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined) {
          pairs.push(encode(prefix));
        } else {
          pairs.push(encode(prefix) + eq + encode(item));
        }
      }
      return;
    }
    if (typeof value === 'object') {
      for (const k of Object.keys(value)) {
        const key = prefix ? prefix + '[' + k + ']' : k;
        serialize(key, value[k]);
      }
      return;
    }
    // 基本类型
    pairs.push(encode(prefix) + eq + encode(value));
  }

  for (const key of Object.keys(obj)) {
    serialize(key, obj[key]);
  }

  return pairs.join(sep);
}

function defaultEncode(s) {
  // 转字符串并编码
  if (typeof s !== 'string') {
    if (typeof s === 'number' && !isFinite(s)) s = String(s);
    else if (typeof s === 'bigint') s = String(s);
    else if (s && typeof s.toString === 'function') s = s.toString();
    else s = String(s);
  }
  return encodeURIComponent(s);
}

// ===== 测试 =====

console.log(querystringStringify({ foo: 'bar', baz: 'qux', baz2: 'quux' }));
// 'foo=bar&baz=qux&baz2=quux'

console.log(querystringStringify({ a: '1', b: '2', c: '3' }));
// 'a=1&b=2&c=3'

// 中文编码
console.log(querystringStringify({ name: '张三', age: '18' }));
// 'name=%E5%BC%A0%E4%B8%89&age=18'

// 数组值
console.log(querystringStringify({ tag: ['js', 'node', 'css'] }));
// 'tag=js&tag=node&tag=css'

// 嵌套对象
console.log(querystringStringify({ user: { name: 'Tom', age: '20' } }));
// 'user[name]=Tom&user[age]=20'

// 空对象
console.log(querystringStringify({})); // ''

// 空值
console.log(querystringStringify({ a: '', b: null }));
// 'a=&b'

// 自定义 sep/eq
console.log(querystringStringify({ a: '1', b: '2' }, ';', ':'));
// 'a:1;b:2'

// 自定义 encode
console.log(querystringStringify({ x: 'A B' }, '&', '=', {
  encodeURIComponent: s => encodeURIComponent(s).replace(/%20/g, '+'),
}));
// 'x=A+B' （空格编码为 +）

// 数字值
console.log(querystringStringify({ count: 100, price: 9.99 }));
// 'count=100&price=9.99'

// 布尔值
console.log(querystringStringify({ active: true, deleted: false }));
// 'active=true&deleted=false'

// 嵌套数组
console.log(querystringStringify({ items: ['a', 'b'], page: '1' }));
// 'items=a&items=b&page=1'

// 与原生对比
if (typeof require === 'function') {
  try {
    const qs = require('querystring');
    const cases = [
      { foo: 'bar', baz: 'qux' },
      { name: '张三', age: '18' },
      { tag: ['js', 'node', 'css'] },
      { a: '', b: null },
    ];
    for (const c of cases) {
      const mine = querystringStringify(c);
      const native = qs.stringify(c);
      console.log(`compare:`, mine, 'vs', native, 'same=', mine === native);
    }
  } catch (e) {
    // 跳过
  }
}
