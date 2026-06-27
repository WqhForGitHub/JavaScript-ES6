/**
 * 手写模糊测试 (Fuzz Testing)
 * ===========================
 *
 * 概念说明:
 * 模糊测试 (Fuzz Testing / Fuzzing) 通过向目标程序输入大量随机或畸形数据,
 * 自动发现崩溃 / 异常 / 未处理边界等缺陷. 广泛用于解析器、协议实现、文件格式处理.
 *
 * 核心组成:
 * 1. 输入生成 (Input Generation):
 *    - 随机字节流
 *    - 边界值 (0, -1, MAX_INT, 空串, 超长串)
 *    - 变异策略 (mutation): 翻转位 / 插入 / 删除 / 重复 / 拼接已知种子
 * 2. 目标执行: 把输入喂给被测函数, 捕获异常
 * 3. 崩溃收集: 记录导致失败的输入, 去重, 可作为回归用例
 * 4. 覆盖率引导 (本实现未做): 真实 fuzzer (如 AFL) 用覆盖率引导变异方向
 *
 * 本实现要点:
 * - 提供 Fuzzer 类, 内置多种输入生成器与变异器
 * - 支持 seed 语料库 (corpus), 新发现的崩溃加入语料
 * - 去重崩溃 (按错误信息签名)
 */

"use strict";

/**
 * 可种子化随机数 (xorshift32)
 */
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1e9) / 1e9;
  };
}

// ------------------------------------------------------------
// 输入生成器 (Generators)
// ------------------------------------------------------------

/**
 * 边界值集合: 经典容易触发 bug 的取值
 */
const EDGE_CASES = [
  "",
  "0",
  "-1",
  "0x0",
  "null",
  "undefined",
  "NaN",
  "Infinity",
  "-Infinity",
  "true",
  "false",
  "[]",
  "{}",
  "[null]",
  '{"a":null}',
  "undefined",
  "\x00",
  "\uffff",
  "\u0000\u0001\u0002",
  "a".repeat(1000),
  "a".repeat(10000),
  "<script>alert(1)</script>",
  "{{{{{",
  "}}}}}",
  '""""',
  "null,",
  "0e0",
  "1e999",
  "-0",
  "0.1",
  "3.141592653589793",
];

/**
 * 随机字节字符串生成器
 */
function randomString(rng, maxLen = 64) {
  const len = Math.floor(rng() * maxLen) + 1;
  let s = "";
  for (let i = 0; i < len; i++) {
    // 覆盖 ASCII 可打印 + 部分控制字符
    const code = Math.floor(rng() * 128);
    s += String.fromCharCode(code);
  }
  return s;
}

/**
 * 随机 JSON 风格字符串 (畸形 / 合法混合)
 */
function randomJsonLike(rng) {
  const templates = [
    () => `{${randomKey(rng)}:${randomValue(rng)}}`,
    () => `[${randomValue(rng)},${randomValue(rng)}]`,
    () => `{"${randomString(rng, 8)}"`,
    () => `${randomValue(rng)},`,
    () => `{"a":{"b":{"c":${randomValue(rng)}}}}`,
  ];
  return templates[Math.floor(rng() * templates.length)]();
}

function randomKey(rng) {
  return `"${randomString(rng, 8)}"`;
}

function randomValue(rng) {
  const choices = [
    "null",
    "true",
    "false",
    String(Math.floor(rng() * 1e6)),
    `"${randomString(rng, 10)}"`,
    "[]",
    "{}",
  ];
  return choices[Math.floor(rng() * choices.length)];
}

// ------------------------------------------------------------
// 变异器 (Mutators)
// ------------------------------------------------------------

/**
 * 位翻转
 */
function bitFlip(str) {
  if (!str) return str;
  const arr = [...str];
  const idx = Math.floor(Math.random() * arr.length);
  const code = arr[idx].charCodeAt(0);
  const bit = 1 << Math.floor(Math.random() * 8);
  arr[idx] = String.fromCharCode(code ^ bit);
  return arr.join("");
}

/**
 * 插入随机字符
 */
function insertByte(str) {
  const pos = Math.floor(Math.random() * (str.length + 1));
  const ch = String.fromCharCode(Math.floor(Math.random() * 128));
  return str.slice(0, pos) + ch + str.slice(pos);
}

/**
 * 删除随机字符
 */
function deleteByte(str) {
  if (!str.length) return str;
  const pos = Math.floor(Math.random() * str.length);
  return str.slice(0, pos) + str.slice(pos + 1);
}

/**
 * 重复某段
 */
function duplicateChunk(str) {
  if (str.length < 2) return str;
  const start = Math.floor(Math.random() * str.length);
  const end = start + Math.floor(Math.random() * (str.length - start)) + 1;
  const chunk = str.slice(start, end);
  return str.slice(0, end) + chunk + str.slice(end);
}

const MUTATORS = [bitFlip, insertByte, deleteByte, duplicateChunk];

/**
 * 对种子进行随机变异
 */
function mutate(rng, seed) {
  const mutator = MUTATORS[Math.floor(rng() * MUTATORS.length)];
  return mutator(seed);
}

// ------------------------------------------------------------
// Fuzzer 主类
// ------------------------------------------------------------

/**
 * 模糊测试运行器
 */
class Fuzzer {
  /**
   * @param {object} [options]
   * @param {number} [options.seed] - 随机种子
   * @param {string[]} [options.corpus] - 初始语料库
   */
  constructor(options = {}) {
    this.rng = makeRng(
      options.seed != null ? options.seed : Date.now() & 0xffffffff,
    );
    this.corpus =
      options.corpus && options.corpus.length
        ? [...options.corpus]
        : [...EDGE_CASES];
    /** @type {Map<string, {input: string, error: string, kind: string}>} */
    this.crashes = new Map();
    this.execCount = 0;
    this.crashCount = 0;
  }

  /**
   * 生成下一个输入
   * 50% 概率从语料库选种子并变异, 50% 概率全新随机生成
   */
  nextInput() {
    const r = this.rng();
    if (r < 0.4 && this.corpus.length) {
      const base = this.corpus[Math.floor(this.rng() * this.corpus.length)];
      return mutate(this.rng, base);
    } else if (r < 0.7) {
      return randomString(this.rng, 128);
    } else if (r < 0.9) {
      return randomJsonLike(this.rng);
    } else {
      // 直接用边界值
      return EDGE_CASES[Math.floor(this.rng() * EDGE_CASES.length)];
    }
  }

  /**
   * 运行单次测试
   * @param {Function} target - 被测函数, 接收字符串输入
   * @param {string} input
   * @returns {{ok: boolean, error?: string, kind?: string}}
   */
  runOnce(target, input) {
    this.execCount++;
    try {
      target(input);
      return { ok: true };
    } catch (e) {
      // 区分 "预期异常" 与 "崩溃":
      // 这里把所有抛错都视为潜在缺陷
      const error = `${e.name}: ${e.message}`;
      // 错误种类签名: 取错误名 + 消息前 40 字符
      const kind = e.name;
      return { ok: false, error, kind };
    }
  }

  /**
   * 运行模糊测试
   * @param {Function} target - 被测函数 (input: string) => any
   * @param {object} [options]
   * @param {number} [options.iterations=1000]
   * @param {number} [options.maxCrashes=20] - 收集到该数量后停止
   */
  fuzz(target, options = {}) {
    const iterations = options.iterations || 1000;
    const maxCrashes = options.maxCrashes || 20;

    for (let i = 0; i < iterations; i++) {
      if (this.crashes.size >= maxCrashes) break;
      const input = this.nextInput();
      const result = this.runOnce(target, input);
      if (!result.ok) {
        this.crashCount++;
        // 按错误签名去重
        const sig = `${result.kind}::${result.error.slice(0, 60)}`;
        if (!this.crashes.has(sig)) {
          this.crashes.set(sig, {
            input,
            error: result.error,
            kind: result.kind,
          });
          // 把发现崩溃的输入加入语料库, 便于进一步变异
          this.corpus.push(input);
        }
      }
    }
  }

  /**
   * 获取崩溃报告
   */
  report() {
    return {
      executions: this.execCount,
      crashes: this.crashCount,
      uniqueCrashes: this.crashes.size,
      details: [...this.crashes.values()],
    };
  }
}

// ============================================================
// 被测目标: 一个简易 JSON 解析器 (故意有缺陷)
// ============================================================

/**
 * 简易 JSON 解析器 (递归下降, 仅支持子集, 故意保留若干缺陷)
 * 支持: 对象 / 数组 / 字符串 / 数字 / true / false / null
 */
class SimpleJsonParser {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  peek() {
    return this.input[this.pos];
  }

  skipWs() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  parse() {
    this.skipWs();
    if (this.pos >= this.input.length) {
      throw new Error("空输入");
    }
    const value = this.parseValue();
    this.skipWs();
    if (this.pos < this.input.length) {
      throw new SyntaxError(`多余字符位于 ${this.pos}: '${this.peek()}'`);
    }
    return value;
  }

  parseValue() {
    this.skipWs();
    const ch = this.peek();
    if (ch === "{") return this.parseObject();
    if (ch === "[") return this.parseArray();
    if (ch === '"') return this.parseString();
    if (ch === "-" || (ch >= "0" && ch <= "9")) return this.parseNumber();
    if (this.input.startsWith("true", this.pos)) {
      this.pos += 4;
      return true;
    }
    if (this.input.startsWith("false", this.pos)) {
      this.pos += 5;
      return false;
    }
    if (this.input.startsWith("null", this.pos)) {
      this.pos += 4;
      return null;
    }
    throw new SyntaxError(`非预期字符 '${ch}' 位于 ${this.pos}`);
  }

  parseObject() {
    this.pos++; // {
    this.skipWs();
    const obj = {};
    if (this.peek() === "}") {
      this.pos++;
      return obj;
    }
    while (true) {
      this.skipWs();
      if (this.peek() !== '"') throw new SyntaxError("对象键必须为字符串");
      const key = this.parseString();
      this.skipWs();
      if (this.peek() !== ":") throw new SyntaxError("期望 ':'");
      this.pos++;
      obj[key] = this.parseValue();
      this.skipWs();
      if (this.peek() === ",") {
        this.pos++;
        continue;
      }
      if (this.peek() === "}") {
        this.pos++;
        break;
      }
      throw new SyntaxError("期望 ',' 或 '}'");
    }
    return obj;
  }

  parseArray() {
    this.pos++; // [
    this.skipWs();
    const arr = [];
    if (this.peek() === "]") {
      this.pos++;
      return arr;
    }
    while (true) {
      arr.push(this.parseValue());
      this.skipWs();
      if (this.peek() === ",") {
        this.pos++;
        continue;
      }
      if (this.peek() === "]") {
        this.pos++;
        break;
      }
      throw new SyntaxError("期望 ',' 或 ']'");
    }
    return arr;
  }

  parseString() {
    // 故意缺陷: 没有处理转义字符, 也没有检查未闭合字符串
    this.pos++; // 跳过开始引号
    let s = "";
    while (this.pos < this.input.length && this.input[this.pos] !== '"') {
      s += this.input[this.pos];
      this.pos++;
    }
    if (this.pos >= this.input.length) {
      throw new SyntaxError("字符串未闭合");
    }
    this.pos++; // 跳过结束引号
    return s;
  }

  parseNumber() {
    const start = this.pos;
    if (this.peek() === "-") this.pos++;
    while (
      this.pos < this.input.length &&
      /[0-9.eE+-]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }
    const numStr = this.input.slice(start, this.pos);
    const num = Number(numStr);
    if (Number.isNaN(num)) {
      throw new SyntaxError(`无效数字: ${numStr}`);
    }
    return num;
  }
}

/** 被测目标函数包装 */
function parseTarget(input) {
  const parser = new SimpleJsonParser(input);
  return parser.parse();
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 模糊测试演示 ==========\n");

console.log("目标: 简易 JSON 解析器 (故意保留缺陷)\n");

// 第一轮: 用默认语料库模糊测试
const fuzzer = new Fuzzer({ seed: 20240101 });
console.log("--- 开始模糊测试 (1000 轮) ---");
fuzzer.fuzz(parseTarget, { iterations: 1000, maxCrashes: 15 });

const report = fuzzer.report();
console.log(`\n执行次数: ${report.executions}`);
console.log(`总崩溃数: ${report.crashes}`);
console.log(`去重后独立缺陷: ${report.uniqueCrashes}`);

console.log("\n--- 发现的独立缺陷 (按错误签名去重) ---");
report.details.forEach((c, i) => {
  const preview = c.input.length > 50 ? c.input.slice(0, 50) + "..." : c.input;
  const display = JSON.stringify(preview);
  console.log(`\n[缺陷 ${i + 1}] 类型: ${c.kind}`);
  console.log(`  错误: ${c.error}`);
  console.log(`  触发输入: ${display} (长度 ${c.input.length})`);
});

// 验证: 用发现的崩溃输入复现
console.log("\n--- 复现其中一个崩溃 ---");
if (report.details.length > 0) {
  const crash = report.details[0];
  console.log("复现输入:", JSON.stringify(crash.input.slice(0, 60)));
  try {
    parseTarget(crash.input);
    console.log("(未复现, 可能是偶发)");
  } catch (e) {
    console.log("复现成功, 抛出:", e.name, "-", e.message);
  }
}

// 第二轮: 增加迭代次数, 看是否能发现更多缺陷
console.log("\n--- 第二轮: 更长时间模糊 (2000 轮, 复用语料库) ---");
const fuzzer2 = new Fuzzer({ seed: 99, corpus: fuzzer.corpus });
fuzzer2.fuzz(parseTarget, { iterations: 2000, maxCrashes: 25 });
const report2 = fuzzer2.report();
console.log(`执行次数: ${report2.executions}`);
console.log(`总崩溃数: ${report2.crashes}`);
console.log(`独立缺陷: ${report2.uniqueCrashes}`);

console.log("\n[模糊测试演示完成]");
console.log("结论: Fuzzer 自动发现了多个能导致解析器抛错的畸形输入,");
console.log("      这些输入可作为回归测试用例, 用于加固解析器的健壮性.");
