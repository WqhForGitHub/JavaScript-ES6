const js = require("@eslint/js");
const globals = require("globals");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "eslint.config.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // demo 片段中未使用的变量/赋值是故意演示提升与作用域的
      "no-unused-vars": "off",
      "no-useless-assignment": "off",
    },
  },
  {
    // 010 演示 func2 访问不到 func1 的 value，运行时 ReferenceError 是考点
    files: ["010-*/index.js"],
    rules: {
      "no-undef": "off",
    },
  },
  prettierConfig,
];
