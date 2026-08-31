// 改前：飞机之间直接互相协商跑道，谁都跟谁说话，没有仲裁者，全凭先来后到

type PlaneState = 'flying' | 'landing' | 'parked';

class Plane {
  state: PlaneState = 'flying';

  constructor(
    public flightNo: string, // 航班号
    public fuelPercent: number, // 剩余油量
  ) {}

  // 想降落：自己挨个问“你们谁在用跑道？”，自己判断能不能降
  requestLanding(allPlanes: Plane[]): void {
    console.log(`${this.flightNo} 请求降落（油量 ${this.fuelPercent}%）`);

    // 必须拿到“所有飞机”的名单才能做判断
    const runwayBusy = allPlanes.some((p) => p.state === 'landing');
    if (runwayBusy) {
      console.log(`  ${this.flightNo}：跑道被占，我先盘旋等待...`);
      return;
    }
    // 没人用就自己占用跑道（检查和占用之间没有原子性，并发请求会撞车）
    this.state = 'landing';
    console.log(`  ${this.flightNo}：正在降落...`);
  }
}

const planes = [new Plane('CA101', 30), new Plane('MU202', 15), new Plane('CZ303', 55)];

// 每架飞机都要携带完整名单来“开会”
planes.forEach((p) => p.requestLanding(planes));

// 问题：
// 1. 每架飞机都得认识所有其他飞机，机群越大关系越乱
// 2. 没有优先级仲裁：油量只剩 15% 的 MU202，仅因 CA101 先开口就得盘旋等待
// 3. “检查跑道 + 占用跑道”不是原子操作，两架同时请求就可能同时降落
// 4. 想加“起飞也要用跑道”的协调逻辑，每架飞机都得改一遍

export {};
