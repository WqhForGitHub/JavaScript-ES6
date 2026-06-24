/**
 * 手写对象路径取值 get
 *
 * 作用：
 *   - 按路径（如 'a.b.c' 或 ['a', 'b', 'c']）安全取值
 *   - 路径不存在时返回默认值，避免报错
 *   - 类似 lodash.get
 *
 * 实现思路：
 *   1. 统一路径为数组：字符串用 split('.')，数组直接用
 *   2. 逐层访问，遇到 null/undefined 立即返回默认值
 *   3. 走完所有路径段则返回最终值
 *
 * 支持：
 *   - 点号路径 'a.b.c'
 *   - 数组路径 ['a', 0, 'b']
 *   - 包含数组索引的字符串路径 'a[0].b'
 */

function parsePath(path) {
  if (Array.isArray(path)) {
    return path.map(String);
  }
  if (typeof path !== "string") {
    return [];
  }
  // 支持 'a.b.c' 和 'a[0].b' 两种写法
  // 将 'a[0].b' 拆成 ['a', '0', 'b']
  const result = [];
  const segments = path.split(".");
  for (const seg of segments) {
    // 处理 a[0][1] 形式
    const match = seg.match(/^([^\[]*)((?:\[\d+\])*)$/);
    if (!match) {
      result.push(seg);
      continue;
    }
    if (match[1]) result.push(match[1]);
    if (match[2]) {
      const indices = match[2].match(/\[(\d+)\]/g) || [];
      for (const idx of indices) {
        result.push(idx.slice(1, -1));
      }
    }
  }
  return result;
}

function getObject(obj, path, defaultValue) {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }

  const segments = parsePath(path);
  let current = obj;

  for (const seg of segments) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[seg];
  }

  return current === undefined ? defaultValue : current;
}

// ===== 测试 =====

const obj = {
  a: {
    b: {
      c: 42,
      d: null,
    },
    arr: [10, 20, { x: 99 }],
  },
  top: "hello",
};

// 基本路径取值
console.log(getObject(obj, "a.b.c")); // 42

// 路径不存在返回默认值
console.log(getObject(obj, "a.b.z", "default")); // 'default'

// 中间为 null/undefined
console.log(getObject(obj, "a.d.x", "fallback")); // 'fallback'

// 数组路径（字符串形式）
console.log(getObject(obj, "a.arr[0]")); // 10
console.log(getObject(obj, "a.arr[2].x")); // 99

// 数组路径（数组形式）
console.log(getObject(obj, ["a", "arr", 2, "x"])); // 99

// 顶层取值
console.log(getObject(obj, "top")); // 'hello'

// 完全不存在的路径
console.log(getObject(obj, "x.y.z", null)); // null

// obj 本身为 null/undefined
console.log(getObject(null, "a.b", "safe")); // 'safe'
console.log(getObject(undefined, "a.b", "safe")); // 'safe'

// 默认值参数省略时返回 undefined
console.log(getObject(obj, "a.b.notExist")); // undefined

// 取到 null 值本身（null 不是 undefined，应返回 null）
console.log(getObject(obj, "a.b.d", "default")); // null
