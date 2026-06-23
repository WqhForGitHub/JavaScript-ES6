/**
 * MiniRouter 应用
 * 演示：hash/history 路由 · 动态参数 :id · 路由守卫（登录拦截）· 动态渲染
 */

// 模拟登录状态
let isLoggedIn = false;

// 模拟用户数据
const users = [
  { id: 1, name: 'Alice', role: '管理员', email: 'alice@example.com', bio: '前端架构师' },
  { id: 2, name: 'Bob', role: '开发者', email: 'bob@example.com', bio: '全栈工程师' },
  { id: 3, name: 'Carol', role: '设计师', email: 'carol@example.com', bio: 'UI/UX 设计师' },
  { id: 4, name: 'Dave', role: '开发者', email: 'dave@example.com', bio: '后端工程师' },
  { id: 5, name: 'Eve', role: '产品经理', email: 'eve@example.com', bio: '产品负责人' },
  { id: 6, name: 'Frank', role: '测试', email: 'frank@example.com', bio: 'QA 专家' },
];

// ============ 页面组件 ============
const pages = {
  home: () => `
    <h2 class="page-title">首页</h2>
    <p style="color:#666;line-height:1.8;margin-bottom:16px">
      欢迎使用 MiniRouter！这是一个用原生 JS 实现的前端路由系统。
    </p>
    <div class="alert alert-info">
      功能：hash / history 双模式 · 动态路由参数 :id · 路由守卫（登录拦截）· 404 处理
    </div>
    <p style="margin-top:16px;color:#666">点击左侧导航栏体验路由切换。尝试访问「设置」页面会被守卫拦截到登录页。</p>
  `,

  usersList: () => `
    <h2 class="page-title">用户列表</h2>
    <p style="color:#888;margin-bottom:20px">点击卡片查看用户详情（动态路由 :id）</p>
    <div class="card-grid">
      ${users.map(u => `
        <a class="card" href="/users/${u.id}" data-link>
          <h3>${u.name}</h3>
          <p>${u.role}</p>
        </a>
      `).join('')}
    </div>
  `,

  userDetail: (params, query) => {
    const user = users.find(u => u.id === Number(params.id));
    if (!user) {
      return `
        <h2 class="page-title">用户不存在</h2>
        <a class="back-link" href="/users" data-link>← 返回列表</a>
        <p style="color:#999">找不到 ID 为 ${params.id} 的用户</p>
      `;
    }
    return `
      <a class="back-link" href="/users" data-link>← 返回列表</a>
      <h2 class="page-title">用户详情</h2>
      <div class="user-detail">
        <div class="avatar">${user.name[0]}</div>
        <div class="detail-row"><span class="label">ID</span><span class="value">${user.id}</span></div>
        <div class="detail-row"><span class="label">姓名</span><span class="value">${user.name}</span></div>
        <div class="detail-row"><span class="label">角色</span><span class="value">${user.role}</span></div>
        <div class="detail-row"><span class="label">邮箱</span><span class="value">${user.email}</span></div>
        <div class="detail-row"><span class="label">简介</span><span class="value">${user.bio}</span></div>
        ${query.from ? `<div class="detail-row"><span class="label">来源</span><span class="value">${query.from}</span></div>` : ''}
      </div>
    `;
  },

  settings: () => `
    <h2 class="page-title">设置</h2>
    <div class="alert alert-info">这是一个需要登录才能访问的页面。你已经通过路由守卫验证 ✅</div>
    <div class="user-detail">
      <div class="detail-row"><span class="label">主题</span><span class="value">深色模式</span></div>
      <div class="detail-row"><span class="label">语言</span><span class="value">简体中文</span></div>
      <div class="detail-row"><span class="label">通知</span><span class="value">已开启</span></div>
    </div>
    <button class="btn" onclick="logout()">退出登录</button>
  `,

  login: () => `
    <h2 class="page-title">登录</h2>
    <div class="alert alert-warn">路由守卫会拦截未登录用户对 /settings 的访问，自动跳转到此页。</div>
    <div class="login-form">
      <input type="text" placeholder="用户名（随便填）" value="admin" />
      <input type="password" placeholder="密码（随便填）" value="123456" />
      <button class="btn" onclick="doLogin()">登录</button>
    </div>
  `,
};

// ============ 登录/登出 ============
window.doLogin = function () {
  isLoggedIn = true;
  router.push('/settings');
};

window.logout = function () {
  isLoggedIn = false;
  router.push('/login');
};

// ============ 创建路由器 ============
const router = new MiniRouter({
  mode: 'hash',
  container: document.getElementById('router-view'),
});

// ============ 注册路由 ============
router.route('/', pages.home);
router.route('/users', pages.usersList);
router.route('/users/:id', pages.userDetail);
router.route('/settings', pages.settings);
router.route('/login', pages.login);

// ============ 路由守卫 ============
router.beforeEach((to, from) => {
  console.log(`[Guard] ${from ? from.path : 'null'} → ${to.path}`);

  // /settings 需要登录
  if (to.path === '/settings' && !isLoggedIn) {
    console.log('[Guard] 未登录，重定向到 /login');
    return '/login';
  }
  // 已登录时访问 /login，重定向到 /settings
  if (to.path === '/login' && isLoggedIn) {
    return '/settings';
  }
  return true;
});

router.afterEach((to, from) => {
  console.log(`[After] 导航完成：${to.path}`);
});

// ============ 模式切换 ============
document.getElementById('modeHash').addEventListener('click', function () {
  if (this.classList.contains('active')) return;
  location.reload(); // 切换模式需要重新初始化
  // 实际项目中可以用 sessionStorage 记住模式选择
  sessionStorage.setItem('router-mode', 'hash');
});

document.getElementById('modeHistory').addEventListener('click', function () {
  if (this.classList.contains('active')) return;
  sessionStorage.setItem('router-mode', 'history');
  // history 模式在 file:// 下有限制，提示用户
  if (location.protocol === 'file:') {
    alert('History 模式需要 HTTP 服务器运行（因为依赖 history API）。切换为 hash 模式演示。');
    sessionStorage.setItem('router-mode', 'hash');
    return;
  }
  location.reload();
});

// 读取保存的模式
const savedMode = sessionStorage.getItem('router-mode');
if (savedMode === 'history' && location.protocol !== 'file:') {
  router.mode = 'history';
  document.getElementById('modeHash').classList.remove('active');
  document.getElementById('modeHistory').classList.add('active');
}

// ============ 启动路由 ============
router.start();
