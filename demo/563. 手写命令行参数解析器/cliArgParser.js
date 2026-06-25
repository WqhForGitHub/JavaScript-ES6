/**
 * 手写命令行参数解析器
 *
 * 功能：解析 process.argv，支持 --flag、--key=value、--key value、-k value、短选项合并
 * 实现思路：
 *   1. 跳过前两项(node 与脚本路径)，从下标 2 开始遍历
 *   2. 识别 -- 前缀(长选项)、- 前缀(短选项)、无前缀(位置参数 _)
 *   3. 支持 alias 别名映射、boolean 标记、default 默认值
 *   4. 数字字符串自动转为 number；-- 之后的参数全部视为位置参数
 *   5. 同名键多次出现自动转为数组
 */

/** 尝试把值转为 number（仅纯数字） */
function coerce(val, isBoolean) {
  if (isBoolean || typeof val !== "string") return val;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  return val;
}

function assign(obj, key, val) {
  if (key in obj) {
    if (Array.isArray(obj[key])) obj[key].push(val);
    else obj[key] = [obj[key], val];
  } else {
    obj[key] = val;
  }
}

/**
 * 解析参数
 * @param {string[]} argv       通常是 process.argv
 * @param {object} options      { alias, boolean, default }
 * @returns {object} 解析结果，含 _ 位置参数
 */
function parseArgs(argv, options = {}) {
  const { alias = {}, boolean = [], defaults = {} } = options;
  const boolSet = new Set(boolean.map(String));
  const result = { _: [], ...defaults };

  const args = argv.slice(2);
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    // -- 之后全部视为位置参数
    if (arg === "--") {
      result._.push(...args.slice(i + 1));
      break;
    }

    // 长选项 --key / --key=value
    if (arg.startsWith("--")) {
      const body = arg.slice(2);
      const eq = body.indexOf("=");
      let key, val;
      if (eq !== -1) {
        key = body.slice(0, eq);
        val = body.slice(eq + 1);
      } else {
        key = body;
        val = undefined;
      }
      key = alias[key] || key;
      const isBool = boolSet.has(key);

      if (
        val === undefined &&
        !isBool &&
        i + 1 < args.length &&
        !looksLikeFlag(args[i + 1])
      ) {
        val = args[++i];
      }
      if (val === undefined)
        val = true; // 无值的标志位
      else val = coerce(val, isBool);

      assign(result, key, val);
    }
    // 短选项 -k / -k value / -abc 合并
    else if (arg.startsWith("-") && arg.length > 1 && arg !== "-") {
      const chars = arg.slice(1);
      if (chars.includes("=")) {
        const eqIdx = chars.indexOf("=");
        const k = alias[chars.slice(0, eqIdx)] || chars.slice(0, eqIdx);
        assign(result, k, coerce(chars.slice(eqIdx + 1), boolSet.has(k)));
      } else {
        for (let j = 0; j < chars.length; j++) {
          const c = chars[j];
          const key = alias[c] || c;
          const isBool = boolSet.has(key);
          // 最后一个字符且非布尔且有后续值
          if (
            j === chars.length - 1 &&
            !isBool &&
            i + 1 < args.length &&
            !looksLikeFlag(args[i + 1])
          ) {
            assign(result, key, coerce(args[++i], isBool));
          } else {
            assign(result, key, true);
          }
        }
      }
    }
    // 位置参数
    else {
      result._.push(arg);
    }
    i++;
  }

  return result;
}

function looksLikeFlag(s) {
  if (s.startsWith("-") && s.length > 1 && s !== "-") {
    // 负数(如 -0.5 / -10)不算 flag，应作为值
    if (/^-?\d+(\.\d+)?$/.test(s)) return false;
    return true;
  }
  return false;
}

// ===== 测试 =====
console.log("=== 命令行参数解析器演示 ===");

// 1) 基本长选项
const a1 = parseArgs([
  "node",
  "cli.js",
  "--name=alice",
  "--age",
  "30",
  "--verbose",
]);
console.log("基本解析:", a1);
// { _:[], name:'alice', age:30, verbose:true }

// 2) 短选项与别名
const a2 = parseArgs(["node", "cli.js", "-n", "bob", "-a", "25", "-vd"], {
  alias: { n: "name", a: "age", v: "verbose", d: "debug" },
});
console.log("短选项+别名:", a2);
// { _:[], name:'bob', age:25, verbose:true, debug:true }

// 3) 位置参数与 -- 分隔
const a3 = parseArgs([
  "node",
  "cli.js",
  "file1.txt",
  "--",
  "--not-a-flag",
  "file2.txt",
]);
console.log("位置参数:", a3);
// { _: ['file1.txt', '--not-a-flag', 'file2.txt'] }

// 4) 布尔标记（不消费下一个值）
const a4 = parseArgs(["node", "cli.js", "--color", "red"], {
  boolean: ["color"],
});
console.log("布尔标记:", a4);
// { _: ['red'], color:true }

// 5) 默认值
const a5 = parseArgs(["node", "cli.js"], {
  defaults: { port: 3000, host: "0.0.0.0" },
});
console.log("默认值:", a5); // { _:[], port:3000, host:'0.0.0.0' }

// 6) 同名键转数组
const a6 = parseArgs([
  "node",
  "cli.js",
  "--tag",
  "a",
  "--tag",
  "b",
  "--tag",
  "c",
]);
console.log("同名键数组:", a6); // { _:[], tag:['a','b','c'] }

// 7) 数字与负数
const a7 = parseArgs([
  "node",
  "cli.js",
  "--count",
  "100",
  "--ratio",
  "-0.5",
  "--name",
  "x",
]);
console.log("数字类型:", a7); // { count:100, ratio:-0.5, name:'x' }

// 8) 真实 process.argv 演示（无额外参数时）
const a8 = parseArgs(process.argv);
console.log("process.argv 解析 _ 长度:", a8._.length);
