# Demo 目录说明

本目录存放《JavaScript 设计模式与开发实践》各章节的示例代码。目录与文件均使用英文命名，其中文含义见下表。

## 目录结构约定

- 每章一个 `chapter-NN-xxx` 目录（NN 为章节编号）
- 第 1～3 章为基础语法示例，按 `demo1`、`demo2`… 编号
- 第 4～22 章按 `NNN-english-name` 编号，每个示例包含两个子目录：
  - `before`：改前（存在坏味道的写法）
  - `after`：改后（应用设计模式/原则重构后的写法）
- 示例入口文件统一为 `index.ts` / `index.js`，可直接用 `npx tsx` 或浏览器打开 `index.html` 运行

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
| `chapter-08-pubsub-pattern` | 第08章：发布-订阅模式 |
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

## 示例目录对照表

### 第01章：面向对象的 JavaScript（chapter-01）

| 英文目录名 | 中文名称 |
| --- | --- |
| `demo1` | 鸭子类型与多态 |
| `demo2` | 封装数据（闭包实现私有变量） |
| `demo3` | 原型继承与 Object.create |

### 第02章：this、call 和 apply（chapter-02）

| 英文目录名 | 中文名称 |
| --- | --- |
| `demo1` | this 的指向规则 |
| `demo2` | call 和 apply |
| `demo3` | bind 的实现 |

### 第03章：闭包和高阶函数（chapter-03）

| 英文目录名 | 中文名称 |
| --- | --- |
| `demo1` | 变量作用域与闭包的形成 |
| `demo2` | 柯里化（currying） |
| `demo3` | 节流（throttle） |
| `demo4` | AOP 面向切面编程 |

### 第04章：单例模式（chapter-04）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-login-modal` | 001. 登录弹窗 |
| `002-global-config-manager` | 002. 全局配置管理器 |
| `003-database-connection-pool` | 003. 数据库连接池 |
| `004-logging-system` | 004. 日志系统 |
| `005-shopping-cart` | 005. 购物车 |

### 第05章：策略模式（chapter-05）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-performance-bonus` | 001. 绩效奖金计算 |
| `002-promotion-discount` | 002. 商品促销折扣 |
| `003-form-validator` | 003. 表单验证器 |
| `004-shipping-fee` | 004. 物流运费计算 |
| `005-payment-method` | 005. 支付方式选择 |

### 第06章：代理模式（chapter-06）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-image-preloading` | 001. 图片预加载 |
| `002-report-lazy-loading` | 002. 报表懒加载 |
| `003-api-data-caching` | 003. 接口数据缓存 |
| `004-access-control` | 004. 权限控制 |
| `005-log-tracking` | 005. 日志埋点 |

### 第07章：迭代器模式（chapter-07）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-product-collection-iteration` | 001. 商品集合遍历 |
| `002-order-pagination-iteration` | 002. 订单分页遍历 |
| `003-org-tree-iteration` | 003. 组织架构树遍历 |
| `004-coupon-lazy-generation` | 004. 优惠码按需生成 |
| `005-quote-comparison` | 005. 报价单逐项比对 |

### 第08章：发布-订阅模式（chapter-08）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-user-login-broadcast` | 001. 用户登录成功广播 |
| `002-order-payment-notification` | 002. 订单支付完成通知 |
| `003-price-drop-alert` | 003. 商品降价订阅提醒 |
| `004-site-behavior-tracking` | 004. 全站行为埋点统计 |
| `005-restock-reminder` | 005. 到货一次性提醒 |

### 第09章：命令模式（chapter-09）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-document-editor-undo-redo` | 001. 文档编辑器撤销重做 |
| `002-multiple-entry-unified-trigger` | 002. 多入口统一触发 |
| `003-print-task-queue` | 003. 打印任务队列 |
| `004-operation-log-replay` | 004. 操作日志与回放 |
| `005-macro-command-promotion` | 005. 宏命令一键大促 |

### 第10章：组合模式（chapter-10）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-folder-size-statistics` | 001. 文件夹大小统计 |
| `002-multi-level-menu-rendering` | 002. 多级菜单渲染 |
| `003-org-headcount-statistics` | 003. 组织架构人数统计 |
| `004-permission-tree-validation` | 004. 权限树校验 |
| `005-package-cart-pricing` | 005. 套餐购物车计价 |

### 第11章：模板方法模式（chapter-11）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-coffee-and-tea-brewing` | 001. 咖啡与茶冲泡流程 |
| `002-page-initialization-flow` | 002. 页面初始化流程 |
| `003-report-export-flow` | 003. 报表导出流程 |
| `004-verification-code-login` | 004. 验证码登录流程 |
| `005-automated-test-case` | 005. 自动化测试用例 |

### 第12章：享元模式（chapter-12）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-underwear-model-photography` | 001. 内衣模特拍照 |
| `002-map-vehicle-marker` | 002. 地图车辆标记 |
| `003-live-danmaku-emoji` | 003. 直播弹幕表情 |
| `004-gomoku-piece-rendering` | 004. 五子棋棋子渲染 |
| `005-file-upload-modal-pool` | 005. 文件上传弹窗池 |

### 第13章：职责链模式（chapter-13）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-leave-approval-flow` | 001. 请假审批流程 |
| `002-support-ticket-escalation` | 002. 客服工单升级处理 |
| `003-registration-form-validation-chain` | 003. 注册表单校验链 |
| `004-coupon-eligibility-check` | 004. 优惠券领取资格判定 |
| `005-static-resource-loading-fallback` | 005. 静态资源加载降级 |

### 第14章：中介者模式（chapter-14）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-bubble-battle-team-match` | 001. 泡泡堂组队对战 |
| `002-chatroom-message-forwarding` | 002. 聊天室消息转发 |
| `003-cart-checkout-linkage` | 003. 购物车结算联动 |
| `004-product-filter-linkage` | 004. 商品筛选器联动 |
| `005-airport-tower-control` | 005. 机场塔台调度 |

### 第15章：装饰者模式（chapter-15）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-coffee-topping-pricing` | 001. 咖啡加料计价 |
| `002-game-equipment-damage-stacking` | 002. 游戏装备伤害叠加 |
| `003-login-tracking-report` | 003. 登录埋点上报 |
| `004-form-submit-pre-validation` | 004. 表单提交前置校验 |
| `005-api-request-enhancement` | 005. 接口请求增强 |

### 第16章：状态模式（chapter-16）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-light-switch-cycle` | 001. 电灯开关循环 |
| `002-order-state-management` | 002. 订单流转管理 |
| `003-vending-machine` | 003. 自动售货机 |

### 第17章：适配器模式（chapter-17）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-map-rendering-unified-call` | 001. 地图渲染统一调用 |
| `002-shipping-address-format-conversion` | 002. 收货地址格式转换 |
| `003-third-party-login-unification` | 003. 第三方登录统一 |
| `004-payment-channel-param-adapter` | 004. 支付渠道参数适配 |
| `005-logging-seamless-replacement` | 005. 日志上报无缝替换 |

### 第18章：单一职责原则（chapter-18）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-user-profile-rendering` | 001. 用户资料渲染 |
| `002-one-click-order` | 002. 订单一键下单 |
| `003-registration-form-submit` | 003. 注册表单提交 |
| `004-log-recording-report` | 004. 日志记录上报 |
| `005-avatar-image-upload` | 005. 头像图片上传 |

### 第19章：最少知识原则（chapter-19）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-order-shipping-city-display` | 001. 订单收货城市展示 |
| `002-department-payroll-statistics` | 002. 部门工资单统计 |
| `003-unread-badge-update` | 003. 未读角标更新 |
| `004-cart-discount-calculation` | 004. 购物车优惠计算 |
| `005-leave-approval-submission` | 005. 请假审批提交 |

### 第20章：开放-封闭原则（chapter-20）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-api-error-code-handling` | 001. 接口错误码统一处理 |
| `002-product-list-sorting` | 002. 商品列表排序方式 |
| `003-notification-channel-extension` | 003. 消息通知渠道扩展 |
| `004-membership-points-rules` | 004. 会员积分获取规则 |
| `005-product-card-promo-badge` | 005. 商品卡片促销角标 |

### 第21章：接口和面向接口编程（chapter-21）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-avatar-upload-storage-switch` | 001. 头像上传存储切换 |
| `002-app-logging-unified-outlet` | 002. 应用日志统一出口 |
| `003-verification-code-sending-channel` | 003. 验证码发送渠道 |
| `004-report-export-multi-format` | 004. 报表导出多格式 |
| `005-dashboard-plugin-contract` | 005. 仪表盘插件契约 |

### 第22章：代码重构（chapter-22）

| 英文目录名 | 中文名称 |
| --- | --- |
| `001-customer-debt-bill-printing` | 001. 客户欠款账单打印 |
| `002-summer-electricity-tiered-pricing` | 002. 夏季用电阶梯计价 |
| `003-membership-registration-validation` | 003. 会员注册表单校验 |
| `004-takeout-order-shipping-address` | 004. 外卖下单收货地址 |
| `005-department-payroll-report` | 005. 部门工资报表统计 |

## 通用子目录对照表

| 英文名 | 中文名 | 说明 |
| --- | --- | --- |
| `before` | 改前 | 重构前的代码，体现问题或坏味道 |
| `after` | 改后 | 重构后的代码，体现设计模式/原则的收益 |
| `demo1`～`demo4` | demo1～demo4 | 第 1～3 章基础语法示例编号 |

## 代码质量检查

本目录所有代码文件均通过以下检查（可通过 `package.json` 中的脚本或 husky `pre-commit` 钩子触发）：

```bash
npx eslint demo          # ESLint 检查（js/ts）
npx prettier --check demo # Prettier 格式检查
npx tsc --noEmit         # TypeScript 类型检查
```
