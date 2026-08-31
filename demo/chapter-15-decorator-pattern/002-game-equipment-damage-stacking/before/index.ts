// 改前：装备加成全部硬编码在英雄类里，用布尔字段当开关，每出一件新装备都要改这个类

class Hero {
  // 每出一件新装备，就要多一个布尔字段
  public hasSword = false; // 屠龙刀
  public hasRing = false; // 力量戒指
  public hasPoison = false; // 淬毒药剂

  constructor(public baseAttack = 10) {}

  getAttack(): number {
    let atk = this.baseAttack;

    // 每出一件新装备，这里就要多一个 if
    if (this.hasSword) {
      atk += 15; // 屠龙刀：+15
    }
    if (this.hasRing) {
      atk += 6; // 力量戒指：+6
    }
    if (this.hasPoison) {
      atk += 8; // 淬毒药剂：+8
    }
    // 下一件"暴击符文"上线时？继续加字段、加 if……

    return atk;
  }
}

// ========== 模拟战斗 ==========
const hero = new Hero();

hero.hasSword = true;
console.log(`捡起屠龙刀，攻击力：${hero.getAttack()}`); // 25

hero.hasRing = true;
console.log(`戴上力量戒指，攻击力：${hero.getAttack()}`); // 31

hero.hasPoison = true;
console.log(`喝下淬毒药剂，攻击力：${hero.getAttack()}`); // 39

// 问题：
// 1. 每新增一件装备 = 加一个布尔字段 + 改 getAttack，英雄类越来越臃肿
// 2. 装备效果写死在英雄类里，怪物、宠物想复用同一套装备系统？只能复制粘贴
// 3. "39 点攻击力是怎么来的"全靠读整段 if 链，无法逐层追踪每件装备的贡献
// 4. 装备数量、生效顺序、叠加规则都被编译期写死，无法在运行时按战斗场景重新搭配

export {};
