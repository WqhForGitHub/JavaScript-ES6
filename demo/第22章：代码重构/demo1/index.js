// ============================================================
// 提取函数（Extract Function）
// 重构的核心手法之一：将一段功能独立的代码抽离成一个新的函数
// 好处：减少重复，提高可读性，便于复用
// ============================================================

// ---------- 重构前 ----------
const printOwingBefore = function (invoice) {
  let outstanding = 0;

  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');

  // 计算应收金额
  for (let i = 0; i < invoice.orders.length; i++) {
    outstanding += invoice.orders[i].amount;
  }

  // 记录到期日
  const today = new Date();
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  // 打印详情
  console.log('name: ' + invoice.customer);
  console.log('amount: ' + outstanding);
  console.log('due: ' + invoice.dueDate.toLocaleDateString());
};

const invoice1 = {
  customer: 'sven',
  orders: [{ amount: 100 }, { amount: 200 }],
};

console.log('--- 重构前 ---');
printOwingBefore(invoice1);

// ---------- 重构后 ----------
// 将打印横幅的逻辑提取为独立函数
const printBanner = function () {
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');
};

// 将计算应收金额的逻辑提取为独立函数
const getOutstanding = function (orders) {
  let result = 0;
  for (let i = 0; i < orders.length; i++) {
    result += orders[i].amount;
  }
  return result;
};

// 将记录到期日的逻辑提取为独立函数
const recordDueDate = function (invoice) {
  const today = new Date();
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
};

// 将打印详情的逻辑提取为独立函数
const printDetails = function (invoice, outstanding) {
  console.log('name: ' + invoice.customer);
  console.log('amount: ' + outstanding);
  console.log('due: ' + invoice.dueDate.toLocaleDateString());
};

// 重构后的主函数，逻辑清晰一目了然
const printOwingAfter = function (invoice) {
  printBanner();
  const outstanding = getOutstanding(invoice.orders);
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
};

const invoice2 = {
  customer: 'sven',
  orders: [{ amount: 100 }, { amount: 200 }],
};

console.log('\n--- 重构后 ---');
printOwingAfter(invoice2);
