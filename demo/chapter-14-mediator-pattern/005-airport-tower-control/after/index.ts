// 改后：中介者模式 -- 飞机只向塔台发请求，跑道分配、优先级、排队全部由塔台仲裁

type PlaneState = 'flying' | 'landing' | 'taking-off' | 'parked';

// ========== 同事对象：飞机只认识塔台 ==========
class Plane {
  state: PlaneState = 'flying';

  constructor(
    public flightNo: string,
    public fuelPercent: number,
    private tower: Tower,
  ) {}

  requestLanding(): void {
    this.tower.requestLanding(this); // 只发请求，怎么排是塔台的事
  }

  requestTakeoff(): void {
    this.tower.requestTakeoff(this);
  }

  // 由塔台回调：授权使用跑道
  clearToLand(): void {
    this.state = 'landing';
    console.log(`${this.flightNo}：收到塔台许可，正在降落...`);
  }

  clearToTakeoff(): void {
    this.state = 'taking-off';
    console.log(`${this.flightNo}：收到塔台许可，正在起飞...`);
  }

  // 降落/起飞完成，通知塔台释放跑道
  done(): void {
    this.state = this.state === 'landing' ? 'parked' : 'flying';
    this.tower.runwayFree();
  }
}

// ========== 中介者：塔台，唯一管理跑道和队列的角色 ==========
class Tower {
  private runwayBusy = false;
  private landingQueue: Plane[] = [];
  private takeoffQueue: Plane[] = [];

  requestLanding(plane: Plane): void {
    console.log(`${plane.flightNo} 请求降落（油量 ${plane.fuelPercent}%）`);
    this.landingQueue.push(plane);
    this.schedule();
  }

  requestTakeoff(plane: Plane): void {
    console.log(`${plane.flightNo} 请求起飞`);
    this.takeoffQueue.push(plane);
    this.schedule();
  }

  runwayFree(): void {
    this.runwayBusy = false;
    this.schedule();
  }

  // 仲裁规则集中一处：降落优先于起飞；等待降落的飞机里油量低者优先
  private schedule(): void {
    if (this.runwayBusy) return;

    this.landingQueue.sort((a, b) => a.fuelPercent - b.fuelPercent); // 油量升序
    const nextLanding = this.landingQueue.shift();
    if (nextLanding) {
      this.runwayBusy = true;
      nextLanding.clearToLand();
      return;
    }

    const nextTakeoff = this.takeoffQueue.shift();
    if (nextTakeoff) {
      this.runwayBusy = true;
      nextTakeoff.clearToTakeoff();
    }
  }
}

// ========== 使用：飞机之间互不通信，只跟塔台说话 ==========
const tower = new Tower();
const ca101 = new Plane('CA101', 30, tower);
const mu202 = new Plane('MU202', 15, tower);
const cz303 = new Plane('CZ303', 55, tower);
const hu404 = new Plane('HU404', 90, tower);

ca101.requestLanding(); // 跑道空闲，立即放行
mu202.requestLanding(); // 进入等待队列（油量低，会排在 CZ303 前面）
cz303.requestLanding();
hu404.requestTakeoff(); // 起飞要让着降落的

console.log('--- 跑道陆续空出，队列自动流转 ---');
ca101.done(); // CA101 落地 -> 自动放行油量更低的 MU202
mu202.done(); // MU202 落地 -> 放行 CZ303
cz303.done(); // 降落队列清空 -> 放行起飞的 HU404
hu404.done(); // 跑道彻底空闲

// 优势：
// 1. 飞机只持有塔台一个引用，机群再大也是星型结构
// 2. “跑道互斥、油量优先、降落优先”等仲裁规则集中在塔台一处
// 3. 检查与占用由塔台原子完成，不存在两架同时降落的竞态
// 4. 新增协调逻辑（如除冰队列、地面滑行指挥）只改塔台，飞机零改动

export {};
