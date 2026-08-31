// 改前：打印客户欠款账单的函数一口气干了三件事（画横幅、算欠款、打明细），几十行读下来不知道哪段在干嘛，改任何一段都要通读全文

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

// ========== 打印欠款账单：所有逻辑堆在一个函数里 ==========
function printOwing(invoice: Invoice): void {
  let outstanding = 0;

  // 画横幅（打印细节）
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');

  // 计算应收欠款（计算细节）
  for (const order of invoice.orders) {
    if (!order.paid) {
      outstanding += order.amount;
    }
  }

  // 打印明细（打印细节）
  console.log(`customer: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due date: ${getDueDate()}`);
}

function getDueDate(): string {
  const now = new Date();
  const due = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  return `${due.getFullYear()}-${due.getMonth() + 1}-${due.getDate()}`;
}

// ========== 使用 ==========
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

// 问题：
// 1. 一个函数干三件事：横幅怎么画、欠款怎么算、明细怎么打，全部搅在一起，得通读全文才能理解
// 2. 中间夹着一段"计算"，前后都是"打印"：阅读时要在"算钱"和"画界面"两种思维间来回切换
// 3. 想复用其中一段（比如只算欠款给财务模块用）做不到，只能整段复制
// 4. 函数越长，临时变量（如 outstanding）被中途修改的风险越大，改一处容易牵连别处

export {};
