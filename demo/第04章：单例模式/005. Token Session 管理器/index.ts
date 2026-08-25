// 第04章：单例模式 - 005：Token / Session 管理器
//
// 场景：登录态（token、session）必须全局统一管理：
// 任何模块都要能读到「当前登录用户」，退出登录时要一次性清空，
// 网络层要能感知登录态变化来带上 Authorization 头。
// 如果登录态散落在各模块，就会出现「一个页面退出了，另一个页面还是登录态」的经典 bug。

interface Session {
  token: string;
  userId: string;
  username: string;
  expiresAt: number;
}

class SessionManager {
  private static instance: SessionManager | null = null;

  private sessions = new Map<string, Session>();
  private currentToken: string | null = null;
  private listeners: Array<(token: string | null) => void> = [];

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /** 登录成功，创建会话 */
  login(userId: string, username: string, ttlMs = 150): Session {
    const token = this.generateToken();
    const session: Session = {
      token,
      userId,
      username,
      expiresAt: Date.now() + ttlMs,
    };
    this.sessions.set(token, session);
    this.currentToken = token;
    this.notify(token);
    return session;
  }

  /** 校验 token 是否有效（不存在或已过期都算无效） */
  validate(token: string | null): Session | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  /** 任何模块都可以读到当前登录用户 */
  getCurrentSession(): Session | null {
    return this.validate(this.currentToken);
  }

  /** 续期：滑动过期，用户一直活跃就一直有效 */
  refresh(token: string, ttlMs = 500): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    session.expiresAt = Date.now() + ttlMs;
    return true;
  }

  /** 退出登录（不传 token 则退出当前用户） */
  logout(token?: string): void {
    const target = token ?? this.currentToken;
    if (target) {
      this.sessions.delete(target);
    }
    if (target === this.currentToken) {
      this.currentToken = null;
      this.notify(null);
    }
  }

  /** 其它模块（如网络层）可以监听登录态变化 */
  onChange(listener: (token: string | null) => void): void {
    this.listeners.push(listener);
  }

  private notify(token: string | null): void {
    this.listeners.forEach((fn) => fn(token));
  }

  private generateToken(): string {
    return 'tok_' + Math.random().toString(36).slice(2, 10);
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  const sessionA = SessionManager.getInstance();
  const sessionB = SessionManager.getInstance();

  console.log('两个模块拿到的是同一个会话管理器：', sessionA === sessionB); // true

  // 网络层监听登录态变化，决定是否带上 Authorization 头
  sessionB.onChange((token) => {
    console.log(`[网络层] 登录态变化，携带凭证 = ${token ? token.slice(0, 8) + '...' : '无'}`);
  });

  // 登录模块执行登录
  const { token } = sessionA.login('u_1001', '张三');
  console.log('\n登录成功，token：', token);

  // 购物车模块读取当前用户
  console.log('购物车模块读到的当前用户：', sessionB.getCurrentSession()?.username);

  // 等待 token 过期
  await new Promise((r) => setTimeout(r, 200));
  console.log('\n200ms 后再读当前用户：', sessionA.getCurrentSession(), '（已过期）');

  // 重新登录，并用 refresh 续期
  const session2 = sessionA.login('u_1001', '张三');
  sessionB.refresh(session2.token, 500);
  await new Promise((r) => setTimeout(r, 200));
  console.log('\n续期后 200ms 再校验：', sessionA.getCurrentSession()?.username, '（仍然有效）');

  // 退出登录，所有模块同时感知
  sessionB.logout();
  console.log('\n退出后当前用户：', sessionA.getCurrentSession()); // null
}

main();

export {};
