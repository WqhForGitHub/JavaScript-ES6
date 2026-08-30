// 改后：提炼函数 -- 把"画横幅、算欠款、打明细"三段各抽成一个小函数，主函数读起来就像目录，每段职责一眼可辨

// ========== 订单：一条订单有金额和是否已付款 ==========
interface Order {
  amount: number;
  paid: boolean;
}

// ========== 账单上的欠款数据 ==========
interface Invoice {
  customer: string;
  orders: Order[];
}

// ========== 主函数：只剩三个"做什么"，没有"怎么做" ==========
function printOwing(invoice: Invoice): void {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

// ========== 横幅怎么画：只归这一个函数管 ==========
function printBanner(): void {
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');
}

// ========== 欠款怎么算：只归这一个函数管 ==========
function calculateOutstanding(invoice: Invoice): number {
  let outstanding = 0;
  for (const order of invoice.orders) {
    if (!order.paid) {
      outstanding += order.amount;
    }
  }
  return outstanding;
}

// ========== 明细怎么打：只归这一个函数管 ==========
function printDetails(invoice: Invoice, outstanding: number): void {
  console.log(`customer: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due date: ${getDueDate()}`);
}

function getDueDate(): string {
  const now = new Date();
  const due = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  return `${due.getFullYear()}-${due.getMonth() + 1}-${due.getDate()}`;
}

// ========== 使用：行为与改前完全一致 ==========
const invoice: Invoice = {
  customer: '张三',
  orders: [
    { amount: 500, paid: true },
    { amount: 300, paid: false },
    { amount: 200, paid: false },
  ],
};

printOwing(invoice);
// ***********************
// **** Customer Owes ****
// ***********************
// customer: 张三
// amount: 500
// due date: 2026-9-29

// ========== 扩展：财务模块想只拿欠款金额，直接复用 calculateOutstanding ==========
const financeAmount = calculateOutstanding(invoice);
console.log(`财务口径欠款：${financeAmount}`); // 财务口径欠款：500

// 优势：
// 1. 函数名即注释：printOwing 读作"画横幅、算欠款、打明细"，不用读实现就能理解意图
// 2. 计算与打印彻底分离：改账单样式不碰计算逻辑，改计算口径不碰打印代码
// 3. calculateOutstanding 可以被财务、对账等任何模块复用，不再需要复制整段
// 4. outstanding 只在 calculateOutstanding 内部存在，作用域缩到最小，被误改的风险随之消失

export {};
