// 改后：享元模式 -- 性别作为内部状态只存 2 份，款式作为外部状态用参数传入

// ========== 享元对象：只保存可共享的内部状态（性别） ==========
class FlyweightModel {
  constructor(private sex: 'male' | 'female') {}

  // 外部状态（内衣款式）通过参数传入，用完即弃，不占对象内存
  takePhoto(underwear: string): void {
    const label = this.sex === 'male' ? '男模特' : '女模特';
    console.log(`拍照：${label}，身穿 ${underwear}`);
  }
}

// ========== 享元工厂：同一个内部状态只创建一次，之后全部复用 ==========
class ModelFactory {
  private cache = new Map<'male' | 'female', FlyweightModel>();

  create(sex: 'male' | 'female'): FlyweightModel {
    let model = this.cache.get(sex);
    if (!model) {
      model = new FlyweightModel(sex);
      this.cache.set(sex, model);
    }
    return model;
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== 拍摄：无论多少套内衣，全程只有 2 个模特对象 ==========
const factory = new ModelFactory();

for (let i = 1; i <= 3; i++) {
  factory.create('male').takePhoto(`男款 ${i} 号内衣`);
}
for (let i = 1; i <= 3; i++) {
  factory.create('female').takePhoto(`女款 ${i} 号内衣`);
}

console.log(`已拍摄 6 套内衣，共创建模特对象：${factory.size()} 个`); // 2
console.log('就算拍 10000 套，对象依然只有 2 个');

// 验证共享：同一个 key 拿到的永远是同一个对象
const maleA = factory.create('male');
const maleB = factory.create('male');
console.log('两次 create(male) 是同一个对象：', maleA === maleB); // true

// 优势：
// 1. 内部状态（性别）与外部状态（款式）分离：款式再多也只占 2 个对象
// 2. 享元工厂保证同 key 复用，绝不重复创建等价对象
// 3. 共享对象的修改一处生效：给男模统一换发型，只改这 1 个对象

export {};
