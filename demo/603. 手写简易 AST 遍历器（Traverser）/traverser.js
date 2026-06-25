/**
 * 简易 AST 遍历器（Traverser）
 *
 * 使用访问者模式（Visitor Pattern）深度优先遍历 AST。
 * 允许调用者对不同类型的节点注册 enter/exit 处理函数。
 *
 * 实现思路：
 * 1. traverseArray：遍历节点数组，对每个节点调用 traverseNode。
 * 2. traverseNode：
 *    - 先调用 visitor 中对应 type 的 enter 方法。
 *    - 根据节点类型，递归遍历其子节点（如 Program.body、CallExpression.params）。
 *    - 子节点遍历完成后，调用对应 type 的 exit 方法。
 *
 * @param {{type: string, body?: Array, params?: Array}} ast - AST 根节点
 * @param {Object} visitor - 访问者对象，键为节点类型，值为 { enter, exit }
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    const methods = visitor[node.type];

    // enter
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // 根据节点类型递归遍历子节点
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;
      case "CallExpression":
        traverseArray(node.params, node);
        break;
      case "NumberLiteral":
      case "StringLiteral":
        break;
      default:
        throw new TypeError(node.type);
    }

    // exit
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

// ===== 测试用例 =====
const ast = {
  type: "Program",
  body: [
    {
      type: "CallExpression",
      name: "add",
      params: [
        { type: "NumberLiteral", value: "2" },
        {
          type: "CallExpression",
          name: "subtract",
          params: [
            { type: "NumberLiteral", value: "4" },
            { type: "NumberLiteral", value: "2" },
          ],
        },
      ],
    },
  ],
};

const logs = [];
traverser(ast, {
  NumberLiteral: {
    enter(node, parent) {
      logs.push(
        `进入数字: ${node.value}（父节点: ${parent ? parent.type : "null"}）`,
      );
    },
  },
  CallExpression: {
    enter(node, parent) {
      logs.push(`进入调用: ${node.name}`);
    },
    exit(node, parent) {
      logs.push(`退出调用: ${node.name}`);
    },
  },
});
console.log(logs.join("\n"));
// 期望输出:
// 进入调用: add
// 进入数字: 2（父节点: CallExpression）
// 进入调用: subtract
// 进入数字: 4（父节点: CallExpression）
// 进入数字: 2（父节点: CallExpression）
// 退出调用: subtract
// 退出调用: add
