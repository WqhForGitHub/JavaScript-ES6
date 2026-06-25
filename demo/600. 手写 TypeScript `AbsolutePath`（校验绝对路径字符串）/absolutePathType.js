/**
 * 手写 TypeScript `AbsolutePath`（校验绝对路径字符串）
 *
 * 类型作用：
 *   校验字符串字面量类型 S 是否为绝对路径（以 / 或盘符开头）。
 *   命中则返回原类型 S，否则返回 never（编译期即拒绝非法路径）。
 *
 * 实现思路：
 *   利用模板字面量类型匹配前缀：
 *     // Unix 绝对路径：以 / 开头
//      type AbsolutePath<S extends string> =
//        S extends `/${string}` ? S : never;
 *
 *   若要同时支持 Windows 盘符路径（如 C:\...），可扩展为：
 *     type AbsolutePath<S extends string> =
//        S extends `/${string}`
//          ? S
//          : S extends `${string}:${string}`
//            ? S
//            : never;
 *
 * 运行时模拟：
 *   JS 用正则校验字符串是否为合法绝对路径。
 */

// ===== TypeScript 类型实现 =====
// // 仅 Unix 风格
// type AbsolutePath<S extends string> = S extends `/${string}` ? S : never;
//
// // 兼容 Windows 盘符
// type AbsolutePath<S extends string> =
//   S extends `/${string}`
//     ? S
//     : S extends `${string}:${string}`
//       ? S
//       : never;
//
// 示例：
//   type R1 = AbsolutePath<'/usr/local/bin'>; // '/usr/local/bin'
//   type R2 = AbsolutePath<'./relative'>;      // never
//   type R3 = AbsolutePath<'C:\\Users\\foo'>;  // 'C:\\Users\\foo'

// ===== 运行时模拟函数 =====
/**
 * 模拟 AbsolutePath：校验是否为 Unix 绝对路径（以 / 开头）
 * @param {string} s 待校验字符串
 * @returns {string} 校验通过返回原字符串
 * @throws {Error} 不是绝对路径时抛错（对应 TS 返回 never）
 */
function absolutePath(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  if (!s.startsWith("/")) {
    throw new Error(`"${s}" is not an absolute path`);
  }
  return s;
}

/**
 * 兼容 Windows 盘符的版本
 * @param {string} s
 * @returns {string}
 */
function absolutePathCrossPlatform(s) {
  if (typeof s !== "string") {
    throw new TypeError("Expected a string");
  }
  // Unix 风格 / 或 Windows 盘符 X:
  if (/^\/|^[A-Za-z]:[\\/]/.test(s)) {
    return s;
  }
  throw new Error(`"${s}" is not an absolute path`);
}

/**
 * 谓词版本：返回布尔值（不抛错）
 * @param {string} s
 * @returns {boolean}
 */
function isAbsolutePath(s) {
  if (typeof s !== "string") return false;
  return s.startsWith("/");
}

/**
 * 谓词版本（跨平台）
 * @param {string} s
 * @returns {boolean}
 */
function isAbsolutePathCrossPlatform(s) {
  if (typeof s !== "string") return false;
  return /^\/|^[A-Za-z]:[\\/]/.test(s);
}

/**
 * 类型守卫风格的封装（对应 TS 的类型谓词 S is AbsolutePath<S>）
 * @param {string} s
 * @returns {string|null} 合法返回原串，非法返回 null
 */
function asAbsolutePath(s) {
  return isAbsolutePath(s) ? s : null;
}

// ===== 测试 =====

// 合法 Unix 绝对路径
console.log(absolutePath("/usr/local/bin")); // '/usr/local/bin'
console.log(absolutePath("/")); // '/'
console.log(absolutePath("/home/user/file.txt")); // '/home/user/file.txt'

// 非法路径
try {
  absolutePath("./relative");
} catch (e) {
  console.log("catch:", e.message); // "./relative" is not an absolute path
}
try {
  absolutePath("relative/path");
} catch (e) {
  console.log("catch:", e.message); // "relative/path" is not an absolute path
}
try {
  absolutePath("");
} catch (e) {
  console.log("catch:", e.message); // "" is not an absolute path
}

// 跨平台版本
console.log(absolutePathCrossPlatform("/usr/local")); // '/usr/local'
console.log(absolutePathCrossPlatform("C:\\Users\\foo")); // 'C:\\Users\\foo'
console.log(absolutePathCrossPlatform("D:/data")); // 'D:/data'
try {
  absolutePathCrossPlatform("relative");
} catch (e) {
  console.log("catch:", e.message); // "relative" is not an absolute path
}

// 谓词版本
console.log(isAbsolutePath("/usr")); // true
console.log(isAbsolutePath("usr")); // false
console.log(isAbsolutePath("./usr")); // false
console.log(isAbsolutePath("")); // false
console.log(isAbsolutePath(123)); // false

console.log(isAbsolutePathCrossPlatform("/usr")); // true
console.log(isAbsolutePathCrossPlatform("C:\\foo")); // true
console.log(isAbsolutePathCrossPlatform("C:/foo")); // true
console.log(isAbsolutePathCrossPlatform("usr")); // false

// 类型守卫封装
console.log(asAbsolutePath("/usr")); // '/usr'
console.log(asAbsolutePath("usr")); // null

// 边界：仅盘符
console.log(isAbsolutePathCrossPlatform("C:\\")); // true
console.log(isAbsolutePathCrossPlatform("C:")); // false（无路径分隔符）

// 非字符串抛错
try {
  absolutePath(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a string
}
