// 改前：每落一子 new 一个棋子对象，一盘下满 361 个交叉点就是 361 个对象

// 棋子对象：颜色（只有黑白 2 种）+ 落子坐标（每一手都不同）
class ChessPiece {
  // 模拟棋子渲染资源：真实场景是 canvas 纹理 / 渐变描述，黑白各一份就够
  readonly texture: string;

  constructor(
    public color: 'black' | 'white',
    public x: number, // 交叉点行号 0-18
    public y: number, // 交叉点列号 0-18
  ) {
    this.texture = `棋子纹理(${color})`;
  }

  draw(): void {
    const label = this.color === 'black' ? '黑子' : '白子';
    console.log(`在 (${this.x}, ${this.y}) 绘制${label}：${this.texture}`);
  }
}

// 一盘激战：黑白交替落了 60 手，每手都 new 一个棋子
const board: ChessPiece[] = [];
for (let i = 0; i < 60; i++) {
  board.push(new ChessPiece(i % 2 === 0 ? 'black' : 'white', Math.floor(i / 19), i % 19));
}

console.log(`已落 60 子，棋子对象数：${board.length}`); // 60
board[0].draw();
board[1].draw();

// 问题：
// 1. 颜色只有 2 种，纹理却随每一手棋重复创建，下满一盘最多 361 个对象
// 2. 纹理永远只有黑白两份，坐标才是每子不同的数据，主次完全颠倒
// 3. 全局换棋子皮肤（如玛瑙质感），要遍历所有棋子对象逐个替换纹理

export {};
