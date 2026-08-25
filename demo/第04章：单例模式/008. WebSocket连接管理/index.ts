// 第04章：单例模式 - 008：WebSocket 连接管理
//
// 场景：页面里很多模块都要收发实时消息（通知、聊天、行情……），
// 但一个页面通常只允许维持一条长连接，服务器也按连接数收费 / 限流。
// WebSocket 管理器必须是单例：统一建连、统一分发消息、断线统一重连。

type MessageHandler = (data: any) => void;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;

  private url: string;
  private handlers = new Map<string, Set<MessageHandler>>();
  private status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(url = 'wss://realtime.example.com/socket'): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(url);
    }
    return WebSocketManager.instance;
  }

  connect(): void {
    // 已经有人在连 / 连上了，直接复用，绝不重复建连
    if (this.status !== 'disconnected') {
      console.log(`[连接] 已有连接（状态：${this.status}），直接复用`);
      return;
    }
    this.status = 'connecting';
    console.log(`[连接] 正在连接 ${this.url} ...`);

    // 模拟浏览器的 new WebSocket(url)，50ms 后连接成功
    setTimeout(() => {
      this.status = 'connected';
      console.log('[连接] 连接成功');
      this.emit('open', null);
    }, 50);
  }

  disconnect(): void {
    this.status = 'disconnected';
    console.log('[连接] 已断开');
    // 真实项目中这里还应该触发自动重连逻辑
  }

  /** 按事件名订阅服务器消息 */
  on(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  send(event: string, data: unknown): void {
    if (this.status !== 'connected') {
      console.log(`[发送失败] 当前状态为 ${this.status}，「${event}」没有发出`);
      return;
    }
    console.log(`[发送] ${event}: ${JSON.stringify(data)}`);
    // 模拟服务器收到后把消息广播回来
    setTimeout(() => this.emit(event, data), 20);
  }

  /** 把一条连接上的消息分发给所有订阅了该事件的模块 */
  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((fn) => fn(data));
  }

  getStatus(): string {
    return this.status;
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  // 消息模块、聊天模块拿到的是同一个管理器
  const wsA = WebSocketManager.getInstance();
  const wsB = WebSocketManager.getInstance();

  console.log('两个模块拿到的是同一个连接管理器：', wsA === wsB); // true

  // 各模块订阅自己关心的消息
  wsA.on('open', () => console.log('[消息模块] 连接已建立，开始收发消息'));
  wsA.on('chat', (data) => console.log('[消息模块] 收到 chat：', data));
  wsB.on('chat', (data) => console.log('[聊天模块] 收到 chat：', data));
  wsB.on('order', (data) => console.log('[订单模块] 收到 order：', data));

  // 两个模块都调用 connect()，但真正的建连只发生一次
  wsA.connect();
  wsB.connect(); // 直接复用

  // 等待连接建立
  await new Promise((r) => setTimeout(r, 80));

  console.log('\n当前连接状态：', wsA.getStatus()); // connected
  wsB.send('chat', { from: '张三', text: '在吗？' });
  await new Promise((r) => setTimeout(r, 50)); // 等服务器回包

  console.log('\n--- 断线后再发消息 ---');
  wsA.disconnect();
  wsB.send('chat', { from: '李四', text: '还在吗？' }); // 发送失败
}

main();

export {};
