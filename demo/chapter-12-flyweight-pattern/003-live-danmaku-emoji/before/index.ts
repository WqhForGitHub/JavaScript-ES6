// 改前：每条表情弹幕都 new 一个完整对象，表情图资源跟着弹幕一起爆炸

// 弹幕对象：表情图（大，种类只有 4 种）+ 轨道/时间（小，每条都不同）
class EmojiBullet {
  // 模拟表情图资源：真实场景是 gif / 雪碧图切片，每种几 KB 到几十 KB
  readonly skin: string;

  constructor(
    public emoji: '笑脸' | '哭脸' | '点赞' | '火箭',
    public track: number, // 弹幕轨道（屏幕第几行）
    public at: number, // 出现时间戳（ms）
  ) {
    this.skin = `表情图(${emoji})-约16KB`;
  }

  render(): void {
    console.log(`第 ${this.track} 轨道 @${this.at}ms 渲染${this.emoji}：${this.skin}`);
  }
}

// 一分钟涌入 10000 条表情弹幕
const bullets: EmojiBullet[] = [];
const emojis = ['笑脸', '哭脸', '点赞', '火箭'] as const;
for (let i = 0; i < 10000; i++) {
  bullets.push(new EmojiBullet(emojis[i % 4], i % 12, 1000 + i));
}

console.log(`1 分钟 10000 条弹幕，表情对象数：${bullets.length}`); // 10000
bullets[0].render();
bullets[1].render();

// 问题：
// 1. 表情只有 4 种，16KB 的图资源却被复制了 10000 份（约 156MB）
// 2. 轨道和时间这些真正每条都不同的数据，反而只占对象里的一小部分
// 3. 表情图更新（春节限定皮肤），10000 个对象里的同一份资源全要替换

export {};
