/**
 * 手写 CSV 生成器
 *
 * 将对象数组转换为 CSV 字符串。
 * 处理规则：
 * - 值中包含逗号 → 用双引号包裹
 * - 值中包含双引号 → 将 " 转义为 ""，并用双引号包裹
 * - 值中包含换行符 → 用双引号包裹
 * - 第一行为表头（取自对象的 key）
 * - 支持自定义分隔符
 * - 支持自定义是否包含表头
 */

/**
 * 转义单个 CSV 字段。
 * 如果字段包含分隔符、双引号或换行符，则需要用双引号包裹并将内部双引号转义为 ""。
 *
 * @param {string} field - 原始字段值
 * @param {string} delimiter - 分隔符（默认逗号）
 * @returns {string} 转义后的字段
 */
function escapeCSVField(field, delimiter = ",") {
  // 将值转为字符串（null/undefined 转为空字符串）
  let str = "";
  if (field !== null && field !== undefined) {
    str = String(field);
  }

  // 检查是否需要加引号
  const needsQuoting =
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r");

  if (needsQuoting) {
    // 转义双引号：每个 " 变成 ""
    str = str.replace(/"/g, '""');
    // 用双引号包裹
    str = '"' + str + '"';
  }

  return str;
}

/**
 * 将对象数组转换为 CSV 字符串。
 *
 * @param {Object[]} data - 对象数组
 * @param {Object} [options] - 配置选项
 * @param {string} [options.delimiter=','] - 分隔符
 * @param {boolean} [options.includeHeader=true] - 是否包含表头
 * @param {string[]} [options.columns] - 指定列顺序（默认取第一个对象的所有 key）
 * @param {string} [options.lineEnding='\n'] - 行结束符
 * @returns {string} CSV 字符串
 */
function generateCSV(data, options = {}) {
  const {
    delimiter = ",",
    includeHeader = true,
    columns = null,
    lineEnding = "\n",
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    return includeHeader ? "" : "";
  }

  // 确定列名
  let keys;
  if (columns && columns.length > 0) {
    keys = columns;
  } else {
    // 取所有对象的所有 key（保持顺序）
    const keySet = new Set();
    for (const row of data) {
      if (row && typeof row === "object") {
        for (const key of Object.keys(row)) {
          keySet.add(key);
        }
      }
    }
    keys = Array.from(keySet);
  }

  const lines = [];

  // 生成表头
  if (includeHeader) {
    const headerFields = keys.map((key) => escapeCSVField(key, delimiter));
    lines.push(headerFields.join(delimiter));
  }

  // 生成数据行
  for (const row of data) {
    const fields = keys.map((key) => {
      const value = row && typeof row === "object" ? row[key] : undefined;
      return escapeCSVField(value, delimiter);
    });
    lines.push(fields.join(delimiter));
  }

  return lines.join(lineEnding);
}

/**
 * 将二维数组（而非对象数组）转换为 CSV 字符串。
 *
 * @param {Array<Array<*>>} rows - 二维数组
 * @param {Object} [options] - 配置选项
 * @param {string} [options.delimiter=','] - 分隔符
 * @param {string} [options.lineEnding='\n'] - 行结束符
 * @returns {string} CSV 字符串
 */
function generateCSVFromArray(rows, options = {}) {
  const { delimiter = ",", lineEnding = "\n" } = options;

  if (!Array.isArray(rows)) return "";

  const lines = rows.map((row) => {
    if (!Array.isArray(row)) row = [row];
    return row.map((field) => escapeCSVField(field, delimiter)).join(delimiter);
  });

  return lines.join(lineEnding);
}

// ===================== 测试用例 =====================

console.log("===== 基本 CSV 生成 =====");
const data1 = [
  { name: "Alice", age: 30, city: "Beijing" },
  { name: "Bob", age: 25, city: "Shanghai" },
  { name: "Charlie", age: 35, city: "Guangzhou" },
];
console.log(generateCSV(data1));
// name,age,city
// Alice,30,Beijing
// Bob,25,Shanghai
// Charlie,35,Guangzhou

console.log("\n===== 值中包含逗号 =====");
const data2 = [
  { name: "Alice", description: "Hello, World" },
  { name: "Bob", description: "Normal text" },
];
console.log(generateCSV(data2));
// name,description
// Alice,"Hello, World"
// Bob,Normal text

console.log("\n===== 值中包含双引号 =====");
const data3 = [
  { name: "Alice", quote: 'She said "hello"' },
  { name: "Bob", quote: "No quotes here" },
];
console.log(generateCSV(data3));
// name,quote
// Alice,"She said ""hello"""
// Bob,No quotes here

console.log("\n===== 值中包含换行符 =====");
const data4 = [
  { name: "Alice", note: "Line 1\nLine 2" },
  { name: "Bob", note: "Single line" },
];
console.log(generateCSV(data4));
// name,note
// Alice,"Line 1
// Line 2"
// Bob,Single line

console.log("\n===== 自定义分隔符（分号）=====");
const data5 = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
console.log(generateCSV(data5, { delimiter: ";" }));
// name;age
// Alice;30
// Bob;25

console.log("\n===== 自定义分隔符（Tab）=====");
const data6 = [{ col1: "a", col2: "b" }];
console.log(generateCSV(data6, { delimiter: "\t" }));

console.log("\n===== 不包含表头 =====");
const data7 = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
console.log(generateCSV(data7, { includeHeader: false }));
// Alice,30
// Bob,25

console.log("\n===== 指定列顺序 =====");
const data8 = [
  { name: "Alice", age: 30, city: "Beijing" },
  { name: "Bob", age: 25, city: "Shanghai" },
];
console.log(generateCSV(data8, { columns: ["city", "name", "age"] }));
// city,name,age
// Beijing,Alice,30
// Shanghai,Bob,25

console.log("\n===== 空值和 undefined 处理 =====");
const data9 = [
  { name: "Alice", age: null, email: undefined },
  { name: "Bob", age: 25, email: "bob@test.com" },
];
console.log(generateCSV(data9));
// name,age,email
// Alice,,   (null 和 undefined 都转为空字符串)
// Bob,25,bob@test.com

console.log("\n===== 二维数组生成 CSV =====");
const arrayData = [
  ["name", "age", "city"],
  ["Alice", 30, "Beijing"],
  ["Bob", 25, "Shanghai"],
];
console.log(generateCSVFromArray(arrayData));

console.log("\n===== 综合复杂测试 =====");
const complexData = [
  {
    id: 1,
    name: "Alice, Jr.",
    description: 'A "great" person\nMulti-line bio',
    score: 95.5,
    tags: "tag1,tag2,tag3",
  },
  {
    id: 2,
    name: "Bob",
    description: "Simple description",
    score: 88,
    tags: "tag4",
  },
];
const csv = generateCSV(complexData);
console.log(csv);
console.log("\n（CSV 生成完成）");

console.log("\n===== 空数组测试 =====");
console.log(JSON.stringify(generateCSV([])));
// ""

console.log("\n===== 不同行结束符测试 =====");
const data10 = [
  { a: 1, b: 2 },
  { a: 3, b: 4 },
];
console.log("Windows (\\r\\n):");
console.log(JSON.stringify(generateCSV(data10, { lineEnding: "\r\n" })));
