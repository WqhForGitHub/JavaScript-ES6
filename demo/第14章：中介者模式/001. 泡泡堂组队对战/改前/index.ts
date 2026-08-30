// 改前：每个玩家都持有全部队友和敌人的引用，阵亡后自己挨个判断、挨个通知

type PlayerState = 'alive' | 'dead';

class Player {
  state: PlayerState = 'alive';
  partners: Player[] = []; // 队友引用
  enemies: Player[] = []; // 敌人引用

  constructor(
    public name: string,
    public teamColor: string,
  ) {}

  win(): void {
    console.log(`${this.name}（${this.teamColor}队）赢了`);
  }

  lose(): void {
    console.log(`${this.name}（${this.teamColor}队）输了`);
  }

  die(): void {
    this.state = 'dead';

    // 阵亡后自己负责：遍历队友判断是否全灭
    const allDead = this.partners.every((p) => p.state === 'dead');
    if (!allDead) return;

    // 全灭后自己负责：通知所有队友失败、所有敌人获胜
    this.lose();
    this.partners.forEach((p) => p.lose());
    this.enemies.forEach((e) => e.win());
  }
}

// 组队：两两互相登记引用，8 个玩家就是几十条互相指向的线
function createPlayers(): Player[] {
  const players = [
    ...['皮蛋', '小乖', '宝宝', '小强'].map((name) => new Player(name, '红')),
    ...['黑妞', '葱头', '胖墩', '海盗'].map((name) => new Player(name, '蓝')),
  ];
  players.forEach((a) => {
    players.forEach((b) => {
      if (a === b) return;
      if (a.teamColor === b.teamColor) a.partners.push(b);
      else a.enemies.push(b);
    });
  });
  return players;
}

const players = createPlayers();
console.log('红队依次阵亡...');
players[0].die();
players[1].die();
players[2].die();
players[3].die(); // 红队全灭，蓝队获胜

// 问题：
// 1. 每个玩家持有所有其他玩家的引用，玩家越多关系网越乱（网状耦合）
// 2. die() 里写死了“判断全灭 + 广播胜负”的全局规则，规则一变每个玩家都要改
// 3. 玩家中途退出/换队，得遍历更新所有人的 partners/enemies 列表，极易漏改
// 4. 想单独测试一个玩家，必须先造齐全部队友和敌人

export {};
