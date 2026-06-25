/**
 * 手写模块依赖分析（AST 方式）
 *
 * 功能：通过解析代码为 AST，提取所有 import/require 依赖
 * 实现思路：
 *   1. 将源码解析为 AST（简易词法分析）
 *   2. 遍历 AST 节点，匹配 ImportDeclaration / CallExpression(require)
 *   3. 收集所有依赖路径
 */

const NODE_TYPES = {
  IMPORT_DECLARATION: "ImportDeclaration",
  CALL_EXPRESSION: "CallExpression",
};

function parseToAST(code) {
  const nodes = [];
  let m;
  // import 语句
  const r1 =
    /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]*)\})?\s*(?:,\s*\*\s+as\s+(\w+))?\s*from\s+['"`](.+?)['"`]/g;
  while ((m = r1.exec(code)) !== null) {
    nodes.push({
      type: NODE_TYPES.IMPORT_DECLARATION,
      specifiers: {
        default: m[1] || null,
        named: m[2]
          ? m[2]
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        namespace: m[3] || null,
      },
      source: m[4],
    });
  }
  // require() 调用
  const r2 = /(?:const|let|var)\s+(\w+)\s*=\s*require\(['"`](.+?)['"`]\)/g;
  while ((m = r2.exec(code)) !== null) {
    nodes.push({
      type: NODE_TYPES.CALL_EXPRESSION,
      callee: "require",
      arguments: [{ value: m[2] }],
      variable: m[1],
    });
  }
  // 动态 import()
  const r3 = /import\s*\(['"`](.+?)['"`]\)/g;
  while ((m = r3.exec(code)) !== null) {
    nodes.push({
      type: NODE_TYPES.CALL_EXPRESSION,
      callee: "import",
      arguments: [{ value: m[1] }],
      variable: null,
    });
  }
  return { type: "Program", body: nodes };
}

function traverse(ast, visitor) {
  function visit(node) {
    if (!node || typeof node.type !== "string") return;
    if (visitor[node.type]) visitor[node.type](node);
    for (const k in node) {
      if (Array.isArray(node[k])) node[k].forEach(visit);
      else if (node[k] && typeof node[k] === "object" && node[k].type)
        visit(node[k]);
    }
  }
  if (ast.body) ast.body.forEach(visit);
}

function analyzeDeps(code) {
  const ast = parseToAST(code);
  const deps = [];
  traverse(ast, {
    ImportDeclaration(n) {
      deps.push({ source: n.source, type: "static-import" });
    },
    CallExpression(n) {
      if (n.callee === "require" || n.callee === "import")
        deps.push({ source: n.arguments[0].value, type: n.callee });
    },
  });
  return deps;
}

// ===== 测试 =====
const testCode = `
import React from 'react';
import { useState } from 'react';
import * as utils from './utils';
const lodash = require('lodash');
const lazy = import('./lazy');
`;
const deps = analyzeDeps(testCode);
console.log("AST 节点数:", parseToAST(testCode).body.length); // 5
console.log("依赖列表:");
deps.forEach((d) => console.log("  " + d.type + ": " + d.source));
console.log("依赖总数:", deps.length); // 5
