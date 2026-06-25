/**
 * 手写简易路径解析器（支持 . 和 ..）
 *
 * 类似 Node.js path.resolve / path.normalize，处理路径中的：
 *   - 多余分隔符 / 和 \
 *   - . （当前目录）
 *   - .. （上级目录）
 *   - 相对路径与绝对路径
 *
 * 实现思路：
 * 1. 统一把 \ 替换为 /。
 * 2. 拆分为段数组。
 * 3. 遍历段：遇到普通段入栈，'.' 忽略，'..' 弹出栈顶（绝对路径时栈底不弹出）。
 * 4. 绝对路径以 / 开头重组，相对路径以段连接。
 *
 * @param {string} input - 输入路径
 * @param {string} [base] - 基准路径（用于相对路径解析）
 * @returns {string} 规范化后的路径
 */
function normalizeSegments(segments, isAbsolute) {
  const result = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (result.length > 0 && result[result.length - 1] !== "..") {
        result.pop();
      } else if (!isAbsolute) {
        result.push("..");
      }
      continue;
    }
    result.push(seg);
  }
  return result;
}

function pathParser(input, base) {
  // 统一分隔符
  let combined = input.replace(/\\/g, "/");

  // 如果提供了 base 且 input 是相对路径，先拼接
  if (base && !combined.startsWith("/")) {
    combined = base.replace(/\\/g, "/") + "/" + combined;
  }

  const isAbsolute = combined.startsWith("/");
  const segments = combined.split("/");
  const normalized = normalizeSegments(segments, isAbsolute);

  let result = normalized.join("/");
  if (isAbsolute) {
    result = "/" + result;
  }
  return result === "" ? (isAbsolute ? "/" : ".") : result;
}

// 仅规范化（不拼接 base）
function normalize(input) {
  return pathParser(input);
}

// 解析为 { dir, base, ext, name }
function parsePath(input) {
  const normalized = input.replace(/\\/g, "/");
  const slashIdx = normalized.lastIndexOf("/");
  const dir = slashIdx === -1 ? "" : normalized.slice(0, slashIdx);
  const base = slashIdx === -1 ? normalized : normalized.slice(slashIdx + 1);
  const dotIdx = base.lastIndexOf(".");
  const ext = dotIdx > 0 ? base.slice(dotIdx) : "";
  const name = ext ? base.slice(0, dotIdx) : base;
  return { dir, base, ext, name };
}

// ===== 测试用例 =====
console.log(normalize("/a/b/c/.././d")); // 期望输出: /a/b/d
console.log(normalize("a/b/../../c")); // 期望输出: c
console.log(normalize("/a//b///c")); // 期望输出: /a/b/c
console.log(normalize("./a/b/.")); // 期望输出: a/b
console.log(normalize("C:\\Users\\..\\docs")); // 期望输出: C:/docs

console.log(pathParser("b/c", "/a/b")); // 期望输出: /a/b/b/c
console.log(pathParser("../x", "/a/b/c")); // 期望输出: /a/b/x

console.log(JSON.stringify(parsePath("/a/b/c.txt")));
// 期望输出: { "dir": "/a/b", "base": "c.txt", "ext": ".txt", "name": "c" }
