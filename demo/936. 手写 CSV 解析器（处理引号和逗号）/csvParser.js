/**
 * 手写 CSV 解析器（处理引号和逗号）
 *
 * 将 CSV 字符串解析为对象数组。
 * 处理规则：
 * - 带引号的字段中可包含逗号
 * - 引号内的双引号通过 "" 转义
 * - 带引号的字段中可包含换行符
 * - 空字段正确处理
 * - 支持自定义分隔符
 * - 支持表头行（第一行作为 key）
 *
 * 使用状态机（state machine）逐字符解析，正确处理各种边界情况。
 */

/**
 * CSV 解析器的状态。
 * - NORMAL:  普通模式，正在读取未加引号的字段
 * - QUOTED:  引号模式，正在读取双引号包裹的字段
 * - QUOTE_IN_QUOTED: 引号模式中遇到引号，需判断是转义还是结束
 */
const State = {
  NORMAL: "NORMAL",
  QUOTED: "QUOTED",
  QUOTE_IN_QUOTED: "QUOTE_IN_QUOTED",
};

/**
 * 将 CSV 字符串解析为二维数组（行 x 字段）。
 *
 * @param {string} csv - CSV 字符串
 * @param {Object} [options] - 配置选项
 * @param {string} [options.delimiter=','] - 分隔符
 * @returns {Array<Array<string>>} 二维数组
 */
function parseCSVToRows(csv, options = {}) {
  const { delimiter = "," } = options;

  const rows = [];
  let currentRow = [];
  let currentField = "";
  let state = State.NORMAL;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];

    switch (state) {
      case State.NORMAL: {
        if (ch === '"') {
          // 进入引号模式
          state = State.QUOTED;
        } else if (ch === delimiter) {
          // 字段结束
          currentRow.push(currentField);
          currentField = "";
        } else if (ch === "\r") {
          // 处理 \r\n 或 \r
          currentRow.push(currentField);
          currentField = "";
          rows.push(currentRow);
          currentRow = [];
          // 跳过 \n（如果有）
          if (i + 1 < csv.length && csv[i + 1] === "\n") {
            i++;
          }
        } else if (ch === "\n") {
          // 行结束
          currentRow.push(currentField);
          currentField = "";
          rows.push(currentRow);
          currentRow = [];
        } else {
          currentField += ch;
        }
        break;
      }

      case State.QUOTED: {
        if (ch === '"') {
          // 可能是字段结束，也可能是转义的引号
          state = State.QUOTE_IN_QUOTED;
        } else {
          currentField += ch;
        }
        break;
      }

      case State.QUOTE_IN_QUOTED: {
        if (ch === '"') {
          // 转义的引号："" → "
          currentField += '"';
          state = State.QUOTED;
        } else if (ch === delimiter) {
          // 字段结束
          currentRow.push(currentField);
          currentField = "";
          state = State.NORMAL;
        } else if (ch === "\r") {
          // 行结束
          currentRow.push(currentField);
          currentField = "";
          rows.push(currentRow);
          currentRow = [];
          state = State.NORMAL;
          if (i + 1 < csv.length && csv[i + 1] === "\n") {
            i++;
          }
        } else if (ch === "\n") {
          // 行结束
          currentRow.push(currentField);
          currentField = "";
          rows.push(currentRow);
          currentRow = [];
          state = State.NORMAL;
        } else {
          // 引号后跟其他字符（不规范但容错处理）
          currentField += ch;
          state = State.QUOTED;
        }
        break;
      }
    }
  }

  // 处理最后一个字段/行
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * 将 CSV 字符串解析为对象数组。
 * 第一行作为表头（key），后续行作为数据。
 *
 * @param {string} csv - CSV 字符串
 * @param {Object} [options] - 配置选项
 * @param {string} [options.delimiter=','] - 分隔符
 * @param {boolean} [options.hasHeader=true] - 是否有表头行
 * @param {string[]} [options.headers] - 自定义表头（覆盖第一行）
 * @param {Function} [options.transform] - 值转换函数 (value, header) => newValue
 * @returns {Object[]} 对象数组
 */
function parseCSV(csv, options = {}) {
  const {
    delimiter = ",",
    hasHeader = true,
    headers = null,
    transform = null,
  } = options;

  if (!csv || csv.trim() === "") return [];

  const rows = parseCSVToRows(csv, { delimiter });

  if (rows.length === 0) return [];

  let headerRow;
  let dataRows;

  if (hasHeader) {
    if (headers) {
      headerRow = headers;
      dataRows = rows;
    } else {
      headerRow = rows[0];
      dataRows = rows.slice(1);
    }
  } else {
    // 没有表头，使用列索引作为 key
    const maxCols = Math.max(...rows.map((r) => r.length));
    headerRow = Array.from({ length: maxCols }, (_, i) => "col" + (i + 1));
    dataRows = rows;
  }

  const result = [];
  for (const row of dataRows) {
    // 跳过空行
    if (row.length === 1 && row[0] === "") continue;
    const obj = {};
    for (let i = 0; i < headerRow.length; i++) {
      const key = headerRow[i];
      let value = i < row.length ? row[i] : "";
      if (transform) {
        value = transform(value, key);
      }
      obj[key] = value;
    }
    result.push(obj);
  }

  return result;
}

// ===================== 内联 CSV 生成器（用于往返测试） =====================

/**
 * 转义 CSV 字段。
 * @param {string} field - 字段值
 * @param {string} delimiter - 分隔符
 * @returns {string}
 */
function escapeCSVField(field, delimiter = ",") {
  let str = "";
  if (field !== null && field !== undefined) {
    str = String(field);
  }
  const needsQuoting =
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r");
  if (needsQuoting) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * 生成 CSV。
 * @param {Object[]} data - 对象数组
 * @param {Object} options - 配置
 * @returns {string}
 */
function generateCSV(data, options = {}) {
  const { delimiter = ",", includeHeader = true } = options;
  if (!Array.isArray(data) || data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const lines = [];
  if (includeHeader) {
    lines.push(keys.map((k) => escapeCSVField(k, delimiter)).join(delimiter));
  }
  for (const row of data) {
    lines.push(
      keys.map((k) => escapeCSVField(row[k], delimiter)).join(delimiter),
    );
  }
  return lines.join("\n");
}

// ===================== 测试用例 =====================

console.log("===== 基本解析 =====");
const csv1 = "name,age,city\nAlice,30,Beijing\nBob,25,Shanghai";
console.log(JSON.stringify(parseCSV(csv1), null, 2));

console.log("\n===== 带引号的字段（包含逗号）=====");
const csv2 = 'name,description\nAlice,"Hello, World"\nBob,Normal text';
console.log(JSON.stringify(parseCSV(csv2), null, 2));

console.log("\n===== 转义双引号 =====");
const csv3 = 'name,quote\nAlice,"She said ""hello"""\nBob,No quotes';
console.log(JSON.stringify(parseCSV(csv3), null, 2));

console.log("\n===== 带换行符的字段 =====");
const csv4 = 'name,note\nAlice,"Line 1\nLine 2"\nBob,Single line';
console.log(JSON.stringify(parseCSV(csv4), null, 2));

console.log("\n===== 空字段 =====");
const csv5 = "name,age,email\nAlice,,\nBob,25,bob@test.com";
console.log(JSON.stringify(parseCSV(csv5), null, 2));

console.log("\n===== 自定义分隔符（分号）=====");
const csv6 = "name;age\nAlice;30\nBob;25";
console.log(JSON.stringify(parseCSV(csv6, { delimiter: ";" }), null, 2));

console.log("\n===== 自定义分隔符（Tab）=====");
const csv7 = "name\tage\nAlice\t30";
console.log(JSON.stringify(parseCSV(csv7, { delimiter: "\t" }), null, 2));

console.log("\n===== Windows 行结束符 (\\r\\n) =====");
const csv8 = "name,age\r\nAlice,30\r\nBob,25";
console.log(JSON.stringify(parseCSV(csv8), null, 2));

console.log("\n===== 无表头模式 =====");
const csv9 = "Alice,30,Beijing\nBob,25,Shanghai";
console.log(JSON.stringify(parseCSV(csv9, { hasHeader: false }), null, 2));

console.log("\n===== 自定义表头 =====");
const csv10 = "Alice,30\nBob,25";
console.log(
  JSON.stringify(parseCSV(csv10, { headers: ["name", "age"] }), null, 2),
);

console.log("\n===== 值转换函数 =====");
const csv11 = "name,age,score\nAlice,30,95.5\nBob,25,88";
const parsed11 = parseCSV(csv11, {
  transform: (value, header) => {
    if (header === "age") return parseInt(value, 10);
    if (header === "score") return parseFloat(value);
    return value;
  },
});
console.log(JSON.stringify(parsed11, null, 2));

console.log("\n===== 往返测试（生成 → 解析）=====");
const original = [
  { name: "Alice", age: "30", city: "Beijing" },
  { name: "Bob, Jr.", age: "25", city: "Shanghai" },
  { name: "Charlie", age: "35", city: "New York" },
];
const generated = generateCSV(original);
console.log("生成的 CSV:");
console.log(generated);
const roundTripped = parseCSV(generated);
console.log("解析回的对象:");
console.log(JSON.stringify(roundTripped, null, 2));
console.log(
  "往返一致:",
  JSON.stringify(original) === JSON.stringify(roundTripped),
);

console.log("\n===== 复杂往返测试 =====");
const complex = [
  { id: "1", text: 'Hello, "World"!', note: "Line1\nLine2" },
  { id: "2", text: "Normal", note: "Simple" },
];
const complexCSV = generateCSV(complex);
console.log("生成的 CSV:");
console.log(complexCSV);
const complexParsed = parseCSV(complexCSV);
console.log("解析回的对象:");
console.log(JSON.stringify(complexParsed, null, 2));
console.log(
  "往返一致:",
  JSON.stringify(complex) === JSON.stringify(complexParsed),
);

console.log("\n===== 空字符串测试 =====");
console.log(JSON.stringify(parseCSV("")));
console.log(JSON.stringify(parseCSV("   ")));

console.log("\n===== 只有表头 =====");
console.log(JSON.stringify(parseCSV("name,age,city")));
