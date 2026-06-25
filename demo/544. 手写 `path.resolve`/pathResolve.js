/**
 * 手写 `path.resolve`
 *
 * 作用：模拟 Node.js path.resolve([...paths])，把路径序列解析为绝对路径。
 *       规则：
 *         - 从右向左逐个处理参数，直到遇到一个绝对路径（以 / 或盘符开头）为止
 *         - 把剩余路径片段拼接起来
 *         - 如果没有任何绝对路径，则以当前工作目录 cwd 为前缀
 *         - 结果一定是绝对路径
 *         - 会规范化 . 和 .. 以及多余的 /
 *
 * 实现思路：
 *   1. 平台：以 POSIX 为主，同时支持 Windows 盘符（C:）
 *   2. 从右向左扫描，记录片段，遇到绝对路径停止
 *   3. 若没遇到绝对路径，prepend cwd
 *   4. 规范化：分割 -> 处理 . 和 .. -> 重新拼接
 *   5. 保留开头的盘符或根斜杠
 */

function pathResolve(...args) {
  // 默认 cwd（Node 中是 process.cwd()，这里允许注入或用默认值）
  const cwd = pathResolve.cwd || process.cwd();

  let resolvedPath = "";
  let resolvedAbsolute = false;
  let device = ""; // Windows 盘符，如 'C:'

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : cwd;

    if (typeof path !== "string") {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (path === "") continue;

    // 检测 Windows 盘符（C: 或 C:\）
    const winDriveMatch = /^([a-zA-Z]:)(.*)/.exec(path);
    if (winDriveMatch && !device) {
      device = winDriveMatch[1];
      resolvedPath = winDriveMatch[2] || resolvedPath;
    } else {
      resolvedPath = path + "/" + resolvedPath;
    }

    resolvedAbsolute =
      resolvedPath[0] === "/" || (device && resolvedPath[0] === "/");
  }

  // 此时 resolvedAbsolute 为 true（如果有 cwd 兜底）
  // 规范化路径
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);

  // 拼接最终结果
  let result =
    (device || "") + (resolvedPath[0] === "/" ? "" : "/") + resolvedPath;
  // 确保绝对
  if (!device && result[0] !== "/") result = "/" + result;
  if (result.length === 0) result = device ? device + "/" : "/";
  return result;
}

// 规范化路径字符串（处理 . 和 ..）
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;

  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);
    else code = 47; // '/'

    if (code === 47 /* / */) {
      if (lastSlash === i - 1 || dots === 1) {
        // '..' 或 '.'，跳过
      } else if (lastSlash !== i - 1 && dots === 2) {
        // '..'，回退一段
        if (
          res.length === 0 ||
          res.charCodeAt(res.length - 1) !== 46 /* . */ ||
          res.length < 2 ||
          res.charCodeAt(res.length - 2) !== 46
        ) {
          if (res.length > 2) {
            lastSegmentLength = res.length - 1;
            lastSlash = res.lastIndexOf("/", lastSegmentLength - 1);
            if (lastSlash === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlash);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            dots = 0;
            lastSlash = i;
            continue;
          }
        } else if (res.length === 2 || res.length === 1) {
          res = "";
          lastSegmentLength = 0;
          lastSlash = i;
          dots = 0;
          continue;
        }
      }
      if (res) res += "/";
      res += path.slice(lastSlash + 1, i);
      lastSegmentLength = i - lastSlash - 1;
      dots = 0;
      lastSlash = i;
    } else if (code === 46 /* . */ && dots !== -1) {
      dots++;
    } else {
      dots = -1;
    }
  }
  return res;
}

// 设置默认 cwd（便于测试）
pathResolve.cwd = "/home/user";

// ===== 测试 =====

console.log(pathResolve("/foo/bar", "./baz")); // '/foo/bar/baz'
console.log(pathResolve("/foo/bar", "/tmp/file/")); // '/tmp/file'
console.log(pathResolve("wwwroot", "static_files/png/", "../gif/image.gif"));
// '/home/user/wwwroot/static_files/gif/image.gif'
console.log(pathResolve()); // '/home/user' (cwd)
console.log(pathResolve("")); // '/home/user'

// 相对路径回退
console.log(pathResolve("/a/b/c", "../../d")); // '/a/d'
console.log(pathResolve("/a/b/c", "./d/e/../f")); // '/a/b/c/d/f'

// 多个绝对路径取最后一个
console.log(pathResolve("/root", "/var", "log")); // '/var/log'

// 超出根目录的 ..
console.log(pathResolve("/a", "../../../b")); // '/b'

// Windows 盘符（仅作演示，POSIX 环境下也可识别）
console.log(pathResolve("C:\\foo", "bar")); // 'C:/foo/bar' (简化处理)

// 与 cwd 拼接
pathResolve.cwd = "/projects/app";
console.log(pathResolve("src", "index.js")); // '/projects/app/src/index.js'
console.log(pathResolve("./src", "../config/settings.json"));
// '/projects/app/config/settings.json'
