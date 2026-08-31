// 改后：命令模式 -- 入口组件只认识"命令对象"，与具体业务彻底解耦

// ========== 接收者（Receiver）：业务逻辑 ==========
class OrderService {
  createOrder(): void {
    console.log('[业务] 创建订单成功');
  }

  deleteOrder(): void {
    console.log('[业务] 删除订单成功');
  }
}

// ========== 命令（Command）：把一次请求封装成对象 ==========
interface Command {
  execute(): void;
}

class CreateOrderCommand implements Command {
  constructor(private service: OrderService) {}

  execute(): void {
    console.log('[日志] 执行命令：创建订单');
    this.service.createOrder();
  }
}

class DeleteOrderCommand implements Command {
  constructor(private service: OrderService) {}

  execute(): void {
    console.log('[日志] 执行命令：删除订单');
    this.service.deleteOrder();
  }
}

// ========== 调用者（Invoker）：通用入口组件，全后台复用 ==========
class Button {
  constructor(private command: Command) {}

  click(): void {
    this.command.execute();
  }
}

class MenuItem {
  constructor(private command: Command) {}

  click(): void {
    this.command.execute();
  }
}

class Hotkey {
  constructor(private command: Command) {}

  press(): void {
    this.command.execute();
  }
}

// ========== 组装：同一个命令可以挂到任意多个入口 ==========
const service = new OrderService();
const createCmd = new CreateOrderCommand(service);

const toolbarButton = new Button(createCmd);
const contextMenu = new MenuItem(createCmd);
const ctrlN = new Hotkey(createCmd);

toolbarButton.click();
contextMenu.click();
ctrlN.press();

// 别的按钮想绑"删除订单"？换个命令对象即可，入口组件一行不改
const deleteButton = new Button(new DeleteOrderCommand(service));
deleteButton.click();

// 优势：
// 1. 日志、权限等通用逻辑只在命令里写一次，所有入口自动共享
// 2. Button/MenuItem/Hotkey 是通用组件，可绑定任何命令，全系统复用
// 3. 新入口、新业务互不影响：入口换命令、命令挂新入口都只是一行代码

export {};
