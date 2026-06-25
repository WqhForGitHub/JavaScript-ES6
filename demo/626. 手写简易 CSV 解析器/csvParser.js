/**
 * 手写简易 CSV 解析器
 *
 * 解析 CSV（逗号分隔值）文本，支持：
 *   - 自定义分隔符
 *   - 引号包裹的字段（含逗号、换行）
 *   - 引号内的转义引号（"" 表示一个 "）
 *   - 可选表头行
 *
 * 实现思路（状态机）：
 * 1. 逐字符扫描，维护状态：inField（普通字段）、inQuoted（引号内）。
 * 2. 引号内遇到 "" 视为一个字面引号并继续留在引号内。
 * 3. 遇到分隔符或换行符结束当前字段。
 *
 * @param {string} text - CSV 文本
 * @param {Object} [options] - { delimiter: ',', header: false }
 * @returns {Array<Array<string>>} 行数组，每行为字段数组
 */
function csvParser(text, options = {}) {
  const delimiter = options.delimiter || ",";
  const hasHeader = options.header || false;

  const rows = [];
  let row = [];
  let field = "";
  let inQuoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuoted) {
      if (ch === '"') {
        // 检查是否为转义的引号 ""
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuoted = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuoted = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        // 忽略 \r，由 \n 处理换行
      } else {
        field += ch;
      }
    }
  }

  // 处理最后一行
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (hasHeader && rows.length > 0) {
    const headers = rows[0];
    return rows.slice(1).map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] !== undefined ? r[idx] : "";
      });
      return obj;
    });
  }

  return rows;
}

// CSV 序列化
function csvStringify(rows, options = {}) {
  const delimiter = options.delimiter || ",";
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell);
          if (s.includes(delimiter) || s.includes('"') || s.includes("\n")) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        })
        .join(delimiter),
    )
    .join("\n");
}

// ===== 测试用例 =====
const csv = `name,age,city
张三,30,北京
"李,四",25,"上海"
王五,28,"新""加坡"`;

console.log(JSON.stringify(csvParser(csv), null, 2));
// 期望输出:
// [
//   ["name", "age", "city"],
//   ["张三", "30", "北京"],
//   ["李,四", "25", "上海"],
//   ["王五", "28", "新\"加坡"]
// ]

console.log(JSON.stringify(csvParser(csv, { header: true }), null, 2));
// 期望输出:
// [
//   { "name": "张三", "age": "30", "city": "北京" },
//   { "name": "李,四", "age": "25", "city": "上海" },
//   { "name": "王五", "age": "28", "city": "新\"加坡" }
// ]

console.log(
  csvStringify([
    ["a", "b,c"],
    ['d"e', "f"],
  ]),
);
// 期望输出:
// a,"b,c"
// "d""e",f
