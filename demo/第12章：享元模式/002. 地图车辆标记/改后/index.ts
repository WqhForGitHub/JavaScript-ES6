// 改后：享元模式 -- 车型图标只创建 3 份共享，实时坐标作为外部状态绘制时传入

// ========== 享元对象：只保存车型图标这类内部状态 ==========
class VehicleIcon {
  // 模拟图标资源：全地图同车型共用这一份
  readonly iconData: string;

  constructor(public type: 'taxi' | 'express' | 'truck') {
    this.iconData = `图标贴图(${type})-约32KB`;
  }

  // 外部状态（实时坐标）通过参数传入，车辆移动不再牵动对象本身
  draw(lng: number, lat: number): void {
    console.log(`在 (${lng}, ${lat}) 绘制 ${this.type}：${this.iconData}`);
  }
}

// ========== 享元工厂：每种车型只创建一次 ==========
class IconFactory {
  private cache = new Map<'taxi' | 'express' | 'truck', VehicleIcon>();

  get(type: 'taxi' | 'express' | 'truck'): VehicleIcon {
    let icon = this.cache.get(type);
    if (!icon) {
      icon = new VehicleIcon(type);
      this.cache.set(type, icon);
    }
    return icon;
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== 3000 辆车：只有 3 个图标对象 ==========
const factory = new IconFactory();
const types = ['taxi', 'express', 'truck'] as const;

// 车辆位置只存轻量数据（真实项目：Float32Array / 消息推送）
const vehicles: Array<{ type: (typeof types)[number]; lng: number; lat: number }> = [];
for (let i = 0; i < 3000; i++) {
  vehicles.push({ type: types[i % 3], lng: 120 + i * 0.001, lat: 30 + i * 0.001 });
}

// 绘制前 3 辆车作演示：图标来自共享池，坐标现场传入
for (const v of vehicles.slice(0, 3)) {
  factory.get(v.type).draw(v.lng, v.lat);
}

console.log(`在途车辆 3000 辆，图标对象数：${factory.size()} 个`); // 3
console.log('换冬季主题只需改 3 个对象，3000 辆车同时生效');

// 优势：
// 1. 内部状态（车型图标）与外部状态（实时坐标）分离，3000 辆车只占 3 个图标对象
// 2. 车辆增删、坐标移动只操作轻量数据，昂贵的图标资源稳定复用
// 3. 图标换肤只改享元对象本身，所有引用它的车辆标记同时生效

export {};
