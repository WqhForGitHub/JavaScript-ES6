// 改前：售货机用一个字符串状态 + 库存计数，投币/退币/选货/补货四个方法里全是状态分支，出货还要再嵌套库存判断

type MachineState = 'idle' | 'hasCoin' | 'soldOut';

class VendingMachine {
  private state: MachineState = 'idle'; // 初始状态：待机（未投币）
  private stock: number;

  constructor(stock: number) {
    this.stock = stock;
  }

  insertCoin(): void {
    if (this.state === 'idle') {
      console.log('投币成功，请选择商品');
      this.state = 'hasCoin';
    } else if (this.state === 'hasCoin') {
      console.log('已投过硬币，请直接选择商品');
    } else {
      console.log('本机已售罄，请勿投币');
    }
  }

  ejectCoin(): void {
    if (this.state === 'idle') {
      console.log('没有可退的硬币');
    } else if (this.state === 'hasCoin') {
      console.log('退币成功，硬币已吐出');
      this.state = 'idle';
    } else {
      console.log('没有可退的硬币');
    }
  }

  pressButton(): void {
    if (this.state === 'idle') {
      console.log('请先投币');
    } else if (this.state === 'hasCoin') {
      console.log('出货中……饮料掉进取货口');
      this.stock -= 1;
      // 出货完还要再判断一次库存，决定回到待机还是转售罄 -- 状态判断和库存逻辑缠在一起
      if (this.stock > 0) {
        console.log(`出货完成，剩余库存 ${this.stock} 件`);
        this.state = 'idle';
      } else {
        console.log('出货完成，本机商品已售罄');
        this.state = 'soldOut';
      }
    } else {
      console.log('本机已售罄，无法出货');
    }
  }

  restock(count: number): void {
    this.stock += count;
    if (this.state === 'soldOut') {
      console.log(`补货 ${count} 件，机器恢复营业`);
      this.state = 'idle';
    } else {
      console.log(`补货 ${count} 件，当前库存 ${this.stock} 件`);
    }
  }
}

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

// 问题：
// 1. 4 个操作 × 3 种状态，每个方法都要把状态枚举一遍，分支密密麻麻
// 2. pressButton 里“状态判断 + 扣库存 + 决定下一个状态”缠在一起，改一次出货规则要理三层逻辑
// 3. 售罄的拦截规则（勿投币、无法出货）散落在多个方法里，新增“故障停机”状态又要全部翻新
// 4. 机器的行为没有按状态归类，读代码要在四个方法间来回跳，才能拼出一台完整的售货机

export {};
