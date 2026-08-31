# JavaScript 设计模式与开发实践

《JavaScript 设计模式与开发实践》（曾探）学习笔记与示例代码仓库。

## 目录结构

- `chapter-NN-xxx/`：各章节学习笔记（Markdown）
- `demo/chapter-NN-xxx/`：各章节示例代码（含重构前后对比）
- 目录与文件均使用英文命名，中文含义见下表及 [demo/README.md](demo/README.md)

## 章节目录对照表

| 英文目录名 | 中文名称 |
| --- | --- |
| `chapter-01-object-oriented-javascript` | 第01章：面向对象的 JavaScript |
| `chapter-02-this-call-apply` | 第02章：this、call 和 apply |
| `chapter-03-closures-and-higher-order-functions` | 第03章：闭包和高阶函数 |
| `chapter-04-singleton-pattern` | 第04章：单例模式 |
| `chapter-05-strategy-pattern` | 第05章：策略模式 |
| `chapter-06-proxy-pattern` | 第06章：代理模式 |
| `chapter-07-iterator-pattern` | 第07章：迭代器模式 |
| `chapter-08-pubsub-pattern` | 第08章：发布订阅模式 |
| `chapter-09-command-pattern` | 第09章：命令模式 |
| `chapter-10-composite-pattern` | 第10章：组合模式 |
| `chapter-11-template-method-pattern` | 第11章：模板方法模式 |
| `chapter-12-flyweight-pattern` | 第12章：享元模式 |
| `chapter-13-chain-of-responsibility-pattern` | 第13章：职责链模式 |
| `chapter-14-mediator-pattern` | 第14章：中介者模式 |
| `chapter-15-decorator-pattern` | 第15章：装饰者模式 |
| `chapter-16-state-pattern` | 第16章：状态模式 |
| `chapter-17-adapter-pattern` | 第17章：适配器模式 |
| `chapter-18-single-responsibility-principle` | 第18章：单一职责原则 |
| `chapter-19-least-knowledge-principle` | 第19章：最少知识原则 |
| `chapter-20-open-closed-principle` | 第20章：开放-封闭原则 |
| `chapter-21-interface-oriented-programming` | 第21章：接口和面向接口编程 |
| `chapter-22-code-refactoring` | 第22章：代码重构 |

## 开发工具

```bash
npm install          # 安装依赖
npm run lint         # ESLint 检查
npm run lint:fix     # ESLint 自动修复
npm run format       # Prettier 格式化
npm run format:check # Prettier 格式检查
npm run typecheck    # TypeScript 类型检查
```

提交代码时会通过 husky `pre-commit` 钩子自动执行 lint-staged（eslint + prettier）与 `tsc --noEmit` 全量类型检查。
