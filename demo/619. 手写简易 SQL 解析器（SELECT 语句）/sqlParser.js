/**
 * 手写简易 SQL 解析器（SELECT 语句）
 *
 * 解析基本的 SELECT 语句，提取：
 *   - select 字段列表
 *   - from 表名
 *   - where 条件（简易，支持 AND / OR / 比较运算符）
 *   - order by 字段及方向
 *   - limit 数量
 *
 * 实现思路：
 * 1. 词法分析：用正则把 SQL 切分为关键字、标识符、运算符、字符串、数字 token。
 * 2. 语法分析：顺序消费 token，按 SELECT -> FROM -> WHERE -> ORDER BY -> LIMIT 解析。
 * 3. where 子句用递归下降解析 AND/OR 优先级。
 *
 * @param {string} sql - SQL 语句
 * @returns {Object} 解析结果对象
 */
function tokenize(sql) {
  const tokens = [];
  const regex =
    /\s*([A-Za-z_][A-Za-z0-9_.]*|<=|>=|<>|!=|=[^=]|[()<>*,;]|\d+(?:\.\d+)?|'[^']*')\s*/g;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    let v = match[1];
    if (/^[A-Za-z_]/.test(v) && !v.startsWith("'")) {
      tokens.push({ type: "word", value: v });
    } else if (/^\d/.test(v)) {
      tokens.push({ type: "number", value: parseFloat(v) });
    } else if (v.startsWith("'")) {
      tokens.push({ type: "string", value: v.slice(1, -1) });
    } else {
      tokens.push({ type: "punct", value: v });
    }
  }
  return tokens;
}

function sqlParser(sql) {
  const tokens = tokenize(sql);
  let pos = 0;
  const upper = (t) => (t && t.type === "word" ? t.value.toUpperCase() : "");

  function peekVal() {
    return tokens[pos] ? tokens[pos].value : null;
  }
  function expectWord(word) {
    if (upper(tokens[pos]) !== word)
      throw new Error(`期望 ${word}，实际 ${peekVal()}`);
    pos++;
  }
  function consume() {
    return tokens[pos++];
  }

  function parseSelectList() {
    const fields = [];
    do {
      const t = consume();
      let field = { name: t.value };
      // 支持 AS 别名
      if (upper(tokens[pos]) === "AS") {
        pos++;
        field.alias = consume().value;
      }
      // 支持 table.column（已被 token 包含）
      fields.push(field);
    } while (
      tokens[pos] &&
      tokens[pos].type === "punct" &&
      tokens[pos].value === "," &&
      pos++
    );
    return fields;
  }

  function parseWhere() {
    function parseCondition() {
      const left = consume().value;
      const op = consume().value;
      const right = consume();
      return { type: "condition", left, op, right: right.value };
    }
    function parseAnd() {
      let left = parseCondition();
      while (upper(tokens[pos]) === "AND") {
        pos++;
        left = { type: "and", left, right: parseCondition() };
      }
      return left;
    }
    function parseOr() {
      let left = parseAnd();
      while (upper(tokens[pos]) === "OR") {
        pos++;
        left = { type: "or", left, right: parseAnd() };
      }
      return left;
    }
    return parseOr();
  }

  const result = {
    select: [],
    from: null,
    where: null,
    orderBy: null,
    limit: null,
  };

  expectWord("SELECT");
  result.select = parseSelectList();
  expectWord("FROM");
  result.from = consume().value;

  if (upper(tokens[pos]) === "WHERE") {
    pos++;
    result.where = parseWhere();
  }
  if (upper(tokens[pos]) === "ORDER") {
    pos++;
    expectWord("BY");
    const field = consume().value;
    let direction = "ASC";
    if (upper(tokens[pos]) === "ASC" || upper(tokens[pos]) === "DESC") {
      direction = tokens[pos].value.toUpperCase();
      pos++;
    }
    result.orderBy = { field, direction };
  }
  if (upper(tokens[pos]) === "LIMIT") {
    pos++;
    result.limit = consume().value;
  }

  return result;
}

// ===== 测试用例 =====
console.log(JSON.stringify(sqlParser("SELECT id, name FROM users"), null, 2));
// 期望输出:
// { "select": [{ "name": "id" }, { "name": "name" }], "from": "users", "where": null, "orderBy": null, "limit": null }

console.log(
  JSON.stringify(
    sqlParser(
      "SELECT id, name AS n FROM users WHERE age >= 18 AND status = 'active' ORDER BY id DESC LIMIT 10",
    ),
    null,
    2,
  ),
);
// 期望输出:
// {
//   "select": [{ "name": "id" }, { "name": "name", "alias": "n" }],
//   "from": "users",
//   "where": {
//     "type": "and",
//     "left": { "type": "condition", "left": "age", "op": ">=", "right": 18 },
//     "right": { "type": "condition", "left": "status", "op": "=", "right": "active" }
//   },
//   "orderBy": { "field": "id", "direction": "DESC" },
//   "limit": 10
// }
