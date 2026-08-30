// 改前：电灯用字符串记录状态，每个动作方法里都要把所有状态 if-else 一遍，加档位、加动作都要翻新分支

type LightState = 'off' | 'weak' | 'strong';

class Light {
  private state: LightState = 'off'; // 初始状态：关灯

  // 动作一：按下按钮，循环切换亮度
  buttonWasPressed(): void {
    if (this.state === 'off') {
      console.log('弱光灯亮起'); // 关灯 -> 弱光
      this.state = 'weak';
    } else if (this.state === 'weak') {
      console.log('强光灯亮起'); // 弱光 -> 强光
      this.state = 'strong';
    } else {
      console.log('灯熄灭'); // 强光 -> 关灯
      this.state = 'off';
    }
  }

  // 动作二：双击直接关灯 -- 又要把所有状态重新判断一遍
  doubleTap(): void {
    if (this.state === 'off') {
      console.log('灯已是关闭状态');
    } else {
      console.log('灯熄灭');
      this.state = 'off';
    }
  }
}

// ========== 使用：连按四次按钮，状态循环一圈 ==========
const light = new Light();
light.buttonWasPressed(); // 弱光灯亮起
light.buttonWasPressed(); // 强光灯亮起
light.buttonWasPressed(); // 灯熄灭
light.buttonWasPressed(); // 弱光灯亮起（循环一圈回到弱光）

light.doubleTap(); // 灯熄灭
light.doubleTap(); // 灯已是关闭状态

// 问题：
// 1. 状态和行为被拆散：想知道“弱光状态下会发生什么”，得在两个方法里翻找 if-else 分支
// 2. 每加一个动作（如双击），都要把所有状态重新枚举一遍，分支成倍增长
// 3. 每加一个档位（如中光），buttonWasPressed、doubleTap 里的判断都要跟着改，违反开放-封闭原则
// 4. 流转规则（关灯->弱光->强光->关灯）埋在分支里，没有一个地方能一眼看完整条链

export {};
