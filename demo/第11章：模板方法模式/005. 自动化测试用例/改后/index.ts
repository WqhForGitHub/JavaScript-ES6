// 改后：模板方法模式 -- 基类把「准备 -> 执行 -> 清理」骨架固定在 run()，用例只写断言

// ========== 抽象基类：测试用例执行骨架 ==========
abstract class TestCase {
  // 模板方法：执行骨架只写一次，try/catch/finally 的保障对每个用例自动生效
  run(): void {
    console.log(`▶ 开始用例：${this.caseName}`);
    this.setUp();
    try {
      this.runTest();
    } catch (e) {
      // 框架统一捕获断言失败，不让异常冲垮整个测试进程
      console.log(`✖ 用例失败：${this.caseName}（${(e as Error).message}）`);
    } finally {
      // 清理必达：就算断言抛异常也要恢复现场
      this.tearDown();
    }
  }

  // 钩子方法：默认的前置准备，需要特殊数据的用例可覆写
  protected setUp(): void {
    console.log('准备：清空购物车');
  }

  // 差异步骤：用例本体，子类只关心执行和断言
  protected abstract runTest(): void;

  // 公共步骤：统一清理，回滚数据库
  protected tearDown(): void {
    console.log('清理：回滚数据库');
  }

  protected abstract caseName: string;
}

// ========== 子类：只写用例本体 ==========
class CreateOrderTest extends TestCase {
  protected caseName = '下单成功';

  protected runTest(): void {
    console.log('执行：创建订单 O-1，断言金额 = 99 元');
  }
}

class CancelOrderTest extends TestCase {
  protected caseName = '取消订单';

  // 钩子覆写：这个用例需要特殊的前置数据
  protected setUp(): void {
    console.log('准备：造一条待支付订单');
  }

  protected runTest(): void {
    console.log('执行：取消订单 O-2，断言状态 = 已取消');
  }
}

class OutOfStockTest extends TestCase {
  protected caseName = '库存不足';

  protected runTest(): void {
    console.log('执行：库存不足下单，断言抛出 OUT_OF_STOCK');
    // 模拟断言失败抛异常：骨架的 finally 依然会执行清理
    throw new Error('OUT_OF_STOCK');
  }
}

console.log('--- 测试 1 ---');
new CreateOrderTest().run();

console.log('--- 测试 2（覆写 setUp 钩子）---');
new CancelOrderTest().run();

console.log('--- 测试 3（断言抛异常，清理照样执行）---');
new OutOfStockTest().run();

// 优势：
// 1. try/catch/finally 的执行保障只在骨架里写一次，所有用例自动获得
// 2. 用例只写「执行 + 断言」，不再抄样板，框架加耗时统计也只改基类
// 3. setUp 是钩子方法：大多数用例直接复用默认准备，个别用例按需覆写

export {};
