// 改后：中介者模式 -- 玩家只向中介者汇报自己的状态，胜负判定和广播全由中介者负责

type PlayerState = 'alive' | 'dead';

// ========== 同事对象：玩家只认识中介者 ==========
class Player {
  state: PlayerState = 'alive';

  constructor(
    public name: string,
    public teamColor: string,
    private director: PlayerDirector,
  ) {
    director.addPlayer(this); // 出生即向中介者注册
  }

  win(): void {
    console.log(`${this.name}（${this.teamColor}队）赢了`);
  }

  lose(): void {
    console.log(`${this.name}（${this.teamColor}队）输了`);
  }

  die(): void {
    this.state = 'dead';
    // 只汇报“我死了”，剩下的都是中介者的事
    this.director.onPlayerDead(this);
  }

  quit(): void {
    this.director.removePlayer(this);
  }
}

// ========== 中介者：唯一知道全局结构的角色 ==========
class PlayerDirector {
  private teams = new Map<string, Player[]>();

  addPlayer(player: Player): void {
    const team = this.teams.get(player.teamColor) ?? [];
    team.push(player);
    this.teams.set(player.teamColor, team);
  }

  removePlayer(player: Player): void {
    const team = this.teams.get(player.teamColor) ?? [];
    this.teams.set(
      player.teamColor,
      team.filter((p) => p !== player),
    );
  }

  onPlayerDead(player: Player): void {
    const team = this.teams.get(player.teamColor) ?? [];
    if (team.some((p) => p.state === 'alive')) return; // 还有队友活着，游戏继续

    // 本队全灭：广播失败；其他队广播胜利 -- 规则只存在中介者这一处
    team.forEach((p) => p.lose());
    this.teams.forEach((members, color) => {
      if (color !== player.teamColor) {
        members.forEach((p) => p.win());
      }
    });
  }
}

// ========== 使用：玩家之间互不认识，全部交给中介者 ==========
const director = new PlayerDirector();
const reds = ['皮蛋', '小乖', '宝宝', '小强'].map((name) => new Player(name, '红', director));
// 蓝队 4 人（创建即注册，无需保存引用）
['黑妞', '葱头', '胖墩', '海盗'].forEach((name) => new Player(name, '蓝', director));

console.log('--- 场景 1：红队依次阵亡，全灭后广播胜负 ---');
reds[0].die();
reds[1].die();
reds[2].die();
reds[3].die(); // 红队全灭，蓝队获胜

console.log('--- 场景 2：有人中途退赛，中介者名册自动更新 ---');
const director2 = new PlayerDirector();
const reds2 = ['皮蛋', '小乖', '宝宝'].map((name) => new Player(name, '红', director2));
['黑妞', '葱头'].forEach((name) => new Player(name, '蓝', director2));

reds2[0].quit(); // 皮蛋退赛，无需任何人更新引用
reds2[1].die();
reds2[2].die(); // 剩下的红队全灭，蓝队获胜

// 优势：
// 1. 玩家只持有中介者一个引用，星型结构替代了网状结构
// 2. “判断全灭、广播胜负”等游戏规则集中在中介者，改规则只改一处
// 3. 退赛/换队只需中介者更新名册，玩家之间零感知
// 4. 玩家对象可以配合一个假中介者独立测试

export {};
