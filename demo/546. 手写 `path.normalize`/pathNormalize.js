/**
 * 手写 `path.normalize`
 *
 * 作用：模拟 Node.js path.normalize(path)，规范化路径字符串：
 *         - 合并多个连续的 '/'
 *         - 解析 '.' 段（当前目录，去除）
 *         - 解析 '..' 段（上级目录，回退）
 *         - 保留开头的 '/'（绝对路径）
 *         - 保留结尾的 '/'（若规范化后非根目录）
 *         - 若结果为空，返回 '.'
 *
 *   注意：normalize 不会把相对路径转成绝对路径，也不解析符号链接。
 *
 * 实现思路：
 *   1. 检测开头是否 '/'
 *   2. 检测结尾是否 '/'
 *   3. 按 '/' split 成段
 *   4. 遍历段：
 *        '' 或 '.' 跳过
 *        '..'：若结果栈非空弹出，否则（绝对路径下）忽略
 *        其他：入栈
 *   5. 重新拼接，按需补开头/结尾 '/'
 */

function pathNormalize(path) {
  if (typeof path !== "string") {
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(path),
    );
  }
  if (path === "") return ".";

  // 检测 Windows 盘符
  let device = "";
  let rest = path;
  const winDriveMatch = /^([a-zA-Z]:)(.*)/.exec(path);
  if (winDriveMatch) {
    device = winDriveMatch[1];
    rest = winDriveMatch[2];
  }

  const isAbsolute = rest[0] === "/";
  const trailingSlash = rest.length > 0 && rest[rest.length - 1] === "/";

  // 按斜杠拆分
  const segments = rest.split("/").filter((s) => s !== "");
  const stack = [];

  for (const seg of segments) {
    if (seg === ".") {
      // 跳过
      continue;
    }
    if (seg === "..") {
      if (stack.length > 0 && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!isAbsolute) {
        // 相对路径下保留 ..（无法回退到根之外）
        stack.push("..");
      }
      // 绝对路径下 .. 在根处忽略
      continue;
    }
    stack.push(seg);
  }

  let result = stack.join("/");

  // 拼接
  if (isAbsolute) {
    result = "/" + result;
  }
  if (device) {
    result = device + result;
  }

  // 结尾斜杠
  if (trailingSlash && result.length > 0 && result[result.length - 1] !== "/") {
    // 根 '/' 单独处理
    if (result !== "/" || !device) {
      if (result !== "/" || device) result += "/";
    }
  }

  if (result === "" || result === device) return device ? device + "." : ".";
  return result;
}

// ===== 测试 =====

console.log(pathNormalize("/foo/bar//baz/asdf/quux/.."));
// '/foo/bar/baz/asdf'

console.log(pathNormalize("/foo/bar/../baz")); // '/foo/baz'
console.log(pathNormalize("/foo/./bar")); // '/foo/bar'
console.log(pathNormalize("foo/bar/../baz")); // 'foo/baz'
console.log(pathNormalize("a/./b/../c/")); // 'a/c/'
console.log(pathNormalize("/a/b/../../c")); // '/c'
console.log(pathNormalize("/a/b/../../../c")); // '/c' (绝对路径下 .. 不会超出根)
console.log(pathNormalize("")); // '.'
console.log(pathNormalize(".")); // '.'
console.log(pathNormalize("./")); // './' -> 实际 Node 返回 './'，这里我们处理为 '.'
console.log(pathNormalize("..")); // '..'
console.log(pathNormalize("../..")); // '../..'
console.log(pathNormalize("/")); // '/'
console.log(pathNormalize("//server/share/dir")); // '/server/share/dir'

// 多余斜杠合并
console.log(pathNormalize("a///b//c")); // 'a/b/c'
console.log(pathNormalize("/a//b//c/")); // '/a/b/c/'

// Windows 盘符
console.log(pathNormalize("C:\\foo\\..\\bar")); // 'C:/foo/../bar' -> 简化处理反斜杠
// 注意：本实现不专门处理反斜杠分隔符（POSIX 风格）

// 与原生对比（如果可用）
if (typeof require === "function") {
  try {
    const path = require("path");
    const cases = [
      "/foo/bar//baz/asdf/quux/..",
      "a/./b/../c/",
      "/a/b/../../c",
      "..",
      "",
    ];
    for (const c of cases) {
      const mine = pathNormalize(c);
      const native = path.posix.normalize(c);
      console.log(
        `compare [${c}]: mine=${mine} native=${native} same=${mine === native}`,
      );
    }
  } catch (e) {
    // 跳过
  }
}
