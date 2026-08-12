/**
 * 飞机大战 - Canvas 游戏
 * 核心：游戏循环 (rAF) · 碰撞检测 (AABB) · 关卡系统 · 计分系统
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

// ============ 游戏状态 ============
const game = {
  state: 'menu', // menu | playing | paused | gameover
  score: 0,
  level: 1,
  lives: 3,
  player: null,
  bullets: [],
  enemies: [],
  particles: [],
  powerups: [],
  keys: {},
  lastShot: 0,
  lastEnemy: 0,
  enemyInterval: 1200,
  shootInterval: 250,
  frame: 0,
};

// ============ 工具函数 ============
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// AABB 碰撞检测
function collide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ============ 玩家 ============
function createPlayer() {
  return {
    x: W / 2 - 20,
    y: H - 80,
    w: 40,
    h: 40,
    speed: 5,
    power: 1, // 火力等级
  };
}

function drawPlayer() {
  const p = game.player;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  // 机身
  ctx.fillStyle = '#61dafb';
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-16, 14);
  ctx.lineTo(-6, 8);
  ctx.lineTo(0, 12);
  ctx.lineTo(6, 8);
  ctx.lineTo(16, 14);
  ctx.closePath();
  ctx.fill();
  // 驾驶舱
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  // 引擎火焰
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.lineTo(0, 14 + rand(6, 12));
  ctx.lineTo(5, 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function updatePlayer() {
  const p = game.player;
  if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
    p.x -= p.speed;
  }
  if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
    p.x += p.speed;
  }
  if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) {
    p.y -= p.speed;
  }
  if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) {
    p.y += p.speed;
  }
  p.x = Math.max(0, Math.min(W - p.w, p.x));
  p.y = Math.max(0, Math.min(H - p.h, p.y));

  // 自动射击
  const now = performance.now();
  if (now - game.lastShot > game.shootInterval) {
    shoot();
    game.lastShot = now;
  }
}

// ============ 子弹 ============
function shoot() {
  const p = game.player;
  const cx = p.x + p.w / 2;
  if (p.power >= 1) {
    game.bullets.push({ x: cx - 2, y: p.y, w: 4, h: 12, speed: 8 });
  }
  if (p.power >= 2) {
    game.bullets.push({ x: cx - 12, y: p.y + 6, w: 4, h: 12, speed: 8 });
    game.bullets.push({ x: cx + 8, y: p.y + 6, w: 4, h: 12, speed: 8 });
  }
  if (p.power >= 3) {
    game.bullets.push({ x: cx - 20, y: p.y + 10, w: 4, h: 12, speed: 8, vx: -1 });
    game.bullets.push({ x: cx + 16, y: p.y + 10, w: 4, h: 12, speed: 8, vx: 1 });
  }
}

function drawBullets() {
  ctx.fillStyle = '#ffeb3b';
  game.bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
}

function updateBullets() {
  game.bullets.forEach((b) => {
    b.y -= b.speed;
    if (b.vx) b.x += b.vx;
  });
  game.bullets = game.bullets.filter((b) => b.y > -20);
}

// ============ 敌机 ============
const ENEMY_TYPES = [
  { type: 'small', w: 30, h: 30, hp: 1, speed: 2, score: 10, color: '#e74c3c' },
  { type: 'medium', w: 44, h: 44, hp: 3, speed: 1.5, score: 25, color: '#9b59b6' },
  { type: 'large', w: 60, h: 60, hp: 6, speed: 1, score: 50, color: '#34495e' },
];

function spawnEnemy() {
  // 根据关卡决定敌机类型概率
  const r = Math.random();
  let typeIdx;
  if (game.level >= 3) {
    typeIdx = r < 0.5 ? 0 : r < 0.85 ? 1 : 2;
  } else if (game.level >= 2) {
    typeIdx = r < 0.7 ? 0 : 1;
  } else {
    typeIdx = 0;
  }
  const tpl = ENEMY_TYPES[typeIdx];
  game.enemies.push({
    ...tpl,
    x: rand(0, W - tpl.w),
    y: -tpl.h,
    maxHp: tpl.hp,
    wobble: rand(0, Math.PI * 2),
  });
}

function drawEnemies() {
  game.enemies.forEach((e) => {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.fillStyle = e.color;
    if (e.type === 'small') {
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(-15, -10);
      ctx.lineTo(0, -5);
      ctx.lineTo(15, -10);
      ctx.closePath();
      ctx.fill();
    } else if (e.type === 'medium') {
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-10, -15);
      ctx.lineTo(10, -15);
      ctx.lineTo(22, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(-30, 10);
      ctx.lineTo(-20, -20);
      ctx.lineTo(20, -20);
      ctx.lineTo(30, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 血条
    if (e.hp < e.maxHp) {
      const barW = e.w;
      ctx.fillStyle = '#333';
      ctx.fillRect(e.x, e.y - 6, barW, 4);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(e.x, e.y - 6, barW * (e.hp / e.maxHp), 4);
    }
  });
}

function updateEnemies() {
  game.enemies.forEach((e) => {
    e.y += e.speed * (1 + game.level * 0.1);
    e.wobble += 0.05;
    e.x += Math.sin(e.wobble) * 0.5;
  });
  game.enemies = game.enemies.filter((e) => e.y < H + 50);
}

// ============ 粒子爆炸效果 ============
function explode(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
    const speed = rand(2, 5);
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: rand(2, 5),
      color,
    });
  }
}

function drawParticles() {
  game.particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;
}

function updateParticles() {
  game.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= 0.025;
  });
  game.particles = game.particles.filter((p) => p.life > 0);
}

// ============ 道具 ============
function spawnPowerup(x, y) {
  const types = ['power', 'life'];
  const type = Math.random() < 0.7 ? 'power' : 'life';
  game.powerups.push({ x, y, w: 24, h: 24, type, speed: 1.5, frame: 0 });
}

function drawPowerups() {
  game.powerups.forEach((p) => {
    p.frame += 0.1;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.frame);
    ctx.fillStyle = p.type === 'power' ? '#f39c12' : '#2ecc71';
    ctx.fillRect(-12, -12, 24, 24);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.type === 'power' ? 'P' : '+', 0, 1);
    ctx.restore();
  });
}

function updatePowerups() {
  game.powerups.forEach((p) => {
    p.y += p.speed;
  });
  game.powerups = game.powerups.filter((p) => p.y < H + 30);
}

// ============ 星空背景 ============
const stars = [];
for (let i = 0; i < 60; i++) {
  stars.push({ x: rand(0, W), y: rand(0, H), speed: rand(0.5, 2), size: rand(1, 2.5) });
}
function drawStars() {
  stars.forEach((s) => {
    s.y += s.speed;
    if (s.y > H) {
      s.y = 0;
      s.x = rand(0, W);
    }
    ctx.fillStyle = `rgba(255,255,255,${s.size / 3})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}

// ============ 碰撞处理 ============
function handleCollisions() {
  // 子弹 vs 敌机
  game.bullets.forEach((b, bi) => {
    game.enemies.forEach((e, ei) => {
      if (collide(b, e)) {
        e.hp--;
        game.bullets.splice(bi, 1);
        explode(b.x, b.y, '#ffeb3b', 4);
        if (e.hp <= 0) {
          explode(e.x + e.w / 2, e.y + e.h / 2, e.color, 16);
          game.score += e.score;
          scoreEl.textContent = game.score;
          // 掉落道具
          if (Math.random() < 0.15) {
            spawnPowerup(e.x + e.w / 2 - 12, e.y);
          }
          game.enemies.splice(ei, 1);
          checkLevelUp();
        }
      }
    });
  });

  // 敌机 vs 玩家
  if (game.player) {
    game.enemies.forEach((e, ei) => {
      if (collide(game.player, e)) {
        explode(e.x + e.w / 2, e.y + e.h / 2, '#fff', 20);
        game.enemies.splice(ei, 1);
        playerHit();
      }
    });
  }

  // 道具 vs 玩家
  if (game.player) {
    game.powerups.forEach((p, pi) => {
      if (collide(game.player, p)) {
        if (p.type === 'power') {
          game.player.power = Math.min(3, game.player.power + 1);
        } else {
          game.lives++;
          livesEl.textContent = game.lives;
        }
        game.powerups.splice(pi, 1);
      }
    });
  }
}

function playerHit() {
  game.lives--;
  livesEl.textContent = game.lives;
  explode(game.player.x + game.player.w / 2, game.player.y + game.player.h / 2, '#61dafb', 20);
  game.player.power = Math.max(1, game.player.power - 1);
  if (game.lives <= 0) {
    gameOver();
  } else {
    // 短暂无敌（重置位置）
    game.player.x = W / 2 - 20;
    game.player.y = H - 80;
  }
}

// ============ 关卡系统 ============
function checkLevelUp() {
  const thresholds = [0, 200, 500, 1000, 1800, 3000, 5000];
  let newLevel = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (game.score >= thresholds[i]) {
      newLevel = i + 1;
      break;
    }
  }
  if (newLevel > game.level) {
    game.level = newLevel;
    levelEl.textContent = game.level;
    game.enemyInterval = Math.max(400, 1200 - game.level * 120);
    game.shootInterval = Math.max(120, 250 - game.level * 15);
    // 关卡提示粒子
    for (let i = 0; i < 30; i++) {
      explode(rand(0, W), rand(0, H / 2), '#f39c12', 8);
    }
  }
}

// ============ 游戏循环 ============
function gameLoop() {
  if (game.state !== 'playing') return;

  game.frame++;
  ctx.clearRect(0, 0, W, H);

  // 背景
  drawStars();

  // 更新
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateParticles();
  updatePowerups();

  // 碰撞
  handleCollisions();

  // 生成敌机
  const now = performance.now();
  if (now - game.lastEnemy > game.enemyInterval) {
    spawnEnemy();
    game.lastEnemy = now;
  }

  // 绘制
  drawBullets();
  drawEnemies();
  drawPowerups();
  drawParticles();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// ============ 游戏控制 ============
function startGame() {
  game.state = 'playing';
  game.score = 0;
  game.level = 1;
  game.lives = 3;
  game.bullets = [];
  game.enemies = [];
  game.particles = [];
  game.powerups = [];
  game.enemyInterval = 1200;
  game.shootInterval = 250;
  game.player = createPlayer();
  scoreEl.textContent = 0;
  levelEl.textContent = 1;
  livesEl.textContent = 3;
  overlay.style.display = 'none';
  game.lastEnemy = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  game.state = 'gameover';
  overlay.innerHTML = `
    <h2>游戏结束</h2>
    <div class="final-score">${game.score}</div>
    <p>最高关卡: ${game.level}</p>
    <button class="start-btn" id="startBtn">再来一局</button>
    <p class="controls-hint">← → 或 A D 移动 · 空格发射 · 鼠标移动控制</p>
  `;
  overlay.style.display = 'flex';
  document.getElementById('startBtn').addEventListener('click', startGame);
}

// ============ 输入 ============
document.addEventListener('keydown', (e) => {
  game.keys[e.key] = true;
  if (e.key === ' ' && game.state === 'playing') {
    e.preventDefault();
    shoot();
  }
});
document.addEventListener('keyup', (e) => {
  game.keys[e.key] = false;
});

// 鼠标控制
canvas.addEventListener('mousemove', (e) => {
  if (game.state !== 'playing' || !game.player) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (W / rect.width);
  const y = (e.clientY - rect.top) * (H / rect.height);
  game.player.x = x - game.player.w / 2;
  game.player.y = y - game.player.h / 2;
  game.player.x = Math.max(0, Math.min(W - game.player.w, game.player.x));
  game.player.y = Math.max(0, Math.min(H - game.player.h, game.player.y));
});

// 触屏支持
canvas.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    if (game.state !== 'playing' || !game.player) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    game.player.x = (touch.clientX - rect.left) * (W / rect.width) - game.player.w / 2;
    game.player.y = (touch.clientY - rect.top) * (H / rect.height) - game.player.h / 2;
    game.player.x = Math.max(0, Math.min(W - game.player.w, game.player.x));
    game.player.y = Math.max(0, Math.min(H - game.player.h, game.player.y));
  },
  { passive: false }
);

startBtn.addEventListener('click', startGame);
