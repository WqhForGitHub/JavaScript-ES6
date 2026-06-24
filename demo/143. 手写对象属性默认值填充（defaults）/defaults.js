/**
 * 手写对象属性默认值填充 defaults
 *
 * 作用：
 *   - 用默认值对象填充目标对象中缺失的属性
 *   - 仅当目标对象该属性为 undefined 时才填充
 *   - 类似 lodash.defaults / Object.assign 的"反向"版本
 *   - 不修改默认值对象，返回目标对象
 *
 * 示例：
 *   defaults({ a: 1 }, { a: 99, b: 2 }) → { a: 1, b: 2 }
 *   （a 已存在保留，b 缺失用默认值）
 *
 * 与 Object.assign 的区别：
 *   - Object.assign: 后者覆盖前者（无论是否 undefined）
 *   - defaults: 已存在的值（非 undefined）不被覆盖
 *
 * 实现思路：
 *   1. 遍历默认值对象的所有属性
 *   2. 若目标对象该属性为 undefined，则用默认值填充
 *   3. 支持多个默认值源（靠前的优先级高）
 */

function defaults(target, ...sources) {
  if (target === null || typeof target !== "object") {
    return target;
  }

  for (const source of sources) {
    if (source === null || source === undefined) continue;
    if (typeof source !== "object") continue;

    for (const key of Object.keys(source)) {
      // 仅当目标对象该属性为 undefined 时才填充
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }

  return target;
}

// 不修改原对象的纯函数版本
function defaultsDeep(target, ...sources) {
  const result = { ...target };
  for (const source of sources) {
    if (source === null || source === undefined) continue;
    if (typeof source !== "object") continue;

    for (const key of Object.keys(source)) {
      if (result[key] === undefined) {
        result[key] = source[key];
      } else if (
        typeof result[key] === "object" &&
        result[key] !== null &&
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(result[key]) &&
        !Array.isArray(source[key])
      ) {
        // 嵌套对象也递归填充默认值
        result[key] = defaultsDeep(result[key], source[key]);
      }
    }
  }
  return result;
}

// ===== 测试 =====

// 基本默认值填充
console.log(defaults({ a: 1 }, { a: 99, b: 2 }));
// { a: 1, b: 2 }

// undefined 会被默认值覆盖
console.log(defaults({ a: undefined, b: 2 }, { a: 1 }));
// { a: 1, b: 2 }

// null 不会被覆盖（null 是有意义的值）
console.log(defaults({ a: null }, { a: 1 }));
// { a: null }

// 多个默认值源（靠前优先）
console.log(defaults({ a: 1 }, { b: 2 }, { b: 99, c: 3 }));
// { a: 1, b: 2, c: 3 }

// 空目标
console.log(defaults({}, { a: 1, b: 2 }));
// { a: 1, b: 2 }

// 不存在的属性用默认值
console.log(defaults({ x: 1 }, { x: 2, y: 3, z: 4 }));
// { x: 1, y: 3, z: 4 }

// 配置合并典型场景
const defaultConfig = {
  host: "localhost",
  port: 3000,
  debug: false,
};
const userConfig = {
  port: 8080,
  // host 未提供
};
const finalConfig = defaultsDeep({}, userConfig, defaultConfig);
console.log(finalConfig);
// { port: 8080, host: 'localhost', debug: false }

// 深层默认值
const deepDefault = { db: { host: "127.0.0.1", port: 3306 } };
const deepUser = { db: { port: 3307 } };
console.log(defaultsDeep({}, deepUser, deepDefault));
// { db: { port: 3307, host: '127.0.0.1' } }
