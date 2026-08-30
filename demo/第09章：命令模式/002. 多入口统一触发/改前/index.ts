// 改前：按钮、菜单、快捷键三个入口各自直接调用业务函数，重复且失控
class OrderService {
  createOrder(): void {
    console.log('[业务] 创建订单成功');
  }

  deleteOrder(): void {
    console.log('[业务] 删除订单成功');
  }
}

const orderService = new OrderService();

// 工具栏按钮：直接调用业务函数
const toolbarButton = {
  click(): void {
    console.log('[日志] 工具栏按钮被点击');
    orderService.createOrder();
  },
};

// 右键菜单：再写一遍几乎相同的代码
const contextMenu = {
  click(): void {
    console.log('[日志] 右键菜单被点击');
    orderService.createOrder();
  },
};

// 快捷键：又写一遍
const hotkey = {
  press(): void {
    console.log('[日志] 快捷键被按下');
    orderService.createOrder();
  },
};

toolbarButton.click();
contextMenu.click();
hotkey.press();

// 问题：
// 1. 三个入口重复编写"日志 + 调用"，想加权限校验就要改三处，漏一处就是漏洞
// 2. 入口组件写死了 OrderService，没法复用到"保存用户""导出报表"等其他操作
// 3. 新增入口（语音指令、拖拽手势）只能继续复制粘贴

export {};
