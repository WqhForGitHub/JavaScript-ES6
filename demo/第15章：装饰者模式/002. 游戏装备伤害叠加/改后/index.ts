// 改后：装饰者模式 -- 装备是"包在英雄身上的装饰者"，捡起装备 = 再包一层，攻击力从内到外逐层叠加

// ========== 组件接口：英雄和装备装饰者暴露同一套 API ==========
interface Fighter {
  getAttack(): number;
  desc(): string;
}

// ========== 被装饰的具体组件：裸装英雄 ==========
class BaseHero implements Fighter {
  getAttack(): number {
    return 10;
  }

  desc(): string {
    return '裸装英雄';
  }
}

// ========== 抽象装饰者：持有一个战斗单位，默认把行为委托给它 ==========
abstract class Equipment implements Fighter {
  constructor(protected fighter: Fighter) {}

  getAttack(): number {
    return this.fighter.getAttack();
  }

  desc(): string {
    return this.fighter.desc();
  }
}

// ========== 具体装饰者：每件装备只封装自己的加成 ==========
class Sword extends Equipment {
  getAttack(): number {
    return this.fighter.getAttack() + 15;
  }

  desc(): string {
    return this.fighter.desc() + ' -> 持屠龙刀';
  }
}

class Ring extends Equipment {
  getAttack(): number {
    return this.fighter.getAttack() + 6;
  }

  desc(): string {
    return this.fighter.desc() + ' -> 戴力量戒指';
  }
}

class Poison extends Equipment {
  getAttack(): number {
    return this.fighter.getAttack() + 8;
  }

  desc(): string {
    return this.fighter.desc() + ' -> 喝淬毒药剂';
  }
}

// ========== 模拟战斗：捡起一件装备就包一层，包裹顺序即叠加顺序 ==========
let hero: Fighter = new BaseHero();
console.log(`${hero.desc()}，攻击力：${hero.getAttack()}`); // 10

hero = new Sword(hero); // 捡起屠龙刀
console.log(`${hero.desc()}，攻击力：${hero.getAttack()}`); // 25

hero = new Ring(hero); // 戴上力量戒指
console.log(`${hero.desc()}，攻击力：${hero.getAttack()}`); // 31

hero = new Poison(hero); // 喝下淬毒药剂
console.log(`${hero.desc()}，攻击力：${hero.getAttack()}`); // 39

// ========== 不同出装方案：同一个裸装英雄，包出不同的战斗单位 ==========
const tank: Fighter = new Poison(new Ring(new BaseHero())); // 坦克流
const dps: Fighter = new Sword(new Sword(new BaseHero())); // 双持输出流（屠龙刀 x2）
console.log(`坦克流出装 [${tank.desc()}]，攻击力：${tank.getAttack()}`); // 24
console.log(`输出流出装 [${dps.desc()}]，攻击力：${dps.getAttack()}`); // 40

// ========== 扩展：新赛季上新"暴击符文"，已有装备和英雄零修改 ==========
class CritRune extends Equipment {
  getAttack(): number {
    return Math.floor(this.fighter.getAttack() * 1.5); // 攻击力提升 50%
  }

  desc(): string {
    return this.fighter.desc() + ' -> 镶暴击符文';
  }
}

const lucky: Fighter = new CritRune(new Sword(new BaseHero()));
console.log(`新出装 [${lucky.desc()}]，攻击力：${lucky.getAttack()}`); // 37

// 优势：
// 1. 新增装备 = 新增一个装饰者类，已有英雄和装备零修改（开闭原则）
// 2. 包裹顺序即叠加顺序，"每一层加了什么"从 desc() 和包裹链上一目了然
// 3. 出装方案在运行时自由组装：同一英雄既可包成坦克流也可包成输出流
// 4. 装备面向 Fighter 接口编程，怪物、宠物换上 BaseFighter 就能复用整套装备系统

export {};
