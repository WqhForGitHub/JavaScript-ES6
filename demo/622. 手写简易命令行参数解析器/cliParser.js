/**
 * 手写简易命令行参数解析器
 *
 * 解析类 Unix 风格的命令行参数，支持：
 *   - 短选项 -a、-abc（合并）
 *   - 长选项 --name、--name=value、--name value
 *   - 布尔标志
 *   -- 分隔符（其后均为位置参数）
 *   - 位置参数
 *
 * 实现思路：
 * 1. 维护指针遍历参数数组。
 * 2. 遇到 -- 时，剩余全部作为位置参数。
 * 3. 遇到 -- 开头：解析 key=value 或读取下一个值。
 * 4. 遇到 - 开头：逐字符处理短选项。
 * 5. 其它视为位置参数。
 *
 * @param {string[]} argv - 参数数组（通常为 process.argv.slice(2)）
 * @param {Object} [options] - 配置项，如 { alias: { v: 'verbose' }, defaults: {...} }
 * @returns {{flags: Object, params: string[]}} 解析结果
 */
function cliParser(argv, options = {}) {
  const { alias = {}, defaults = {}, boolean = [] } = options;
  const flags = { ...defaults };
  const params = [];
  let i = 0;
  let onlyParams = false;

  function setFlag(key, value) {
    // 布尔标记不消费下一个值
    if (boolean.includes(key) && value === undefined) {
      flags[key] = true;
      return;
    }
    if (value === undefined) {
      // 尝试消费下一个值
      if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        flags[key] = argv[++i];
      } else {
        flags[key] = true;
      }
    } else {
      flags[key] = value;
    }
  }

  function resolveAlias(key) {
    return alias[key] || key;
  }

  while (i < argv.length) {
    const arg = argv[i];

    if (onlyParams) {
      params.push(arg);
      i++;
      continue;
    }

    if (arg === "--") {
      onlyParams = true;
      i++;
      continue;
    }

    // 长选项
    if (arg.startsWith("--")) {
      const body = arg.slice(2);
      const eqIdx = body.indexOf("=");
      if (eqIdx !== -1) {
        const key = resolveAlias(body.slice(0, eqIdx));
        setFlag(key, body.slice(eqIdx + 1));
      } else {
        const key = resolveAlias(body);
        setFlag(key, undefined);
      }
      i++;
      continue;
    }

    // 短选项
    if (arg.startsWith("-") && arg.length > 1) {
      const chars = arg.slice(1);
      for (let c = 0; c < chars.length; c++) {
        const key = resolveAlias(chars[c]);
        // 若为布尔标记或最后字符，按标志处理
        if (boolean.includes(key) || c < chars.length - 1) {
          if (boolean.includes(key)) {
            flags[key] = true;
          } else {
            // 短选项中间字符视为布尔
            flags[key] = true;
          }
        } else {
          setFlag(key, undefined);
        }
      }
      i++;
      continue;
    }

    // 位置参数
    params.push(arg);
    i++;
  }

  return { flags, params };
}

// ===== 测试用例 =====
console.log(
  JSON.stringify(
    cliParser(["--name=Alice", "--verbose", "file.txt"], {
      boolean: ["verbose"],
    }),
    null,
    2,
  ),
);
// 期望输出:
// { "flags": { "name": "Alice", "verbose": true }, "params": ["file.txt"] }

console.log(
  JSON.stringify(
    cliParser(["-abc", "123", "--port", "8080", "--", "--not-a-flag"], {
      alias: { a: "all", b: "bold", c: "count" },
    }),
    null,
    2,
  ),
);
// 期望输出:
// { "flags": { "all": true, "bold": true, "count": "123", "port": "8080" }, "params": ["--not-a-flag"] }

console.log(
  JSON.stringify(
    cliParser(["--output=result.log", "--force", "input.txt"], {
      boolean: ["force"],
      defaults: { force: false },
    }),
    null,
    2,
  ),
);
// 期望输出:
// { "flags": { "output": "result.log", "force": true }, "params": ["input.txt"] }
