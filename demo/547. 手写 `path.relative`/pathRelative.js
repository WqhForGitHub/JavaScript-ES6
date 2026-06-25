/**
 * 手写 `path.relative(from, to)
 *
 * 作用：模拟 Node.js path.relative(from, to)，返回从 from 到 to 的相对路径。
 *       规则：
 *         - 两个路径都先 resolve 成绝对路径（基于 cwd）
 *         - 找到两条路径的最长公共前缀
 *         - from 在公共前缀之后还有 N 段，相对路径就以 N 个 '..' 开头
 *         - 再拼接 to 在公共前缀之后的剩余段
 *         - 如果两路径相同，返回 ''
 *         - 如果两路径在不同根（如不同盘符），返回 to 的绝对路径
 *
 * 实现思路：
 *   1. 规范化 from 和 to
 *   2. 拆分段数组 fromParts / toParts
 *   3. 找公共前缀长度 i
 *   4. back = fromParts.length - i 个 '..'
 *   5. forward = toParts.slice(i)
 *   6. 拼接 back + forward，若为空返回 '.'
 */

function pathRelative(from, to) {
  if (typeof from !== "string") {
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(from),
    );
  }
  if (typeof to !== "string") {
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(to),
    );
  }

  // 注入的 cwd（便于测试）
  const cwd = pathRelative.cwd || "/";

  // 规范化两路径（这里假设它们已是规范形式或简单规范化）
  const fromAbs = resolveToAbsolute(from, cwd);
  const toAbs = resolveToAbsolute(to, cwd);

  // 检测根是否一致（Windows 盘符）
  const fromDrive = /^([a-zA-Z]:)/.exec(fromAbs);
  const toDrive = /^([a-zA-Z]:)/.exec(toAbs);
  if (fromDrive && toDrive && fromDrive[1] !== toDrive[1]) {
    // 不同盘符，返回 to 的绝对路径
    return toAbs;
  }

  // 去掉盘符
  const fromPath = fromDrive ? fromAbs.slice(fromDrive[1].length) : fromAbs;
  const toPath = toDrive ? toAbs.slice(toDrive[1].length) : toAbs;

  const fromParts = fromPath.split("/").filter((s) => s !== "");
  const toParts = toPath.split("/").filter((s) => s !== "");

  // 找公共前缀
  let i = 0;
  while (
    i < fromParts.length &&
    i < toParts.length &&
    fromParts[i] === toParts[i]
  ) {
    i++;
  }

  // from 需要回退的层数
  const upCount = fromParts.length - i;
  const relativeParts = [];
  for (let j = 0; j < upCount; j++) relativeParts.push("..");

  // 拼接 to 的剩余部分
  for (let j = i; j < toParts.length; j++) relativeParts.push(toParts[j]);

  let result = relativeParts.join("/");

  // 还原盘符
  if (toDrive && result) result = toDrive[1] + result;

  if (result === "") return ".";
  return result;
}

// 简化版 resolve：把相对路径转绝对
function resolveToAbsolute(p, cwd) {
  if (p === "") p = cwd;
  // 检测盘符
  const driveMatch = /^([a-zA-Z]:)(.*)/.exec(p);
  let drive = "";
  let rest = p;
  if (driveMatch) {
    drive = driveMatch[1];
    rest = driveMatch[2];
  }
  const isAbsolute = rest[0] === "/";
  if (!isAbsolute) {
    rest = cwd + "/" + rest;
  }
  // 规范化
  const parts = rest.split("/").filter((s) => s !== "" && s !== ".");
  const stack = [];
  for (const part of parts) {
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return drive + "/" + stack.join("/");
}

// 设置 cwd 便于测试
pathRelative.cwd = "/projects/app";

// ===== 测试 =====

console.log(pathRelative("/data/orandea/test/aaa", "/data/orandea/impl/bbb"));
// '../../impl/bbb'

console.log(pathRelative("/a/b/c", "/a/b/c")); // '.'
console.log(pathRelative("/a/b/c", "/a/b/c/d")); // 'd'
console.log(pathRelative("/a/b/c/d", "/a/b/c")); // '..'
console.log(pathRelative("/a/b", "/a/b/c/d/e")); // 'c/d/e'
console.log(pathRelative("/a/b/c/d/e", "/a/b")); // '../../..'

// 完全不同的根下路径
console.log(pathRelative("/x/y", "/a/b")); // '../a/b'
console.log(pathRelative("/a/b/c", "/x/y/z")); // '../../../x/y/z'

// 相对路径作为输入（基于 cwd）
pathRelative.cwd = "/home/user";
console.log(pathRelative("a/b", "a/c")); // '../c'
console.log(pathRelative("docs", "docs/guide/intro.md")); // 'guide/intro.md'

// 空字符串
console.log(pathRelative("", "foo")); // 'foo' (from 为 cwd)
console.log(pathRelative("foo", "")); // '..' (to 为 cwd)

// 同路径
pathRelative.cwd = "/";
console.log(pathRelative("/foo", "/foo")); // '.'

// 不同盘符（Windows 风格）
console.log(pathRelative("C:/foo", "D:/bar")); // 'D:/bar'

// 与原生对比
if (typeof require === "function") {
  try {
    const path = require("path");
    pathRelative.cwd = process.cwd();
    const cases = [
      ["/data/orandea/test/aaa", "/data/orandea/impl/bbb"],
      ["/a/b/c", "/a/b/c/d"],
      ["/a/b/c/d", "/a/b/c"],
    ];
    for (const [f, t] of cases) {
      const mine = pathRelative(f, t);
      const native = path.relative(f, t);
      console.log(
        `compare [${f} -> ${t}]: mine=${mine} native=${native} same=${mine === native}`,
      );
    }
  } catch (e) {
    // 跳过
  }
}
