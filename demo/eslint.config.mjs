import js from '@eslint/js';
import markdown from 'eslint-plugin-markdown';

export default [
  {
    ignores: ['node_modules/**'],
  },
  // 基础规则集
  js.configs.recommended,
  // 构建脚本（Node 环境）：声明 Node 全局变量
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  // 对 Markdown 文件启用代码块处理器
  {
    files: ['**/*.md'],
    plugins: { markdown },
    processor: 'markdown/markdown',
  },
  // 针对 Markdown 中提取出的 JS 代码块（虚拟文件 *.md/**）
  {
    files: ['**/*.md/**'],
    rules: {
      // 代码块是独立演示片段，非完整程序：允许引用外部标识符
      'no-undef': 'off',
      // demo 中定义的函数/变量用于展示，不要求被调用
      'no-unused-vars': 'off',
      // while(true) 循环亮灯、空块演示等场景
      'no-empty': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      // 演示稀疏数组 [1, , 2] 的 flat 行为
      'no-sparse-arrays': 'off',
      // 部分片段为兼容旧浏览器使用 obj.hasOwnProperty 写法演示
      'no-prototype-builtins': 'off',
      // 022 大数相加 demo 有意演示超安全整数面值的精度丢失
      'no-loss-of-precision': 'off',
    },
  },
];
