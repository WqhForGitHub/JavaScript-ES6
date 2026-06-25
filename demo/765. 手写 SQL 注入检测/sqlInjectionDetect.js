/**
 * 手写 SQL 注入检测
 *
 * 功能：检测用户输入是否包含 SQL 注入特征
 *       用于 WAF/输入校验层，识别常见注入模式
 *
 * 实现思路：
 *   1. 基于特征正则的启发式检测
 *   2. 检测维度：
 *      - 注释符号：--、块注释、MySQL 的 #
 *      - 关键字：UNION SELECT, OR 1=1, DROP, INSERT, UPDATE, DELETE
 *      - 元函数：sleep(), benchmark(), load_file()
 *      - 时间盲注：SLEEP, BENCHMARK
 *      - 布尔盲注：AND 1=1, OR 'a'='a'
 *      - 堆叠查询：;
 *      - 编码绕过：0x..., CHAR(), UNION 内嵌注释绕过
 *   3. 给出风险等级与匹配特征
 *
 * 局限：正则无法 100% 覆盖，生产环境应配合参数化查询
 */

// 风险等级
const LEVEL = { SAFE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const LEVEL_NAME = ["安全", "低", "中", "高", "严重"];

// 检测规则表
const RULES = [
  // 注释
  { name: "行注释 --", pattern: /--(\s|$)/, level: LEVEL.MEDIUM },
  { name: "块注释 /* */", pattern: /\/\*|\*\//, level: LEVEL.MEDIUM },
  { name: "MySQL 注释 #", pattern: /#/, level: LEVEL.LOW },

  // 经典永真条件
  {
    name: "OR 1=1 / AND 1=1",
    pattern: /\b(or|and)\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
    level: LEVEL.HIGH,
  },
  {
    name: "OR 字符比较",
    pattern: /\b(or|and)\b\s+['"][a-z]['"]\s*=\s*['"][a-z]['"]/i,
    level: LEVEL.HIGH,
  },

  // UNION 注入
  {
    name: "UNION SELECT",
    pattern: /\bunion\b[\s/*]+\bselect\b/i,
    level: LEVEL.HIGH,
  },

  // 危险关键字
  {
    name: "DROP",
    pattern: /\bdrop\b\s+\b(table|database|schema)\b/i,
    level: LEVEL.CRITICAL,
  },
  { name: "INSERT", pattern: /\binsert\b\s+\binto\b/i, level: LEVEL.HIGH },
  {
    name: "UPDATE SET",
    pattern: /\bupdate\b\s+\S+\s+\bset\b/i,
    level: LEVEL.HIGH,
  },
  { name: "DELETE FROM", pattern: /\bdelete\b\s+\bfrom\b/i, level: LEVEL.HIGH },
  {
    name: "TRUNCATE",
    pattern: /\btruncate\b\s+\b(table)?/i,
    level: LEVEL.CRITICAL,
  },

  // 元函数
  { name: "SLEEP", pattern: /\bsleep\s*\(/i, level: LEVEL.HIGH },
  { name: "BENCHMARK", pattern: /\bbenchmark\s*\(/i, level: LEVEL.HIGH },
  { name: "LOAD_FILE", pattern: /\bload_file\s*\(/i, level: LEVEL.CRITICAL },
  {
    name: "INTO OUTFILE",
    pattern: /\binto\b\s+\b(out|dump)file\b/i,
    level: LEVEL.CRITICAL,
  },
  {
    name: "INFORMATION_SCHEMA",
    pattern: /\binformation_schema\b/i,
    level: LEVEL.HIGH,
  },
  {
    name: "CONCAT",
    pattern: /\b(concat|group_concat|concat_ws)\s*\(/i,
    level: LEVEL.MEDIUM,
  },
  { name: "CHAR(", pattern: /\bchar\s*\(\s*\d+/i, level: LEVEL.MEDIUM },

  // 堆叠查询
  {
    name: "分号堆叠",
    pattern: /;.*?(select|insert|update|delete|drop|create|alter)\b/i,
    level: LEVEL.HIGH,
  },

  // 十六进制绕过
  {
    name: "0x 十六进制字符串",
    pattern: /0x[0-9a-f]{8,}/i,
    level: LEVEL.MEDIUM,
  },

  // 系统变量
  {
    name: "@@version",
    pattern: /@@(version|datadir|hostname|basedir)/i,
    level: LEVEL.HIGH,
  },

  // EXEC / EXECUTE
  { name: "EXEC", pattern: /\bexec(ute)?\s*\(/i, level: LEVEL.HIGH },
];

// 主检测函数
function detectSqlInjection(input) {
  if (input == null)
    return { isInjection: false, level: LEVEL.SAFE, matches: [] };
  const text = String(input);

  const matches = [];
  let maxLevel = LEVEL.SAFE;

  for (const rule of RULES) {
    const m = text.match(rule.pattern);
    if (m) {
      matches.push({ rule: rule.name, match: m[0], level: rule.level });
      if (rule.level > maxLevel) maxLevel = rule.level;
    }
  }

  return {
    isInjection: matches.length > 0,
    level: maxLevel,
    levelName: LEVEL_NAME[maxLevel],
    matches,
  };
}

// 简化判断：是否疑似注入
function isLikelySqlInjection(input) {
  return detectSqlInjection(input).isInjection;
}

// ===== 测试 =====
console.log("=== 手写 SQL 注入检测 ===");

const testInputs = [
  // 正常输入
  { input: "alice", desc: "正常用户名" },
  { input: "hello world", desc: "正常文本" },
  { input: "O'Brien", desc: "正常带撇号姓名" },
  // 经典注入
  { input: "' OR 1=1 --", desc: "经典 OR 1=1" },
  { input: "admin'--", desc: "注释绕过登录" },
  { input: "1; DROP TABLE users", desc: "堆叠 DROP" },
  { input: "1 UNION SELECT username, password FROM users", desc: "UNION 注入" },
  { input: "1' AND 'a'='a", desc: "布尔盲注" },
  {
    input: "1'; INSERT INTO admins VALUES('hacker','pw')--",
    desc: "INSERT 注入",
  },
  // 时间盲注
  { input: "1'; SLEEP(5)--", desc: "时间盲注" },
  { input: "1 AND BENCHMARK(5000000,MD5('test'))", desc: "BENCHMARK 盲注" },
  // 信息获取
  { input: "1 UNION SELECT 1,@@version,3", desc: "获取版本" },
  {
    input: "1 UNION SELECT table_name FROM information_schema.tables",
    desc: "获取表名",
  },
  // 编码绕过
  { input: "0x61646d696e", desc: "十六进制绕过" },
  { input: "CHAR(97,100,109,105,110)", desc: "CHAR 编码绕过" },
  { input: "UNION/**/SELECT/**/1", desc: "注释绕过关键字" },
  // 文件操作
  { input: "1 UNION SELECT LOAD_FILE('/etc/passwd')", desc: "读取文件" },
  { input: "1 INTO OUTFILE '/var/www/shell.php'", desc: "写 webshell" },
];

for (const { input, desc } of testInputs) {
  const result = detectSqlInjection(input);
  console.log(`[${result.levelName}] ${desc}: "${input}"`);
  if (result.matches.length) {
    console.log(
      `    命中规则: ${result.matches.map((m) => m.rule).join(", ")}`,
    );
  }
}

console.log("\n=== 简化判断 ===");
console.log("isLikelySqlInjection('alice'):", isLikelySqlInjection("alice")); // 预期: false
console.log(
  'isLikelySqlInjection("\' OR 1=1"):',
  isLikelySqlInjection("' OR 1=1"),
); // 预期: true
