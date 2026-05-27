// 第14章：中介者模式 - demo1：泡泡堂游戏

// ============================================================
// 一、不好的方式：玩家之间直接互相引用
// ============================================================

var BadPlayer = function(name, teamColor) {
  this.name = name;
  this.teamColor = teamColor;
  this.partners = [];  // 队友列表
  this.enemies = [];   // 敌人列表
  this.state = 'alive';
};

BadPlayer.prototype.win = function() {
  console.log(this.name + ':' + this.teamColor + '方赢了！');
};

BadPlayer.prototype.lose = function() {
  console.log(this.name + ':' + this.teamColor + '方输了！');
};

BadPlayer.prototype.die = function() {
  this.state = 'dead';
  var allDead = true;
  // 检查所有队友是否都死了
  for (var i = 0; i < this.partners.length; i++) {
    if (this.partners[i].state === 'alive') {
      allDead = false;
      break;
    }
  }
  if (allDead) {
    this.lose();                    // 自己方输
    for (var j = 0; j < this.partners.length; j++) {
      this.partners[j].lose();      // 队友输
    }
    for (var k = 0; k < this.enemies.length; k++) {
      this.enemies[k].win();        // 敌人赢
    }
  }
};

// 创建玩家（不好：每个玩家都要持有队友和敌人的引用）
var players = [];
var playerNames1 = ['皮蛋', '小乖', '宝宝', '小强'];
var playerNames2 = ['黑妞', '葱头', '胖墩', '海盗'];

for (var i = 0; i < 4; i++) {
  var p1 = new BadPlayer(playerNames1[i], 'red');
  var p2 = new BadPlayer(playerNames2[i], 'blue');
  players.push(p1);
  players.push(p2);
}

// 设置队友和敌人关系（不好：高度耦合）
for (var m = 0; m < players.length; m++) {
  for (var n = 0; n < players.length; n++) {
    if (players[m].teamColor === players[n].teamColor && m !== n) {
      players[m].partners.push(players[n]);
    }
    if (players[m].teamColor !== players[n].teamColor) {
      players[m].enemies.push(players[n]);
    }
  }
}

console.log('--- 不好的方式：玩家之间直接耦合 ---');
console.log('红队皮蛋 die');
players[0].die(); // 皮蛋 die
console.log('红队小乖 die');
players[2].die(); // 小乖 die
console.log('红队宝宝 die');
players[4].die(); // 宝宝 die
console.log('红队小强 die（红队全灭，蓝队获胜）');
players[6].die(); // 小强 die -> 红队全灭
console.log('');

// ============================================================
// 二、好的方式：中介者模式
// ============================================================

var GoodPlayer = function(name, teamColor) {
  this.name = name;
  this.teamColor = teamColor;
  this.state = 'alive';
};

// 玩家只需要通知中介者，不需要知道其他玩家的存在
GoodPlayer.prototype.win = function() {
  console.log(this.name + ':' + this.teamColor + '方赢了！');
};

GoodPlayer.prototype.lose = function() {
  console.log(this.name + ':' + this.teamColor + '方输了！');
};

GoodPlayer.prototype.die = function() {
  this.state = 'dead';
  playerDirector.ReceiveMessage('playerDead', this);
};

GoodPlayer.prototype.remove = function() {
  playerDirector.ReceiveMessage('removePlayer', this);
};

GoodPlayer.prototype.changeTeam = function(color) {
  playerDirector.ReceiveMessage('changeTeam', this, color);
};

// 中介者：playerDirector
var playerDirector = (function() {
  var players = {};  // 用对象存储所有玩家，key 为团队颜色

  var operations = {
    // 添加玩家
    addPlayer: function(player) {
      var teamColor = player.teamColor;
      if (!players[teamColor]) {
        players[teamColor] = [];
      }
      players[teamColor].push(player);
    },
    // 移除玩家
    removePlayer: function(player) {
      var teamColor = player.teamColor;
      var teamPlayers = players[teamColor] || [];
      for (var i = teamPlayers.length - 1; i >= 0; i--) {
        if (teamPlayers[i] === player) {
          teamPlayers.splice(i, 1);
        }
      }
      console.log('  ' + player.name + ' 已被移除');
    },
    // 玩家换队
    changeTeam: function(player, newTeamColor) {
      var oldTeamColor = player.teamColor;
      // 从原队伍移除
      var teamPlayers = players[oldTeamColor] || [];
      for (var i = teamPlayers.length - 1; i >= 0; i--) {
        if (teamPlayers[i] === player) {
          teamPlayers.splice(i, 1);
        }
      }
      // 更新队伍颜色
      player.teamColor = newTeamColor;
      // 加入新队伍
      operations.addPlayer(player);
      console.log('  ' + player.name + ' 从 ' + oldTeamColor + '方 转到 ' + newTeamColor + '方');
    },
    // 玩家死亡
    playerDead: function(player) {
      var teamColor = player.teamColor;
      var teamPlayers = players[teamColor];
      // 检查同队是否全部阵亡
      var allDead = true;
      for (var i = 0; i < teamPlayers.length; i++) {
        if (teamPlayers[i].state === 'alive') {
          allDead = false;
          break;
        }
      }
      if (allDead) {
        // 同队全部阵亡，本队输
        for (var j = 0; j < teamPlayers.length; j++) {
          teamPlayers[j].lose();
        }
        // 敌队赢
        for (var color in players) {
          if (color !== teamColor) {
            var enemyTeam = players[color];
            for (var k = 0; k < enemyTeam.length; k++) {
              enemyTeam[k].win();
            }
          }
        }
      }
    }
  };

  var ReceiveMessage = function() {
    var message = Array.prototype.shift.call(arguments);
    operations[message].apply(this, arguments);
  };

  return {
    ReceiveMessage: ReceiveMessage
  };
})();

// 创建玩家
console.log('--- 好的方式：中介者模式 ---');
console.log('创建红蓝两队玩家...');

var redTeam = [];
var blueTeam = [];
var redNames = ['皮蛋', '小乖', '宝宝', '小强'];
var blueNames = ['黑妞', '葱头', '胖墩', '海盗'];

for (var r = 0; r < 4; r++) {
  var redPlayer = new GoodPlayer(redNames[r], 'red');
  playerDirector.ReceiveMessage('addPlayer', redPlayer);
  redTeam.push(redPlayer);
}
for (var b = 0; b < 4; b++) {
  var bluePlayer = new GoodPlayer(blueNames[b], 'blue');
  playerDirector.ReceiveMessage('addPlayer', bluePlayer);
  blueTeam.push(bluePlayer);
}

console.log('');

// 测试：红队全灭，蓝队获胜
console.log('--- 测试1：红队全灭，蓝队获胜 ---');
console.log('红队皮蛋 die');
redTeam[0].die();
console.log('红队小乖 die');
redTeam[1].die();
console.log('红队宝宝 die');
redTeam[2].die();
console.log('红队小强 die（红队全灭）');
redTeam[3].die();
console.log('');

// ============================================================
// 测试 removePlayer 和 changeTeam
// ============================================================

console.log('--- 测试2：removePlayer 和 changeTeam ---');
console.log('重新创建玩家...');

var redTeam2 = [];
var blueTeam2 = [];
var redNames2 = ['皮蛋2', '小乖2', '宝宝2', '小强2'];
var blueNames2 = ['黑妞2', '葱头2', '胖墩2', '海盗2'];

for (var r2 = 0; r2 < 4; r2++) {
  var rp = new GoodPlayer(redNames2[r2], 'red');
  playerDirector.ReceiveMessage('addPlayer', rp);
  redTeam2.push(rp);
}
for (var b2 = 0; b2 < 4; b2++) {
  var bp = new GoodPlayer(blueNames2[b2], 'blue');
  playerDirector.ReceiveMessage('addPlayer', bp);
  blueTeam2.push(bp);
}

console.log('');

// 测试 removePlayer：红队皮蛋2退出游戏
console.log('红队皮蛋2 退出游戏：');
redTeam2[0].remove();
console.log('');

// 测试 changeTeam：红队小乖2叛变到蓝队
console.log('红队小乖2 叛变到蓝队：');
redTeam2[1].changeTeam('blue');
console.log('');

// 现在继续游戏，看看结果
console.log('继续游戏：');
console.log('红队宝宝2 die');
redTeam2[2].die();
console.log('红队小强2 die（红队只剩2人，小乖2已叛变，皮蛋2已退出）');
redTeam2[3].die();
console.log('');

// ============================================================
// 总结
// ============================================================

console.log('--- 总结 ---');
console.log('不好的方式：每个玩家持有 partners[] 和 enemies[]，玩家之间高度耦合');
console.log('好的方式：玩家只与中介者 playerDirector 通信，解耦了玩家之间的关系');
console.log('中介者负责：addPlayer, removePlayer, changeTeam, playerDead');
console.log('玩家只需调用：die(), remove(), changeTeam()，内部转发给中介者处理');
