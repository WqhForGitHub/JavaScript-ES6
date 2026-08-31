// 改后：状态模式 -- 待机/已投币/售罄各是一个状态类，每个状态自己回答“投币、退币、选货、补货该怎么办”

// ========== 状态接口：状态要响应的所有动作 ==========
interface VendingState {
  insertCoin(machine: VendingMachine): void;
  ejectCoin(machine: VendingMachine): void;
  pressButton(machine: VendingMachine): void;
  restock(machine: VendingMachine, count: number): void;
}

// ========== 上下文：售货机只保存当前状态和库存，动作全部转发给状态 ==========
class VendingMachine {
  stock: number; // 库存由状态对象读写
  private currentState: VendingState;

  constructor(stock: number) {
    this.stock = stock;
    this.currentState = stock > 0 ? machineIdle : machineSoldOut; // 开机时按库存定初始状态
  }

  insertCoin(): void {
    this.currentState.insertCoin(this);
  }

  ejectCoin(): void {
    this.currentState.ejectCoin(this);
  }

  pressButton(): void {
    this.currentState.pressButton(this);
  }

  restock(count: number): void {
    this.currentState.restock(this, count);
  }

  setState(next: VendingState): void {
    this.currentState = next;
  }
}

// ========== 具体状态：待机（未投币） ==========
class IdleState implements VendingState {
  insertCoin(machine: VendingMachine): void {
    console.log('投币成功，请选择商品'); // 待机 -> 已投币
    machine.setState(machineHasCoin);
  }

  ejectCoin(): void {
    console.log('没有可退的硬币');
  }

  pressButton(): void {
    console.log('请先投币');
  }

  restock(machine: VendingMachine, count: number): void {
    machine.stock += count;
    console.log(`补货 ${count} 件，当前库存 ${machine.stock} 件`);
  }
}

// ========== 具体状态：已投币 ==========
class HasCoinState implements VendingState {
  insertCoin(): void {
    console.log('已投过硬币，请直接选择商品');
  }

  ejectCoin(machine: VendingMachine): void {
    console.log('退币成功，硬币已吐出'); // 已投币 -> 待机
    machine.setState(machineIdle);
  }

  pressButton(machine: VendingMachine): void {
    console.log('出货中……饮料掉进取货口');
    machine.stock -= 1;
    // 出货后的去向只有这一处说了算：还有货回待机，没货转售罄
    if (machine.stock > 0) {
      console.log(`出货完成，剩余库存 ${machine.stock} 件`);
      machine.setState(machineIdle);
    } else {
      console.log('出货完成，本机商品已售罄');
      machine.setState(machineSoldOut);
    }
  }

  restock(machine: VendingMachine, count: number): void {
    machine.stock += count;
    console.log(`补货 ${count} 件，当前库存 ${machine.stock} 件`);
  }
}

// ========== 具体状态：售罄 ==========
class SoldOutState implements VendingState {
  insertCoin(): void {
    console.log('本机已售罄，请勿投币'); // 售罄的第一道闸门：不让投币
  }

  ejectCoin(): void {
    console.log('没有可退的硬币');
  }

  pressButton(): void {
    console.log('本机已售罄，无法出货'); // 第二道闸门：无法出货
  }

  restock(machine: VendingMachine, count: number): void {
    machine.stock += count;
    console.log(`补货 ${count} 件，机器恢复营业`); // 售罄 -> 待机
    machine.setState(machineIdle);
  }
}

// 状态对象无字段，全局共享一份
const machineIdle = new IdleState();
const machineHasCoin = new HasCoinState();
const machineSoldOut = new SoldOutState();

// ========== 使用：正常购买一瓶 ==========
const vm = new VendingMachine(2);
vm.pressButton(); // 请先投币
vm.insertCoin(); // 投币成功，请选择商品
vm.ejectCoin(); // 退币成功，硬币已吐出
vm.insertCoin(); // 投币成功，请选择商品
vm.pressButton(); // 出货中……饮料掉进取货口 / 出货完成，剩余库存 1 件
vm.pressButton(); // 请先投币

// ========== 使用：卖到售罄，补货后恢复营业 ==========
vm.insertCoin(); // 投币成功，请选择商品
vm.pressButton(); // 出货中……饮料掉进取货口 / 出货完成，本机商品已售罄
vm.insertCoin(); // 本机已售罄，请勿投币
vm.restock(3); // 补货 3 件，机器恢复营业
vm.insertCoin(); // 投币成功，请选择商品
vm.pressButton(); // 出货中……饮料掉进取货口 / 出货完成，剩余库存 2 件

// 优势：
// 1. 售罄的所有拦截规则集中在 SoldOutState 一个类里，投币、出货的闸门一处看全
// 2. 出货规则只写在 HasCoinState.pressButton 一处，“回待机还是转售罄”不再散落多层嵌套
// 3. 新增状态（如“故障停机”）只需新增一个类，售货机和其他状态零改动，符合开放-封闭原则
// 4. 售货机类不含任何分支判断，投币/退币/选货只是转发，读三个状态类就能拼出完整机器

export {};
