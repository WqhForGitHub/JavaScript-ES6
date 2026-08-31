// 改后：命令模式 -- 每次操作都是命令对象，天然可记录、可回放

// ========== 接收者：商品 ==========
interface Product {
  name: string;
  price: number;
  onSale: boolean;
}

const product: Product = { name: '机械键盘', price: 399, onSale: true };

// ========== 命令：每个操作封装成对象，自己知道怎么执行、怎么描述自己 ==========
interface Command {
  describe(): string;
  execute(): void;
}

class ChangePriceCommand implements Command {
  private oldPrice = 0;

  constructor(
    private product: Product,
    private newPrice: number,
  ) {}

  describe(): string {
    return `改价：${this.oldPrice} -> ${this.newPrice}`;
  }

  execute(): void {
    this.oldPrice = this.product.price; // 执行时记下改价前的价格
    this.product.price = this.newPrice;
  }
}

class TakeOffSaleCommand implements Command {
  constructor(private product: Product) {}

  describe(): string {
    return '下架';
  }

  execute(): void {
    this.product.onSale = false;
  }
}

class PutOnSaleCommand implements Command {
  constructor(private product: Product) {}

  describe(): string {
    return '上架';
  }

  execute(): void {
    this.product.onSale = true;
  }
}

// ========== 调用者：执行的同时自动记录，日志就是命令列表本身 ==========
class CommandHistory {
  private commands: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.commands.push(command); // 执行和记录收口在一处，绝不漏记
  }

  printLog(): void {
    console.log('--- 审计日志 ---');
    this.commands.forEach((command, index) => {
      console.log(`${index + 1}. ${command.describe()}`);
    });
  }

  replay(): void {
    console.log('--- 回放：按原顺序重演全部操作 ---');
    this.commands.forEach((command) => command.execute());
  }
}

const history = new CommandHistory();
history.execute(new ChangePriceCommand(product, 299));
history.execute(new TakeOffSaleCommand(product));
history.execute(new PutOnSaleCommand(product));
history.execute(new ChangePriceCommand(product, 259));

console.log('当前状态：', product); // price: 259, onSale: true
history.printLog();

// 模拟复盘：把商品恢复到初始状态，再按原顺序回放一遍
product.price = 399;
product.onSale = true;
history.replay();
console.log('回放后的状态：', product); // 与真实操作序列的结果一致

// 优势：
// 1. 执行与记录收口在 CommandHistory 一处，不可能漏记审计
// 2. 日志是命令对象而不只是字符串：能回放、能统计，也能接着做撤销
// 3. 新操作 = 新命令类，日志与回放逻辑零改动

export {};
