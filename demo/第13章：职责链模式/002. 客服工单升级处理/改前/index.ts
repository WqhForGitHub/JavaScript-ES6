// 改前：机器人和各级客服的处理规则全写在一个函数里，条件越堆越多

interface Ticket {
  id: number;
  content: string; // 用户问题描述
}

// FAQ 知识库
const faq: Record<string, string> = {
  开发票: '开票入口：我的订单 -> 申请开票',
  修改手机号: '入口：设置 -> 账号与安全 -> 更换手机号',
};

// 工单处理入口：哪一级能处理、怎么答复，全部写死在一个函数里
function resolveTicket(ticket: Ticket): string {
  // 第一层：先查 FAQ 机器人
  for (const keyword of Object.keys(faq)) {
    if (ticket.content.includes(keyword)) {
      return `[FAQ机器人] 工单#${ticket.id}：${faq[keyword]}`;
    }
  }

  // 第二层：一线客服，处理账号类问题
  if (ticket.content.includes('密码') || ticket.content.includes('登录')) {
    return `[一线客服] 工单#${ticket.id}：已为您重置账号，请注意查收短信`;
  }

  // 第三层：二线工程师，处理技术故障
  if (ticket.content.includes('报错') || ticket.content.includes('白屏')) {
    return `[二线工程师] 工单#${ticket.id}：已定位到服务故障，预计 2 小时恢复`;
  }

  // 兜底：专家坐席
  return `[专家坐席] 工单#${ticket.id}：已转接人工专家，请保持电话畅通`;
}

console.log(resolveTicket({ id: 1, content: '请问怎么开发票？' }));
console.log(resolveTicket({ id: 2, content: '登录不上，密码忘了' }));
console.log(resolveTicket({ id: 3, content: '下单页面一直报错 500' }));
console.log(resolveTicket({ id: 4, content: '我要投诉快递员的态度' }));

// 问题：
// 1. 机器人、一线、二线、专家四方的知识全部耦合在一个函数里
// 2. 新增一级处理方（如“VIP 专属客服”）或调整升级顺序，都必须修改此函数
// 3. 各级无法独立维护：FAQ 知识库要更新也得动这个函数
// 4. 升级过程是隐式的（一层层 if 往下掉），看不出“谁处理不了、转给了谁”

export {};
