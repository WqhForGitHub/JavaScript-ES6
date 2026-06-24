/**
 * 手写 `path.join`
 *
 * 作用：模拟 Node.js path.join([...paths])，把多个路径片段拼接成一个路径。
 *       规则：
 *         - 用平台分隔符连接所有片段
 *         - 规范化结果中的 . 和 ..、多余的分隔符
 *         - 如果所有片段都是空字符串，返回 '.'
 *         - 如果某片段不是字符串，抛 TypeError
 *
 *   与 path.resolve 的区别：
 *     - join 不解析为绝对路径，只做拼接 + 规范化
 *     - join('a','b') 返回 'a/b'，resolve('a','b') 返回 '/cwd/a/b'
 *
 * 实现思路：
 *   1. 收集所有非空片段
 *   2. 用 '/' 拼接
 *   3. 调用 normalizeString 处理 . 和 .. 以及多余 /
 *   4. 若结果为空，返回 '.'
 *   5. 保留结尾的 '/'（与 Node 行为一致：join 不保留尾部斜杠；这里实现不保留）
 */

function pathJoin(...args) {
  if (args.length === 0) return '.';

  let joined = '';
  let firstPart;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== 'string') {
      throw new TypeError('Path must be a string. Received ' + JSON.stringify(arg));
    }
    if (arg === '') continue;

    // 记录第一段，判断是否是绝对路径
    if (joined === '') {
      firstPart = arg;
      joined = arg;
    } else {
      // 避免重复斜杠
      if (joined[joined.length - 1] === '/' || arg[0] === '/') {
        joined += arg;
      } else {
        joined += '/' + arg;
      }
    }
  }

  if (joined === '') return '.';

  // 判断是否绝对路径
  const isAbsolute = joined[0] === '/';
  // 检测盘符
  let device = '';
  const winDriveMatch = /^([a-zA-Z]:)(.*)/.exec(joined);
  if (winDriveMatch) {
    device = winDriveMatch[1];
    joined = winDriveMatch[2];
  }

  // 规范化
  const normalized = normalizeString(joined, !isAbsolute);

  let result = normalized;
  if (device) result = device + (result[0] === '/' ? '' : '/') + result;
  if (isAbsolute && (!device)) result = '/' + result;

  // 若规范化后为空
  if (result === '' || result === device) return device ? device + '/' : '.';
  return result;
}

// 复用 normalizeString（处理 . 和 ..）
function normalizeString(path, allowAboveRoot) {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;

  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);
    else code = 47;

    if (code === 47 /* / */) {
      if (lastSlash === i - 1 || dots === 1) {
        // '//' 或 '/.'，跳过
      } else if (lastSlash !== i - 1 && dots === 2) {
        // '..'，回退一段
        if (
          res.length === 2 ||
          res.length === 1 ||
          (res.length > 0 && res.charCodeAt(res.length - 1) === 46 &&
            (res.length < 2 || res.charCodeAt(res.length - 2) === 46))
        ) {
          // 已经在根，忽略
        } else if (res.length > 0) {
          const idx = res.lastIndexOf('/', res.length - 2);
          if (idx === -1) res = '';
          else res = res.slice(0, idx);
        }
        dots = 0;
        lastSlash = i;
        continue;
      }
      if (res) res += '/';
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

// ===== 测试 =====

console.log(pathJoin('/foo', 'bar', 'baz/asdf', 'quux', '..'));
// '/foo/bar/baz/asdf'

console.log(pathJoin('foo', 'bar', 'baz')); // 'foo/bar/baz'

// 非字符串参数会抛 TypeError
try {
  pathJoin('foo', 123, 'bar');
  console.log('should have thrown');
} catch (e) {
  console.log('error type:', e instanceof TypeError); // true
}

console.log(pathJoin('a/b', 'c/d', '../e')); // 'a/b/c/e'
console.log(pathJoin('a/b', '..', '..', 'c')); // 'c'
console.log(pathJoin('/a', '/b', '/c')); // '/a/b/c'
console.log(pathJoin('')); // '.'
console.log(pathJoin('.', '.')); // '.'
console.log(pathJoin('foo//bar', 'baz')); // 'foo/bar/baz'
console.log(pathJoin('foo/', '/bar')); // 'foo/bar'
console.log(pathJoin('./a', './b', './c')); // 'a/b/c'

// 与原生对比（如果可用）
if (typeof require === 'function') {
  try {
    const path = require('path');
    const cases = [['/foo', 'bar', 'baz/asdf', 'quux', '..'], ['a/b', 'c/d', '../e'], ['foo', 'bar', 'baz']];
    for (const c of cases) {
      const mine = pathJoin(...c);
      const native = path.join(...c);
      console.log(`compare [${c.join(',')}]: mine=${mine} native=${native} same=${mine === native}`);
    }
  } catch (e) {
    // 模块不可用，跳过
  }
}
