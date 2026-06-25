/**
 * 手写简易 ESLint 规则（eq-eq-eq）
 *
 * 功能：要求使用 === / !== 代替 == / !=
 * 原因：== 会进行类型隐式转换，容易产生意外行为
 * 实现思路：遍历 BinaryExpression，检查 operator 是否为 == 或 !=
 */

class LintContext {
  constructor(filename) {
    this.filename = filename;
    this.reportings = [];
  }
  report(node, msg) {
    this.reportings.push({ node, msg });
  }
}

const eqEqEqRule = {
  meta: {
    type: "suggestion",
    docs: { description: "require === and !==" },
    fixable: "code",
  },
  create(ctx) {
    return {
      BinaryExpression(node) {
        if (node.operator === "==" || node.operator === "!=") {
          const expected = node.operator === "==" ? "===" : "!==";
          ctx.report(
            node,
            "Expected '" + expected + "' instead of '" + node.operator + "'.",
          );
        }
      },
    };
  },
};

function runRule(code) {
  const ctx = new LintContext("test.js");
  const visitors = eqEqEqRule.create(ctx);
  const re = /([\w'"]+)\s*(==|!=)\s*([\w'"]+)/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    visitors.BinaryExpression({
      type: "BinaryExpression",
      operator: m[2],
      left: { value: m[1] },
      right: { value: m[3] },
    });
  }
  return ctx.reportings;
}

// ===== 测试 =====
const testCode =
  "if (x == 1) {} if (y != null) {} if (a === b) {} if (x == '1') {}";
const reports = runRule(testCode);
console.log("违规报告数:", reports.length); // 3
reports.forEach((r, i) => console.log("  [" + (i + 1) + "] " + r.msg));
// Expected '===' instead of '==' x3, Expected '!==' instead of '!=' x1

// 隐式转换问题
console.log("\n== 隐式转换问题:");
console.log("0 == '' :", 0 == ""); // true (不安全)
console.log("0 === '' :", 0 === ""); // false
console.log("null == undefined :", null == undefined); // true
console.log("null === undefined :", null === undefined); // false
