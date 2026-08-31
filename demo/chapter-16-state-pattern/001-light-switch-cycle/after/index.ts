// 改后：状态模式 -- 每种亮度是一个状态类，电灯把动作委托给当前状态对象，行为跟着状态走

// ========== 状态接口：状态要响应的所有动作 ==========
interface LightState {
  buttonWasPressed(light: Light): void;
  doubleTap(light: Light): void;
}

// ========== 上下文：电灯只保存当前状态并转发动作，自己不写任何状态判断 ==========
class Light {
  private currentState: LightState;

  constructor(initial: LightState) {
    this.currentState = initial;
  }

  buttonWasPressed(): void {
    this.currentState.buttonWasPressed(this); // 按下后发生什么，由当前状态说了算
  }

  doubleTap(): void {
    this.currentState.doubleTap(this);
  }

  setState(next: LightState): void {
    this.currentState = next;
  }
}

// ========== 具体状态：关灯 ==========
class OffState implements LightState {
  buttonWasPressed(light: Light): void {
    console.log('弱光灯亮起'); // 关灯时按下 -> 弱光
    light.setState(weakState);
  }

  doubleTap(): void {
    console.log('灯已是关闭状态'); // 关灯时双击 -> 无事发生
  }
}

// ========== 具体状态：弱光 ==========
class WeakState implements LightState {
  buttonWasPressed(light: Light): void {
    console.log('强光灯亮起'); // 弱光时按下 -> 强光
    light.setState(strongState);
  }

  doubleTap(light: Light): void {
    console.log('灯熄灭'); // 弱光时双击 -> 关灯
    light.setState(offState);
  }
}

// ========== 具体状态：强光 ==========
class StrongState implements LightState {
  buttonWasPressed(light: Light): void {
    console.log('灯熄灭'); // 强光时按下 -> 关灯
    light.setState(offState);
  }

  doubleTap(light: Light): void {
    console.log('灯熄灭'); // 强光时双击 -> 关灯
    light.setState(offState);
  }
}

// 状态对象没有自己的字段，全局共享一份即可
const offState = new OffState();
const weakState = new WeakState();
const strongState = new StrongState();

// ========== 使用：连按四次按钮，状态循环一圈 ==========
const light = new Light(offState);
light.buttonWasPressed(); // 弱光灯亮起
light.buttonWasPressed(); // 强光灯亮起
light.buttonWasPressed(); // 灯熄灭
light.buttonWasPressed(); // 弱光灯亮起（循环一圈回到弱光）

light.doubleTap(); // 灯熄灭
light.doubleTap(); // 灯已是关闭状态

// ========== 扩展：新增“中光”档位，只需新增一个类，再把 WeakState 的跳转目标换成 mediumState ==========
class MediumState implements LightState {
  buttonWasPressed(light: Light): void {
    console.log('强光灯亮起'); // 中光时按下 -> 强光
    light.setState(strongState);
  }

  doubleTap(light: Light): void {
    console.log('灯熄灭'); // 中光时双击 -> 关灯
    light.setState(offState);
  }
}
const mediumState = new MediumState();

// 验证新档位工作正常：此时弱光按下会先到中光，再到强光
const light2 = new Light(offState);
light2.setState(mediumState); // 模拟“弱光按下后已进入中光”
light2.buttonWasPressed(); // 强光灯亮起
light2.doubleTap(); // 灯熄灭

// 优势：
// 1. 行为按状态聚集：读 OffState 一个类，就知道关灯时按下、双击分别会发生什么
// 2. 加档位只需新增一个状态类、改一处跳转，电灯和其他状态类都不用动，符合开放-封闭原则
// 3. 流转规则显式：每个状态类写明“下一步去哪”，关灯->弱光->强光->关灯一目了然
// 4. 电灯类里没有任何 if-else，加动作只需扩展状态接口，各状态各自决定行为

export {};
