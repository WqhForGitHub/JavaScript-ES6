// 改后：享元模式 -- 每种表情只创建 1 个共享对象，轨道/时间作为外部状态传入

// ========== 享元对象：只保存表情图这类内部状态 ==========
class EmojiIcon {
  // 模拟表情图资源：全场弹幕共用这几份
  readonly skin: string;

  constructor(public emoji: '笑脸' | '哭脸' | '点赞' | '火箭') {
    this.skin = `表情图(${emoji})-约16KB`;
  }

  // 外部状态（轨道、时间）通过参数传入
  render(track: number, at: number): void {
    console.log(`第 ${track} 轨道 @${at}ms 渲染${this.emoji}：${this.skin}`);
  }
}

// ========== 享元工厂：每种表情只创建一次 ==========
class EmojiFactory {
  private cache = new Map<string, EmojiIcon>();

  get(emoji: '笑脸' | '哭脸' | '点赞' | '火箭'): EmojiIcon {
    let icon = this.cache.get(emoji);
    if (!icon) {
      icon = new EmojiIcon(emoji);
      this.cache.set(emoji, icon);
    }
    return icon;
  }

  size(): number {
    return this.cache.size;
  }
}

// ========== 10000 条弹幕：只有 4 个表情对象 ==========
const factory = new EmojiFactory();
const emojis = ['笑脸', '哭脸', '点赞', '火箭'] as const;

// 弹幕队列只存轻量的外部状态（真实项目：环形缓冲区 / 定点数组）
const bullets: Array<{ emoji: (typeof emojis)[number]; track: number; at: number }> = [];
for (let i = 0; i < 10000; i++) {
  bullets.push({ emoji: emojis[i % 4], track: i % 12, at: 1000 + i });
}

// 渲染前 4 条作演示：表情对象来自共享池，轨道/时间现场传入
for (const b of bullets.slice(0, 4)) {
  factory.get(b.emoji).render(b.track, b.at);
}

console.log(`1 分钟 10000 条弹幕，表情对象数：${factory.size()} 个`); // 4
console.log('上春节限定皮肤只需换 4 个对象，飞行中的弹幕同时生效');

// 优势：
// 1. 内部状态（表情图）与外部状态（轨道/时间）分离，10000 条弹幕只占 4 个对象
// 2. 弹幕的生灭只增删轻量记录，昂贵的图资源全程复用，GC 压力骤降
// 3. 表情图换肤只改享元对象，所有正在飞行的弹幕即时生效

export {};
