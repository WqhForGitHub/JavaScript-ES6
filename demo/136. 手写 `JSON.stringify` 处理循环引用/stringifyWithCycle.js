/**
 * 手写 JSON.stringify 处理循环引用
 *
 * 作用：
 *   - 原生 JSON.stringify 遇到循环引用会抛 TypeError
 *   - 本实现在遇到循环引用时用占位标记替代，避免报错
 *
 * 策略：
 *   - 用一个 WeakSet 记录正在序列化的对象
 *   - 递归进入对象前先检查是否已在集合中：
 *       是 → 说明是循环引用，输出 "[Circular]" 占位（而非抛错）
 *       否 → 加入集合，继续序列化
 *   - 序列化完成后从集合移除（允许同一对象在不同分支出现）
 *
 * 支持类型：对象、数组、字符串、数字、布尔、null
 */

function stringifyWithCycle(value) {
  const seen = new WeakSet();

  function serialize(val) {
    if (val === null) return "null";
    if (val === undefined) return null; // 作为属性值时忽略

    const type = typeof val;

    if (type === "string") return quote(val);
    if (type === "number") return isFinite(val) ? String(val) : "null";
    if (type === "boolean") return val ? "true" : "false";
    if (type === "function" || type === "symbol") return null; // 忽略

    if (type === "object") {
      // 循环引用检测
      if (seen.has(val)) {
        return '"[Circular]"';
      }
      seen.add(val);

      let result;
      if (Array.isArray(val)) {
        const parts = [];
        for (const item of val) {
          const s = serialize(item);
          parts.push(s === null ? "null" : s);
        }
        result = "[" + parts.join(",") + "]";
      } else if (val instanceof Date) {
        result = quote(val.toISOString());
      } else {
        const parts = [];
        for (const key of Object.keys(val)) {
          const s = serialize(val[key]);
          if (s === null) continue; // 忽略 undefined/function/symbol
          parts.push(quote(key) + ":" + s);
        }
        result = "{" + parts.join(",") + "}";
      }

      // 序列化完成，从集合移除（允许同对象在不同分支出现）
      seen.delete(val);
      return result;
    }

    return null;
  }

  function quote(str) {
    let r = '"';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const code = str.charCodeAt(i);
      if (ch === '"') r += '\\"';
      else if (ch === "\\") r += "\\\\";
      else if (ch === "\n") r += "\\n";
      else if (ch === "\r") r += "\\r";
      else if (ch === "\t") r += "\\t";
      else if (ch === "\b") r += "\\b";
      else if (ch === "\f") r += "\\f";
      else if (code < 0x20) r += "\\u" + code.toString(16).padStart(4, "0");
      else r += ch;
    }
    r += '"';
    return r;
  }

  const out = serialize(value);
  return out === null ? undefined : out;
}

// ===== 测试 =====

// 无循环引用：与普通 stringify 一致
console.log(stringifyWithCycle({ a: 1, b: "hi" })); // '{"a":1,"b":"hi"}'
console.log(stringifyWithCycle([1, 2, 3])); // '[1,2,3]'

// 对象自引用（循环）
const cyclic = { name: "node", children: [] };
cyclic.children.push(cyclic);
console.log(stringifyWithCycle(cyclic));
// '{"name":"node","children":["[Circular]"]}'

// 相互引用
const a = { name: "a" };
const b = { name: "b" };
a.partner = b;
b.partner = a;
console.log(stringifyWithCycle(a));
// '{"name":"a","partner":{"name":"b","partner":"[Circular]"}}'

// 同一对象在不同分支（非循环）应正常出现两次
const shared = { v: 1 };
const container = { x: shared, y: shared };
console.log(stringifyWithCycle(container));
// '{"x":{"v":1},"y":{"v":1}}'（shared 出现两次，未被当成循环）

// 数组循环引用
const arr = [1, 2];
arr.push(arr);
console.log(stringifyWithCycle(arr));
// '[1,2,"[Circular]"]'

// 嵌套循环
const root2 = {
  level: 0,
  child: {
    level: 1,
    child: {
      level: 2,
    },
  },
};
root2.child.child.back = root2.child; // 指向中间层
console.log(stringifyWithCycle(root2));
// '{"level":0,"child":{"level":1,"child":{"level":2,"back":"[Circular]"}}}'
