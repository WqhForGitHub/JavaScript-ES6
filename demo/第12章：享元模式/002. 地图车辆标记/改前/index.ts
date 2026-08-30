// 改前：地图上每辆车 new 一个标记对象，车型图标数据跟着对象被复制了几千份

// 标记对象：车型图标（大块头，3 种车型只有 3 份有效数据）+ 实时坐标（每辆车都不同）
class VehicleMarker {
  // 模拟图标资源：真实场景里是几十 KB 的雪碧图切片 / 绘制参数
  readonly iconData: string;

  constructor(
    public type: 'taxi' | 'express' | 'truck',
    public lng: number,
    public lat: number,
  ) {
    this.iconData = `图标贴图(${type})-约32KB`;
  }

  draw(): void {
    console.log(`在 (${this.lng}, ${this.lat}) 绘制 ${this.type}：${this.iconData}`);
  }
}

// 地图上实时有 3000 辆车在跑
const markers: VehicleMarker[] = [];
const types = ['taxi', 'express', 'truck'] as const;
for (let i = 0; i < 3000; i++) {
  markers.push(new VehicleMarker(types[i % 3], 120 + i * 0.001, 30 + i * 0.001));
}

console.log(`在途车辆 3000 辆，标记对象数：${markers.length}`); // 3000
markers[0].draw();
markers[1].draw();

// 问题：
// 1. 车型只有 3 种，32KB 的图标数据却随 3000 个对象复制了 3000 份（约 93.75MB）
// 2. 坐标每秒都在变，图标数据纹丝不动，不变的却跟着一起创建和销毁
// 3. 图标升级（换冬季主题），要更新 3000 个对象里的同一份数据

export {};
