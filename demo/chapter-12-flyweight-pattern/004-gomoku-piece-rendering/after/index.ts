// 改后：享元模式 -- 黑白两个棋子享元全盘共享，坐标作为外部状态绘制时传入

// ========== 享元对象：只保存颜色和纹理这类内部状态 ==========
class PieceFlyweight {
  // 模拟棋子渲染资源：全盘只有黑白两份
  readonly texture: string;

  constructor(public color: 'black' | 'white') {
    this.texture = `棋子纹理(${color})`;
  }

  // 外部状态（交叉点坐标）通过参数传入
  draw(x: number, y: number): void {
    const label = this.color === 'black' ? '黑子' : '白子';
    console.log(`在 (${x}, ${y}) 绘制${label}：${this.texture}`);
  }
}

// ========== 享元工厂：黑子白子各创建一次 ==========
class PieceFactory {
  private cache = new Map<'black' | 'white', PieceFlyweight>();

  get(color: 'black' | 'white'): PieceFlyweight {
    let piece = this.cache.get(color);
    if (!piece) {
      piece = new PieceFlyweight(color);
      this.cache.set(color, piece);
    }
    return piece;
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== 对局记录：只存轻量的外部状态 ==========
const factory = new PieceFactory();
const moves: Array<{ color: 'black' | 'white'; x: number; y: number }> = [];
for (let i = 0; i < 60; i++) {
  moves.push({ color: i % 2 === 0 ? 'black' : 'white', x: Math.floor(i / 19), y: i % 19 });
}

// 重绘前 4 手作演示：棋子对象来自共享池，坐标现场传入
for (const m of moves.slice(0, 4)) {
  factory.get(m.color).draw(m.x, m.y);
}

console.log(`已落 60 子，棋子对象数：${factory.size()} 个`); // 2
console.log('就算下满 361 个交叉点，对象依然只有 2 个');

// 优势：
// 1. 内部状态（颜色纹理）与外部状态（坐标）分离，整盘棋只占 2 个对象
// 2. 悔棋 / 重绘 / 复盘只操作轻量坐标记录，纹理对象全程复用
// 3. 换棋子皮肤只改 2 个享元对象，全盘棋子即时生效

export {};
