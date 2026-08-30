import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/'] },

  // 仓库根目录的 Node 工具脚本（ESLint 配置等）
  {
    files: ['*.mjs', '*.cjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // demo 下的旧式浏览器脚本 JS（无模块系统，经 <script src> 引入）
  {
    files: ['demo/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 教学示例忠实原书：var 重复声明、与浏览器全局重名、
      // 故意未使用的变量等"坏味道"本身就是教学点，降为 warn 保留提示但不阻塞提交
      'no-redeclare': 'warn',
      'no-unused-vars': 'warn',
      'no-constant-condition': 'warn',
      'no-useless-assignment': 'warn',
      'no-prototype-builtins': 'warn',
    },
  },

  // demo 下的 TypeScript（独立教学脚本，末尾用 export {} 标记为模块）
  {
    files: ['demo/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 同上：教学演示中故意保留的未使用变量降为 warn
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // 必须放最后：关闭所有与 Prettier 冲突的格式类规则
  prettierConfig,
);
