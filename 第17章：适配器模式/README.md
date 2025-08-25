# deepseek
JavaScript 的适配器模式（Adapter Pattern）是一种**结构型设计模式**，用于解决两个不兼容接口之间的兼容性问题。它通过创建一个中间层（适配器）来转换一个类的接口，使其能被另一个类/系统使用，而无需修改原始代码。

## 核心概念
1. **目标接口（Target）**：客户端期望使用的接口（标准）。
2. **适配者（Adaptee）**：需要被适配的现有接口（不兼容的对象/类）。
3. **适配器（Adapter）**：转换接口的中间层，将 Adaptee 的接口包装成 Target 接口。

## 使用场景
- 整合第三方库/遗留代码时，接口不匹配。
- 复用旧功能但需符合新接口规范。
- 统一多个类的不一致接口（如支付网关、数据格式转换）。

## 代码示例

### 场景：兼容两种日志系统
```javascript
// 目标接口 (期望的日志接口)
class NewLogger {
  log(message) {
    throw new Error("需实现 log 方法");
  }
}

// 被适配的旧日志类 (不兼容)
class OldLogger {
  writeLog(text) {
    console.log(`旧日志: ${text}`);
  }
}

// 适配器：转换旧接口为 NewLogger 兼容接口
class LoggerAdapter extends NewLogger {
  constructor(oldLogger) {
    super();
    this.oldLogger = oldLogger;
  }

  log(message) {
    // 将新接口调用转为旧接口方法
    this.oldLogger.writeLog(message.toUpperCase());
  }
}

// 使用适配器
const oldLogger = new OldLogger();
const adapter = new LoggerAdapter(oldLogger);

adapter.log("警告：内存不足"); 
// 输出：旧日志: 警告：内存不足（转为大写）
```

## 模式优势
1. **解耦**：客户端与适配者分离，互不依赖。
2. **复用性**：复用无法修改的旧代码/第三方库。
3. **灵活性**：适配器可动态替换，支持多种适配逻辑。
4. **符合开闭原则**：不修改原有代码，仅通过新增适配器扩展功能。

## 实际应用案例
1. **API 兼容**：封装不同支付接口（如 PayPal/Stripe），提供统一支付方法。
   ```javascript
   class PayPal {
     makePayment(amount) { /* ... */ }
   }
   
   class StripeAdapter {
     constructor(stripe) {
       this.stripe = stripe;
     }
     pay(amount) {
       this.stripe.processPayment(amount * 100); // 转换金额单位
     }
   }
   ```
   
2. **数据格式转换**：将 XML 数据适配为 JSON 格式。
   ```javascript
   class XMLToJSONAdapter {
     parse(data) {
       const xml = parseXml(data); // 假设 XML 解析函数
       return convertToJson(xml);  // 转换为 JSON
     }
   }
   ```

## 与其他模式的区别
- **vs 装饰器模式**：适配器侧重接口转换，装饰器侧重功能扩展。
- **vs 外观模式**：适配器解决两个接口兼容问题；外观模式简化复杂子系统的调用。

> 💡**关键总结**：适配器是解决接口不兼容问题的“转换器”，确保新旧代码/系统无缝协作，是系统集成中的关键桥梁。